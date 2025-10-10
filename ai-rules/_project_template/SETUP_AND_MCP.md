# 環境構築 & MCP サーバー運用ガイド（{{PROJECT_NAME}} 専用）

このドキュメントでは、開発環境のセットアップとMCP（Model Context Protocol）サーバーの運用方法を定義します。

**プロジェクト固有**: このファイルは {{PROJECT_NAME}} プロジェクト専用の設定（ポート番号、テストユーザー等）を含みます。

**最終更新**: {{CURRENT_DATE}}

---

## 目次

1. [環境構築](#1-環境構築)
2. [MCP サーバー概要](#2-mcp-サーバー概要)
3. [Serena MCP（最重要）](#3-serena-mcp最重要)
4. [context7](#4-context7)
5. [playwright](#5-playwright)
6. [github](#6-github)
7. [desktop-commander](#7-desktop-commander)
8. [supabase](#8-supabase)

---

## 1. 環境構築

### 1.1 必須ツール

- **Node.js**: v18以上
- **Python**: 3.11以上
- **Docker & Docker Compose**: 最新版
- **Git**: 最新版

### 1.2 ポート設定（固定・変更禁止）

| サービス | ポート |
|---------|--------|
| フロントエンド | {{FRONTEND_PORT}} |
| バックエンド | {{BACKEND_PORT}} |
| PostgreSQL | {{DB_PORT}} |
| MinIO | {{MINIO_PORT}} |

⚠️ **重要**: ポート競合時は他のプロセスをkillして既定ポートを使用すること。

### 1.3 環境変数設定

#### .env ファイル形式

- **UPPER_SNAKE_CASE**: すべて大文字
- **値にクォートは付けない**
- **機密情報は.gitignoreに追加**

#### 環境変数例

```env
# データベース
DATABASE_URL=postgresql://localhost:{{DB_PORT}}/mydb
DB_HOST=localhost
DB_PORT={{DB_PORT}}

# API
API_BASE_URL=http://localhost:{{BACKEND_PORT}}
JWT_SECRET_KEY=your-secret-key

# Supabase
SUPABASE_PROJECT_REF={{SUPABASE_PROJECT_REF}}
SUPABASE_URL=https://{{SUPABASE_PROJECT_REF}}.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# GitHub（MCPサーバー用）
GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# Context7（MCPサーバー用）
CONTEXT7_API_KEY=your-context7-api-key

# Netlify（MCPサーバー用）
NETLIFY_PERSONAL_ACCESS_TOKEN=your-netlify-pat
```

### 1.4 セットアップ手順

詳細は [../docs/SETUP.md](../docs/SETUP.md) を参照してください。

---

## 2. MCP サーバー概要

### 2.1 MCPとは

Model Context Protocol（MCP）は、Claude Codeが外部ツールやサービスと連携するための仕組みです。

### 2.2 利用可能なMCPサーバー

- **serena**: コードベース解析・メモリ管理（**最重要・最優先で使用**）
- **context7**: RAG/検索支援
- **playwright**: E2Eテスト自動化
- **github**: Issue/PR操作
- **netlify**: サイトのビルド・デプロイ・管理
- **desktop-commander**: ローカルPC操作
- **supabase**: DB/認証/ストレージ連携

### 2.3 共通ルール

#### セキュリティ

- **トークン・APIキーは.envに退避**
- **.gitignoreに追加必須**
- **設定JSON内でenv参照**

例：
```json
{
  "env": {
    "GITHUB_TOKEN": "from .env",
    "CONTEXT7_API_KEY": "from .env"
  }
}
```

#### 起動方法

- **type: "stdio"**: ローカルプロセスとして自動起動
- **HTTP接続**: 指定URLへ接続（Authorization: Bearer トークン）

---

## 3. Serena MCP（最重要）

⚠️ **最重要**: 毎セッション開始時にSerenaメモリから前回の状態を読み込む

### 3.1 用途

- **メモリ機能**: プロジェクト情報の永続化（**最重要**）
- **コード構造解析**: シンボル検索・参照解析
- **効率的な検索**: パターン検索・ファイル検索
- **精密な編集**: シンボル単位・正規表現による編集

### 3.2 セッション開始時の必須フロー

```
1. mcp__serena__activate_project
   project: "{{GITHUB_REPO}}"

2. mcp__serena__list_memories
   → 利用可能なメモリを確認

3. mcp__serena__read_memory
   memory_file_name: "current_issues_and_priorities.md"
   → 現在のIssue・優先度を把握

4. 作業開始
```

### 3.3 主要メモリファイル

- **current_issues_and_priorities.md** - 現在のIssue・優先度（**最重要**）
- **project_overview.md** - プロジェクト概要
- **database_api_specifications.md** - DB・API仕様
- **pr_review_and_issues.md** - PRレビュー・Issue管理
- **architecture_notes.md** - アーキテクチャ・既知の問題
- **development_workflow.md** - 開発ワークフロー
- **code_style_conventions.md** - コーディング規約
- **suggested_commands.md** - よく使うコマンド
- **task_completion_checklist.md** - タスク完了チェックリスト

### 3.4 いつSerenaを使うか

#### ✅ 使うべきケース

1. **セッション開始時（必須）** - メモリから前回の状態を読み込み
2. **プロジェクト全体の把握が必要な場合** - 初回セッション、大規模リファクタリング前
3. **複数ファイルにまたがる変更** - 関数名変更、API変更、スキーマ変更
4. **影響範囲調査** - 特定のシンボルの参照箇所検索
5. **コードベース全体の検索・解析** - パターン検索、ファイル検索
6. **大量のファイル操作** - 複数ファイルの一括編集

#### ❌ 使わなくてよいケース

- **1-2個のファイルの簡単な編集** - 通常のRead/Edit/Writeツールで十分

### 3.5 主要機能

#### メモリ機能（最重要）

```bash
# メモリ一覧
mcp__serena__list_memories

# メモリ読み込み
mcp__serena__read_memory
  memory_file_name: "current_issues_and_priorities.md"

# メモリ書き込み
mcp__serena__write_memory
  memory_name: "feature_implementation_notes"
  content: "..."

# メモリ削除
mcp__serena__delete_memory
  memory_file_name: "obsolete_memory.md"
```

#### コード構造解析

```bash
# ファイル内のシンボル概要
mcp__serena__get_symbols_overview
  relative_path: "backend/app/api/users.py"

# シンボル検索
mcp__serena__find_symbol
  name_path: "UserService/get_user"
  relative_path: "backend/app/services"
  include_body: true
  depth: 1

# シンボルの参照元検索
mcp__serena__find_referencing_symbols
  name_path: "UserService/get_user"
  relative_path: "backend/app/services/user_service.py"
```

#### 効率的な検索

```bash
# パターン検索
mcp__serena__search_for_pattern
  pattern: "def get_.*\("
  relative_path: "backend/app"
  searchType: "content"

# ファイル検索
mcp__serena__find_file
  file_mask: "*.py"
  relative_path: "backend"

# ディレクトリ一覧
mcp__serena__list_dir
  relative_path: "backend/app"
  recursive: true
```

#### 精密な編集

```bash
# シンボル本体の置換
mcp__serena__replace_symbol_body
  name_path: "UserService/get_user"
  relative_path: "backend/app/services/user_service.py"
  body: "..."

# 正規表現による置換
mcp__serena__replace_regex
  relative_path: "backend/app/api/users.py"
  regex: "old_pattern"
  repl: "new_pattern"

# シンボルの前後に挿入
mcp__serena__insert_before_symbol
  name_path: "UserService"
  relative_path: "backend/app/services/user_service.py"
  body: "..."

mcp__serena__insert_after_symbol
  name_path: "UserService/get_user"
  relative_path: "backend/app/services/user_service.py"
  body: "..."
```

### 3.6 ベストプラクティス

**✅ DO（推奨）**:
- セッション開始時は必ずメモリを確認
- 重要な情報（Issue、未解決問題）はメモリに保存
- `relative_path`で検索範囲を絞る
- シンボル検索を積極的に活用

**❌ DON'T（非推奨）**:
- 不必要にファイル全体を読まない（`get_symbols_overview`で概要把握）
- メモリを読まずに作業開始しない
- 同じ情報を何度も読まない（メモリに保存して再利用）

### 3.7 実践的な使用例

#### 例1: プロジェクト全体の把握（初回セッション）

```
1. mcp__serena__activate_project
   project: "{{GITHUB_REPO}}"

2. mcp__serena__check_onboarding_performed
   → onboarding済みか確認

3. mcp__serena__list_memories
   → 利用可能なメモリを確認

4. mcp__serena__read_memory
   memory_file_name: "project_overview.md"
   → プロジェクト概要を把握

5. mcp__serena__read_memory
   memory_file_name: "current_issues_and_priorities.md"
   → 現在の優先度を把握

6. 作業開始
```

#### 例2: 複数ファイルにまたがる変更（関数名変更）

```
1. mcp__serena__find_symbol
   name_path: "get_user_data"
   include_body: false
   → 変更対象の関数を特定

2. mcp__serena__find_referencing_symbols
   name_path: "get_user_data"
   relative_path: "backend/app/services/user_service.py"
   → 参照元を検索

3. 各ファイルでmcp__serena__replace_regex
   → 関数名を一括変更

4. mcp__serena__write_memory
   memory_name: "refactoring_notes"
   content: "get_user_data → fetch_user_info に変更完了"
```

#### 例3: コードベース全体の検索

```
1. mcp__serena__search_for_pattern
   pattern: "TODO|FIXME"
   relative_path: "backend"
   searchType: "content"
   → TODOコメントを検索

2. mcp__serena__write_memory
   memory_name: "todo_list"
   content: "検索結果のまとめ"
```

### 3.8 トラブルシューティング

#### No active project

**エラー**: "No active project. Ask the user to provide the project path..."

**解決**:
```
mcp__serena__activate_project
  project: "{{GITHUB_REPO}}"
```

#### Onboarding not performed

**エラー**: "Onboarding not performed yet (no memories available)"

**解決**:
```
mcp__serena__onboarding
```

---

## 4. context7

### 4.1 用途

- **最新ライブラリ仕様の取得**（FastAPI, Next.js, React等）
- ローカル/URL/リポジトリのドキュメントを取り込み
- 質問応答や類似検索（RAG: Retrieval-Augmented Generation）
- 設計検討前の情報収集フェーズに有効

### 4.2 起動

```bash
npx @upstash/context7-mcp --api-key <CONTEXT7_API_KEY>
```

**注意**: `CONTEXT7_API_KEY` は `.env` に保存

### 4.3 自動取得タイミング

Claudeが以下の場合に自動的にContext7で最新仕様を取得：

1. **新規API実装時** → FastAPI最新仕様
2. **フロントエンド機能追加時** → Next.js/React最新仕様
3. **ライブラリエラー解決時** → 該当ライブラリの最新仕様
4. **未知のライブラリ使用時** → 該当ライブラリの公式ドキュメント

### 4.4 使用例

#### 最新ライブラリ仕様取得（手動）

```
use context7 — FastAPI 0.110の依存性注入パターン
use context7 — Next.js 15のApp Routerエラーハンドリング
```

#### ドキュメントのインデックス

```
context7 に docs/ と backend/ をインデックスして。
終わったら '準備 OK' と返して
```

#### URL の取り込み

```
次の記事 URL を取り込んで要点 5 つに要約して: <URL>
```

#### 検索

```
FastAPI のエラーハンドリング方針に関する社内文書の要点を列挙して
```

### 4.5 注意事項

- 取り込み対象に秘密情報が含まれないか要確認
- 重要文書はパス/グロブで選別し、極力最小限に
- **自動取得は必要時のみ**（トークン節約のため）

---

## 5. playwright

### 5.1 用途

- E2E（End-to-End）自動テスト
- テスト作成・実行・スクリーンショット/動画保存・レポート確認
- **コミット前に必ずE2Eテストを実施**（[TESTING.md](./TESTING.md)参照）

### 5.2 起動

```bash
npx @playwright/mcp@latest
```

### 5.3 テストユーザー情報

開発・テスト時は以下を使用：

```
メールアドレス: {{TEST_USER_EMAIL}}
パスワード: {{TEST_USER_PASSWORD}}
ユーザー名: {{TEST_USER_NAME}}
ユーザーID: 00000000-0000-4000-{{BACKEND_PORT}}-000000000000
```

### 5.4 使用例

#### テスト実行

```
playwright で tests/e2e/login.spec.ts を実行、
結果と失敗スクショを出力して
```

#### テスト作成

```
ユーザー {{TEST_USER_EMAIL}}/{{TEST_USER_PASSWORD}} でログイン →
ダッシュボードの 'Welcome, {{TEST_USER_NAME}}' を検証する E2E を新規作成して
```

#### サーバー起動待ち

```
テスト前に http://localhost:{{FRONTEND_PORT}} と http://localhost:{{BACKEND_PORT}} の
起動待ちを入れて（タイムアウト 60 秒）
```

### 5.5 注意事項

- **ポート固定**: {{FRONTEND_PORT}}/{{BACKEND_PORT}}（競合時は他プロセスをkill）
- CI でのヘッドレス実行も想定し、storageState 等を活用

詳細: [TESTING.md](./TESTING.md)

---

## 6. github

### 6.1 用途

- Issue/PR操作の自動化
- Issue作成、PR作成、ラベル付与、レビュー依頼、コメント投稿など

### 6.2 起動

設定済みURLへHTTP接続（Authorization: Bearer `GITHUB_TOKEN`）

**注意**: `GITHUB_TOKEN` は `.env` に保存

### 6.3 使用例

#### Issue作成

```
{{PROJECT_NAME}} に ISSUE_GUIDELINES.md の作成タスクを issue 登録。
テンプレは ai-rules の規約に沿って。
ラベルは documentation と priority: high
```

#### PR作成

```
ブランチ feat-issue-guidelines の PR を main 向けに作成。
本文に Closes #<issue 番号> と E2E 結果を記載して
```

#### レビューア追加

```
この PR にレビューア @<member> を追加して、
ラベル enhancement を付けて
```

### 6.4 注意事項

- トークン露出禁止（.env に退避）
- 対象リポジトリは **{{GITHUB_OWNER}}/{{PROJECT_NAME}}** に固定（誤操作防止）

---

## 7. Netlify MCP

### 7.1 用途

- **プロジェクトのビルド・デプロイ**: フロントエンドのNetlifyへのデプロイ
- **サイト管理**: 新規サイト作成、既存サイト管理
- **環境変数設定**: デプロイ時の環境変数・シークレット管理
- **アクセス制御**: プロジェクトの保護設定
- **フォーム管理**: フォーム送信の有効化・管理

### 7.2 認証設定

Netlify Personal Access Token（PAT）が必要です。

#### PATの取得方法

1. [Netlify Dashboard](https://app.netlify.com/) にログイン
2. 左下のユーザーアイコン → **User settings** → **OAuth**
3. **New access token** をクリック
4. トークンをコピー
5. `.mcp.json` の `NETLIFY_PERSONAL_ACCESS_TOKEN` に設定

⚠️ **重要**: PATは機密情報です。`.gitignore`で除外されていることを確認してください。

### 7.3 使用例

#### サイトの作成

```bash
# AIに依頼
> Netlifyに新しいサイトを作成してください。
  サイト名: my-app
  リポジトリ: {{GITHUB_OWNER}}/{{GITHUB_REPO}}
```

#### デプロイ

```bash
# AIに依頼
> フロントエンドをNetlifyにデプロイしてください。
  ビルドコマンド: npm run build
  公開ディレクトリ: dist
```

#### 環境変数設定

```bash
# AIに依頼
> Netlifyサイトに環境変数を追加してください。
  変数名: API_URL
  値: https://api.example.com
```

#### サイト情報確認

```bash
# AIに依頼
> Netlifyサイトの情報を表示してください。
```

### 7.4 注意事項

- **Node.js 22以上推奨**: Netlify MCP ServerはNode.js 22以上を推奨
- **Netlify CLI**: `npm install -g netlify-cli` でインストール推奨
- **認証エラー**: 認証エラーが発生する場合は、`netlify login` でログイン確認

---

## 8. desktop-commander

### 8.1 用途

- ローカルPCの操作自動化
- 画面操作/アプリ起動/キーボード入力/プロセス操作など
- 手動での環境準備や一発コマンドを代行

### 8.2 使用例

#### ポート確認・プロセスkill

```
ターミナルを開いて lsof -i :{{BACKEND_PORT}} → 該当 PID があれば kill -9 <PID> を実行
```

#### ブラウザ起動

```
Chrome を起動して http://localhost:{{FRONTEND_PORT}} を全画面表示、
ロード後にスクショを保存
```

#### エディタ操作

```
VS Code を開いて ai-rules/ISSUE_GUIDELINES.md を新規作成、
下書きを貼り付けて保存
```

### 8.3 注意事項

- 誤操作リスクがあるため、操作範囲を明示（アプリ名/パス/許可ダイアログ対応）
- 機密画面のスクショ取得は禁止

---

## 9. supabase

### 9.1 用途

- DB/認証/ストレージ連携
- Supabaseプロジェクト（`{{SUPABASE_PROJECT_REF}}`）に対するスキーマ確認・SQL実行・ストレージ操作など

### 9.2 使用例

#### スキーマ確認

```
public スキーマのテーブル一覧とカラム情報を取得して Markdown で整形
```

#### マイグレーション案生成

```
users に plan 列（enum: free/pro）を追加するマイグレーション案を生成し、
ロールバック SQL も併記
```

#### ストレージ操作

```
ストレージに playwright-report/ を作成して最新レポートをアップロード
```

### 9.3 注意事項

- 本番データへの影響に注意（dry-run や確認プロンプトを挟む）
- 秘密鍵/サービスロールキーは厳重管理（.env & .gitignore）

---

## セキュリティチェックリスト

- [ ] `.env` ファイルを `.gitignore` に追加
- [ ] すべてのAPIキー・トークンを `.env` に保存
- [ ] 機密情報をハードコードしていない
- [ ] `.env.example` に必要な環境変数を記載（値は空）
- [ ] MCPサーバー設定JSON内で `env` 参照を使用
- [ ] トークンの権限を最小限に設定

---

## 関連ドキュメント

- [WORKFLOW.md](./WORKFLOW.md): 開発ワークフロー全体
- [TESTING.md](./TESTING.md): テストガイドライン
- [PR_AND_REVIEW.md](./PR_AND_REVIEW.md): PR・レビュー・マージプロセス
- [../docs/SETUP.md](../docs/SETUP.md): 詳細な環境構築手順
- [../docs/DATABASE.md](../docs/DATABASE.md): データベーススキーマ定義
- [../docs/API.md](../docs/API.md): API エンドポイント仕様
