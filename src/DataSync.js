/**
 * DataSync.gs
 * メインシートと工数シート間のデータ同期処理を専門に担当します。
 */

// =================================================================================
// === メイン → 工数シートへの同期処理 (差分更新アプローチ) ===
// =================================================================================
function syncMainToAllInputSheets() {
  const mainSheet = new MainSheet();
  const mainIndices = mainSheet.indices;

  // --- メインシートの「未着手」自動入力 ---
  if (mainSheet.getLastRow() >= mainSheet.startRow) {
    const range = mainSheet.sheet.getRange(mainSheet.startRow, 1, mainSheet.getLastRow() - mainSheet.startRow + 1, mainSheet.getLastColumn());
    const mainData = range.getValues();
    const mainFormulas = range.getFormulas();
    let hasUpdate = false;
    mainData.forEach((row, i) => {
      if (!row[mainIndices.PROGRESS - 1] && row[mainIndices.TANTOUSHA - 1]) {
        row[mainIndices.PROGRESS - 1] = "未着手";
        hasUpdate = true;
      }
    });
    if (hasUpdate) {
      // 数式を保護しながら書き込み
      const finalData = mainData.map((row, i) =>
        row.map((cell, j) => mainFormulas[i][j] || cell)
      );
      range.setValues(finalData);
    }
  }
  
  const mainDataValues = mainSheet.sheet.getRange(mainSheet.startRow, 1, mainSheet.getLastRow() - mainSheet.startRow + 1, mainSheet.getLastColumn()).getValues();
  
  // --- 担当者ごとに、メインシートにあるべき案件リストを作成 ---
  const projectsByTantousha = new Map();
  mainDataValues.forEach(row => {
    const tantousha = row[mainIndices.TANTOUSHA - 1];
    if (!tantousha) return;
    if (!projectsByTantousha.has(tantousha)) {
      projectsByTantousha.set(tantousha, new Map());
    }
    // ユニークキーの重複防止：管理Noと作業区分が両方空の場合はスキップ
    const mgmtNo = row[mainIndices.MGMT_NO - 1];
    const sagyouKubun = row[mainIndices.SAGYOU_KUBUN - 1];
    if (!mgmtNo || !sagyouKubun) {
      Logger.log(`データスキップ: 管理No「${mgmtNo}」作業区分「${sagyouKubun}」が空です`);
      return;
    }
    const key = `${mgmtNo}_${sagyouKubun}`;
    projectsByTantousha.get(tantousha).set(key, row);
  });

  // --- 各担当者シートをチェックして差分更新 ---
  const tantoushaList = mainSheet.getTantoushaList();
  tantoushaList.forEach(tantousha => {
    try {
      const inputSheet = new InputSheet(tantousha.name);
      const mainProjects = projectsByTantousha.get(tantousha.name) || new Map();
      
      const inputSheetRange = (inputSheet.getLastRow() >= inputSheet.startRow) 
        ? inputSheet.sheet.getRange(inputSheet.startRow, 1, inputSheet.getLastRow() - inputSheet.startRow + 1, inputSheet.getLastColumn())
        : null;
      const inputValues = inputSheetRange ? inputSheetRange.getValues() : [];
      
      const inputProjects = new Map();
      inputValues.forEach((row, i) => {
        const key = `${row[inputSheet.indices.MGMT_NO - 1]}_${row[inputSheet.indices.SAGYOU_KUBUN - 1]}`;
        inputProjects.set(key, { data: row, rowNum: inputSheet.startRow + i });
      });

      // 1. 工数シートから削除すべき行を特定
      const rowsToDelete = [];
      for (const [key, value] of inputProjects.entries()) {
        if (!mainProjects.has(key)) {
          rowsToDelete.push(value.rowNum);
        }
      }

      // 2. 工数シートに追加すべき行を特定
      const rowsToAdd = [];
      for (const [key, value] of mainProjects.entries()) {
        if (!inputProjects.has(key)) {
          rowsToAdd.push([
            value[mainIndices.MGMT_NO - 1],
            value[mainIndices.SAGYOU_KUBUN - 1],
            value[mainIndices.KIBAN - 1],
            value[mainIndices.PROGRESS - 1] || "",
            value[mainIndices.PLANNED_HOURS - 1],
          ]);
        }
      }

      // 3. 差分更新を実行
      if (rowsToDelete.length > 0) {
        // 行削除を最適化：降順ソートして後ろから削除
        rowsToDelete.sort((a, b) => b - a);
        rowsToDelete.forEach(rowNum => inputSheet.sheet.deleteRow(rowNum));
      }
      if (rowsToAdd.length > 0) {
        const startWriteRow = inputSheet.getLastRow() + 1;
        inputSheet.sheet.getRange(startWriteRow, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);

        const sumFormulas = [];
        const dateStartCol = Object.keys(INPUT_SHEET_HEADERS).length + 1;
        const dateStartColLetter = inputSheet.sheet.getRange(1, dateStartCol).getA1Notation().replace("1", "");
        for (let i = 0; i < rowsToAdd.length; i++) {
          const rowNum = startWriteRow + i;
          sumFormulas.push([`=IFERROR(SUM(${dateStartColLetter}${rowNum}:${rowNum}))`]);
        }
        inputSheet.sheet.getRange(startWriteRow, inputSheet.indices.ACTUAL_HOURS_SUM, rowsToAdd.length, 1).setFormulas(sumFormulas);
      }

      // フィルタを再作成（行追加・削除後）
      if (rowsToDelete.length > 0 || rowsToAdd.length > 0) {
        const existingFilter = inputSheet.sheet.getFilter();
        if (existingFilter) {
          existingFilter.remove();
        }
        const lastRow = inputSheet.getLastRow();
        if (lastRow >= inputSheet.startRow) {
          inputSheet.sheet.getRange(inputSheet.startRow - 1, 1, lastRow - inputSheet.startRow + 2, inputSheet.getLastColumn()).createFilter();
        }
      }

    } catch (e) {
      Logger.log(`${tantousha.name} の工数シート差分更新中にエラー: ${e.message}`);
    }
  });
}

// =================================================================================
// === 工数 → メインシートへの同期処理 (変更なし) ===
// =================================================================================
function syncInputToMain(inputSheetName, editedRange) {
  const tantoushaName = inputSheetName.replace(CONFIG.SHEETS.INPUT_PREFIX, '');
  const inputSheet = new InputSheet(tantoushaName);
  const mainSheet = new MainSheet();
  const mainDataMap = mainSheet.getDataMap();

  const editedRow = editedRange.getRow();
  if (editedRow < inputSheet.startRow) return;

  const editedRowValues = inputSheet.sheet.getRange(editedRow, 1, 1, inputSheet.getLastColumn()).getValues()[0];
  const inputIndices = inputSheet.indices;
  const mainIndices = mainSheet.indices;
  const mgmtNo = editedRowValues[inputIndices.MGMT_NO - 1];
  const sagyouKubun = editedRowValues[inputIndices.SAGYOU_KUBUN - 1];
  const uniqueKey = `${mgmtNo}_${sagyouKubun}`;
  const targetRowInfo = mainDataMap.get(uniqueKey);
  if (!targetRowInfo) return;

  const targetRowNum = targetRowInfo.rowNum;
  const editedCol = editedRange.getColumn();
  const targetRange = mainSheet.sheet.getRange(targetRowNum, 1, 1, mainSheet.getLastColumn());
  const targetValues = targetRange.getValues()[0];
  const targetFormulas = targetRange.getFormulas()[0];

  const newRowData = targetValues.map((cellValue, i) => targetFormulas[i] || cellValue);
  
  // 実工数を先に計算（請求シート同期で使用するため）
  let totalHours = 0;
  const dateStartCol = Object.keys(INPUT_SHEET_HEADERS).length + 1;
  if (inputSheet.getLastColumn() >= dateStartCol) {
    const hoursValues = inputSheet.sheet.getRange(editedRow, dateStartCol, 1, inputSheet.getLastColumn() - dateStartCol + 1).getValues()[0];
    totalHours = hoursValues.reduce((sum, h) => sum + toNumber(h), 0);
  }
  newRowData[mainIndices.ACTUAL_HOURS - 1] = totalHours;

  if (editedCol === inputIndices.PROGRESS) {
    const newProgress = editedRowValues[inputIndices.PROGRESS - 1];
    newRowData[mainIndices.PROGRESS - 1] = newProgress;

    const completionTriggers = getCompletionTriggerStatuses();
    const startDateTriggers = getStartDateTriggerStatuses();
    if (!isValidDate(newRowData[mainIndices.START_DATE - 1]) && startDateTriggers.includes(newProgress)) {
      newRowData[mainIndices.START_DATE - 1] = new Date();
    }

    if (completionTriggers.includes(newProgress)) {
      const completeDate = new Date();
      newRowData[mainIndices.COMPLETE_DATE - 1] = completeDate;

      // 請求シートへの同期（工数シートから進捗を完了状態に変更した場合）
      const kiban = targetValues[mainIndices.KIBAN - 1];
      const plannedHours = targetValues[mainIndices.PLANNED_HOURS - 1];
      syncCompletedToBillingSheet(mgmtNo, sagyouKubun, kiban, plannedHours, totalHours, completeDate);
    } else {
      newRowData[mainIndices.COMPLETE_DATE - 1] = '';
    }
  }
  newRowData[mainIndices.PROGRESS_EDITOR - 1] = tantoushaName;
  newRowData[mainIndices.UPDATE_TS - 1] = new Date();

  // リンク列（数式）を保護: 数式がある列は元の数式を維持
  const finalRowData = newRowData.map((cell, i) => {
    return targetFormulas[i] ? targetFormulas[i] : cell;
  });

  // 数式と値を混在させて書き込む
  for (let col = 0; col < finalRowData.length; col++) {
    const cellValue = finalRowData[col];
    const cellRange = mainSheet.sheet.getRange(targetRowNum, col + 1);

    if (typeof cellValue === 'string' && cellValue.startsWith('=')) {
      cellRange.setFormula(cellValue);
    } else {
      cellRange.setValue(cellValue);
    }
  }
}

// =================================================================================
// === 予定工数の同期処理 (メイン → 全工数シート) ===
// =================================================================================
/**
 * メインシートで予定工数が編集されたときに、全工数シートの該当行を更新します。
 * @param {number} editedRow - メインシートで編集された行番号
 */
function syncPlannedHoursToInputSheets(editedRow) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const mainSheet = new MainSheet();
  const mainIndices = mainSheet.indices;

  // 編集された行のデータを取得
  const editedRowRange = mainSheet.sheet.getRange(editedRow, 1, 1, mainSheet.getLastColumn());
  const editedRowValues = editedRowRange.getValues()[0];

  const mgmtNo = editedRowValues[mainIndices.MGMT_NO - 1];
  const sagyouKubun = editedRowValues[mainIndices.SAGYOU_KUBUN - 1];
  const newPlannedHours = editedRowValues[mainIndices.PLANNED_HOURS - 1];

  // 管理Noまたは作業区分が空の場合はスキップ
  if (!mgmtNo || !sagyouKubun) {
    ss.toast('管理Noまたは作業区分が空のため、予定工数を同期できません。', '同期スキップ', 3);
    return;
  }

  const uniqueKey = `${mgmtNo}_${sagyouKubun}`;
  const tantoushaList = mainSheet.getTantoushaList();
  let syncCount = 0;

  // 全工数シートをループして該当行を更新
  tantoushaList.forEach(tantousha => {
    try {
      const inputSheet = new InputSheet(tantousha.name);

      // 工数シートにデータが存在するかチェック
      if (inputSheet.getLastRow() < inputSheet.startRow) {
        return; // データがない場合はスキップ
      }

      // 工数シートのデータを取得
      const inputRange = inputSheet.sheet.getRange(inputSheet.startRow, 1, inputSheet.getLastRow() - inputSheet.startRow + 1, inputSheet.getLastColumn());
      const inputValues = inputRange.getValues();
      const inputFormulas = inputRange.getFormulas();

      // 該当行を検索（管理No + 作業区分がキー）
      for (let i = 0; i < inputValues.length; i++) {
        const row = inputValues[i];
        const rowMgmtNo = row[inputSheet.indices.MGMT_NO - 1];
        const rowSagyouKubun = row[inputSheet.indices.SAGYOU_KUBUN - 1];
        const rowKey = `${rowMgmtNo}_${rowSagyouKubun}`;

        if (rowKey === uniqueKey) {
          // 該当行が見つかった - 予定工数を更新
          const targetRowNum = inputSheet.startRow + i;
          const targetCol = inputSheet.indices.PLANNED_HOURS;

          // 数式を保護しながら値のみ更新
          if (!inputFormulas[i][targetCol - 1]) {
            inputSheet.sheet.getRange(targetRowNum, targetCol).setValue(newPlannedHours);
            syncCount++;
            Logger.log(`${tantousha.name} の工数シート: 行${targetRowNum} の予定工数を ${newPlannedHours} に更新`);
          }
          break; // 該当行は1つのみのはずなのでループを抜ける
        }
      }
    } catch (e) {
      Logger.log(`${tantousha.name} の工数シートへの予定工数同期中にエラー: ${e.message}`);
    }
  });

  // 同期結果を通知
  if (syncCount > 0) {
    ss.toast(`${syncCount}件の工数シートに予定工数を同期しました。`, '同期完了', 3);
  } else {
    ss.toast('該当する工数シートが見つかりませんでした。', '同期結果', 3);
  }
}

// =================================================================================
// === 予定工数の一括同期処理 ===
// =================================================================================
/**
 * メインシート全体の予定工数を全工数シートに一括同期します（カスタムメニューから実行）
 * 一斉入力時など、onEditトリガーで処理されない複数セル編集後に使用します。
 */
function syncAllPlannedHoursToInputSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const mainSheet = new MainSheet();

  ss.toast('予定工数の一括同期を開始します...', '処理中', 3);

  // メインシートのデータ行数を取得
  const lastRow = mainSheet.getLastRow();
  if (lastRow < mainSheet.startRow) {
    ss.toast('同期対象のデータがありません。', '完了', 3);
    return;
  }

  let totalProcessed = 0;

  // メインシートの各行をループして予定工数を同期
  for (let rowNum = mainSheet.startRow; rowNum <= lastRow; rowNum++) {
    try {
      // 既存の単一行同期関数を再利用
      syncPlannedHoursToInputSheets(rowNum);
      totalProcessed++;
    } catch (e) {
      Logger.log(`行${rowNum}の予定工数同期中にエラー: ${e.message}`);
    }
  }

  // 色付け処理を実行
  colorizeAllSheets();

  // 完了通知
  ss.toast(`${totalProcessed}行の予定工数を全工数シートに同期しました。`, '同期完了', 5);
  Logger.log(`予定工数一括同期完了: ${totalProcessed}行を処理しました`);
}

// =================================================================================
// === 完了案件の請求シート同期処理 ===
// =================================================================================
/**
 * メインシートで完了日が入力されたときに、請求シートに案件を追加/更新します。
 * @param {string} mgmtNo - 管理No
 * @param {string} sagyouKubun - 作業区分
 * @param {string} kiban - 機番（委託業務内容）
 * @param {number} plannedHours - 予定工数
 * @param {number} actualHours - 実工数
 * @param {Date} completeDate - 完了日
 */
function syncCompletedToBillingSheet(mgmtNo, sagyouKubun, kiban, plannedHours, actualHours, completeDate) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let billingSheet = ss.getSheetByName(CONFIG.SHEETS.BILLING);

  // 請求シートが存在しない場合は作成
  if (!billingSheet) {
    billingSheet = ss.insertSheet(CONFIG.SHEETS.BILLING);
    const headers = ["管理No", "委託業務内容", "作業区分", "予定工数", "実工数", "完了月"];
    billingSheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
    Logger.log('請求シートを新規作成しました');
  }

  // 管理Noまたは作業区分が空の場合はスキップ
  if (!mgmtNo || !sagyouKubun) {
    Logger.log('管理Noまたは作業区分が空のため、請求シートへの同期をスキップしました');
    return;
  }

  // 完了日から完了月を生成（YYYY-MM形式）
  const completeMonth = completeDate ? Utilities.formatDate(new Date(completeDate), Session.getScriptTimeZone(), 'yyyy-MM') : '';

  // 請求シートで該当行を検索（管理No + 作業区分がキー）
  const lastRow = billingSheet.getLastRow();
  let targetRow = null;

  if (lastRow >= 2) {
    const billingData = billingSheet.getRange(2, 1, lastRow - 1, 3).getValues();
    for (let i = 0; i < billingData.length; i++) {
      if (billingData[i][0] === mgmtNo && billingData[i][2] === sagyouKubun) {
        targetRow = i + 2;
        break;
      }
    }
  }

  // 行データを準備
  const rowData = [
    mgmtNo,
    kiban || '',
    sagyouKubun,
    plannedHours || '',
    actualHours || '',
    completeMonth
  ];

  if (targetRow) {
    // 既存行を更新
    billingSheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
    Logger.log(`請求シート: 行${targetRow} を更新しました（管理No: ${mgmtNo}, 作業区分: ${sagyouKubun}）`);
  } else {
    // 新規行を追加
    const newRow = lastRow + 1;
    billingSheet.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);
    Logger.log(`請求シート: 行${newRow} を追加しました（管理No: ${mgmtNo}, 作業区分: ${sagyouKubun}）`);
  }

  // フィルタがまだ設定されていない場合は追加
  const existingFilter = billingSheet.getFilter();
  if (!existingFilter && billingSheet.getLastRow() >= 2) {
    const dataRange = billingSheet.getRange(1, 1, billingSheet.getLastRow(), 6);
    dataRange.createFilter();
    Logger.log('請求シートにフィルタを設定しました');
  }
}