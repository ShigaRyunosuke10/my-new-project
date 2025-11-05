/**
 * SyncRetry.js
 * 同期処理の統一的なリトライ機構と失敗ログ管理を提供します。
 */

// =================================================================================
// === リトライ機構 ===
// =================================================================================

/**
 * 任意の同期関数を最大回数までリトライ実行します。
 *
 * @param {Function} fn - 実行する同期関数
 * @param {number} maxRetries - 最大リトライ回数（デフォルト: 3）
 * @param {string} description - 処理の説明（ログ用）
 * @param {number} waitMs - リトライ間隔（ミリ秒、デフォルト: 1000）
 * @returns {{success: boolean, result: any, error: Error|null}} 実行結果
 */
function retrySync(fn, maxRetries = 3, description = '同期処理', waitMs = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = fn();
      if (attempt > 1) {
        Logger.log(`${description}: ${attempt}回目の試行で成功`);
      }
      return { success: true, result: result, error: null };
    } catch (e) {
      Logger.log(`${description}: ${attempt}回目の試行で失敗 - ${e.message}`);

      if (attempt < maxRetries) {
        Logger.log(`${waitMs}ms待機後に再試行します...`);
        Utilities.sleep(waitMs);
      } else {
        // 最終試行でも失敗した場合
        Logger.log(`${description}: 全${maxRetries}回の試行で失敗`);
        logSyncFailure_(description, e.message);
        return { success: false, result: null, error: e };
      }
    }
  }
}

// =================================================================================
// === 失敗ログ管理 ===
// =================================================================================

const SYNC_FAILURE_KEY = 'sync_failures';
const SYNC_FAILURE_EXPIRY = 86400; // 24時間（秒）

/**
 * 同期失敗をキャッシュに記録します（内部関数）
 *
 * @param {string} description - 失敗した処理の説明
 * @param {string} errorMsg - エラーメッセージ
 */
function logSyncFailure_(description, errorMsg) {
  try {
    const cache = CacheService.getScriptCache();
    const existingData = cache.get(SYNC_FAILURE_KEY);

    const failures = existingData ? JSON.parse(existingData) : [];

    failures.push({
      description: description,
      error: errorMsg,
      timestamp: new Date().toISOString()
    });

    // 最新100件のみ保持
    if (failures.length > 100) {
      failures.shift();
    }

    cache.put(SYNC_FAILURE_KEY, JSON.stringify(failures), SYNC_FAILURE_EXPIRY);
  } catch (e) {
    Logger.log(`失敗ログの記録中にエラー: ${e.message}`);
  }
}

/**
 * 記録された同期失敗の履歴を取得します。
 *
 * @returns {Array<{description: string, error: string, timestamp: string}>} 失敗履歴
 */
function getSyncFailures() {
  try {
    const cache = CacheService.getScriptCache();
    const data = cache.get(SYNC_FAILURE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    Logger.log(`失敗ログの取得中にエラー: ${e.message}`);
    return [];
  }
}

/**
 * 同期失敗の履歴をクリアします。
 */
function clearSyncFailures() {
  try {
    const cache = CacheService.getScriptCache();
    cache.remove(SYNC_FAILURE_KEY);
    Logger.log('同期失敗履歴をクリアしました');
  } catch (e) {
    Logger.log(`失敗ログのクリア中にエラー: ${e.message}`);
  }
}

// =================================================================================
// === ユーザー向けメニュー関数 ===
// =================================================================================

/**
 * 失敗した同期処理の履歴を表示します（カスタムメニューから実行）
 */
function showSyncFailures() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const failures = getSyncFailures();

  if (failures.length === 0) {
    ss.toast('同期失敗の履歴はありません。', '同期失敗履歴', 3);
    return;
  }

  let message = `同期失敗履歴（最新${failures.length}件）:\n\n`;

  // 最新5件のみ表示
  const displayCount = Math.min(5, failures.length);
  for (let i = failures.length - 1; i >= failures.length - displayCount; i--) {
    const f = failures[i];
    const time = new Date(f.timestamp).toLocaleString('ja-JP');
    message += `[${time}] ${f.description}\nエラー: ${f.error}\n\n`;
  }

  if (failures.length > 5) {
    message += `他${failures.length - 5}件の失敗あり`;
  }

  SpreadsheetApp.getUi().alert('同期失敗履歴', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * 同期失敗履歴をクリアします（カスタムメニューから実行）
 */
function clearSyncFailureLog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  clearSyncFailures();
  ss.toast('同期失敗履歴をクリアしました。', '完了', 3);
}

// =================================================================================
// === 夜間自動リトライ機能 ===
// =================================================================================

/**
 * 失敗した同期を再実行します（カスタムメニューまたは夜間トリガーから実行）
 *
 * 以下の同期を順番に再実行します:
 * 1. リンク同期（メイン→全工数）
 * 2. 予定工数同期（メイン→全工数）
 * 3. 完了案件同期（メイン→請求）
 */
function retryAllFailedSyncs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const failures = getSyncFailures();

  if (failures.length === 0) {
    ss.toast('再実行する失敗同期はありません。', '同期再実行', 3);
    Logger.log('再実行する失敗同期はありません');
    return;
  }

  Logger.log(`失敗同期の再実行を開始します（${failures.length}件の失敗履歴あり）`);
  ss.toast('失敗した同期を再実行しています...', '処理中', 3);

  let retryCount = 0;
  const startTime = new Date();

  try {
    // 1. リンク同期を再実行
    Logger.log('リンク同期を再実行中...');
    const mainSheet = new MainSheet();
    syncLinksToInputSheets_(mainSheet);
    retryCount++;

    // 2. 予定工数同期を再実行
    Logger.log('予定工数同期を再実行中...');
    syncAllPlannedHoursToInputSheets();
    retryCount++;

    // 3. 完了案件同期を再実行
    Logger.log('完了案件同期を再実行中...');
    syncAllCompletedToBillingSheet();
    retryCount++;

    const endTime = new Date();
    const elapsedSec = Math.round((endTime - startTime) / 1000);

    // 再実行後に失敗が残っているかチェック
    const remainingFailures = getSyncFailures();

    if (remainingFailures.length === 0) {
      ss.toast(`全ての同期が成功しました（実行時間: ${elapsedSec}秒）`, '同期再実行完了', 5);
      Logger.log(`同期再実行が完了しました: 全て成功（実行時間: ${elapsedSec}秒）`);
    } else {
      ss.toast(`同期再実行完了: ${remainingFailures.length}件の失敗が残っています（実行時間: ${elapsedSec}秒）`, '同期再実行完了（一部失敗）', 10);
      Logger.log(`同期再実行が完了しました: ${remainingFailures.length}件の失敗が残っています`);
    }

  } catch (e) {
    Logger.log(`同期再実行中にエラー: ${e.message}`);
    ss.toast(`同期再実行中にエラーが発生しました: ${e.message}`, 'エラー', 5);
  }
}

/**
 * 夜間自動リトライトリガーが未設定の場合のみ作成します（内部関数）
 * runAllManualMaintenance()から自動的に呼ばれます。
 */
function setupNightlyRetryTriggerIfNotExists() {
  const triggers = ScriptApp.getProjectTriggers();
  const exists = triggers.some(t => t.getHandlerFunction() === 'retryAllFailedSyncs');

  if (!exists) {
    try {
      ScriptApp.newTrigger('retryAllFailedSyncs')
        .timeBased()
        .atHour(2)
        .everyDays(1)
        .create();
      Logger.log('夜間自動リトライトリガーを自動設定しました（毎日午前2時）');
    } catch (e) {
      Logger.log(`トリガー自動設定エラー: ${e.message}`);
    }
  } else {
    Logger.log('夜間自動リトライトリガーは既に設定されています');
  }
}

/**
 * 夜間自動リトライのトリガーを設定します（Apps Script エディタから手動実行）
 *
 * 通常は runAllManualMaintenance() 実行時に自動設定されるため、
 * 手動実行は不要です。トリガーを再作成したい場合のみ使用してください。
 */
function setupNightlyRetryTrigger() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    // 既存の夜間リトライトリガーを削除
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'retryAllFailedSyncs') {
        ScriptApp.deleteTrigger(trigger);
        Logger.log('既存の夜間リトライトリガーを削除しました');
      }
    });

    // 新しい夜間トリガーを作成（毎日午前2時）
    ScriptApp.newTrigger('retryAllFailedSyncs')
      .timeBased()
      .atHour(2)  // 午前2時
      .everyDays(1)  // 毎日
      .create();

    ss.toast('夜間自動リトライを設定しました（毎日午前2時に実行）', '設定完了', 5);
    Logger.log('夜間自動リトライトリガーを設定しました（毎日午前2時）');

  } catch (e) {
    Logger.log(`トリガー設定中にエラー: ${e.message}`);
    ss.toast(`トリガー設定に失敗しました: ${e.message}`, 'エラー', 5);
  }
}

/**
 * 夜間自動リトライのトリガーを削除します（Apps Script エディタから手動実行）
 *
 * 自動リトライを完全に停止したい場合に使用してください。
 */
function removeNightlyRetryTrigger() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    const triggers = ScriptApp.getProjectTriggers();
    let removed = false;

    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'retryAllFailedSyncs') {
        ScriptApp.deleteTrigger(trigger);
        removed = true;
        Logger.log('夜間リトライトリガーを削除しました');
      }
    });

    if (removed) {
      ss.toast('夜間自動リトライを解除しました', '設定完了', 3);
    } else {
      ss.toast('夜間自動リトライは設定されていません', '確認', 3);
    }

  } catch (e) {
    Logger.log(`トリガー削除中にエラー: ${e.message}`);
    ss.toast(`トリガー削除に失敗しました: ${e.message}`, 'エラー', 5);
  }
}
