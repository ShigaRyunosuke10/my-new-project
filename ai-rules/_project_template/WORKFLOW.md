# 開発ワークフロー（{{PROJECT_NAME}} 専用）

このドキュメントでは、作業開始から終了までの全体的なワークフローを定義します。

**プロジェクト固有**: このファイルは {{PROJECT_NAME}} プロジェクト専用の設定を含みます。

**最終更新**: {{CURRENT_DATE}}

---

## クイックリファレンス

### 全体フロー図

```
[作業開始]
    ↓
[ブランチ作成] (feat-*, fix-*, docs-*, refactor-*)
    ↓
[実装・修正]
    ↓
[e2e-tester サブエージェント実行] ← 必須（コミット前）
    ├─[テスト成功] → [コミット] ← COMMIT_GUIDELINES.md準拠
    └─[テスト失敗] → [修正] → ループ
    ↓
[push]
    ↓
[PR作成] ← PR_AND_REVIEW.md参照
    ↓
[code-reviewer サブエージェント レビュー依頼] ← 必須
    ↓
[レビュー結果確認]
    ├─[マージ可] → [マージ] → [docs-updater サブエージェント実行] ← 必須
    │                              ↓
    │                         [完了]
    │
    └─[要修正] → [修正] → [push] → [再レビュー依頼] → ループ
```

---

## 1. セッション開始時（必須）

⚠️ **セッション管理**: AI側から適切なタイミングでセッション切り替えを提案します
詳細: [../../common/SESSION_MANAGEMENT.md](../../common/SESSION_MANAGEMENT.md)

### 1.1 Serena メモリから状態を読み込み

⚠️ **重要**: 毎セッション開始時に必ず実施

```
1. mcp__serena__activate_project
   project: "{{PROJECT_NAME}}"

2. mcp__serena__list_memories
   → 利用可能なメモリを確認

3. mcp__serena__read_memory
   memory_file_name: "current_issues_and_priorities.md"
   → 現在の優先度を把握

4. mcp__serena__read_memory
   memory_file_name: "session_handover.md"  # セッション引き継ぎ情報
   → 前セッションの完了内容・次のタスクを確認

5. mcp__serena__read_memory
   memory_file_name: "phase_progress.md"  # フェーズ管理時
   → 現在のフェーズ・進捗を確認

6. フェーズ・仕様確認
   - 現在のフェーズと実装内容を確認
   - 不明点はユーザーに質問

7. 作業開始
```

詳細: [SETUP_AND_MCP.md](./SETUP_AND_MCP.md) の「Serena MCP」セクション、[../../common/PHASE_MANAGEMENT.md](../../common/PHASE_MANAGEMENT.md)

### 1.2 ブランチ作成

**必ず専用ブランチを作成する**

```bash
git checkout -b <ブランチ名>
```

#### ブランチ命名規則

- `feat-<機能名>`: 新機能追加（例: `feat-user-dashboard`）
- `fix-<修正内容>`: バグ修正（例: `fix-login-timeout`）
- `refactor-<対象>`: リファクタリング（例: `refactor-api-error-handling`）
- `docs-<内容>`: ドキュメント更新（例: `docs-api-specification`）

⚠️ **重要**: mainブランチでの直接作業は絶対禁止

---

## 2. 実装・修正

### 2.1 命名規則に準拠

詳細: [NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md)

- TypeScript/JavaScript: camelCase（変数・関数）、PascalCase（クラス・型）
- Python: snake_case（変数・関数）、PascalCase（クラス）
- APIエンドポイント: kebab-case、複数形の名詞
- データベース: snake_case（テーブル・カラム）
- 環境変数: UPPER_SNAKE_CASE

### 2.2 影響範囲の確認

- 該当修正によって他の処理に問題がないか確認
- 他の動作に影響がある場合は既存の期待動作が正常に動作するよう修正
- 修正前に影響範囲を把握する

---

## 3. テスト（必須）

詳細: [TESTING.md](./TESTING.md)

### 3.1 動作確認

- **必ず動作確認を行う**
- 動作確認中にエラーが発見された際はタスクを更新
- エラーがない状態でコミット

### 3.2 E2Eテスト（必須）

**e2e-tester サブエージェント使用**:
```
> e2e-tester サブエージェントを使用してE2Eテストを実施
```

- Playwright MCPで自動テスト実行
- 正常系・異常系・エッジケースを確認
- テストユーザー（{{TEST_USER_EMAIL}}）で全フローを確認
- スクリーンショット自動保存
- テスト失敗時は修正してから再実行

### 3.3 セルフチェック

- [ ] コンソールエラーがない
- [ ] デバッグコード（`console.log`, `print`）を削除
- [ ] 不要なコメントを削除
- [ ] コードフォーマットが統一されている
- [ ] [命名規則](./NAMING_CONVENTIONS.md) に準拠している

---

## 4. コミット

詳細: [COMMIT_GUIDELINES.md](./COMMIT_GUIDELINES.md)

### 4.1 コミットメッセージ形式

```bash
git add .
git commit -m "<type>: <subject>

<body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### Type（必須）

- `feat`: 新機能追加
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `refactor`: バグ修正や機能追加を含まないコードの変更
- `test`: テストの追加・修正
- `chore`: ビルドプロセスやツールの変更

---

## 5. PR作成・レビュー・マージ

⚠️ **重要**: このフェーズの詳細は **[PR_AND_REVIEW.md](./PR_AND_REVIEW.md)** を参照してください

### 5.1 push

```bash
git push -u origin <ブランチ名>
```

### 5.2 PR作成

```bash
mcp__github__create_pull_request
  owner: "{{GITHUB_OWNER}}"
  repo: "{{GITHUB_REPO}}"
  title: "<type>: <変更内容の要約>"
  body: "[PR_AND_REVIEW.md のテンプレートに従う]"
  head: "<ブランチ名>"
  base: "main"
```

### 5.3 code-reviewer サブエージェント レビュー（必須）

PR作成直後に必ず実施

```
> code-reviewerサブエージェントを使用してPR #[番号]をレビューしてください
```

### 5.4 レビュー対応（Issue管理ガイドラインに従う）

詳細: [ISSUE_GUIDELINES.md](./ISSUE_GUIDELINES.md) の「code-reviewerレビュー後の対応フロー」

**基本方針: その場で即修正**（Issueを溜めない）

- **Critical**: 必ずその場で修正
- **Major**: 原則その場で修正（30分以内必須）
- **Minor**: 5分以内なら即修正、それ以外も推奨
- **例外的にIssue化**: 1時間超の大規模修正のみ（要相談）

**対応フロー**:
1. 問題発見 → 作業時間見積もり
2. 上記方針に従って即修正 or Issue化を判断
3. 即修正の場合 → 修正 → push → 再レビュー依頼（Critical/Major）
4. Issue化の場合 → GitHub Issue作成 → Serenaメモリ登録 → PRマージ（Critical解消済みなら）

### 5.5 マージ

```bash
mcp__github__merge_pull_request
  owner: "{{GITHUB_OWNER}}"
  repo: "{{GITHUB_REPO}}"
  pullNumber: <PR番号>
  merge_method: "squash"  # 推奨
```

---

## 6. ドキュメント更新（マージ後必須）

⚠️ **重要**: **PR作成→レビュー→マージ→ドキュメント更新までを1セットの作業として完了させる**

### 6.1 更新対象

#### 人間用ドキュメント（docs/）
- **[docs/DATABASE.md](../../docs/DATABASE.md)**: データベーススキーマ定義
- **[docs/API.md](../../docs/API.md)**: API エンドポイント仕様
- **[docs/SETUP.md](../../docs/SETUP.md)**: 環境構築手順
- **[docs/PHASES.md](../../docs/PHASES.md)**: フェーズ管理（フェーズ管理時）

#### AI用詳細仕様（Serenaメモリ）
- `.serena/memories/database_specifications.md` - DB詳細仕様
- `.serena/memories/api_specifications.md` - API詳細仕様
- `.serena/memories/phase_progress.md` - フェーズ進捗（フェーズ管理時）
- `.serena/memories/current_issues_and_priorities.md` - Issue・優先度

詳細: [../../common/DOCUMENTATION_GUIDE.md](../../common/DOCUMENTATION_GUIDE.md)

### 6.2 更新フロー

```bash
# mainブランチに切り替え
git checkout main
git pull

# 1. docs/ の更新
# - API.md, DATABASE.md など該当ファイルを編集
# - 簡潔に要点のみ更新

# 2. Serenaメモリの更新
mcp__serena__write_memory(
  memory_name="api_specifications.md",  # 該当ファイル
  content="[詳細な技術仕様]"
)

# 3. コミット＆プッシュ
git add docs/ .serena/memories/
git commit -m "docs: [機能名]の追加に伴いドキュメント更新"
git push
```

---

## 7. フェーズ完了時（該当する場合）

詳細: [../../common/PHASE_MANAGEMENT.md](../../common/PHASE_MANAGEMENT.md)

### 7.1 完了チェックリスト
- [ ] 全機能の実装完了
- [ ] E2Eテスト完了
- [ ] **仕様との整合性確認**（ユーザーと最終確認）
- [ ] ドキュメント完全更新（docs/PHASES.md + Serenaメモリ）
- [ ] 次フェーズの準備（必要に応じて）

### 7.2 フェーズ移行手順
1. ユーザーと仕様の最終確認
2. docs/PHASES.md のステータスを「✅ 完了」に更新
3. phase_progress.md に完了サマリを記載
4. 次フェーズの仕様を確認してから開始

---

## 8. Issue作成（必要に応じて）

詳細: [ISSUE_GUIDELINES.md](./ISSUE_GUIDELINES.md)

- レビューでCritical/Major問題が発見された場合
- バグが発見された場合
- 新機能の要望がある場合

---

## 詳細ガイドライン

### {{PROJECT_NAME}} 固有
- **[SETUP_AND_MCP.md](./SETUP_AND_MCP.md)**: 環境構築・MCP設定
- **[TESTING.md](./TESTING.md)**: テストガイドライン
- **[PR_AND_REVIEW.md](./PR_AND_REVIEW.md)**: PR作成・レビュー・マージプロセス
- **[ISSUE_GUIDELINES.md](./ISSUE_GUIDELINES.md)**: Issue作成ガイドライン
- **[DOCUMENTATION_GUIDE.md](./DOCUMENTATION_GUIDE.md)**: {{PROJECT_NAME}}固有のドキュメント管理

### 汎用（プロジェクト横断）
- **[../../common/WORKFLOW.md](../../common/WORKFLOW.md)**: 汎用ワークフロー
- **[../../common/SESSION_MANAGEMENT.md](../../common/SESSION_MANAGEMENT.md)**: セッション管理ガイドライン
- **[../../common/PHASE_MANAGEMENT.md](../../common/PHASE_MANAGEMENT.md)**: フェーズ管理
- **[../../common/DOCUMENTATION_GUIDE.md](../../common/DOCUMENTATION_GUIDE.md)**: ドキュメント管理
- **[../../common/COMMIT_GUIDELINES.md](../../common/COMMIT_GUIDELINES.md)**: コミットメッセージガイドライン
- **[../../common/NAMING_CONVENTIONS.md](../../common/NAMING_CONVENTIONS.md)**: 命名規則

---

## 注意事項

- ⚠️ **セッション開始時にSerenaメモリから状況を把握**（phase_progress.md含む）
- ⚠️ **フェーズ開始時に必ず仕様確認**
- ⚠️ **mainブランチへの直接作業は絶対禁止**
- ⚠️ **コミット前に必ず動作確認とE2Eテストを実施**
- ⚠️ **PR作成直後に必ずcode-reviewer サブエージェント レビューを依頼**
- ⚠️ **Critical問題が存在する場合は絶対にマージしない**
- ⚠️ **PR作成→レビュー→マージ→ドキュメント更新までを1セットの作業として完了**
- ⚠️ **フェーズ完了時に必ず仕様との整合性確認**
