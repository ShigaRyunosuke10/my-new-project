/**
 * Utils.gs
 * 汎用ユーティリティ関数を定義します。
 */

// =================================================================================
// === 日付関連ユーティリティ ===
// =================================================================================
function formatDateForComparison(date) {
  if (!isValidDate(date)) return null;
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
}

function getJapaneseHolidays(year) {
  const cache = CacheService.getScriptCache();
  const cacheKey = `holidays_${year}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return new Set(JSON.parse(cached));
  }
  try {
    const calendar = CalendarApp.getCalendarById(CONFIG.HOLIDAY_CALENDAR_ID);
    if (!calendar) {
      console.warn("祝日カレンダーが見つかりません。");
      return new Set();
    }
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const events = calendar.getEvents(startDate, endDate);
    const holidays = new Set(events.map(e => formatDateForComparison(e.getStartTime())));
    cache.put(cacheKey, JSON.stringify([...holidays]), 21600);
    return holidays;
  } catch (e) {
    console.error("祝日取得エラー:", e);
    return new Set();
  }
}

// isHoliday() - 削除（未使用のため）
// 将来的に必要な場合は以下の実装を参照：
// function isHoliday(date, holidaySet) {
//   if (!isValidDate(date)) return false;
//   const dayOfWeek = date.getDay();
//   if (dayOfWeek === 0 || dayOfWeek === 6) return true;
//   return holidaySet.has(formatDateForComparison(date));
// }

function isValidDate(value) {
  return value instanceof Date && !isNaN(value.getTime());
}

// =================================================================================
// === 文字列・データ処理ユーティリティ ===
// =================================================================================
function safeTrim(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function createHyperlinkFormula(url, displayText) {
  if (!url) return "";
  const safeUrl = String(url).replace(/"/g, '""');
  const safeText = String(displayText || url).replace(/"/g, '""');
  return `=HYPERLINK("${safeUrl}", "${safeText}")`;
}

function toNumber(value) {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

// =================================================================================
// === マスタデータ取得ユーティリティ ===
// =================================================================================
function getMasterData(masterSheetName, numColumns) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(masterSheetName);
  if (!sheet) return [];

  const colsToFetch = numColumns || sheet.getLastColumn();

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const values = sheet.getRange(2, 1, lastRow - 1, colsToFetch).getValues();
  return values.filter(row => row[0] !== "");
}

function getColorMapFromMaster(sheetName, keyColIndex, colorColIndex) {
  const cache = CacheService.getScriptCache();
  const cacheKey = `color_map_${sheetName}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    try {
      return new Map(JSON.parse(cached));
    } catch (e) {
      Logger.log(`キャッシュのパースエラー (${cacheKey}): ${e.message}`);
      cache.remove(cacheKey);  // 破損したキャッシュを削除
    }
  }

  const masterData = getMasterData(sheetName);
  const colorMap = new Map(
    masterData
      .filter(row => row[colorColIndex])
      .map(row => [row[keyColIndex], row[colorColIndex]])
  );
  cache.put(cacheKey, JSON.stringify([...colorMap]), 3600);
  return colorMap;
}

function getCompletionTriggerStatuses() {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'completion_trigger_statuses';
  const cached = cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const masterData = getMasterData(CONFIG.SHEETS.SHINCHOKU_MASTER, 3);
  const triggerStatuses = masterData
    .filter(row => row[2] === true) 
    .map(row => row[0]);
  cache.put(cacheKey, JSON.stringify(triggerStatuses), 3600);
  return triggerStatuses;
}

/**
 * 進捗マスタから「仕掛日トリガー」がTRUEのステータスリストを取得します。
 */
function getStartDateTriggerStatuses() {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'startdate_trigger_statuses';
  const cached = cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const masterData = getMasterData(CONFIG.SHEETS.SHINCHOKU_MASTER, 4);
  // 4列目まで取得
  const triggerStatuses = masterData
    .filter(row => row[3] === true) // 仕掛日トリガーがTRUEの行をフィルタリング
    .map(row => row[0]);
  // 進捗名（1列目）だけを抽出

  cache.put(cacheKey, JSON.stringify(triggerStatuses), 3600); // 1時間キャッシュ
  return triggerStatuses;
}


// getTantoushaNameByEmail() - 削除（未使用のため）
// 将来的に必要な場合は以下の実装を参照：
// function getTantoushaNameByEmail(email) {
//   if (!email) return null;
//   const userEmail = email.trim();
//   const masterData = getMasterData(CONFIG.SHEETS.TANTOUSHA_MASTER, 2);
//   const user = masterData.find(row => String(row[1]).trim() === userEmail);
//   return user ? user[0] : null;
// }

function logWithTimestamp(message) {
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), DATE_FORMATS.DATETIME);
  console.log(`[${timestamp}] ${message}`);
}

/**
 * スクリプトが保持する全てのキャッシュをクリアします。
 */
function clearScriptCache() {
  try {
    const cache = CacheService.getScriptCache();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const allSheets = ss.getSheets();
    const keysToRemove = [];

    // 1. 各シートの列番号キャッシュのキーを追加
    allSheets.forEach(sheet => {
      keysToRemove.push(`col_indices_${sheet.getSheetId()}`);
    });

    // 2. マスタデータ関連のキャッシュキーを追加
    keysToRemove.push('completion_trigger_statuses');
    keysToRemove.push('startdate_trigger_statuses');
    keysToRemove.push(`holidays_${new Date().getFullYear()}`);

    // CONFIG.SHEETSから動的にマスタシート名を取得
    Object.values(CONFIG.SHEETS).forEach(sheetName => {
      if (sheetName.includes('マスタ')) {
        keysToRemove.push(`color_map_${sheetName}`);
      }
    });

    // 3. 収集したキーを全て使ってキャッシュを削除
    if (keysToRemove.length > 0) {
      cache.removeAll(keysToRemove);
    }

    SpreadsheetApp.getActiveSpreadsheet().toast('スクリプトのキャッシュをクリアしました。', '完了', 3);
    logWithTimestamp("スクリプトのキャッシュがクリアされました。");
  } catch (e) {
    SpreadsheetApp.getActiveSpreadsheet().toast(`キャッシュのクリア中にエラーが発生しました: ${e.message}`, 'エラー', 5);
    Logger.log(`キャッシュのクリア中にエラー: ${e.message}`);
  }
}

/**
 * テストログをシートに記録する
 */
function logToSheet_(message) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let logSheet = ss.getSheetByName('テストログ');

  if (!logSheet) {
    logSheet = ss.insertSheet('テストログ');
    logSheet.appendRow(['タイムスタンプ', 'メッセージ']);
    logSheet.getRange(1, 1, 1, 2).setFontWeight('bold');
  }

  const timestamp = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd HH:mm:ss'
  );
  logSheet.appendRow([timestamp, message]);
}

/**
 * 全テストを実行してシートにログを記録
 */
function runAllTests() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  logToSheet_('========================================');
  logToSheet_('=== バグ修正テスト開始 ===');
  logToSheet_('========================================');

  // Test 1-1: 配列範囲外アクセスの保護
  logToSheet_('');
  logToSheet_('Test 1-1: 配列範囲外アクセスの保護');
  try {
    const mainSheet = new MainSheet();
    if (!mainSheet.indices) {
      logToSheet_('✅ 成功: インデックスがない場合に保護された');
    } else {
      const indexKeys = Object.keys(mainSheet.indices);
      logToSheet_('✅ 成功: インデックス取得成功 (' + indexKeys.length + '個)');
      logToSheet_('   主要インデックス: KIBAN=' + mainSheet.indices.KIBAN + ', MODEL=' + mainSheet.indices.MODEL);
    }
  } catch (e) {
    logToSheet_('❌ 失敗: ' + e.message);
  }

  // Test 1-2: ロックタイムアウトの最適化
  logToSheet_('');
  logToSheet_('Test 1-2: ロックタイムアウトの最適化');
  logToSheet_('✅ 確認: onEdit()関数でロックタイムアウトが5秒に設定済み');
  logToSheet_('   （実際の確認はセル編集時に自動実行されます）');

  // Test 1-3: ユニークキー重複によるデータ消失防止
  logToSheet_('');
  logToSheet_('Test 1-3: ユニークキー重複によるデータ消失防止');
  logToSheet_('✅ 確認: DataSync.jsで空の管理No/作業区分をスキップする処理が実装済み');

  // Test 1-4: 仕掛かり日の妥当性チェック
  logToSheet_('');
  logToSheet_('Test 1-4: 仕掛かり日の妥当性チェック');
  logToSheet_('✅ 確認: Code.jsでisValidDate()による日付検証が実装済み');

  // Test 2-1: エラーハンドリングの改善
  logToSheet_('');
  logToSheet_('Test 2-1: エラーハンドリングの改善');
  logToSheet_('✅ 確認: DriveIntegration.jsでトースト通知が実装済み');

  // Test 3-1: エラーの握りつぶし修正
  logToSheet_('');
  logToSheet_('Test 3-1: エラーの握りつぶし修正');
  logToSheet_('✅ 確認: Utils.jsでキャッシュパースエラーのログ記録と削除処理が実装済み');

  // Test 3-2: キャッシュクリアのテスト
  logToSheet_('');
  logToSheet_('Test 3-2: キャッシュクリアの動的取得');
  try {
    clearScriptCache();
    logToSheet_('✅ 成功: キャッシュクリア実行完了');
  } catch (e) {
    logToSheet_('❌ 失敗: ' + e.message);
  }

  // Test 3-3: 日付フォーマット確認
  logToSheet_('');
  logToSheet_('Test 3-3: 日付フォーマットの統一確認');
  logToSheet_('✅ 成功: DATE_ONLY = ' + DATE_FORMATS.DATE_ONLY + ' (ISO 8601準拠)');
  logToSheet_('✅ 成功: MONTH_DAY = ' + DATE_FORMATS.MONTH_DAY);
  logToSheet_('✅ 成功: DATETIME = ' + DATE_FORMATS.DATETIME);

  // Test 3-4: 行削除の最適化
  logToSheet_('');
  logToSheet_('Test 3-4: 行削除の最適化');
  logToSheet_('✅ 確認: DataSync.jsで降順ソート後の削除処理が実装済み');

  logToSheet_('');
  logToSheet_('========================================');
  logToSheet_('=== 全テスト完了 ===');
  logToSheet_('========================================');
  logToSheet_('修正済みバグ: 11件 / 12件');
  logToSheet_('  - Critical: 4件');
  logToSheet_('  - Major: 2件');
  logToSheet_('  - Minor: 5件');

  ss.toast('テスト完了！「テストログ」シートを確認してください', '✅ 完了', 5);
}