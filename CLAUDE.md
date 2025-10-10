# Claude Code Configuration ({{PROJECT_NAME}})

このファイルは、Claude Codeがこのプロジェクトで作業する際の基本設定とワークフローを定義します。

**プロジェクト名**: {{PROJECT_NAME}}
**最終更新**: {{CURRENT_DATE}}

---

## プロジェクト概要

### 基本情報
- **リポジトリ**: {{GITHUB_OWNER}}/{{GITHUB_REPO}}
- **フロントエンド**: ポート{{FRONTEND_PORT}}
- **バックエンド**: ポート{{BACKEND_PORT}}
- **テストユーザー**: {{TEST_USER_EMAIL}}

### 技術スタック
- **フロントエンド**: [記載してください]
- **バックエンド**: [記載してください]
- **データベース**: [記載してください]
- **テスト**: Playwright (E2E)

---

## セッション開始時の必須手順

### 1. Serenaメモリから状態を読み込み

⚠️ **毎セッション開始時に必ず実施**

```bash
# 1. プロジェクトをアクティベート
mcp__serena__activate_project
  project: "{{PROJECT_NAME}}"

# 2. 利用可能なメモリを確認
mcp__serena__list_memories

# 3. 現在の優先度を把握
mcp__serena__read_memory
  memory_file_name: "current_issues_and_priorities.md"

# 4. セッション引き継ぎ情報を確認
mcp__serena__read_memory
  memory_file_name: "session_handover.md"

# 5. フェーズ進捗を確認（フェーズ管理時）
mcp__serena__read_memory
  memory_file_name: "phase_progress.md"
```

詳細: [ai-rules/_project_template/SETUP_AND_MCP.md](ai-rules/_project_template/SETUP_AND_MCP.md)

### 2. ブランチ確認

```bash
git fetch --quiet
git status
```

---

## 開発ワークフロー

詳細: [ai-rules/_project_template/WORKFLOW.md](ai-rules/_project_template/WORKFLOW.md)

### 全体フロー

```
[セッション開始]
    ↓
[Serenaメモリ読み込み] ← 必須
    ↓
[ブランチ作成] (feat-*, fix-*, docs-*, refactor-*)
    ↓
[実装・修正]
    ↓
[e2e-tester サブエージェント実行] ← 必須（コミット前）
    ├─[成功] → [コミット]
    └─[失敗] → [修正] → ループ
    ↓
[push]
    ↓
[PR作成]
    ↓
[code-reviewer サブエージェント レビュー] ← 必須
    ↓
[レビュー対応]
    ├─[マージ可] → [マージ] → [docs-updater サブエージェント] ← 必須
    └─[要修正] → [修正] → 再レビュー
```

---

## サブエージェント

### code-reviewer

**用途**: PR作成直後の必須レビュー

```
> code-reviewerサブエージェントを使用してPR #[番号]をレビューしてください
```

**実行内容**:
- コード品質チェック
- セキュリティ確認
- パフォーマンス検証
- 命名規則準拠確認
- Critical/Major/Minor分類での問題報告

詳細: [.claude/agents/code-reviewer.md](.claude/agents/code-reviewer.md)

### e2e-tester

**用途**: コミット前の必須E2Eテスト

```
> e2e-tester サブエージェントを使用してE2Eテストを実施
```

**実行内容**:
- 変更ファイルからテスト対象を推測
- 正常系・異常系・エッジケースのテストシナリオ作成
- Playwright MCPでテスト実行
- スクリーンショット保存
- テスト結果レポート出力

詳細: [.claude/agents/e2e-tester.md](.claude/agents/e2e-tester.md)

### docs-updater

**用途**: マージ後の必須ドキュメント更新

```
> docs-updaterサブエージェントを使用してドキュメント更新を実施
```

**実行内容**:
- docs/ の人間用ドキュメント更新
- Serenaメモリの詳細仕様更新
- 一貫性確認
- 自動コミット・プッシュ

詳細: [.claude/agents/docs-updater.md](.claude/agents/docs-updater.md)

---

## MCP設定

### 有効なMCPサーバー

#### Context7
- **用途**: 最新ライブラリ仕様の取得
- **使用例**: `@context7 react 19`, `@context7 fastapi`

#### GitHub
- **用途**: リポジトリ操作
- **リポジトリ**: {{GITHUB_OWNER}}/{{GITHUB_REPO}}
- **操作**: PR作成、Issue管理、マージ

#### Serena
- **用途**: コードベース管理とメモリ
- **プロジェクト**: {{PROJECT_NAME}}
- **メモリファイル**:
  - `current_issues_and_priorities.md` - Issue・優先度
  - `session_handover.md` - セッション引き継ぎ
  - `phase_progress.md` - フェーズ進捗（フェーズ管理時）
  - `database_specifications.md` - DB詳細仕様
  - `api_specifications.md` - API詳細仕様

#### Playwright
- **用途**: E2Eテスト実行
- **テストユーザー**: {{TEST_USER_EMAIL}}

詳細: [ai-rules/_project_template/SETUP_AND_MCP.md](ai-rules/_project_template/SETUP_AND_MCP.md)

---

## 重要なルール

### 必須事項

#### セッション開始時
- ✅ Serenaメモリから状態を読み込む
- ✅ フェーズ・仕様を確認してから作業開始
- ✅ 不明点はユーザーに質問

#### 実装時
- ✅ 専用ブランチで作業（mainブランチ直接作業禁止）
- ✅ [命名規則](ai-rules/common/NAMING_CONVENTIONS.md) に準拠
- ✅ 影響範囲を確認してから修正

#### コミット前
- ✅ e2e-tester サブエージェントでE2Eテスト実施
- ✅ すべてのテストがパスすることを確認
- ✅ デバッグコード・不要コメントを削除

#### PR作成後
- ✅ code-reviewer サブエージェント レビューを依頼
- ✅ Critical問題は必ず修正してからマージ
- ✅ レビュー対応は即座に実施（Issue化は例外的）

#### マージ後
- ✅ docs-updater サブエージェントでドキュメント更新
- ✅ docs/ と Serenaメモリの両方を更新
- ✅ PR作成→レビュー→マージ→ドキュメント更新を1セットで完了

### 禁止事項

- ❌ mainブランチへの直接作業
- ❌ テスト未実施でのコミット
- ❌ Critical問題が残ったままのマージ
- ❌ ドキュメント更新なしでの作業完了
- ❌ デバッグコード・不要コメントのコミット
- ❌ git config の変更
- ❌ 破壊的gitコマンド（push --force, hard reset等、ユーザー明示指示除く）

---

## ドキュメント構成

### 人間用ドキュメント（docs/）
- `docs/DATABASE.md` - データベーススキーマ定義
- `docs/API.md` - API エンドポイント仕様
- `docs/SETUP.md` - 環境構築手順
- `docs/PHASES.md` - フェーズ管理（フェーズ管理時）

### AI用詳細仕様（Serenaメモリ）
- `database_specifications.md` - DB詳細仕様
- `api_specifications.md` - API詳細仕様
- `phase_progress.md` - フェーズ進捗
- `current_issues_and_priorities.md` - Issue・優先度

詳細: [ai-rules/common/DOCUMENTATION_GUIDE.md](ai-rules/common/DOCUMENTATION_GUIDE.md)

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
- `test`: テストの追加・修正
- `chore`: ビルドプロセスやツールの変更

---

## セッション管理

⚠️ AI側から適切なタイミングでセッション切り替えを提案します

詳細: [ai-rules/common/SESSION_MANAGEMENT.md](ai-rules/common/SESSION_MANAGEMENT.md)

### セッション切り替えタイミング
- トークン使用量が予算の70%を超えた場合
- 大きなマイルストーン完了時
- コンテキストが複雑になった場合

### セッション終了時の手順
1. Serenaメモリを更新（session_handover.md等）
2. 完了内容と次のタスクを記録
3. ユーザーに切り替えを提案

---

## AI用ガイドライン

### プロジェクト固有（ai-rules/_project_template/）
- [WORKFLOW.md](ai-rules/_project_template/WORKFLOW.md) - 開発ワークフロー
- [SETUP_AND_MCP.md](ai-rules/_project_template/SETUP_AND_MCP.md) - 環境構築・MCP設定
- [TESTING.md](ai-rules/_project_template/TESTING.md) - テストガイドライン
- [PR_AND_REVIEW.md](ai-rules/_project_template/PR_AND_REVIEW.md) - PR・レビュープロセス
- [ISSUE_GUIDELINES.md](ai-rules/_project_template/ISSUE_GUIDELINES.md) - Issue管理
- [DOCUMENTATION_GUIDE.md](ai-rules/_project_template/DOCUMENTATION_GUIDE.md) - ドキュメント管理

### 汎用（ai-rules/common/）
- [WORKFLOW.md](ai-rules/common/WORKFLOW.md) - 汎用ワークフロー
- [SESSION_MANAGEMENT.md](ai-rules/common/SESSION_MANAGEMENT.md) - セッション管理
- [PHASE_MANAGEMENT.md](ai-rules/common/PHASE_MANAGEMENT.md) - フェーズ管理
- [DOCUMENTATION_GUIDE.md](ai-rules/common/DOCUMENTATION_GUIDE.md) - ドキュメント管理
- [COMMIT_GUIDELINES.md](ai-rules/common/COMMIT_GUIDELINES.md) - コミットメッセージ
- [NAMING_CONVENTIONS.md](ai-rules/common/NAMING_CONVENTIONS.md) - 命名規則
- [ISSUE_GUIDELINES.md](ai-rules/common/ISSUE_GUIDELINES.md) - Issue管理
- [PR_PROCESS.md](ai-rules/common/PR_PROCESS.md) - PRプロセス
- [SETTINGS_JSON_GUIDE.md](ai-rules/common/SETTINGS_JSON_GUIDE.md) - settings.json設定

---

## 最終更新履歴

- {{CURRENT_DATE}}: 初期作成
