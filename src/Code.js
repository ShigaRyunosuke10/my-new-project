/**
 * Code.gs
 * イベントハンドラ、カスタムメニュー、トリガー設定を管理する司令塔。
 * (管理表の作成タイミングを「仕掛かり日」入力時に変更)
 */

// =================================================================================
// === イベントハンドラ ===
// =================================================================================

function onOpen(e) {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('カスタムメニュー')
    .addItem('ソートビューを作成', 'createSortedView')
    .addItem('表示を更新', 'refreshSortedView')
    .addSeparator()
    .addItem('予定工数を一括同期', 'syncAllPlannedHoursToInputSheets')
    .addItem('完了案件を請求シートに一括同期', 'syncAllCompletedToBillingSheet')
    .addSeparator()
    .addItem('全資料フォルダ作成', 'bulkCreateMaterialFolders')
    .addSeparator()
    .addSubMenu(ui.createMenu('工数シート表示設定')
      .addItem('フィルタを有効化', 'enableFiltersOnAllInputSheets')
      .addItem('先月・今月・来月のみ表示', 'showRecentThreeMonths')
      .addItem('全ての月を表示', 'showAllMonths'))
    .addSeparator()
    .addSubMenu(ui.createMenu('同期失敗対策')
      .addItem('失敗した同期を再実行', 'retryAllFailedSyncs')
      .addItem('同期失敗履歴を表示', 'showSyncFailures')
      .addItem('同期失敗履歴をクリア', 'clearSyncFailureLog'))
    .addSeparator()
    .addItem('各種設定と書式を再適用', 'runAllManualMaintenance')
    .addToUi();
}

/**
 * onEdit: 編集イベントを処理する司令塔
 */
function onEdit(e) {
  if (!e || !e.source || !e.range) return;
  const lock = LockService.getScriptLock();
  try {
    // ロック待機時間を30秒に延長（複数ユーザーの同時編集・一括同期処理に対応）
    lock.waitLock(30000);
  } catch (err) {
    Logger.log('ロックの待機中にタイムアウトしました。');
    SpreadsheetApp.getActiveSpreadsheet().toast('他の処理が実行中のため、タイムアウトしました。しばらく待ってから再試行してください。', '処理待機タイムアウト', 5);
    return;
  }
  
  const ss = e.source;
  try {
    const sheet = e.range.getSheet();
    const sheetName = sheet.getName();

    if (sheetName === CONFIG.SHEETS.MAIN) {
      const mainSheet = new MainSheet();
      const editedCol = e.range.getColumn();
      const editedRow = e.range.getRow();

      // indicesの存在確認（ヘッダー変更によるエラー防止）
      if (!mainSheet.indices || !mainSheet.indices.KIBAN || !mainSheet.indices.MODEL) {
        Logger.log('列インデックスが取得できません。ヘッダー行を確認してください。');
        return;
      }

      // 編集された行のデータを取得
      const editedRowValues = mainSheet.getSheet().getRange(editedRow, 1, 1, mainSheet.getSheet().getLastColumn()).getValues()[0];
      const kiban = editedRowValues[mainSheet.indices.KIBAN - 1];
      const model = editedRowValues[mainSheet.indices.MODEL - 1];

      if (editedCol === mainSheet.indices.TANTOUSHA) {
        ss.toast('担当者の変更を検出しました。データとリンクを同期します...', '同期中', 8);

        // データ同期
        syncMainToAllInputSheets();

        // リンク同期を追加
        const mainSheet = new MainSheet();
        syncLinksToInputSheets_(mainSheet);

        colorizeAllSheets();
      }
      // 「予定工数」が編集された時の処理
      else if (editedCol === mainSheet.indices.PLANNED_HOURS && editedRow >= mainSheet.startRow) {
        ss.toast('予定工数の変更を検出しました。工数シートに同期します...', '同期中', 3);
        syncPlannedHoursToInputSheets(editedRow);
        colorizeAllSheets();
      }
      // 「仕掛かり日」が入力された時の処理
      else if (editedCol === mainSheet.indices.START_DATE && editedRow >= mainSheet.startRow) {
        // 日付の妥当性チェックを追加
        const startDateValue = editedRowValues[mainSheet.indices.START_DATE - 1];
        if (kiban && model && startDateValue && isValidDate(startDateValue)) {
          ss.toast('管理表に機種・製番を書き込みます...', '処理中', 3);
          updateManagementSheet({ kiban: kiban, model: model });
        } else if (e.value && !isValidDate(startDateValue)) {
          Logger.log(`無効な日付が入力されました: ${e.value}`);
        }
        colorizeAllSheets();
      } 
      // 「完了日」が入力された時の処理
      else if (editedCol === mainSheet.indices.COMPLETE_DATE && editedRow >= mainSheet.startRow) {
        const completionDate = e.value;
        if (kiban && completionDate) {
          ss.toast('完了日を顧客用管理表と請求シートに同期します...', '同期中', 3);
          updateManagementSheet({ kiban: kiban, completionDate: new Date(completionDate) });

          // 請求シートへの同期
          const mgmtNo = editedRowValues[mainSheet.indices.MGMT_NO - 1];
          const sagyouKubun = editedRowValues[mainSheet.indices.SAGYOU_KUBUN - 1];
          const plannedHours = editedRowValues[mainSheet.indices.PLANNED_HOURS - 1];
          const actualHours = editedRowValues[mainSheet.indices.ACTUAL_HOURS - 1];
          syncCompletedToBillingSheet(mgmtNo, sagyouKubun, kiban, plannedHours, actualHours, new Date(completionDate));
        }
        colorizeAllSheets();
      } else {
        colorizeAllSheets();
      }

    } else if (sheetName.startsWith(CONFIG.SHEETS.INPUT_PREFIX)) {
      syncInputToMain(sheetName, e.range);
      colorizeAllSheets();
    }
  } catch (error) {
    Logger.log(error.stack);
    ss.toast(`エラーが発生しました: ${error.message}`, "エラー", 10);
  } finally {
    lock.releaseLock();
  }
}

/**
 * 顧客用管理表に情報を書き込む（リトライ機能付き）
 * @param {object} data - {kiban, model, completionDate} のいずれかを含むオブジェクト
 */
function updateManagementSheet(data) {
  try {
    const parentFolder = DriveApp.getFolderById(CONFIG.FOLDERS.REFERENCE_MATERIAL_PARENT);
    const kibanFolders = parentFolder.getFoldersByName(data.kiban);

    if (kibanFolders.hasNext()) {
      const kibanFolder = kibanFolders.next();
      const fileName = `${data.kiban}盤配指示図出図管理表`;
      const files = kibanFolder.getFilesByName(fileName);

      if (files.hasNext()) {
        const fileId = files.next().getId();
        
        let success = false;
        let attempts = 4, waitTime = 2000;

        for (let i = 0; i < attempts; i++) {
          try {
            const spreadsheet = SpreadsheetApp.openById(fileId);
            const sheet = spreadsheet.getSheets()[0];
            
            // 仕掛かり日入力時の処理
            if (data.model) {
              sheet.getRange("B4").setValue("機種：" + data.model);
              sheet.getRange("B5").setValue("製番：" + data.kiban);
              sheet.getDataRange().setFontFamily("Arial").setFontSize(11);
            }
            // 完了日入力時の処理
            if (data.completionDate) {
              const formattedDate = Utilities.formatDate(data.completionDate, Session.getScriptTimeZone(), "yyyy/MM/dd");
              sheet.getRange("B7").setValue("完了日：" + formattedDate);
            }
            
            SpreadsheetApp.flush();
            success = true;
            Logger.log(`管理表「${fileName}」を更新しました。`);
            break;
          } catch (e) {
            if (e.message.includes("サービスに接続できなくなりました")) {
              Logger.log(`試行 ${i + 1}/${attempts}: 管理表更新中に接続エラー。${waitTime / 1000}秒後に再試行します。`);
              Utilities.sleep(waitTime);
              waitTime *= 2;
            } else { throw e; }
          }
        }
        if (!success) Logger.log(`管理表「${fileName}」の更新に失敗しました。`);

      } else { Logger.log(`管理表「${fileName}」が見つかりません。`); }
    } else { Logger.log(`機番フォルダ「${data.kiban}」が見つかりません。`); }
  } catch (e) {
    Logger.log(`管理表の更新中にエラー: ${e.message}`);
  }
}


// =================================================================================
// === ソートビュー（データコピー方式）機能 ===
// =================================================================================

function refreshSortedView() {
    SpreadsheetApp.getActiveSpreadsheet().toast('ビューを更新しています...', '処理中', 5);
    removeAllSortedViews(false);
    createSortedView();
}

function createSortedView() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const mainSheet = ss.getSheetByName(CONFIG.SHEETS.MAIN);
  if (!mainSheet) return;
  const mainIndices = getColumnIndices(mainSheet, MAIN_SHEET_HEADERS);
  const sortColumnIndex = mainIndices.MGMT_NO;
  if (!sortColumnIndex) return;
  const lastRow = mainSheet.getLastRow();
  const dataStartRow = CONFIG.DATA_START_ROW.MAIN;
  if (lastRow < dataStartRow) return;
  let viewSheetName = 'ソートビュー';
  let counter = 2;
  while (ss.getSheetByName(viewSheetName)) {
    viewSheetName = `ソートビュー (${counter})`;
    counter++;
  }
  const viewSheet = ss.insertSheet(viewSheetName, 0);
  const sourceRange = mainSheet.getRange(1, 1, lastRow, mainSheet.getLastColumn());
  sourceRange.copyTo(viewSheet.getRange(1, 1), {contentsOnly: false});
  const viewRangeToSort = viewSheet.getRange(dataStartRow, 1, viewSheet.getLastRow() - (dataStartRow - 1), viewSheet.getLastColumn());
  viewRangeToSort.sort({column: sortColumnIndex, ascending: true});
  viewSheet.getRange(1, 1, viewSheet.getLastRow(), viewSheet.getLastColumn()).createFilter();
  applyStandardFormattingToMainSheet();
  colorizeSheet_(new ViewSheet(viewSheet));
  viewSheet.activate();
  ss.toast(`${viewSheetName} を作成しました。`, '完了', 5);
}

function removeAllSortedViews(showMessage = true) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let deleted = false;
  ss.getSheets().forEach(sheet => {
    if (sheet.getName().startsWith('ソートビュー')) {
      ss.deleteSheet(sheet);
      deleted = true;
    }
  });
  const mainSheet = ss.getSheetByName(CONFIG.SHEETS.MAIN);
  if (mainSheet) mainSheet.activate();
  if (showMessage && deleted) {
    ss.toast('すべてのソートビューを削除しました。', '完了', 3);
  }
}

// =================================================================================
// === 色付け処理とヘルパークラス ===
// =================================================================================

class ViewSheet {
  constructor(sheet) {
    this.sheet = sheet;
    this.startRow = CONFIG.DATA_START_ROW.MAIN;
    this.indices = getColumnIndices(this.sheet, MAIN_SHEET_HEADERS);
  }
  getSheet() { return this.sheet; }
  getLastRow() { return this.sheet.getLastRow(); }
}

function colorizeAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheets().forEach(sheet => {
    const sheetName = sheet.getName();
    try {
      if (sheetName === CONFIG.SHEETS.MAIN) colorizeSheet_(new MainSheet());
      else if (sheetName.startsWith(CONFIG.SHEETS.INPUT_PREFIX)) colorizeSheet_(new InputSheet(sheetName.replace(CONFIG.SHEETS.INPUT_PREFIX, '')));
      else if (sheetName.startsWith('ソートビュー')) colorizeSheet_(new ViewSheet(sheet));
    } catch (e) {
      Logger.log(`シート「${sheetName}」の色付け処理中にエラー: ${e.message}`);
    }
  });
}

function colorizeSheet_(sheetObject) {
  const sheet = sheetObject.getSheet();
  const startRow = sheetObject.startRow;
  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) return;
  const indices = sheetObject.indices;
  const lastCol = sheet.getLastColumn();
  const range = sheet.getRange(startRow, 1, lastRow - startRow + 1, lastCol);
  const values = range.getValues();
  const backgroundColors = [];
  const PROGRESS_COLORS = getColorMapFromMaster(CONFIG.SHEETS.SHINCHOKU_MASTER, 0, 1);
  const TANTOUSHA_COLORS = getColorMapFromMaster(CONFIG.SHEETS.TANTOUSHA_MASTER, 0, 2);
  const SAGYOU_KUBUN_COLORS = getColorMapFromMaster(CONFIG.SHEETS.SAGYOU_KUBUN_MASTER, 0, 1);
  const TOIAWASE_COLORS = getColorMapFromMaster(CONFIG.SHEETS.TOIAWASE_MASTER, 0, 1);
  const mgmtNoCol = indices.MGMT_NO, progressCol = indices.PROGRESS, tantoushaCol = indices.TANTOUSHA, toiawaseCol = indices.TOIAWASE, sagyouKubunCol = indices.SAGYOU_KUBUN;
  values.forEach((row, i) => {
    const rowColors = [];
    const baseColor = (i % 2 === 0) ? CONFIG.COLORS.DEFAULT_BACKGROUND : CONFIG.COLORS.ALTERNATE_ROW;
    for (let j = 0; j < lastCol; j++) rowColors[j] = baseColor;
    if (progressCol) {
      const progressValue = safeTrim(row[progressCol - 1]);
      const progressColor = getColor(PROGRESS_COLORS, progressValue, baseColor);
      rowColors[progressCol - 1] = progressColor;
      if (mgmtNoCol) rowColors[mgmtNoCol - 1] = progressColor;
    }
    if (sagyouKubunCol) {
      const value = safeTrim(row[sagyouKubunCol - 1]);
      const color = getColor(SAGYOU_KUBUN_COLORS, value, baseColor);
      if (color !== baseColor) rowColors[sagyouKubunCol - 1] = color;
    }
    if (tantoushaCol) {
       const value = safeTrim(row[tantoushaCol - 1]);
       const color = getColor(TANTOUSHA_COLORS, value, baseColor);
       if (color !== baseColor) rowColors[tantoushaCol - 1] = color;
    }
    if (toiawaseCol) {
       const value = safeTrim(row[toiawaseCol - 1]);
       const color = getColor(TOIAWASE_COLORS, value, baseColor);
       if (color !== baseColor) rowColors[toiawaseCol - 1] = color;
    }
    backgroundColors.push(rowColors);
  });
  range.setBackgrounds(backgroundColors);
}

// =================================================================================
// === フィルタ有効化機能 ===
// =================================================================================

/**
 * すべての工数シートにフィルタを作成する
 */
function enableFiltersOnAllInputSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let count = 0;

  ss.getSheets().forEach(sheet => {
    const sheetName = sheet.getName();
    if (sheetName.startsWith(CONFIG.SHEETS.INPUT_PREFIX)) {
      try {
        const inputSheet = new InputSheet(sheetName.replace(CONFIG.SHEETS.INPUT_PREFIX, ''));
        const lastRow = inputSheet.getLastRow();

        // 既存のフィルタを削除
        const existingFilter = sheet.getFilter();
        if (existingFilter) {
          existingFilter.remove();
        }

        // フィルタを作成（ヘッダー行から最終行まで）
        if (lastRow >= inputSheet.startRow) {
          sheet.getRange(
            inputSheet.startRow - 1,
            1,
            lastRow - inputSheet.startRow + 2,
            inputSheet.getLastColumn()
          ).createFilter();
          count++;
        }
      } catch (e) {
        Logger.log(`シート「${sheetName}」のフィルタ作成中にエラー: ${e.message}`);
      }
    }
  });

  ss.toast(`${count}件の工数シートにフィルタを作成しました。`, '完了', 3);
}

// =================================================================================
// === 既存のヘルパー関数群（変更なし） ===
// =================================================================================
function periodicMaintenance() {
  setupAllDataValidations();
}

function runAllManualMaintenance() {
  SpreadsheetApp.getActiveSpreadsheet().toast('各種設定と書式を適用中...', '処理中', 3);
  updateInputSheetHeaders();
  applyStandardFormattingToAllSheets();
  applyStandardFormattingToMainSheet();
  formatBillingSheet();
  applyStandardFormattingToMasterSheets();
  colorizeAllSheets();
  setupAllDataValidations();

  // 今月のカレンダーを補完（欠けている日付を追加）
  ensureCurrentMonthComplete();

  // フィルタを再適用（新規追加した列も含める）
  enableFiltersOnAllInputSheets();

  SpreadsheetApp.getActiveSpreadsheet().toast('適用が完了しました（カレンダー・フィルタも更新済み）。', '完了', 3);
}

/**
 * 全工数シートのヘッダー行を最新のINPUT_SHEET_HEADERSに更新する
 */
function updateInputSheetHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allSheets = ss.getSheets();
  const newHeaders = Object.values(INPUT_SHEET_HEADERS);
  const cache = CacheService.getScriptCache();

  allSheets.forEach(sheet => {
    const sheetName = sheet.getName();
    if (sheetName.startsWith(CONFIG.SHEETS.INPUT_PREFIX)) {
      try {
        const currentLastCol = sheet.getLastColumn();

        // 現在のヘッダー行を取得（日付列を含む全列）
        const currentHeaders = sheet.getRange(1, 1, 1, currentLastCol).getValues()[0];

        // SEPARATOR列のインデックスを探す（日付列との境界）
        const separatorIndex = newHeaders.indexOf("");

        // 既存のヘッダーとの差分を検出
        const existingBaseHeaders = currentHeaders.slice(0, separatorIndex + 1);
        const dateHeaders = currentHeaders.slice(separatorIndex + 1); // 日付列（保護する）

        // 新しい列を検出して挿入
        for (let i = 0; i < newHeaders.length; i++) {
          const newHeader = newHeaders[i];

          // 空文字（SEPARATOR）以降は日付列なのでスキップ
          if (i >= separatorIndex) {
            break;
          }

          // この位置に既に正しいヘッダーがあればスキップ
          if (existingBaseHeaders[i] === newHeader) {
            continue;
          }

          // 新しいヘッダーが既存のどこかに存在するか確認
          const existingIndex = existingBaseHeaders.indexOf(newHeader);

          if (existingIndex === -1) {
            // 新規列：この位置に挿入
            Logger.log(`工数シート「${sheetName}」: ${i + 1}列目に「${newHeader}」を挿入します。`);
            sheet.insertColumnBefore(i + 1);
            sheet.getRange(1, i + 1).setValue(newHeader);

            // existingBaseHeaders配列も更新（次のループで正しく比較できるように）
            existingBaseHeaders.splice(i, 0, newHeader);
          } else if (existingIndex !== i) {
            // 既存列が違う位置にある：移動が必要（今回は未実装、警告のみ）
            Logger.log(`警告: 工数シート「${sheetName}」の「${newHeader}」列が${existingIndex + 1}列目にありますが、${i + 1}列目に必要です。`);
          }
        }

        // 最終的なヘッダー行を構築（ベースヘッダー + 日付列）
        const finalHeaders = [...newHeaders, ...dateHeaders];
        sheet.getRange(1, 1, 1, finalHeaders.length).setValues([finalHeaders]);

        // このシートのキャッシュをクリア
        const cacheKey = `col_indices_${sheet.getSheetId()}`;
        cache.remove(cacheKey);

        Logger.log(`工数シート「${sheetName}」のヘッダーを更新しました。`);
      } catch (e) {
        Logger.log(`工数シート「${sheetName}」のヘッダー更新中にエラー: ${e.message}`);
        Logger.log(`スタックトレース: ${e.stack}`);
      }
    }
  });
}

function applyStandardFormattingToAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allSheets = ss.getSheets();
  
  allSheets.forEach(sheet => {
    try {
      if(sheet.getName().startsWith('ソートビュー')) return; 
      const dataRange = sheet.getDataRange();
      if (dataRange.isBlank()) return;
      const lastCol = sheet.getLastColumn();
      const lastRow = sheet.getLastRow();

      dataRange
        .setFontFamily("Arial")
        .setFontSize(12)
        .setVerticalAlignment("middle")
        .setBorder(true, true, true, true, true, true, "#cccccc", SpreadsheetApp.BorderStyle.SOLID);

      const headerRange = sheet.getRange(1, 1, 1, lastCol);
      headerRange.setHorizontalAlignment("center");

      const sheetName = sheet.getName();
      let indices;
      if (sheetName === CONFIG.SHEETS.MAIN) {
        indices = getColumnIndices(sheet, MAIN_SHEET_HEADERS);
        const numberCols = [indices.PLANNED_HOURS, indices.ACTUAL_HOURS];
        numberCols.forEach(colIndex => {
          if (colIndex && lastRow > 1) {
            sheet.getRange(2, colIndex, lastRow - 1).setHorizontalAlignment("right");
          }
        });
      } else if (sheetName.startsWith(CONFIG.SHEETS.INPUT_PREFIX)) {
        indices = getColumnIndices(sheet, INPUT_SHEET_HEADERS);
        const numberCols = [indices.PLANNED_HOURS, indices.ACTUAL_HOURS_SUM];
        numberCols.forEach(colIndex => {
          if (colIndex && lastRow > 2) {
             sheet.getRange(3, colIndex, lastRow - 2).setHorizontalAlignment("right");
          }
        });
        if (indices.SEPARATOR) {
           const dateColStart = indices.SEPARATOR + 2;
           if (lastCol >= dateColStart && lastRow > 2) {
             sheet.getRange(3, dateColStart, lastRow - 2, lastCol - dateColStart + 1).setHorizontalAlignment("right");
           }
        }
      }
    } catch (e) {
      Logger.log(`シート「${sheet.getName()}」の書式設定中にエラー: ${e.message}`);
    }
  });
}

function applyStandardFormattingToMainSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allSheets = ss.getSheets();

  allSheets.forEach(sheet => {
    if (sheet && (sheet.getName() === CONFIG.SHEETS.MAIN || sheet.getName().startsWith('ソートビュー'))) {
      try {
        const headerRange = sheet.getRange(1, 1, 1, sheet.getMaxColumns());
        headerRange.setBackground(CONFIG.COLORS.HEADER_BACKGROUND)
                   .setFontColor('#ffffff')
                   .setFontWeight('bold');

        sheet.setFrozenRows(1);
        sheet.setFrozenColumns(4);
      } catch(e) {
        Logger.log(`シート「${sheet.getName()}」のヘッダー書式設定中にエラー: ${e.message}`);
      }
    }
  });
}

/**
 * マスタシート（進捗マスタ、担当者マスタ、作業区分マスタ、問い合わせマスタ）に標準デザインを適用します
 */
function applyStandardFormattingToMasterSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheetNames = [
    CONFIG.SHEETS.SHINCHOKU_MASTER,
    CONFIG.SHEETS.TANTOUSHA_MASTER,
    CONFIG.SHEETS.SAGYOU_KUBUN_MASTER,
    CONFIG.SHEETS.TOIAWASE_MASTER
  ];

  masterSheetNames.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log(`マスタシート「${sheetName}」が見つかりません`);
      return;
    }

    try {
      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();

      if (lastRow < 1 || lastCol < 1) return;

      // 1. ヘッダー行のスタイル設定
      const headerRange = sheet.getRange(1, 1, 1, lastCol);
      headerRange
        .setBackground('#4f5459')
        .setFontColor('#ffffff')
        .setFontWeight('bold')
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle');

      // 2. ヘッダー行を固定
      sheet.setFrozenRows(1);

      // 3. データ行が存在する場合の書式設定
      if (lastRow >= 2) {
        const dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);

        // 全体にフォントとサイズを設定
        dataRange.setFontFamily('Arial').setFontSize(12);

        // 罫線を設定
        dataRange.setBorder(true, true, true, true, true, true, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);

        // 偶数行に薄い背景色を設定
        for (let i = 2; i <= lastRow; i++) {
          if ((i - 2) % 2 === 1) {  // 偶数行（データ行基準）
            sheet.getRange(i, 1, 1, lastCol).setBackground('#f0f5f5');
          }
        }
      }

      Logger.log(`マスタシート「${sheetName}」の見た目を整えました`);
    } catch (e) {
      Logger.log(`マスタシート「${sheetName}」の書式設定中にエラー: ${e.message}`);
    }
  });

  SpreadsheetApp.getActiveSpreadsheet().toast('マスタシートの見た目を整えました。', '完了', 3);
}

function setupAllDataValidations() {
  try {
    const mainSheetInstance = new MainSheet();
    const mainSheetObj = mainSheetInstance.getSheet(); 
    
    if (mainSheetObj.getLastRow() >= mainSheetInstance.startRow) {
      const mainLastRow = mainSheetObj.getMaxRows();
      const mainHeaderIndices = mainSheetInstance.indices;
      
      const mainValidationMap = {
        [CONFIG.SHEETS.SAGYOU_KUBUN_MASTER]: mainHeaderIndices.SAGYOU_KUBUN,
        [CONFIG.SHEETS.TOIAWASE_MASTER]: mainHeaderIndices.TOIAWASE,
        [CONFIG.SHEETS.TANTOUSHA_MASTER]: mainHeaderIndices.TANTOUSHA,
      };
      for (const [masterName, colIndex] of Object.entries(mainValidationMap)) {
        if(colIndex) {
          const masterValues = getMasterData(masterName).map(row => row[0]);
          if (masterValues.length > 0) {
            const rule = SpreadsheetApp.newDataValidation().requireValueInList(masterValues).setAllowInvalid(false).build();
            mainSheetObj.getRange(mainSheetInstance.startRow, colIndex, mainLastRow - mainSheetInstance.startRow + 1).setDataValidation(rule);
          }
        }
      }
      if (mainHeaderIndices.PROGRESS) {
        mainSheetObj.getRange(mainSheetInstance.startRow, mainHeaderIndices.PROGRESS, mainLastRow - mainSheetInstance.startRow + 1).clearDataValidations();
      }
    }

    const progressValues = getMasterData(CONFIG.SHEETS.SHINCHOKU_MASTER).map(row => row[0]);
    if (progressValues.length > 0) {
      const progressRule = SpreadsheetApp.newDataValidation().requireValueInList(progressValues).setAllowInvalid(false).build();
      const allSheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
      allSheets.forEach(sheet => {
        if (sheet.getName().startsWith(CONFIG.SHEETS.INPUT_PREFIX)) {
          try {
            const inputSheet = new InputSheet(sheet.getName().replace(CONFIG.SHEETS.INPUT_PREFIX, ''));
            const lastRow = sheet.getMaxRows();
            const progressCol = inputSheet.indices.PROGRESS;

            if(progressCol && lastRow >= inputSheet.startRow) {
              sheet.getRange(inputSheet.startRow, progressCol, lastRow - inputSheet.startRow + 1).setDataValidation(progressRule);
            }
          } catch(e) {
            Logger.log(`シート「${sheet.getName()}」の入力規則設定をスキップしました: ${e.message}`);
          }
        }
      });
    }
  } catch(e) {
    Logger.log(`データ入力規則の設定中にエラー: ${e.message}`);
  }
}