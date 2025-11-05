/**
 * SheetService.gs
 * スプレッドシートの各シートをオブジェクトとして効率的に扱うためのクラスを定義します。
 */

// =================================================================================
// === すべてのシートクラスの基盤となる抽象クラス ===
// =================================================================================
class SheetService {
  constructor(sheetName) {
    if (this.constructor === SheetService) {
      throw new Error("SheetServiceは抽象クラスのためインスタンス化できません。");
    }
    this.ss = SpreadsheetApp.getActiveSpreadsheet();
    this.sheet = this.ss.getSheetByName(sheetName);
    if (!this.sheet) {
      this.sheet = this.ss.insertSheet(sheetName);
    }
    this.sheetName = sheetName;
    this.startRow = 2;
  }

  getSheet() { return this.sheet; }
  getLastRow() { return this.sheet.getLastRow(); }
  getLastColumn() { return this.sheet.getLastColumn(); }
  getName() { return this.sheetName; }
}


// =================================================================================
// === メインシートを操作するためのクラス ===
// =================================================================================
class MainSheet extends SheetService {
  constructor() {
    super(CONFIG.SHEETS.MAIN);
    this.startRow = CONFIG.DATA_START_ROW.MAIN;
    this.indices = getColumnIndices(this.sheet, MAIN_SHEET_HEADERS);
  }

  getTantoushaList() {
    return getMasterData(CONFIG.SHEETS.TANTOUSHA_MASTER, 2)
      .map(row => ({ name: row[0], email: row[1] }))
      .filter(item => item.name && item.email);
  }

  getDataMap() {
    const lastRow = this.getLastRow();
    if (lastRow < this.startRow) return new Map();
    const values = this.sheet.getRange(this.startRow, 1, lastRow - this.startRow + 1, this.getLastColumn()).getValues();
    const dataMap = new Map();
    values.forEach((row, index) => {
      const mgmtNo = row[this.indices.MGMT_NO - 1];
      const sagyouKubun = row[this.indices.SAGYOU_KUBUN - 1];
      if (mgmtNo && sagyouKubun) {
        const uniqueKey = `${mgmtNo}_${sagyouKubun}`;
        dataMap.set(uniqueKey, { data: row, rowNum: this.startRow + index });
      }
    });
    return dataMap;
  }
}


// =================================================================================
// === 工数シートを操作するためのクラス (軽量化版) ===
// =================================================================================
class InputSheet extends SheetService {
  constructor(tantoushaName) {
    const sheetName = `${CONFIG.SHEETS.INPUT_PREFIX}${tantoushaName}`;
    super(sheetName);
    this.tantoushaName = tantoushaName;
    this.startRow = CONFIG.DATA_START_ROW.INPUT;
    this.indices = getColumnIndices(this.sheet, INPUT_SHEET_HEADERS);
  }

  clearData() {
    const existingFilter = this.sheet.getFilter();
    if (existingFilter) {
      existingFilter.remove();
    }
    const lastRow = this.getLastRow();
    if (lastRow >= this.startRow) {
      this.sheet.getRange(this.startRow, 1, lastRow - this.startRow + 1, this.getLastColumn()).clear();
    }
  }

  writeData(data) {
    const existingFilter = this.sheet.getFilter();
    if (existingFilter) {
      existingFilter.remove();
    }
    
    if (data.length === 0) return;
    
    const dataRange = this.sheet.getRange(this.startRow, 1, data.length, data[0].length);
    dataRange.setValues(data);

    const sumFormulas = [];
    const dateStartCol = Object.keys(INPUT_SHEET_HEADERS).length + 1;
    const dateStartColLetter = this.sheet.getRange(1, dateStartCol).getA1Notation().replace("1", "");
    for (let i = 0; i < data.length; i++) {
      const rowNum = this.startRow + i;
      sumFormulas.push([`=IFERROR(SUM(${dateStartColLetter}${rowNum}:${rowNum}))`]);
    }
    this.sheet.getRange(this.startRow, this.indices.ACTUAL_HOURS_SUM, data.length, 1).setFormulas(sumFormulas);

    // データ書き込み後に、ヘッダーを含めてフィルターを再作成する
    this.sheet.getRange(this.startRow - 1, 1, data.length + 1, this.getLastColumn()).createFilter();
  }
  
  getDataMapForProgress() {
    const lastRow = this.getLastRow();
    if (lastRow < this.startRow) return new Map();
    
    const lastColToRead = Math.max(this.indices.MGMT_NO, this.indices.SAGYOU_KUBUN, this.indices.PROGRESS);
    const values = this.sheet.getRange(this.startRow, 1, lastRow - this.startRow + 1, lastColToRead).getValues();
    
    const dataMap = new Map();
    values.forEach(row => {
      const mgmtNo = row[this.indices.MGMT_NO - 1];
      const sagyouKubun = row[this.indices.SAGYOU_KUBUN - 1];
      const progress = row[this.indices.PROGRESS - 1];
      if (mgmtNo && sagyouKubun) {
        const uniqueKey = `${mgmtNo}_${sagyouKubun}`;
        dataMap.set(uniqueKey, progress);
      }
    });
    return dataMap;
  }
}

// =================================================================================
// === カレンダーと休日のメンテナンス関数 ===
// =================================================================================

/**
 * 全ての工数シートをチェックし、必要であれば次の月の列を追加し、
 * その列に対して土日祝日の書式設定を適用する関数。
 * 月に一度のトリガーや、手動メニューからの実行を想定。
 */
function addNextMonthColumnsToAllInputSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allSheets = ss.getSheets();
  const today = new Date();
  const targetYear = today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear();
  const targetMonth = today.getMonth() === 11 ? 0 : today.getMonth() + 1;

  // 祝日リストを準備
  const holidays = new Set([...getJapaneseHolidays(targetYear)]);
  const holidayStrings = Array.from(holidays);

  allSheets.forEach(sheet => {
    if (sheet.getName().startsWith(CONFIG.SHEETS.INPUT_PREFIX)) {
      try {
        const lastCol = sheet.getLastColumn();
        if (lastCol === 0) return; // 空のシートはスキップ
        const dateHeaderRange = sheet.getRange(1, 1, 1, lastCol);
        const dateHeaderValues = dateHeaderRange.getValues()[0];

        let lastDate = null;
        for (let i = lastCol - 1; i > 0; i--) {
          if (dateHeaderValues[i] instanceof Date) {
            lastDate = dateHeaderValues[i];
            break;
          }
        }
        
        if (lastDate && lastDate.getFullYear() === targetYear && lastDate.getMonth() === targetMonth) {
           Logger.log(`シート「${sheet.getName()}」は既に更新済みのためスキップします。`);
           return;
        }

        // --- 次の月の列を追加 ---
        const daysInNextMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        const newDateHeaders = [];
        for (let i = 1; i <= daysInNextMonth; i++) {
          newDateHeaders.push(new Date(targetYear, targetMonth, i));
        }

        const newColumnStart = lastCol + 1;
        const newRange = sheet.getRange(1, newColumnStart, 1, daysInNextMonth);
        newRange.setValues([newDateHeaders]).setNumberFormat("M/d");

        // --- 追加した列にだけ、条件付き書式を適用 ---
        const rules = sheet.getConditionalFormatRules();
        
        // 週末用のルール
        const weekendRule = SpreadsheetApp.newConditionalFormatRule()
          .whenFormulaSatisfied(`=OR(WEEKDAY(${newRange.getA1Notation().split(':')[0]})=1, WEEKDAY(${newRange.getA1Notation().split(':')[0]})=7)`)
          .setBackground(CONFIG.COLORS.WEEKEND_HOLIDAY)
          .setRanges([newRange])
          .build();
        rules.push(weekendRule);

        // 祝日用のルール
        if (holidayStrings.length > 0) {
          const holidayFormula = `=MATCH(TEXT(${newRange.getA1Notation().split(':')[0]},"yyyy-mm-dd"), {${holidayStrings.map(d => `"${d}"`).join(",")}} ,0)`;
          const holidayRule = SpreadsheetApp.newConditionalFormatRule()
            .whenFormulaSatisfied(holidayFormula)
            .setBackground(CONFIG.COLORS.WEEKEND_HOLIDAY)
            .setRanges([newRange])
            .build();
          rules.push(holidayRule);
        }
        
        sheet.setConditionalFormatRules(rules);

        Logger.log(`シート「${sheet.getName()}」に${targetMonth + 1}月分のカレンダーを追加し、書式設定を行いました。`);

      } catch (e) {
        Logger.log(`「${sheet.getName()}」のカレンダー更新中にエラー: ${e.message}`);
      }
    }
  });
  SpreadsheetApp.getActiveSpreadsheet().toast('全工数シートのカレンダーを更新しました。');
}

/**
 * 今月のカレンダーを補完します（欠けている日付を追加）
 * 各種設定と書式を再適用する際に実行され、今月の日付が完全に揃っているか確認します。
 */
function ensureCurrentMonthComplete() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allSheets = ss.getSheets();
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // 祝日リストを準備
  const holidays = new Set([...getJapaneseHolidays(currentYear)]);
  const holidayStrings = Array.from(holidays);

  allSheets.forEach(sheet => {
    if (sheet.getName().startsWith(CONFIG.SHEETS.INPUT_PREFIX)) {
      try {
        const lastCol = sheet.getLastColumn();
        if (lastCol === 0) return; // 空のシートはスキップ

        const dateHeaderRange = sheet.getRange(1, 1, 1, lastCol);
        const dateHeaderValues = dateHeaderRange.getValues()[0];

        // 今月の日付を抽出
        const currentMonthDates = [];
        const currentMonthColumns = [];
        for (let i = 0; i < dateHeaderValues.length; i++) {
          const val = dateHeaderValues[i];
          if (val instanceof Date && val.getFullYear() === currentYear && val.getMonth() === currentMonth) {
            currentMonthDates.push(val.getDate());
            currentMonthColumns.push(i + 1); // 列番号（1始まり）
          }
        }

        // 欠けている日付を特定
        const missingDays = [];
        for (let day = 1; day <= daysInMonth; day++) {
          if (!currentMonthDates.includes(day)) {
            missingDays.push(day);
          }
        }

        if (missingDays.length === 0) {
          Logger.log(`シート「${sheet.getName()}」の今月カレンダーは完全です。`);
          return;
        }

        // 挿入位置を決定
        let insertCol;
        if (currentMonthDates.length === 0) {
          // 今月のカレンダーが全くない場合は、最終列の次に追加
          Logger.log(`シート「${sheet.getName()}」に今月のカレンダーが存在しないため、全ての日付を作成します。`);
          insertCol = lastCol + 1;
        } else {
          // 今月の日付が一部存在する場合は、最後の今月日付の次に追加
          const lastCurrentMonthCol = Math.max(...currentMonthColumns);
          insertCol = lastCurrentMonthCol + 1;
        }

        // 欠けている日付を追加
        const newDateHeaders = [];
        missingDays.forEach(day => {
          newDateHeaders.push(new Date(currentYear, currentMonth, day));
        });

        const newRange = sheet.getRange(1, insertCol, 1, missingDays.length);
        newRange.setValues([newDateHeaders]).setNumberFormat("M/d");

        // 条件付き書式を適用
        const rules = sheet.getConditionalFormatRules();

        // 週末用のルール
        const weekendRule = SpreadsheetApp.newConditionalFormatRule()
          .whenFormulaSatisfied(`=OR(WEEKDAY(${newRange.getA1Notation().split(':')[0]})=1, WEEKDAY(${newRange.getA1Notation().split(':')[0]})=7)`)
          .setBackground(CONFIG.COLORS.WEEKEND_HOLIDAY)
          .setRanges([newRange])
          .build();
        rules.push(weekendRule);

        // 祝日用のルール
        if (holidayStrings.length > 0) {
          const holidayFormula = `=MATCH(TEXT(${newRange.getA1Notation().split(':')[0]},"yyyy-mm-dd"), {${holidayStrings.map(d => `"${d}"`).join(",")}} ,0)`;
          const holidayRule = SpreadsheetApp.newConditionalFormatRule()
            .whenFormulaSatisfied(holidayFormula)
            .setBackground(CONFIG.COLORS.WEEKEND_HOLIDAY)
            .setRanges([newRange])
            .build();
          rules.push(holidayRule);
        }

        sheet.setConditionalFormatRules(rules);

        // 追加した日付列に書式を適用（緑線ボーダー、右揃えなど）
        const lastRow = sheet.getLastRow();
        if (lastRow > 2) {
          const newDataRange = sheet.getRange(3, insertCol, lastRow - 2, missingDays.length);
          newDataRange
            .setBorder(true, true, true, true, true, true, "#cccccc", SpreadsheetApp.BorderStyle.SOLID)
            .setHorizontalAlignment("right")
            .setVerticalAlignment("middle")
            .setFontFamily("Arial")
            .setFontSize(12);
        }

        Logger.log(`シート「${sheet.getName()}」に今月の欠けている日付（${missingDays.join(', ')}日）を追加しました。`);

      } catch (e) {
        Logger.log(`「${sheet.getName()}」の今月カレンダー補完中にエラー: ${e.message}`);
      }
    }
  });

  SpreadsheetApp.getActiveSpreadsheet().toast('今月のカレンダーを補完しました。', '完了', 2);
}

// =================================================================================
// === 月フィルタリング機能 ===
// =================================================================================

/**
 * すべての工数シートで、先月・今月・来月の3ヶ月分のみ表示する
 */
function showRecentThreeMonths() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-based (0=1月, 11=12月)

  // 先月、今月、来月の範囲を計算
  const lastMonth = new Date(currentYear, currentMonth - 1, 1);
  const nextMonthEnd = new Date(currentYear, currentMonth + 2, 0); // 来月の最終日

  let count = 0;

  ss.getSheets().forEach(sheet => {
    if (sheet.getName().startsWith(CONFIG.SHEETS.INPUT_PREFIX)) {
      try {
        const lastCol = sheet.getLastColumn();
        if (lastCol === 0) return;

        // まず全列を表示
        sheet.showColumns(1, lastCol);

        // ヘッダー行の日付を取得
        const dateHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

        // 非表示にする列を特定
        const columnsToHide = [];
        dateHeaders.forEach((header, i) => {
          if (header instanceof Date) {
            // 先月より前、または来月より後の日付は非表示
            if (header < lastMonth || header > nextMonthEnd) {
              columnsToHide.push(i + 1); // 列番号は1-based
            }
          }
        });

        // 連続した列をまとめて非表示
        if (columnsToHide.length > 0) {
          let rangeStart = columnsToHide[0];
          let rangeEnd = columnsToHide[0];

          for (let i = 1; i <= columnsToHide.length; i++) {
            if (i < columnsToHide.length && columnsToHide[i] === rangeEnd + 1) {
              rangeEnd = columnsToHide[i];
            } else {
              sheet.hideColumns(rangeStart, rangeEnd - rangeStart + 1);
              if (i < columnsToHide.length) {
                rangeStart = columnsToHide[i];
                rangeEnd = columnsToHide[i];
              }
            }
          }
        }

        count++;
      } catch (e) {
        Logger.log(`シート「${sheet.getName()}」の月フィルタリング中にエラー: ${e.message}`);
      }
    }
  });

  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const lastMonthName = monthNames[lastMonth.getMonth()];
  const thisMonthName = monthNames[currentMonth];
  const nextMonthName = monthNames[new Date(currentYear, currentMonth + 1, 1).getMonth()];

  ss.toast(`${count}件の工数シートを${lastMonthName}・${thisMonthName}・${nextMonthName}のみ表示しました。`, '完了', 3);
}

/**
 * すべての工数シートの全ての月を表示する（非表示を解除）
 */
function showAllMonths() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let count = 0;

  ss.getSheets().forEach(sheet => {
    if (sheet.getName().startsWith(CONFIG.SHEETS.INPUT_PREFIX)) {
      try {
        const lastCol = sheet.getLastColumn();
        if (lastCol > 0) {
          sheet.showColumns(1, lastCol);
          count++;
        }
      } catch (e) {
        Logger.log(`シート「${sheet.getName()}」の列表示中にエラー: ${e.message}`);
      }
    }
  });

  ss.toast(`${count}件の工数シートの全ての月を表示しました。`, '完了', 3);
}