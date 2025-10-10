# ドキュメント管理ガイド（汎用）

プロジェクトドキュメントの管理方針とベストプラクティス。

## ドキュメント体系

### 2層構造
1. **docs/** - 人間用ドキュメント（簡潔版）
2. **.serena/memories/** - AI用詳細仕様（Serena MCP用）

### 役割分担

| 種類 | 対象 | 内容 | 更新タイミング |
|------|------|------|---------------|
| docs/ | 人間 | 概要・要点のみ | マージ後 |
| .serena/memories/ | AI | 詳細・技術仕様 | マージ後 |

## docs/ の構成（人間用）

### 必須ファイル
- **README.md** - プロジェクト概要
- **SETUP.md** - 環境構築手順
- **API.md** - API仕様（簡潔版）
- **DATABASE.md** - DB設計（簡潔版）
- **PHASES.md** - フェーズ管理（オプション）

### 記載内容
- **簡潔性**: 要点のみ（詳細はSerenaメモリへ）
- **可読性**: 表・箇条書き中心
- **最新性**: マージ後に必ず更新

### 例: API.md
```markdown
# API仕様

## エンドポイント一覧

### 認証 (Auth)
```
POST   /api/auth/register    ユーザー登録
POST   /api/auth/login       ログイン
```

## 詳細仕様
AI用の詳細なAPI仕様は `.serena/memories/api_specifications.md` を参照。
```

## .serena/memories/ の構成（AI用）

### Serenaメモリの役割
- AIが過去のコンテキストを保持
- セッション開始時に読み込んで状況把握
- 詳細な技術仕様を記録

### 推奨メモリファイル

#### 1. current_issues_and_priorities.md（最重要）
```markdown
# 現在のIssue・優先度

## 🔥 高優先度
- Issue #XX: [内容]（担当: XX）

## 📋 中優先度
...

## 技術的負債
...
```

#### 2. phase_progress.md（フェーズ管理時）
```markdown
# フェーズ進捗詳細

## 現在のフェーズ
Phase X: [フェーズ名]

## 実装済み機能
- ✅ 機能A（PR #XX）

## 残タスク
- [ ] 機能C
```

#### 3. project_overview.md
```markdown
# プロジェクト概要

## システム構成
- フロントエンド: Next.js 14
- バックエンド: FastAPI
- DB: Supabase (PostgreSQL)

## 主要機能
...
```

#### 4. api_specifications.md
```markdown
# API詳細仕様

## POST /api/auth/login
### リクエスト
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### レスポンス
...

### エラーハンドリング
...
```

#### 5. database_specifications.md
```markdown
# データベース詳細仕様

## usersテーブル
| カラム | 型 | 制約 | 説明 |
|--------|---|------|------|
| id | UUID | PK | ユーザーID |
| email | VARCHAR | UNIQUE | メールアドレス |
...

## インデックス
- users_email_idx: email (UNIQUE)

## 外部キー制約
...
```

#### 6. system_architecture.md
```markdown
# システムアーキテクチャ

## 認証フロー
1. ユーザーがログインフォーム送信
2. バックエンドでbcrypt検証
3. JWT発行
...

## ディレクトリ構成
...
```

#### 7. implementation_status.md
```markdown
# 実装状況

## 完了機能
- ✅ ユーザー認証（JWT）
- ✅ 案件管理CRUD

## 進行中
- 🔄 請求書生成

## 未実装
- ⬜ レポート機能
```

#### 8. プロジェクト固有の仕様
- 例（nissei）: `material_and_chuiten_specifications.md`

## ドキュメント更新フロー

### マージ後の必須作業
```
1. docs/ の更新
   - API.md, DATABASE.md など該当ファイル
   - 簡潔に要点のみ更新

2. Serenaメモリの更新
   - api_specifications.md, database_specifications.md など
   - 詳細な技術仕様を更新
   - phase_progress.md の進捗更新

3. コミット＆プッシュ
   git add docs/ .serena/memories/
   git commit -m "docs: [機能名]の追加に伴いドキュメント更新"
   git push
```

### 更新タイミング早見表

| 変更内容 | docs/ | Serenaメモリ |
|---------|-------|-------------|
| APIエンドポイント追加 | API.md | api_specifications.md |
| テーブル追加 | DATABASE.md | database_specifications.md |
| フェーズ完了 | PHASES.md | phase_progress.md |
| Issue追加/解決 | - | current_issues_and_priorities.md |
| アーキテクチャ変更 | - | system_architecture.md |

## ベストプラクティス

### ✅ 推奨
- **マージ直後の更新**: ドキュメント更新を先送りしない
- **両方更新**: docs/ と Serenaメモリの両方を更新
- **詳細はSerenaへ**: 人間用は簡潔に、詳細はAI用へ
- **phase_progress.md の活用**: フェーズ管理時は必ず更新

### ❌ 非推奨
- ドキュメント更新の放置
- docs/ だけ更新してSerenaメモリを忘れる
- Serenaメモリだけ更新してdocs/ を忘れる
- 詳細を docs/ に詰め込む（可読性低下）

## Serenaメモリの操作

### メモリ読み込み
```
mcp__serena__list_memories
mcp__serena__read_memory("current_issues_and_priorities.md")
```

### メモリ書き込み/更新
```
mcp__serena__write_memory(
  memory_name="api_specifications.md",
  content="[更新内容]"
)
```

### メモリ削除（非推奨）
```
mcp__serena__delete_memory("old_memory.md")
```
※ユーザーの明示的な指示がある場合のみ

## トラブルシューティング

### Q: どのメモリファイルを更新すればいい？
A: 変更内容に応じて判断
- API変更 → api_specifications.md
- DB変更 → database_specifications.md
- フェーズ進捗 → phase_progress.md
- Issue管理 → current_issues_and_priorities.md

### Q: docs/ と Serenaメモリの使い分けは？
A:
- **docs/**: 人間が読む（簡潔・要点）
- **Serenaメモリ**: AIが読む（詳細・技術仕様）

### Q: 更新を忘れた場合は？
A: 気づいた時点で即座に更新
1. docs/ を更新してコミット
2. Serenaメモリを更新
3. 次回から忘れないようワークフローを再確認

### Q: Serenaメモリが多すぎて管理が大変
A: 定期的に整理
- 不要なメモリは削除（ユーザー確認後）
- 類似メモリは統合
- プロジェクト固有のメモリファイル構成を最適化
