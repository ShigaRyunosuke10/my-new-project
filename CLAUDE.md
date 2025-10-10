# Claude Code Configuration (工数管理スプレッドシート)

このファイルは、Claude Codeがこのプロジェクトで作業する際の基本設定とワークフローを定義します。

**プロジェクト名**: my-new-project
**プロジェクトタイプ**: Google Apps Script
**最終更新**: 2025-10-10

---

## プロジェクト概要

### 基本情報
- **リポジトリ**: ShigaRyunosuke10/my-new-project
- **Apps Script ID**: 1_gXuHWvCfQg9vRrjo87nYPUkM_hejJbXKJNfDMrQvjPcsg9xNukFsnIW
- **スプレッドシート**: Google スプレッドシート上で動作
- **目的**: 工数管理・プロジェクト管理の自動化

### 技術スタック
- **実行環境**: Google Apps Script
- **開発ツール**: clasp (Command Line Apps Script Projects)
- **言語**: JavaScript (Google Apps Script API)
- **データストア**: Google スプレッドシート
- **外部連携**: Google Drive API, PDF解析

---

## セッション開始時の必須手順

### 1. 参考資料の確認

⚠️ **開発開始前に必ず確認**

```bash
# reference/ 内のバックアップコードを確認
ls reference/

# 既存コードを確認
Read reference/code*.txt
```

### 2. claspでプロジェクトと同期

```bash
# Apps Scriptから最新コードを取得
clasp pull
```

### 3. Git状態を確認

```bash
git status
```

---

## 開発ワークフロー

### 全体フロー（Google Apps Script特化版）

```
[セッション開始]
    ↓
[clasp pull] ← Apps Scriptから最新コード取得
    ↓
[静的解析] ← コード品質チェック
    ↓
[バグ・改善点の特定]
    ↓
[修正実装]
    ↓
[clasp push] ← Apps Scriptへデプロイ
    ↓
[スプレッドシートで手動テスト]
    ↓
[Git commit & push]
```

### 注意事項

#### Google Apps Script特有の制約
- ❌ **E2Eテスト自動化不可**: Playwrightは使用しない（スプレッドシート操作は手動テスト）
- ❌ **PR・レビュープロセス簡略化**: 小規模プロジェクトのためmainブランチ直接コミット可
- ✅ **静的解析重視**: 実行前にコード品質を確認
- ✅ **clasp pushで即座にデプロイ**: Apps Scriptに直接反映

---

## MCP設定

### 有効なMCPサーバー

#### Context7（使用可能）
- **用途**: Google Apps Script APIの最新仕様確認
- **使用例**: `@context7 google apps script LockService`

#### GitHub（使用可能）
- **用途**: リポジトリへのコミット・プッシュ
- **リポジトリ**: ShigaRyunosuke10/my-new-project

#### Serena（不使用）
- **理由**: 小規模プロジェクトのためメモリ管理不要

#### Playwright（不使用）
- **理由**: スプレッドシート操作の自動テスト不可

#### Netlify（不使用）
- **理由**: Webアプリケーションではない

---

## 重要なルール

### 必須事項

#### セッション開始時
- ✅ `clasp pull` で最新コードを取得
- ✅ reference/ のバックアップコードを確認
- ✅ 不明点はユーザーに質問

#### 実装時
- ✅ 静的解析でバグを事前検出
- ✅ JSDoc コメントで関数を文書化
- ✅ 影響範囲を確認してから修正
- ✅ プライベート関数は `_` サフィックスを使用

#### デプロイ前
- ✅ デバッグコード・不要コメントを削除
- ✅ 構文エラーがないことを確認
- ✅ `clasp push` でApps Scriptへデプロイ

#### コミット前
- ✅ 変更内容をBUGFIX_REPORT.mdに記録
- ✅ コミットメッセージは [ai-rules/common/COMMIT_GUIDELINES.md](ai-rules/common/COMMIT_GUIDELINES.md) に準拠

#### コミット後
- ✅ GitHubへプッシュ

### 禁止事項

- ❌ デバッグコード・不要コメントのコミット
- ❌ git config の変更
- ❌ 破壊的gitコマンド（push --force, hard reset等、ユーザー明示指示除く）

---

## ファイル構成

```
my-new-project/
├── src/                          # Apps Scriptソースコード
│   ├── Code.js                   # メインロジック（onEditトリガー）
│   ├── Config.js                 # 設定定義
│   ├── Utils.js                  # ユーティリティ関数
│   ├── DataSync.js               # データ同期処理
│   ├── DriveIntegration.js       # Google Drive連携
│   ├── PdfProcessing.js          # PDF解析
│   ├── SheetService.js           # シート操作
│   ├── Billing.js                # 請求処理
│   ├── Sidebar.html              # サイドバーUI
│   ├── BillingSidebar.html       # 請求サイドバーUI
│   ├── ImportFileDialog.html     # ファイルインポートUI
│   └── appsscript.json           # Apps Script設定
├── reference/                     # 参考資料・バックアップ
│   ├── code1.txt ~ code11.txt    # 既存コードバックアップ
│   └── README.md                 # 参考資料の説明
├── ai-rules/                     # AI用ガイドライン
│   └── common/                   # 汎用ルール
│       ├── COMMIT_GUIDELINES.md  # コミットメッセージ規約
│       ├── NAMING_CONVENTIONS.md # 命名規則
│       └── SESSION_MANAGEMENT.md # セッション管理
├── .clasp.json                   # clasp設定
├── .gitignore
├── CLAUDE.md                     # このファイル
├── BUGFIX_REPORT.md              # バグ修正履歴
└── README.md                     # プロジェクト説明
```

---

## コミットメッセージ形式

詳細: [ai-rules/common/COMMIT_GUIDELINES.md](ai-rules/common/COMMIT_GUIDELINES.md)

```
<type>: <subject>

<body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Type**:
- `feat`: 新機能追加
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `refactor`: バグ修正や機能追加を含まないコードの変更
- `chore`: ビルドプロセスやツールの変更

---

## AI用ガイドライン

### 汎用（ai-rules/common/）
- [COMMIT_GUIDELINES.md](ai-rules/common/COMMIT_GUIDELINES.md) - コミットメッセージ
- [NAMING_CONVENTIONS.md](ai-rules/common/NAMING_CONVENTIONS.md) - 命名規則
- [SESSION_MANAGEMENT.md](ai-rules/common/SESSION_MANAGEMENT.md) - セッション管理

### 不使用（このプロジェクトでは該当しない）
- ~~WORKFLOW.md~~ - Google Apps Script独自フロー使用
- ~~TESTING.md~~ - E2Eテスト自動化不可
- ~~PR_PROCESS.md~~ - PR・レビュープロセス簡略化
- ~~PHASE_MANAGEMENT.md~~ - フェーズ管理不要
- ~~DOCUMENTATION_GUIDE.md~~ - Serenaメモリ不使用

---

## 最終更新履歴

- 2025-10-10: Google Apps Script用に設定を調整
