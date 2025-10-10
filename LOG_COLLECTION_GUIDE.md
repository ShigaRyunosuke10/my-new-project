# ログ取得ガイド - 詳細版

**作成日**: 2025-10-10
**目的**: Apps Scriptのログを確実に取得する方法

---

## 🔍 方法1: Stackdriver Logging（Google Cloud Logging）

### 手順

1. **Apps Scriptエディタを開く**
   ```
   スプレッドシート > 拡張機能 > Apps Script
   ```

2. **Google Cloud プロジェクトを確認**
   ```
   Apps Scriptエディタ > 左メニュー「プロジェクトの設定」⚙️
   → GCP プロジェクト番号をコピー
   ```

3. **Google Cloud Consoleでログを表示**
   ```
   1. https://console.cloud.google.com/ にアクセス
   2. 上部のプロジェクト選択 → プロジェクト番号で検索
   3. 左メニュー「ロギング」→「ログエクスプローラ」を選択
   4. クエリ:
      resource.type="app_script_function"
   ```

---

## 🔍 方法2: console.log() を Logger.log() に変更

現在のコードは `Logger.log()` を使用していますが、これはApps Scriptエディタの「実行数」でしか見られません。

### より確実な方法: `console.log()` に変更

以下のコマンドで一括変更します：

```bash
# Logger.log を console.log に一括変更
sed -i 's/Logger\.log/console.log/g' src/*.js
```

または、Claude Codeに以下を依頼：
```
「src/内の全ファイルでLogger.logをconsole.logに変更してください」
```

変更後:
- `console.log()` → Google Cloud Loggingで確認可能
- `Logger.log()` → Apps Scriptエディタの「実行数」でのみ確認可能

---

## 🔍 方法3: SpreadsheetApp.toast() でユーザー通知

ログではなく、画面上のトースト通知で確認する方法です。

### テスト用コードを追加

Apps Scriptエディタで以下の関数を追加：

```javascript
function testAllFixes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Test 1: 配列範囲外アクセスの保護
  ss.toast('Test 1: 配列範囲外アクセスのテスト開始', 'テスト中', 3);
  const mainSheet = new MainSheet();
  if (!mainSheet.indices || !mainSheet.indices.KIBAN) {
    ss.toast('✅ Test 1 成功: インデックスがない場合に保護された', '成功', 5);
  } else {
    ss.toast('✅ Test 1 成功: インデックスが正常に取得された', '成功', 5);
  }

  // Test 2: キャッシュクリア
  ss.toast('Test 2: キャッシュクリアのテスト開始', 'テスト中', 3);
  clearScriptCache();

  ss.toast('全テスト完了', '完了', 5);
}
```

実行方法：
1. Apps Scriptエディタで `testAllFixes` を選択
2. 「実行」ボタンをクリック
3. スプレッドシートに戻り、画面右下のトースト通知を確認

---

## 🔍 方法4: シートに直接書き込み

ログをスプレッドシートの専用シートに書き込む方法です。

### 手順

1. **「テストログ」シートを作成**
   - スプレッドシートに新しいシートを追加
   - 名前を「テストログ」に変更

2. **ログ記録関数を追加**

Apps Scriptエディタで以下を追加：

```javascript
function logToSheet(message) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let logSheet = ss.getSheetByName('テストログ');

  if (!logSheet) {
    logSheet = ss.insertSheet('テストログ');
    logSheet.appendRow(['タイムスタンプ', 'メッセージ']);
  }

  const timestamp = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd HH:mm:ss'
  );
  logSheet.appendRow([timestamp, message]);
}

// テスト実行
function runAllTests() {
  logToSheet('=== テスト開始 ===');

  // Test 1
  logToSheet('Test 1: 配列範囲外アクセスの保護');
  try {
    const mainSheet = new MainSheet();
    if (!mainSheet.indices) {
      logToSheet('✅ インデックスがない場合に保護された');
    } else {
      logToSheet('✅ インデックス取得成功: ' + JSON.stringify(Object.keys(mainSheet.indices)));
    }
  } catch (e) {
    logToSheet('❌ エラー: ' + e.message);
  }

  // Test 2: キャッシュクリア
  logToSheet('Test 2: キャッシュクリアのテスト');
  try {
    clearScriptCache();
    logToSheet('✅ キャッシュクリア成功');
  } catch (e) {
    logToSheet('❌ エラー: ' + e.message);
  }

  // Test 3: 日付フォーマット確認
  logToSheet('Test 3: 日付フォーマットの確認');
  logToSheet('DATE_ONLY: ' + DATE_FORMATS.DATE_ONLY);
  logToSheet('MONTH_DAY: ' + DATE_FORMATS.MONTH_DAY);

  logToSheet('=== テスト完了 ===');
  SpreadsheetApp.getActiveSpreadsheet().toast('テスト完了。「テストログ」シートを確認してください', '完了', 5);
}
```

3. **実行**
   - Apps Scriptエディタで `runAllTests` を選択
   - 「実行」ボタンをクリック
   - スプレッドシートの「テストログ」シートを確認

---

## 📝 推奨する方法

### 最も簡単な方法: **方法4（シートに直接書き込み）**

理由：
- ✅ ログが確実に残る
- ✅ Apps Scriptエディタを開く必要がない
- ✅ コピペが簡単
- ✅ タイムスタンプ付き

### 実施手順

1. スプレッドシートに「テストログ」シートを作成
2. Claude Codeに依頼：
   ```
   「上記のlogToSheet()とrunAllTests()関数をUtils.jsに追加してください」
   ```
3. clasp push でデプロイ
4. Apps Scriptエディタで `runAllTests` を実行
5. 「テストログ」シートの内容をコピペして私に送る

---

## ❓ トラブルシューティング

### 「実行数」にログが表示されない

**原因**: Google Cloudのログ同期遅延

**対処法**:
1. 5〜10分待ってから再確認
2. または方法4（シート書き込み）を使用

### 「権限が必要です」と表示される

**対処法**:
1. 「権限を確認」をクリック
2. Googleアカウントを選択
3. 「詳細」→「（プロジェクト名）に移動」をクリック
4. 「許可」をクリック

---

**このガイドは Claude Code が作成しました**
