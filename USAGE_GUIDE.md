# Claude Code プロジェクトテンプレート - 詳細使用ガイド

**バージョン**: 1.0
**最終更新**: 2025-10-09

---

## 📖 目次

1. [事前準備](#事前準備)
2. [プロジェクト初期化](#プロジェクト初期化)
3. [要件定義フロー](#要件定義フロー)
4. [環境構築](#環境構築)
5. [開発フロー](#開発フロー)
6. [デプロイ設定](#デプロイ設定)
7. [トラブルシューティング](#トラブルシューティング)

---

## 1. 事前準備

### 必須ツール

```bash
# Python 3.8+
python --version

# Git
git --version

# Docker & Docker Compose
docker --version
docker-compose --version

# Node.js 18+ (フロントエンド開発時)
node --version
npm --version
```

### アカウント準備

以下のアカウントを事前に作成しておくことを推奨：

- **GitHub**: リポジトリ管理用
- **Context7**: AI文書取得用（[登録URL](https://context7.com)）
- **ホスティングサービス**（選択に応じて）:
  - Vercel: [vercel.com](https://vercel.com)
  - Netlify: [netlify.com](https://netlify.com)
  - AWS: [aws.amazon.com](https://aws.amazon.com)

---

## 2. プロジェクト初期化

### ステップ2-1: テンプレートリポジトリの取得

```bash
# 作業ディレクトリに移動
cd ~/workspace

# テンプレートリポジトリをクローン
git clone <このリポジトリのURL> project-template
cd project-template
```

### ステップ2-2: 初期化スクリプトの実行

```bash
python init_project.py
```

**対話形式で以下を入力していきます**：

#### 2-2-1: プロジェクト基本情報

```
=== プロジェクト基本情報 ===

[1/7] プロジェクト名（英数字・ハイフンのみ、例: my-webapp）:
> my-webapp

[2/7] プロジェクト表示名（日本語可、例: 私のWebアプリ）:
> タスク管理アプリ

[3/7] プロジェクト説明（1-2行）:
> チームでタスクを共有・管理するWebアプリケーション。
> リアルタイム更新とカンバンボード機能を提供。

[4/7] GitHub Owner名（例: YourUsername）:
> ShigaRyunosuke10
```

#### 2-2-2: 技術スタック選択

```
=== 技術スタック選択 ===

[5/7] バックエンド技術を選択してください:
  1. FastAPI（Python、高速、非同期対応）
  2. Django（Python、フル機能、管理画面付き）
  3. Express（Node.js、軽量、JS統一）
選択 (1-3): 1

[6/7] フロントエンド技術を選択してください:
  1. Next.js（React、SSR、App Router）
  2. React（SPA、Vite使用）
  3. Vue.js（SPA、Composition API）
選択 (1-3): 1

[7/7] データベースを選択してください:
  1. PostgreSQL（本番推奨）
  2. MySQL（互換性高い）
  3. SQLite（開発用）
  4. その他（手動設定）
選択 (1-4): 1
```

#### 2-2-3: ホスティング先選択（NEW）

```
=== ホスティング先選択 ===

[8/10] フロントエンドのホスティング先を選択してください:
  1. Vercel（Next.js推奨、無料プランあり）
  2. Netlify（静的サイト向け、無料プランあり）
  3. AWS（S3 + CloudFront、柔軟性高い）
  4. 自前サーバー（Docker使用）
  5. 未定（後で決定）
選択 (1-5): 1

[9/10] バックエンドのホスティング先を選択してください:
  1. AWS（EC2/ECS、本番推奨）
  2. GCP（Cloud Run、コンテナ向け）
  3. Heroku（簡単デプロイ、有料）
  4. 自前サーバー（Docker使用）
  5. 未定（後で決定）
選択 (1-5): 1
```

**💡 ホスティング先選択のポイント**:
- **Vercel + AWS**: 一般的な組み合わせ（推奨）
- **Netlify + AWS**: 静的サイト向け
- **AWS + AWS**: 全AWS統一（運用一貫性）
- **自前サーバー**: コスト最小化・完全制御

#### 2-2-4: ポート設定

```
=== ポート設定 ===

[10/12] フロントエンドポート（デフォルト: 3000）:
> 3000

[11/12] バックエンドポート（デフォルト: 8000）:
> 8000

💡 ヒント: 複数プロジェクトを並行開発する場合、ポートを変えてください
   例: プロジェクトA（3000/8000）、プロジェクトB（3001/8001）
```

#### 2-2-5: Serenaメモリ複雑度

```
=== Serenaメモリ複雑度選択 ===

[12/14] プロジェクト規模を選択してください:
  1. Tier 1 - 小規模（3ファイル、個人開発・1-2週間）
  2. Tier 2 - 中規模（6ファイル、チーム開発・1-3ヶ月）
  3. Tier 3 - 大規模（7+ファイル、複雑システム・長期開発）
選択 (1-3): 2

✅ Tier 2を選択しました。以下のSerenaメモリファイルが生成されます:
   - project_overview.md
   - current_issues_and_priorities.md
   - implementation_status.md
   - database_specifications.md
   - api_specifications.md
   - system_architecture.md
```

#### 2-2-6: テストユーザー設定

```
=== テストユーザー設定 ===

[13/14] テストユーザーのメールアドレス:
> qa+test@example.com

[14/14] テストユーザーのパスワード（8文字以上、英数記号含む）:
> TestPass!123

⚠️ これらの情報は .claude/agents/e2e-tester.md に記載されます
```

#### 2-2-7: MCPサーバー選択

```
=== MCPサーバー選択 ===

以下のMCPサーバーを有効化しますか？（Y/n）

  [必須]
  - context7: ライブラリ最新仕様取得 (Y/n): Y
  - github: GitHub連携 (Y/n): Y
  - serena: コードベース管理 (Y/n): Y

  [推奨]
  - playwright: E2Eテスト (Y/n): Y
  - desktop-commander: システム操作 (Y/n): Y
  - codex: コード生成補助 (Y/n): n

  [オプション]
  - supabase: Supabase連携（PostgreSQL以外は不要） (Y/n): n

✅ MCPサーバー設定完了
```

### ステップ2-3: 初期化完了確認

```
=====================================
🎉 プロジェクト初期化完了！
=====================================

プロジェクト名: my-webapp
生成先: /Users/shiga/workspace/my-webapp

📁 生成されたファイル:
  ✅ CLAUDE.md
  ✅ .mcp.json（⚠️ API key要設定）
  ✅ docker-compose.yml
  ✅ .claude/settings.json
  ✅ backend/ (FastAPI)
  ✅ frontend/ (Next.js)
  ✅ .serena/memories/ (Tier 2: 6ファイル)
  ✅ ai-rules/
  ✅ docs/
  ✅ deployment/vercel/ (Vercel設定)
  ✅ deployment/aws/ (AWS設定)

📋 次のステップ:
  1. cd ../my-webapp
  2. 環境変数設定（backend/.env, frontend/.env）
  3. API key設定（.mcp.json）
  4. 要件定義（ai-rules/my-webapp/REQUIREMENTS.md）
  5. git init && git add . && git commit -m "Initial commit"
  6. 開発開始！

詳細は USAGE_GUIDE.md を参照してください。
```

---

## 3. 要件定義フロー

### ステップ3-1: 要件定義ドキュメントの記入

生成されたプロジェクトに移動：

```bash
cd ../my-webapp
```

`ai-rules/my-webapp/REQUIREMENTS.md` を開いて記入：

```markdown
# 要件定義 - タスク管理アプリ

**作成日**: 2025-10-09
**更新日**: 2025-10-09
**作成者**: ShigaRyunosuke10

---

## 1. プロジェクト背景・目的

### 背景
- 現在、チームでタスク管理をスプレッドシートで行っているが、リアルタイム性に欠ける
- タスクの進捗状況が可視化されず、ボトルネックの特定が困難

### 目的
- チーム全員がリアルタイムでタスク状況を把握できるシステムの構築
- カンバンボード形式で直感的なタスク管理を実現
- 進捗レポート自動生成による工数削減

---

## 2. 主要機能

### Phase 1: 基本機能（優先度: 高）
- [ ] ユーザー認証（メール＋パスワード）
- [ ] タスク作成・編集・削除
- [ ] タスクステータス管理（TODO / In Progress / Done）
- [ ] カンバンボード表示

### Phase 2: コラボレーション機能（優先度: 高）
- [ ] タスク担当者設定
- [ ] コメント機能
- [ ] リアルタイム更新（WebSocket）
- [ ] 通知機能

### Phase 3: 分析機能（優先度: 中）
- [ ] 進捗レポート生成
- [ ] タスク完了時間の統計
- [ ] ダッシュボード

### Phase 4: 拡張機能（優先度: 低）
- [ ] ファイル添付
- [ ] タグ機能
- [ ] カスタムフィールド

---

## 3. 技術要件

### 認証
- JWT認証
- セッション有効期限: 7日間
- パスワードハッシュ化（bcrypt）

### データ永続化
- PostgreSQL（Supabase使用）
- バックアップ: 毎日自動（AWS S3）

### ホスティング
- **フロントエンド**: Vercel（無料プラン）
- **バックエンド**: AWS EC2 t3.micro（有料）
- **データベース**: Supabase（無料プラン）

### パフォーマンス要件
- ページ初回読み込み: 3秒以内
- タスク作成・更新レスポンス: 1秒以内
- リアルタイム更新遅延: 500ms以内

---

## 4. 制約・前提条件

### 予算
- 初期開発: 無料範囲内（Vercel無料 + Supabase無料）
- 運用コスト: 月額 $10以下（AWS EC2のみ有料）

### 期限
- Phase 1完了: 2025-11-01（3週間）
- Phase 2完了: 2025-11-30（追加4週間）
- Phase 3完了: 2025-12-31（追加4週間）

### チーム
- 開発者: 1名（ShigaRyunosuke10）
- レビュアー: なし（code-reviewerサブエージェント使用）

### セキュリティ
- HTTPS必須
- XSS/CSRF対策実施
- 環境変数での機密情報管理

---

## 5. 非機能要件

### 可用性
- 稼働率: 95%以上（Vercel/AWS SLA範囲内）

### スケーラビリティ
- 初期想定ユーザー数: 10名
- 最大想定ユーザー数: 100名（1年後）

### 保守性
- コードカバレッジ: 70%以上（E2Eテスト）
- ドキュメント整備（docs/ + Serenaメモリ）

---

## 6. 画面遷移図（概要）

```
[ログイン画面]
    ↓
[ダッシュボード] ←→ [カンバンボード]
    ↓
[タスク詳細画面]
    ↓
[設定画面]
```

---

## 7. データモデル（概要）

```
User (ユーザー)
├─ id: UUID
├─ email: string
├─ password_hash: string
└─ created_at: timestamp

Task (タスク)
├─ id: UUID
├─ title: string
├─ description: text
├─ status: enum (TODO/IN_PROGRESS/DONE)
├─ assignee_id: UUID (FK → User)
├─ created_by: UUID (FK → User)
├─ created_at: timestamp
└─ updated_at: timestamp

Comment (コメント)
├─ id: UUID
├─ task_id: UUID (FK → Task)
├─ user_id: UUID (FK → User)
├─ content: text
└─ created_at: timestamp
```

---

## 8. API設計（概要）

```
POST   /api/auth/register       # ユーザー登録
POST   /api/auth/login          # ログイン
GET    /api/tasks               # タスク一覧取得
POST   /api/tasks               # タスク作成
GET    /api/tasks/:id           # タスク詳細取得
PUT    /api/tasks/:id           # タスク更新
DELETE /api/tasks/:id           # タスク削除
POST   /api/tasks/:id/comments  # コメント追加
```

---

## 9. 開発スケジュール（暫定）

| フェーズ | 期間 | 主要タスク |
|---------|------|-----------|
| Phase 1 | 2025-10-09 ~ 2025-11-01 | 認証、タスクCRUD、カンバンボード |
| Phase 2 | 2025-11-02 ~ 2025-11-30 | コメント、リアルタイム更新、通知 |
| Phase 3 | 2025-12-01 ~ 2025-12-31 | レポート、ダッシュボード |
| Phase 4 | 2026-01-01 ~ 2026-01-31 | 拡張機能 |

---

## 10. リスク管理

| リスク | 影響度 | 対策 |
|--------|--------|------|
| Vercel無料プラン制限超過 | 中 | 使用量監視、必要に応じて有料プラン |
| Supabase無料プラン制限超過 | 中 | DB最適化、必要に応じて自前DB |
| リアルタイム更新の実装難度 | 高 | Phase 2でプロトタイプ検証 |
| 単独開発のボトルネック | 中 | code-reviewer/e2e-tester活用 |

---

## 11. 次回打合せ予定

- **日時**: 2025-10-15 14:00
- **議題**: Phase 1詳細設計レビュー、DB設計確定
- **参加者**: ShigaRyunosuke10
```

### ステップ3-2: 初回打合せの実施

**打合せ前の準備**:
1. REQUIREMENTS.mdをレビュー
2. 不明点・要検討事項をリストアップ
3. 技術的な実現可能性を調査

**打合せ後の記録**（`ai-rules/my-webapp/MEETING_LOG.md`）:

```markdown
# 打合せ記録 - タスク管理アプリ

---

## 2025-10-09 - キックオフミーティング

**参加者**: ShigaRyunosuke10
**時間**: 13:00-14:30（90分）
**議題**: 要件確認、技術スタック決定

### 決定事項

1. **技術スタック確定**
   - バックエンド: FastAPI
   - フロントエンド: Next.js (App Router)
   - DB: PostgreSQL (Supabase)
   - ホスティング: Vercel (frontend) + AWS EC2 (backend)

2. **Phase 1優先機能**
   - ユーザー認証（メール＋パスワード）
   - タスクCRUD
   - カンバンボード（3列: TODO/In Progress/Done）
   - 👉 **Phase 1ではコメント機能は実装しない**（Phase 2に延期）

3. **デザイン方針**
   - UIライブラリ: Tailwind CSS + shadcn/ui
   - レスポンシブ対応（モバイルファースト）
   - ダークモード対応（Phase 2以降）

4. **認証方式**
   - JWT認証（アクセストークン + リフレッシュトークン）
   - セッション有効期限: アクセス1時間、リフレッシュ7日
   - パスワードリセット機能はPhase 2

5. **DB設計**
   - 初期は User, Task の2テーブルのみ
   - Comment, Notification は Phase 2で追加

### 議論内容

#### Q1: リアルタイム更新はPhase 1から実装すべきか？
**A**: Phase 1では手動リフレッシュで十分。Phase 2でWebSocket実装。
理由: 開発期間短縮、Phase 1の動作確認を優先。

#### Q2: 認証にOAuth（Google/GitHub）を使うべきか？
**A**: Phase 1ではメール認証のみ。OAuth はPhase 3以降。
理由: 実装複雑度を下げる、個人開発ではメール認証で十分。

#### Q3: タスクの優先度設定は必要か？
**A**: Phase 1では実装しない。Phase 3で「拡張機能」として検討。
理由: カンバンボードの列順序で優先度を表現可能。

### 次回アクション

- [ ] **Phase 1詳細設計** (担当: ShigaRyunosuke10、期限: 2025-10-12)
  - DB設計図（ER図作成）
  - API設計書（エンドポイント一覧）
  - 画面遷移図（ワイヤーフレーム）

- [ ] **環境構築完了** (担当: ShigaRyunosuke10、期限: 2025-10-11)
  - Docker環境構築
  - Supabase設定
  - GitHub Actions CI/CD設定

- [ ] **Phase 1着手** (担当: ShigaRyunosuke10、開始: 2025-10-13)

### 次回打合せ

- **日時**: 2025-10-15 14:00
- **議題**: Phase 1詳細設計レビュー
- **準備事項**: ER図、API設計書、ワイヤーフレームを事前共有

---

## 2025-10-15 - Phase 1詳細設計レビュー（予定）

（打合せ後に記入）
```

---

## 4. 環境構築

### ステップ4-1: 環境変数の設定

#### バックエンド（`backend/.env`）

```bash
# backend/.env.exampleをコピー
cp backend/.env.example backend/.env

# .envファイルを編集
code backend/.env
```

**内容**:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/my_webapp_db

# JWT
SECRET_KEY=your-secret-key-here-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://my-webapp.vercel.app

# Supabase（使用する場合）
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# AWS S3（使用する場合）
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=my-webapp-files
```

**⚠️ セキュリティ注意**:
- `SECRET_KEY`は必ず変更（`openssl rand -hex 32` で生成推奨）
- `.env`ファイルは`.gitignore`に含まれているか確認
- 本番環境ではホスティングサービスの環境変数機能を使用

#### フロントエンド（`frontend/.env`）

```bash
# frontend/.env.exampleをコピー
cp frontend/.env.example frontend/.env.local

# .env.localファイルを編集
code frontend/.env.local
```

**内容**:
```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# 本番環境（Vercelデプロイ時）
# NEXT_PUBLIC_API_URL=https://api.my-webapp.com

# Supabase（使用する場合）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### ステップ4-2: API Keyの設定

`.mcp.json` を編集：

```bash
code .mcp.json
```

**内容**:
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upwind/context7"],
      "env": {
        "CONTEXT7_API_KEY": "c7k_xxxxxxxxxxxxxxxxxxxxx"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@upwind/mcp-server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_xxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

**API Key取得方法**:
- **Context7**: [context7.com](https://context7.com) でアカウント作成 → Settings → API Keys
- **GitHub**: GitHub Settings → Developer settings → Personal access tokens → Generate new token
  - 必要なスコープ: `repo`, `read:user`, `read:org`

### ステップ4-3: Docker環境起動

```bash
# Docker Composeで全サービス起動
docker-compose up -d

# ログ確認
docker-compose logs -f

# 起動確認
docker-compose ps
```

**期待される出力**:
```
NAME                  STATUS              PORTS
my-webapp-backend     Up 10 seconds       0.0.0.0:8000->8000/tcp
my-webapp-frontend    Up 10 seconds       0.0.0.0:3000->3000/tcp
my-webapp-db          Up 10 seconds       0.0.0.0:5432->5432/tcp
```

### ステップ4-4: データベース初期化

```bash
# バックエンドコンテナに接続
docker-compose exec backend bash

# マイグレーション実行（FastAPIの場合）
alembic upgrade head

# 初期データ投入（オプション）
python scripts/seed_data.py

# 確認
python scripts/check_db.py
```

### ステップ4-5: 動作確認

#### バックエンド

```bash
# ヘルスチェック
curl http://localhost:8000/health

# 期待される出力
{"status":"ok","version":"0.1.0"}
```

#### フロントエンド

ブラウザで `http://localhost:3000` にアクセス → 初期画面が表示されることを確認

---

## 5. 開発フロー

### ステップ5-1: Gitリポジトリ初期化

```bash
# リポジトリ初期化
git init

# 全ファイル追加
git add .

# 初回コミット
git commit -m "chore: initial commit from template

- Setup FastAPI backend
- Setup Next.js frontend
- Configure Docker environment
- Add ai-rules and Serena memories"

# GitHubリポジトリ作成（事前にGitHub上で作成）
git remote add origin git@github.com:ShigaRyunosuke10/my-webapp.git

# プッシュ
git push -u origin main
```

### ステップ5-2: Claude Codeでの開発開始

```bash
# Claude Code起動
claude
```

**初回プロンプト**:
```
プロジェクトを進めよう。

まず ai-rules/my-webapp/REQUIREMENTS.md を確認し、
Phase 1の実装計画を立ててください。
```

**Claudeが実施すること**:
1. Serenaメモリ読み込み（`mcp__serena__activate_project`）
2. REQUIREMENTS.md確認
3. Phase 1タスク分解
4. 実装優先順位の提案

### ステップ5-3: Phase 1実装フロー

#### 1. ブランチ作成

```bash
git checkout -b feat-user-authentication
```

#### 2. 実装

**Claudeプロンプト例**:
```
Phase 1: ユーザー認証機能を実装してください。

要件:
- JWT認証（アクセストークン + リフレッシュトークン）
- /api/auth/register エンドポイント
- /api/auth/login エンドポイント
- パスワードハッシュ化（bcrypt）
```

#### 3. E2Eテスト（コミット前必須）

**Claudeプロンプト**:
```
e2e-testerサブエージェントでユーザー認証機能をテストしてください。

テストシナリオ:
1. 新規ユーザー登録
2. ログイン成功
3. 無効なパスワードでログイン失敗
```

#### 4. コミット

```bash
git add .
git commit -m "feat: add user authentication with JWT

- Implement /api/auth/register endpoint
- Implement /api/auth/login endpoint
- Add password hashing with bcrypt
- Add JWT token generation
- E2E tests passed

Issue: #1"
```

#### 5. プッシュ・PR作成

```bash
git push origin feat-user-authentication

# PRを作成（Claudeが実行）
```

**Claudeプロンプト**:
```
feat-user-authenticationブランチでPRを作成してください。

タイトル: feat: ユーザー認証機能実装
説明: Phase 1 - JWT認証によるユーザー登録・ログイン機能
```

#### 6. コードレビュー（PR作成後必須）

**Claudeプロンプト**:
```
code-reviewerサブエージェントで最新のPRをレビューしてください。
```

**レビュー結果が返ってくる**:
```
## レビュー結果

### ✅ Good Points
- JWT実装が適切
- パスワードハッシュ化実施済み
- E2Eテスト完備

### ⚠️ Minor Issues
1. SECRET_KEYがハードコードされている（backend/app/core/security.py:12）
   - 推奨: 環境変数から読み込み
   - 優先度: Minor

2. エラーハンドリングが不十分（backend/app/api/auth.py:45）
   - 推奨: try-exceptでDB例外をキャッチ
   - 優先度: Major

### 総評
**マージ可否**: 要修正（Major 1件）
**推定修正時間**: 15分
```

#### 7. 修正対応（code-reviewer指摘事項）

**原則**: **その場で即修正**（Issueを溜めない）

**Claudeプロンプト**:
```
code-reviewerの指摘事項を修正してください。

優先対応:
1. SECRET_KEYを環境変数化（Minor）
2. DB例外のエラーハンドリング追加（Major）
```

修正後:
```bash
git add .
git commit -m "fix: address code-reviewer feedback

- Move SECRET_KEY to environment variable
- Add error handling for database exceptions"

git push origin feat-user-authentication
```

#### 8. 再レビュー・マージ

**Claudeプロンプト**:
```
修正完了したので、code-reviewerで再レビューし、問題なければマージしてください。
```

```bash
# Claudeがマージを実行
git checkout main
git pull
```

#### 9. ドキュメント更新（マージ後必須）

**Claudeプロンプト**:
```
docs-updaterサブエージェントで最新のPRマージ内容をドキュメントに反映してください。
```

**docs-updaterが実施すること**:
1. Serenaメモリ更新:
   - `current_issues_and_priorities.md` - Phase 1認証機能完了をマーク
   - `implementation_status.md` - 完了機能に追加
   - `api_specifications.md` - /api/auth/* エンドポイント追加
2. docs/更新（仕様確定時のみ）:
   - `docs/API.md` - 認証エンドポイント追加
   - `docs/SETUP.md` - SECRET_KEY環境変数追加

### ステップ5-4: 定期打合せ

**推奨頻度**: 週1-2回

**打合せ内容**:
- 前回からの進捗確認
- 課題・ブロッカーの共有
- 次週の作業計画
- 仕様変更・追加要件の検討

**打合せ後**: `ai-rules/my-webapp/MEETING_LOG.md` に記録

---

## 6. デプロイ設定

### ステップ6-1: Vercel（フロントエンド）

#### 初回デプロイ

```bash
# Vercel CLIインストール
npm install -g vercel

# Vercelログイン
vercel login

# デプロイ
cd frontend
vercel

# プロンプトに従って回答
? Set up and deploy "~/my-webapp/frontend"? [Y/n] Y
? Which scope do you want to deploy to? ShigaRyunosuke10
? Link to existing project? [y/N] N
? What's your project's name? my-webapp-frontend
? In which directory is your code located? ./
? Want to modify these settings? [y/N] N
```

#### 環境変数設定

```bash
# Vercelダッシュボードで設定
# https://vercel.com/your-username/my-webapp-frontend/settings/environment-variables

# または、CLIで設定
vercel env add NEXT_PUBLIC_API_URL production
> https://api.my-webapp.com
```

#### 自動デプロイ設定

生成された `deployment/vercel/vercel.json` を確認：

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_API_URL": "@next-public-api-url"
  }
}
```

GitHub連携で `main` ブランチへのpush時に自動デプロイ。

### ステップ6-2: AWS EC2（バックエンド）

#### EC2インスタンス起動

```bash
# AWS CLIインストール済みの場合
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --count 1 \
  --instance-type t3.micro \
  --key-name my-webapp-key \
  --security-group-ids sg-xxxxx \
  --subnet-id subnet-xxxxx
```

または、AWSマネジメントコンソールで手動作成。

#### Dockerデプロイ

生成された `deployment/aws/deploy.sh` を使用：

```bash
# deploy.shを実行
chmod +x deployment/aws/deploy.sh
./deployment/aws/deploy.sh

# スクリプト内容（概要）:
# 1. EC2にSSH接続
# 2. Dockerイメージをpull
# 3. コンテナ再起動
# 4. ヘルスチェック
```

**手動デプロイ手順**:

```bash
# EC2にSSH接続
ssh -i my-webapp-key.pem ec2-user@ec2-xx-xx-xx-xx.compute.amazonaws.com

# Dockerインストール（初回のみ）
sudo yum update -y
sudo yum install -y docker
sudo service docker start

# リポジトリクローン
git clone git@github.com:ShigaRyunosuke10/my-webapp.git
cd my-webapp

# 環境変数設定
cp backend/.env.example backend/.env
nano backend/.env  # 本番用の値を設定

# Docker Composeでバックエンド起動
docker-compose up -d backend

# ログ確認
docker-compose logs -f backend
```

#### ドメイン設定

```bash
# Elastic IPを割り当て
aws ec2 allocate-address --domain vpc

# Route 53でDNS設定
# api.my-webapp.com → Elastic IP
```

### ステップ6-3: CI/CDパイプライン（GitHub Actions）

生成された `.github/workflows/deploy.yml` を確認：

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to AWS
        run: ./deployment/aws/deploy.sh
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

**GitHub Secretsに設定**:
- `VERCEL_TOKEN`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

---

## 7. トラブルシューティング

### Q1: `docker-compose up` でポート競合エラー

**エラー**:
```
Error: Bind for 0.0.0.0:3000 failed: port is already allocated
```

**解決策**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /F /PID <PID>

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Q2: `.mcp.json` のAPI keyが認識されない

**症状**: Claude Code起動時に「MCPサーバー接続エラー」

**解決策**:
1. `.mcp.json` のAPI keyが正しいか確認
2. Claude Codeを再起動
3. `~/.config/claude-code/logs/` でエラーログ確認

### Q3: Serenaメモリが読み込まれない

**症状**: `mcp__serena__activate_project` がエラー

**解決策**:
```bash
# .serena/config.toml が存在するか確認
ls .serena/config.toml

# 存在しない場合、作成
echo '[project]
name = "my-webapp"' > .serena/config.toml
```

### Q4: E2Eテストでブラウザが起動しない

**症状**: `e2e-tester` 実行時に「Playwright not installed」エラー

**解決策**:
```bash
# Playwrightブラウザインストール
npx playwright install chromium
```

### Q5: Vercelデプロイで環境変数が反映されない

**症状**: フロントエンドから「API接続エラー」

**解決策**:
1. Vercelダッシュボード → Settings → Environment Variables
2. `NEXT_PUBLIC_API_URL` を確認・追加
3. 再デプロイ: `vercel --prod`

### Q6: AWS EC2でDockerが起動しない

**症状**: `docker-compose up` で「permission denied」

**解決策**:
```bash
# ユーザーをdockerグループに追加
sudo usermod -aG docker ec2-user

# ログアウト・ログイン
exit
ssh -i my-webapp-key.pem ec2-user@ec2-xx-xx-xx-xx.compute.amazonaws.com

# Docker起動確認
docker ps
```

---

## 📞 サポート

詳細な問題は Issue を作成してください：
https://github.com/YourUsername/project-template/issues

---

**最終更新**: 2025-10-09
