# Issue 作成ガイドライン（汎用版）

このドキュメントでは、GitHub Issueの作成方法と管理ルールを定義します。

**プロジェクト横断**: このファイルは複数プロジェクトで共通利用可能な汎用ガイドです。

---

## Issue作成のタイミング

### 必須作成

1. **PRレビューでCritical/Major問題が発見された場合**
   - すぐに修正できない問題はIssue化
   - 参考: [PR_MERGE_PROCESS.md](./PR_MERGE_PROCESS.md)

2. **バグが発見された場合**
   - 再現手順が明確なバグ
   - データ損失やセキュリティリスクがあるバグ

3. **新機能の要望がある場合**
   - ユーザー要望
   - システム改善提案

### 任意作成

1. **技術的負債の記録**
   - リファクタリング対象
   - パフォーマンス改善余地

2. **ドキュメント更新**
   - README更新
   - APIドキュメント追加

---

## Issueテンプレート

### バグ報告

```markdown
## 概要
[バグの内容を簡潔に説明]

## 再現手順
1. [手順1]
2. [手順2]
3. [手順3]

## 期待される動作
[本来どうあるべきか]

## 実際の動作
[実際にどうなっているか]

## 環境
- OS: Windows/Mac/Linux
- ブラウザ: Chrome/Firefox/Safari（フロントエンドの場合）
- バックエンドバージョン: [FastAPIバージョン]
- データベース: Supabase

## スクリーンショット
（あれば添付）

## エラーメッセージ
```
[エラーメッセージ全文]
```

## 追加情報
[その他関連する情報]
```

**ラベル**: `bug`, `priority: high/medium/low`

---

### PRレビュー指摘事項

```markdown
## 問題概要
[問題の内容を簡潔に説明]

## 発生原因
[なぜこの問題が発生したか]

### コード該当箇所
**ファイル**: `backend/app/api/worklogs.py` (line XX-YY)

```python
# 問題のあるコード
def example_function():
    # ...
```

## 影響
[この問題がシステムに与える影響]

## 必須対応（Critical/Majorのみ）

### Option 1: [推奨案]
[具体的な修正方法]

```python
# 修正例
def example_function():
    # ...
```

### Option 2: [代替案]
[別の修正方法]

## 優先度
**Priority: High/Medium/Low**

[優先度の理由]

## 関連PR
- PR #XX: [PRタイトル]

## レビュー詳細
詳細は [PR_REVIEW_HISTORY.md](../docs/PR_REVIEW_HISTORY.md) の PR #XX セクションを参照してください。
```

**ラベル**: `bug`, `priority: high`, `security` (セキュリティ関連の場合)

---

### 新機能追加

```markdown
## 概要
[機能の概要を簡潔に説明]

## 背景・目的
[なぜこの機能が必要か]

## 実装内容
- [ ] タスク1: [具体的な実装内容]
- [ ] タスク2: [具体的な実装内容]
- [ ] タスク3: [具体的な実装内容]

## 技術的詳細
### バックエンド
- エンドポイント: `POST /api/example`
- リクエスト形式: [JSONスキーマ]
- レスポンス形式: [JSONスキーマ]

### フロントエンド
- ページ: `/example`
- コンポーネント: `ExampleComponent.tsx`

### データベース
- テーブル: `examples`
- カラム: `id`, `name`, `created_at`, `updated_at`

## UI/UXデザイン
（モックアップやワイヤーフレームがあれば添付）

## 受け入れ基準
- [ ] 基準1: [完成条件]
- [ ] 基準2: [完成条件]
- [ ] 基準3: [完成条件]

## テスト計画
- [ ] E2Eテスト: [テストシナリオ]
- [ ] 単体テスト: [テスト対象]

## 参考資料
- [関連ドキュメント]
- [参考実装]
```

**ラベル**: `enhancement`, `priority: medium`

---

### リファクタリング

```markdown
## 概要
[リファクタリング対象を簡潔に説明]

## 現状の問題
[現在のコードの問題点]

## 改善案
[どのように改善するか]

## メリット
- メリット1
- メリット2
- メリット3

## 影響範囲
[変更が影響する範囲]

## 実装タスク
- [ ] タスク1
- [ ] タスク2
- [ ] タスク3

## 優先度
**Priority: Medium/Low**

[優先度の理由]
```

**ラベル**: `refactor`, `priority: medium/low`

---

## ラベル分類

### 種類
- `bug`: バグ修正
- `enhancement`: 新機能追加
- `refactor`: リファクタリング
- `documentation`: ドキュメント更新
- `security`: セキュリティ関連
- `performance`: パフォーマンス改善
- `test`: テスト追加・修正

### 優先度
- `priority: high`: Critical問題、データ損失リスク、セキュリティリスク
- `priority: medium`: Major問題、UX改善、パフォーマンス改善
- `priority: low`: Minor問題、コード品質改善、将来的な機能追加

### 状態
- `in progress`: 対応中
- `blocked`: ブロック中（他のタスクに依存）
- `ready for review`: レビュー待ち
- `wontfix`: 対応しない

---

## Issue作成の手順

### 1. Issue作成

```bash
mcp__github__create_issue を使用:
- owner: "ShigaRyunosuke10"
- repo: "nissei"
- title: "[種類] 問題の要約"
- body: [上記テンプレートに従った内容]
- labels: ["bug", "priority: high"]
```

### 2. Issue番号の確認

作成後、Issue番号（例: #25）を確認します。

### 3. PRまたはコミットでIssueをリンク

#### PRでリンク
```markdown
## 関連Issue
Closes #25
Fixes #26
Resolves #27
```

#### コミットメッセージでリンク
```bash
git commit -m "fix: データベーススキーマ不一致を修正

Fixes #25

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Issue管理のルール

### アサイン
- Issue作成者が自分で対応する場合は自分にアサイン
- 他のメンバーに依頼する場合は相手にアサイン

### マイルストーン
- Phase 1, Phase 2, Phase 3 などのマイルストーンを設定
- リリース計画に基づいて振り分け

### プロジェクト
- GitHub Projectsを使用してカンバンボードで管理
- `Backlog`, `Todo`, `In Progress`, `Done` のステータスで管理

### クローズタイミング
- PRがマージされたら自動的にクローズ（`Closes #XX`使用時）
- 対応不要と判断した場合は `wontfix` ラベルを付けて手動クローズ

---

## Issue作成例

### Critical問題のIssue

**タイトル**: `[Critical] PR #21: データベーススキーマ不一致によるデータ損失問題`

**ラベル**: `bug`, `priority: high`, `security`

**詳細**: [Issue #23](https://github.com/ShigaRyunosuke10/nissei/issues/23) を参照

### Major問題のIssue

**タイトル**: `[Major] 管理者APIのエラーハンドリング強化`

**ラベル**: `enhancement`, `priority: medium`

### Minor問題のIssue

**タイトル**: `[Minor] alert()をトースト通知に置き換え`

**ラベル**: `refactor`, `priority: low`

---

## 注意事項

- **Issue作成は必要な場合のみ** - 些細な修正は直接PRで対応
- **タイトルは簡潔に** - 50文字以内
- **本文は具体的に** - 再現手順や修正案を明確に記載
- **ラベルは必ず設定** - 種類と優先度を明示
- **関連PRは必ずリンク** - `Closes #XX` を使用

---

## 関連ドキュメント

- [PR_MERGE_PROCESS.md](./PR_MERGE_PROCESS.md): PRマージプロセス
- [PR_GUIDELINES.md](./PR_GUIDELINES.md): PR作成ガイドライン
- [COMMIT_GUIDELINES.md](./COMMIT_GUIDELINES.md): コミットメッセージガイドライン
- [../docs/PR_REVIEW_HISTORY.md](../docs/PR_REVIEW_HISTORY.md): PRレビュー履歴
