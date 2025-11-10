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
            value[mainIndices.KIBAN_URL - 1] || "",      // 機番(リンク)
            value[mainIndices.SERIES_URL - 1] || "",     // STD資料(リンク)
            "",  // 備考列（初期値は空）
            value[mainIndices.DRAWING_DEADLINE - 1] || "",  // 作図期限
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
      syncCompletedToBillingSheet(mgmtNo, sagyouKubun, kiban, plannedHours, totalHours, completeDate, newProgress);
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
// === 予定工数の一括同期処理（最適化版） ===
// =================================================================================
/**
 * メインシート全体の予定工数を全工数シートに一括同期します（カスタムメニューから実行）
 * 一斉入力時など、onEditトリガーで処理されない複数セル編集後に使用します。
 *
 * パフォーマンス最適化:
 * - バッチ処理で工数シート読み取りを最小化
 * - 不要な行（管理No/作業区分が空）を事前除外
 * - 色付け処理を削除
 */
function syncAllPlannedHoursToInputSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const mainSheet = new MainSheet();
  const mainIndices = mainSheet.indices;

  ss.toast('予定工数と作図期限の一括同期を開始します...', '処理中', 3);

  // 1. メインシートの全データを一度に取得
  const lastRow = mainSheet.getLastRow();
  if (lastRow < mainSheet.startRow) {
    ss.toast('同期対象のデータがありません。', '完了', 3);
    return;
  }

  const mainData = mainSheet.sheet.getRange(mainSheet.startRow, 1, lastRow - mainSheet.startRow + 1, mainSheet.getLastColumn()).getValues();

  // 2. 有効な行のみを抽出（管理No + 作業区分が両方とも存在）
  const validRows = new Map();  // key: 担当者名, value: Map{ key: {plannedHours, drawingDeadline} }

  mainData.forEach((row, index) => {
    const mgmtNo = row[mainIndices.MGMT_NO - 1];
    const sagyouKubun = row[mainIndices.SAGYOU_KUBUN - 1];
    const plannedHours = row[mainIndices.PLANNED_HOURS - 1];
    const drawingDeadline = row[mainIndices.DRAWING_DEADLINE - 1];
    const tantousha = row[mainIndices.TANTOUSHA - 1];

    // 管理No、作業区分、担当者が全て存在する行のみ処理
    if (mgmtNo && sagyouKubun && tantousha) {
      const key = `${mgmtNo}_${sagyouKubun}`;

      if (!validRows.has(tantousha)) {
        validRows.set(tantousha, new Map());
      }
      validRows.get(tantousha).set(key, { plannedHours, drawingDeadline });
    }
  });

  let totalUpdated = 0;
  const failedSheets = [];

  // 3. 担当者ごとに工数シートを処理（リトライ機構付き）
  for (const [tantoushaName, syncDataMap] of validRows.entries()) {
    const result = retrySync(() => {
      const inputSheet = new InputSheet(tantoushaName);

      // 工数シートにデータが存在するかチェック
      if (inputSheet.getLastRow() < inputSheet.startRow) {
        return { skipped: true };
      }

      // 工数シートの全データを一度に取得
      const inputRange = inputSheet.sheet.getRange(inputSheet.startRow, 1, inputSheet.getLastRow() - inputSheet.startRow + 1, inputSheet.getLastColumn());
      const inputValues = inputRange.getValues();
      const inputFormulas = inputRange.getFormulas();

      // 更新対象の行を特定
      const updates = [];  // [{row: rowNum, plannedHours: value, drawingDeadline: value}, ...]

      inputValues.forEach((row, i) => {
        const rowMgmtNo = row[inputSheet.indices.MGMT_NO - 1];
        const rowSagyouKubun = row[inputSheet.indices.SAGYOU_KUBUN - 1];
        const rowKey = `${rowMgmtNo}_${rowSagyouKubun}`;

        if (syncDataMap.has(rowKey)) {
          const targetRowNum = inputSheet.startRow + i;
          const syncData = syncDataMap.get(rowKey);
          const plannedHoursCol = inputSheet.indices.PLANNED_HOURS;
          const drawingDeadlineCol = inputSheet.indices.DRAWING_DEADLINE;

          const updateData = { row: targetRowNum };

          // 予定工数：数式がない場合のみ更新
          if (!inputFormulas[i][plannedHoursCol - 1]) {
            updateData.plannedHours = syncData.plannedHours;
          }

          // 作図期限：数式がない場合のみ更新
          if (drawingDeadlineCol && !inputFormulas[i][drawingDeadlineCol - 1]) {
            updateData.drawingDeadline = syncData.drawingDeadline;
          }

          updates.push(updateData);
        }
      });

      // まとめて更新
      updates.forEach(update => {
        if (update.plannedHours !== undefined) {
          inputSheet.sheet.getRange(update.row, inputSheet.indices.PLANNED_HOURS).setValue(update.plannedHours);
        }
        if (update.drawingDeadline !== undefined && inputSheet.indices.DRAWING_DEADLINE) {
          inputSheet.sheet.getRange(update.row, inputSheet.indices.DRAWING_DEADLINE).setValue(update.drawingDeadline);
        }
      });

      Logger.log(`${tantoushaName} の工数シート: ${updates.length}件を更新`);
      return { skipped: false, updateCount: updates.length };

    }, 3, `${tantoushaName} の工数シートへの予定工数・作図期限同期`);

    if (result.success && !result.result.skipped) {
      totalUpdated += result.result.updateCount;
    } else if (!result.success) {
      failedSheets.push(tantoushaName);
    }
  }

  // 完了通知
  if (failedSheets.length > 0) {
    const failedList = failedSheets.join(', ');
    ss.toast(
      `予定工数・作図期限同期: ${totalUpdated}件を更新、${failedSheets.length}件の工数シートで失敗\n失敗: ${failedList}`,
      '同期完了（一部失敗）',
      10
    );
    Logger.log(`予定工数・作図期限一括同期完了: ${totalUpdated}件を更新、失敗: ${failedList}`);
  } else {
    ss.toast(`${totalUpdated}件の予定工数・作図期限を工数シートに同期しました。`, '同期完了', 5);
    Logger.log(`予定工数・作図期限一括同期完了: ${totalUpdated}件を更新しました`);
  }
}

// =================================================================================
// === 完了案件の一括同期処理 ===
// =================================================================================
/**
 * メインシート全体から完了日が入力済みの案件を請求シートに一括同期します（カスタムメニューから実行）
 */
function syncAllCompletedToBillingSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const mainSheet = new MainSheet();
  const mainIndices = mainSheet.indices;

  ss.toast('完了案件の一括同期を開始します...', '処理中', 3);

  // メインシートのデータ行数を取得
  const lastRow = mainSheet.getLastRow();
  if (lastRow < mainSheet.startRow) {
    ss.toast('同期対象のデータがありません。', '完了', 3);
    return;
  }

  // メインシートの全データを取得
  const mainData = mainSheet.sheet.getRange(mainSheet.startRow, 1, lastRow - mainSheet.startRow + 1, mainSheet.getLastColumn()).getValues();
  let syncCount = 0;

  // 各行をループして完了日が入力済みの案件を同期
  mainData.forEach((row, index) => {
    try {
      const completeDate = row[mainIndices.COMPLETE_DATE - 1];

      // 完了日が入力されている場合のみ同期
      if (completeDate && isValidDate(completeDate)) {
        const mgmtNo = row[mainIndices.MGMT_NO - 1];
        const sagyouKubun = row[mainIndices.SAGYOU_KUBUN - 1];
        const kiban = row[mainIndices.KIBAN - 1];
        const plannedHours = row[mainIndices.PLANNED_HOURS - 1];
        const actualHours = row[mainIndices.ACTUAL_HOURS - 1];
        const progress = row[mainIndices.PROGRESS - 1];

        syncCompletedToBillingSheet(mgmtNo, sagyouKubun, kiban, plannedHours, actualHours, new Date(completeDate), progress);
        syncCount++;
      }
    } catch (e) {
      Logger.log(`行${mainSheet.startRow + index}の請求シート同期中にエラー: ${e.message}`);
    }
  });

  // 同期後に見た目を整える
  if (syncCount > 0) {
    formatBillingSheet();
  }

  // 完了通知
  ss.toast(`${syncCount}件の完了案件を請求シートに同期しました。`, '同期完了', 5);
  Logger.log(`完了案件一括同期完了: ${syncCount}件を処理しました`);
}

// =================================================================================
// === 請求シートの見た目整形処理 ===
// =================================================================================
/**
 * 請求シートの見た目を整える（カスタムメニューから実行）
 */
function formatBillingSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const billingSheet = ss.getSheetByName(CONFIG.SHEETS.BILLING);

  if (!billingSheet) {
    ss.toast('請求シートが存在しません。', 'エラー', 3);
    return;
  }

  const lastRow = billingSheet.getLastRow();
  if (lastRow < 1) return;

  // 1. ヘッダー行のスタイル設定
  const headerRange = billingSheet.getRange(1, 1, 1, 6);
  headerRange
    .setBackground('#4f5459')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  // 2. ヘッダー行を固定
  billingSheet.setFrozenRows(1);

  // 3. データ行が存在する場合の書式設定
  if (lastRow >= 2) {
    const dataRange = billingSheet.getRange(2, 1, lastRow - 1, 6);

    // 全体にフォントとサイズを設定
    dataRange.setFontFamily('Arial').setFontSize(12);

    // 罫線を設定
    dataRange.setBorder(true, true, true, true, true, true, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);

    // 数値列（予定工数・実工数）を右揃え
    billingSheet.getRange(2, 4, lastRow - 1, 2).setHorizontalAlignment('right');

    // 偶数行に薄い背景色を設定
    for (let i = 2; i <= lastRow; i++) {
      if ((i - 2) % 2 === 1) {  // 偶数行（データ行基準）
        billingSheet.getRange(i, 1, 1, 6).setBackground('#f0f5f5');
      }
    }
  }

  // 4. 列幅を調整
  billingSheet.setColumnWidth(1, 100);  // 管理No
  billingSheet.setColumnWidth(2, 150);  // 委託業務内容
  billingSheet.setColumnWidth(3, 120);  // 作業区分
  billingSheet.setColumnWidth(4, 80);   // 予定工数
  billingSheet.setColumnWidth(5, 80);   // 実工数
  billingSheet.setColumnWidth(6, 100);  // 完了月

  Logger.log('請求シートの見た目を整えました');
  ss.toast('請求シートの見た目を整えました。', '完了', 3);
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
 * @param {string} progress - 進捗ステータス
 */
function syncCompletedToBillingSheet(mgmtNo, sagyouKubun, kiban, plannedHours, actualHours, completeDate, progress) {
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

  // 請求書トリガーステータスでない場合はスキップ
  const billingTriggers = getBillingTriggerStatuses();
  if (!billingTriggers.includes(progress)) {
    Logger.log(`進捗「${progress}」は請求書トリガー対象外のため、同期をスキップしました`);
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