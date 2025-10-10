# AI Rules - 開発ガイドライン（2層構造版）

このディレクトリには、開発ガイドラインが格納されています。

**最終更新**: {{CURRENT_DATE}}

---

## 📁 ディレクトリ構造

```
ai-rules/
├── common/                     # プロジェクト横断（汎用ガイドライン）
│   ├── WORKFLOW.md             # 汎用ワークフロー ⭐
│   ├── SESSION_MANAGEMENT.md   # セッション管理ガイドライン ⭐
│   ├── PHASE_MANAGEMENT.md     # フェーズ管理 ⭐
│   ├── DOCUMENTATION_GUIDE.md  # ドキュメント管理 ⭐
│   ├── DOCUMENT_CONSISTENCY.md # ドキュメント整合性確認 ⭐
│   ├── DOCUMENT_CLEANUP.md     # ドキュメントクリーンアップ
│   ├── COMMIT_GUIDELINES.md    # コミット規約
│   ├── NAMING_CONVENTIONS.md   # 命名規則
│   ├── ISSUE_GUIDELINES.md     # Issue作成（汎用）
│   ├── PR_PROCESS.md           # PR & レビュー（汎用版）
│   └── SETTINGS_JSON_GUIDE.md  # settings.json設定ガイド
│
├── _project_template/          # プロジェクト固有（テンプレート）
│   ├── WORKFLOW.md             # 開発ワークフロー ⭐ 最重要
│   ├── ISSUE_GUIDELINES.md     # Issue管理（プロジェクト固有）⭐
│   ├── SETUP_AND_MCP.md        # 環境構築 & MCP
│   ├── TESTING.md              # テスト
│   ├── DOCUMENTATION_GUIDE.md  # ドキュメント管理（プロジェクト固有）
│   └── PR_AND_REVIEW.md        # PR & レビュー
│
└── README.md                   # このファイル
```

---

## 🌍 common/ - プロジェクト横断（汎用ガイドライン）

**用途**: 複数プロジェクトで共通利用可能な汎用ルール

**特徴**:
- ✅ **変数プレースホルダーなし** - そのまま使える
- ✅ プロジェクト固有の情報を含まない（ポート番号、テストユーザー等の記載なし）
- ✅ 他プロジェクトにコピーして利用可能
- ✅ 普遍的なベストプラクティス

**例**: 「コミット前にE2Eテストを実施」（どのプロジェクトでも共通）

### ファイル一覧

**[WORKFLOW.md](./common/WORKFLOW.md)** - 汎用ワークフロー ⭐
- セッション開始→実装→PR→マージ→ドキュメント更新の基本フロー
- Serenaメモリ読み込み手順
- フェーズ管理との連携

**[SESSION_MANAGEMENT.md](./common/SESSION_MANAGEMENT.md)** - セッション管理ガイドライン ⭐
- AI側からセッション切り替えを提案するタイミング（Must/Should/May）
- セッション終了時の必須作業（TODOリスト整理、Git状態確認、引き継ぎ情報作成）
- 次セッション開始時のフロー（Serenaメモリ読み込み、Git状態確認）
- セッション切り替え提案フォーマット

**[PHASE_MANAGEMENT.md](./common/PHASE_MANAGEMENT.md)** - フェーズ管理 ⭐
- フェーズ定義と進行フロー
- フェーズ開始時・完了時の仕様確認
- PHASES.md と phase_progress.md の管理

**[DOCUMENTATION_GUIDE.md](./common/DOCUMENTATION_GUIDE.md)** - ドキュメント管理 ⭐
- docs/ と .serena/memories/ の2層構造
- マージ後の更新フロー（両方必須）
- Serenaメモリ操作方法

**[DOCUMENT_CONSISTENCY.md](./common/DOCUMENT_CONSISTENCY.md)** - ドキュメント整合性確認 ⭐
- 整合性確認タイミング（必須5種・推奨2種）
- ワークフロー変更時・サブエージェント追加時のチェックリスト
- よくある不整合パターンと対策

**[DOCUMENT_CLEANUP.md](./common/DOCUMENT_CLEANUP.md)** - ドキュメントクリーンアップ
- ドキュメント整理のタイミングとプロセス
- 冗長性排除、MECE原則適用

**[COMMIT_GUIDELINES.md](./common/COMMIT_GUIDELINES.md)** - コミットメッセージガイドライン
- コミットメッセージの形式（type, subject, body）
- コミット前の確認事項

**[NAMING_CONVENTIONS.md](./common/NAMING_CONVENTIONS.md)** - 命名規則
- ファイル・ディレクトリ命名
- 変数・関数命名
- APIエンドポイント命名
- データベーステーブル・カラム命名
- 環境変数命名

**[ISSUE_GUIDELINES.md](./common/ISSUE_GUIDELINES.md)** - Issue作成ガイドライン
- Issueテンプレート（バグ報告、新機能追加、リファクタリング）
- ラベル分類と優先度設定
- Issue作成手順・管理ルール

**[PR_PROCESS.md](./common/PR_PROCESS.md)** - PR & レビューガイド（汎用版）
- PR作成テンプレート
- レビュープロセス
- マージ手順

**[SETTINGS_JSON_GUIDE.md](./common/SETTINGS_JSON_GUIDE.md)** - settings.json設定ガイド
- Claude Code設定ファイルの構造説明
- permissions, hooks, mcpServers設定

---

## 🏢 _project_template/ - プロジェクト固有（テンプレート）

**用途**: プロジェクト固有の設定・ワークフロー（変数プレースホルダー付き）

**特徴**:
- ✅ **変数プレースホルダーあり** - {{変数名}} を実際の値に置換して使用
- ✅ プロジェクト固有の情報を含む（ポート番号、テストユーザー等を変数で定義）
- ✅ 新規プロジェクト作成時に _project_template/ を project_name/ にコピーして使用
- ✅ 変数を置換してプロジェクト専用のルールに変換

**例**: 「テストユーザー: {{TEST_USER_EMAIL}}」→「テストユーザー: qa+shared@example.com」に置換

### 変数プレースホルダー一覧

#### プロジェクト情報
- `{{PROJECT_NAME}}` - プロジェクト名（例: my-webapp）
- `{{GITHUB_OWNER}}` - GitHubオーナー名（例: YourUsername）
- `{{GITHUB_REPO}}` - リポジトリ名（例: my-webapp）
- `{{CURRENT_DATE}}` - 現在日付（例: 2025-10-10）

#### 開発環境
- `{{FRONTEND_PORT}}` - フロントエンドポート（例: 3000）
- `{{BACKEND_PORT}}` - バックエンドポート（例: 8000）

#### テストユーザー
- `{{TEST_USER_EMAIL}}` - テストユーザーメールアドレス
- `{{TEST_USER_PASSWORD}}` - テストユーザーパスワード
- `{{TEST_USER_NAME}}` - テストユーザー名
- `{{TEST_USER_ID}}` - テストユーザーID（UUID）

#### MCP設定（.mcp.json）
- `{{CONTEXT7_API_KEY}}` - Context7 APIキー
- `{{GITHUB_TOKEN}}` - GitHub Personal Access Token

### ファイル一覧

**[WORKFLOW.md](./_project_template/WORKFLOW.md)** - 開発ワークフロー ⭐ 最重要
- 作業開始から終了までの流れ
- セッション開始時のSerenaメモリ読み込み
- 各フェーズへのリンク集

**[SETUP_AND_MCP.md](./_project_template/SETUP_AND_MCP.md)** - 環境構築 & MCP サーバー運用 ⭐ 必読
- 環境構築手順（ポート設定・環境変数）
- **Serena MCP**: メモリ機能・コード構造解析・効率的な検索（最重要）
- **Context7**: 最新ライブラリ仕様の自動取得
- playwright, github, その他MCPサーバー設定

**[TESTING.md](./_project_template/TESTING.md)** - テストガイドライン
- E2Eテスト実施手順（Playwright MCP使用）
- テストユーザー情報
- ポート管理・環境クリーンアップ

**[DOCUMENTATION_GUIDE.md](./_project_template/DOCUMENTATION_GUIDE.md)** - ドキュメント管理ガイド ⭐ 必読
- **Serena vs docs の使い分け**: AI用詳細仕様 vs 人間用簡潔ドキュメント
- **追記・更新のフロー**: セッション開始時・開発中・PR作成時・マージ後
- **Serenaメモリ一覧**: 主要メモリファイルの役割と更新タイミング

**[ISSUE_GUIDELINES.md](./_project_template/ISSUE_GUIDELINES.md)** - Issue管理（プロジェクト固有）⭐
- **その場で即修正原則**: レビュー後は即座に修正、Issueを溜めない
- **Issue解決ルール**: Critical（必ず即修正）、Major（30分以内）、Minor（5分以内推奨）
- **Issue化する基準**: 1時間超の大規模修正のみ（例外的）

**[PR_AND_REVIEW.md](./_project_template/PR_AND_REVIEW.md)** - PR & レビュー（プロジェクト固有） ⭐ 最重要
- **code-reviewer サブエージェント レビュー**: レビュー依頼方法・観点・結果分類
- **修正対応**: 修正手順・再レビュー・Issue作成
- **マージ実行**: マージ条件・マージ方法
- **docs/ 更新確認**: 更新対象・更新フロー


---

## 🚀 クイックスタート（新規プロジェクト）

### 新規セッション開始時（最重要）

⚠️ **毎回必ず実施**: Serenaメモリから前回の状態を読み込む

```
1. mcp__serena__activate_project
   project: "{{PROJECT_NAME}}"

2. mcp__serena__list_memories
   → 利用可能なメモリを確認

3. mcp__serena__read_memory
   memory_file_name: "current_issues_and_priorities.md"
   → 現在の優先度を把握

4. mcp__serena__read_memory
   memory_file_name: "session_handover.md"
   → 前セッションの完了内容・次のタスクを確認

5. mcp__serena__read_memory
   memory_file_name: "phase_progress.md"  # フェーズ管理時
   → 現在のフェーズ・進捗を確認

6. フェーズ・仕様確認
   - 現在のフェーズと実装内容を確認
   - 不明点はユーザーに質問

7. 作業開始
```

詳細: [_project_template/SETUP_AND_MCP.md](./_project_template/SETUP_AND_MCP.md) の「Serena MCP」セクション、[common/PHASE_MANAGEMENT.md](./common/PHASE_MANAGEMENT.md)

### 新規タスクを開始する場合

1. [common/WORKFLOW.md](./common/WORKFLOW.md) で基本フローを把握
2. [_project_template/WORKFLOW.md](./_project_template/WORKFLOW.md) でプロジェクト固有の手順を確認
3. ブランチを作成（`feat-*`, `fix-*`）
4. 実装・修正を行う（[common/NAMING_CONVENTIONS.md](./common/NAMING_CONVENTIONS.md) 準拠）
5. [_project_template/TESTING.md](./_project_template/TESTING.md) に従ってE2Eテストを実施
6. [common/COMMIT_GUIDELINES.md](./common/COMMIT_GUIDELINES.md) に従ってコミット
7. [_project_template/PR_AND_REVIEW.md](./_project_template/PR_AND_REVIEW.md) に従ってPR作成・レビュー・マージ
8. **docs/ と Serenaメモリの両方を更新**（[common/DOCUMENTATION_GUIDE.md](./common/DOCUMENTATION_GUIDE.md)）
9. フェーズ完了時は仕様確認（[common/PHASE_MANAGEMENT.md](./common/PHASE_MANAGEMENT.md)）

---

## 🔗 ドキュメント間の関係

```
common/WORKFLOW.md（汎用）⭐ 基本フロー
    │
    ├── common/SESSION_MANAGEMENT.md（セッション管理）⭐
    │   ├── AI側からセッション切り替え提案（Must/Should/May）
    │   ├── セッション終了時の必須作業
    │   ├── 次セッション開始フロー
    │   └── .serena/memories/session_handover.md（引き継ぎ情報）
    │
    ├── common/PHASE_MANAGEMENT.md（フェーズ管理）⭐
    │   ├── docs/PHASES.md（人間用フェーズ一覧）
    │   └── .serena/memories/phase_progress.md（AI用進捗）
    │
    ├── common/DOCUMENTATION_GUIDE.md（ドキュメント管理）⭐
    │   ├── docs/（人間用簡潔版）
    │   └── .serena/memories/（AI用詳細版）
    │
    └── common/DOCUMENT_CONSISTENCY.md（整合性確認）⭐
        ├── ワークフロー変更時チェックリスト
        ├── サブエージェント追加時チェックリスト
        └── Issue/PR管理ルール変更時チェックリスト

_project_template/WORKFLOW.md（プロジェクト固有）⭐ 最重要
    │
    ├── common/SESSION_MANAGEMENT.md（セッション管理）⭐
    │   └── session_handover.md読み込み（セッション開始時）
    │
    ├── SETUP_AND_MCP.md（プロジェクト固有）
    │   ├── Serena MCP（メモリ機能・セッション開始時必須）
    │   └── _project_template/DOCUMENTATION_GUIDE.md（プロジェクト固有のドキュメント）
    │
    ├── common/NAMING_CONVENTIONS.md（汎用）
    │
    ├── TESTING.md（プロジェクト固有）
    │   └── Playwright MCP（E2Eテスト）
    │
    ├── common/COMMIT_GUIDELINES.md（汎用）
    │
    ├── _project_template/ISSUE_GUIDELINES.md（Issue管理）⭐
    │   ├── その場で即修正原則（Issueを溜めない）
    │   └── common/ISSUE_GUIDELINES.md（汎用版の参照）
    │
    ├── PR_AND_REVIEW.md（プロジェクト固有）⭐ 最重要
    │   ├── common/PR_PROCESS.md（汎用版の参照）
    │   ├── code-reviewer サブエージェント（レビュー）
    │   ├── _project_template/ISSUE_GUIDELINES.md（レビュー後の修正フロー）⭐
    │   ├── common/DOCUMENTATION_GUIDE.md（docs更新確認）
    │   └── common/ISSUE_GUIDELINES.md（Issue作成）
    │
    └── common/PHASE_MANAGEMENT.md（フェーズ完了確認）
```

---

## 🎯 2層構造の目的

### なぜ分離したのか

1. **再利用性の向上**: `common/` の内容は他プロジェクトでそのまま使用可能
2. **保守性の向上**: 汎用ルール変更時は `common/` のみ修正すれば良い
3. **明確な責任分離**: どこに何を書くべきかが明確

### どちらに書くべきか

#### common/ に書くべき内容
- ✅ 汎用ワークフロー（基本フロー）
- ✅ フェーズ管理（フェーズ進行ルール）
- ✅ ドキュメント管理（docs/ と Serenaメモリの使い分け）
- ✅ コミットメッセージの形式
- ✅ 命名規則（言語・フレームワーク共通）
- ✅ PR作成プロセス
- ✅ Issue管理ルール

#### _project_template/ に書くべき内容（変数プレースホルダー使用）
- ✅ プロジェクト固有のワークフロー（ポート・テストユーザー等を変数で定義）
- ✅ ポート番号（`{{FRONTEND_PORT}}`, `{{BACKEND_PORT}}`）
- ✅ テストユーザー情報（`{{TEST_USER_EMAIL}}`等）
- ✅ 主要Serenaメモリファイル群の定義
- ✅ code-reviewerサブエージェント設定

**重要**: _project_template/のファイルは直接編集せず、新規プロジェクト作成時にコピーしてから変数を置換します。

---

## ⚠️ 重要な注意事項

- ✅ **セッション開始時にSerenaメモリから状況を把握**（phase_progress.md含む）
- ✅ **フェーズ開始時に必ず仕様確認**（ユーザーと合意）
- ✅ **mainブランチへの直接作業は絶対禁止**
- ✅ **コミット前に必ず動作確認とE2Eテストを実施**
- ✅ **PR作成直後に必ずcode-reviewer サブエージェント レビューを依頼**
- ✅ **Critical問題が存在する場合は絶対にマージしない**
- ✅ **PR作成→レビュー→マージ→ドキュメント更新までを1セット**（PRを溜めない）
- ✅ **マージ後は docs/ と Serenaメモリの両方を更新**（必須）
- ✅ **フェーズ完了時に必ず仕様との整合性確認**（ユーザーと最終確認）
- ✅ **機密情報（APIキー、パスワード等）はコミットしない**

---

## 🔗 外部ドキュメント

### プロジェクト設定

- **[../CLAUDE.md](../CLAUDE.md)**: Claude Code 設定と全体ルール

### 人間用ドキュメント（簡潔版）

- **[../docs/README.md](../docs/README.md)**: プロジェクト概要
- **[../docs/SETUP.md](../docs/SETUP.md)**: 環境構築手順
- **[../docs/DATABASE.md](../docs/DATABASE.md)**: データベース設計（簡潔版）
- **[../docs/API.md](../docs/API.md)**: API仕様（簡潔版）

### AI用ドキュメント（詳細版）

詳細な技術仕様は `.serena/memories/` を参照：
- `database_specifications.md` - DB詳細仕様（CREATE TABLE文等）
- `api_specifications.md` - API詳細仕様（全エンドポイント）
- `system_architecture.md` - システムアーキテクチャ詳細
- `implementation_status.md` - 実装状況・進捗
- `current_issues_and_priorities.md` - 現在の課題・優先度（最重要）

参考: [_project_template/DOCUMENTATION_GUIDE.md](./_project_template/DOCUMENTATION_GUIDE.md)

---

## 📝 更新履歴

- **{{CURRENT_DATE}}**: テンプレート初期作成
