# Claude Code プロジェクトテンプレート

**バージョン**: 1.0
**最終更新**: 2025-10-09

## 📋 概要

このリポジトリは、Claude Codeを使った新規プロジェクト開発を効率化するためのテンプレートシステムです。

### 🎯 目的

1. **開発環境の標準化**: ai-rules、MCPサーバー、サブエージェント設定を統一
2. **迅速なプロジェクト立ち上げ**: 対話形式の初期化スクリプトで5-10分でセットアップ完了
3. **技術スタックの柔軟性**: FastAPI/Django/Express × Next.js/React/Vue.js の組み合わせに対応
4. **要件定義フローの標準化**: 初回打合せ→要件定義→仕様確定の流れを組み込み
5. **段階的な複雑度対応**: Serena 3段階設定（Tier 1: 3ファイル / Tier 2: 6ファイル / Tier 3: 7+ファイル）

---

## 🏗️ ディレクトリ構造

```
project-template/
├── README.md                        # 本ファイル（テンプレート使用ガイド）
├── USAGE_GUIDE.md                   # 詳細手順書
├── init_project.py                  # 対話型初期化スクリプト
│
├── template/                        # テンプレートファイル群
│   ├── CLAUDE.md.template           # Claude Code設定（変数化済み）
│   ├── README.md.template           # プロジェクト用README
│   ├── .gitignore                   # Git除外設定（共通）
│   ├── .mcp.json.template           # MCPサーバー設定
│   ├── docker-compose.yml.template  # Docker構成
│   │
│   ├── .claude/                     # Claude Code設定
│   │   ├── settings.json.template   # 基本設定（技術スタック別）
│   │   ├── settings.local.json.template  # ローカル設定
│   │   └── agents/                  # サブエージェント設定
│   │       ├── code-reviewer.md.template
│   │       ├── e2e-tester.md.template
│   │       └── docs-updater.md.template
│   │
│   ├── ai-rules/                    # AI動作ルール
│   │   ├── common/                  # 横断共通ルール（コピー用）
│   │   │   ├── COMMIT_GUIDELINES.md
│   │   │   ├── WORKFLOW.md
│   │   │   ├── PHASE_MANAGEMENT.md
│   │   │   ├── SESSION_MANAGEMENT.md
│   │   │   ├── SETTINGS_JSON_GUIDE.md
│   │   │   ├── DOCUMENT_CLEANUP.md
│   │   │   ├── DOCUMENT_CONSISTENCY.md
│   │   │   ├── NAMING_CONVENTIONS.md
│   │   │   ├── DOCUMENTATION_GUIDE.md
│   │   │   ├── ISSUE_GUIDELINES.md
│   │   │   └── PR_PROCESS.md
│   │   │
│   │   └── _project_template/      # プロジェクト固有テンプレート
│   │       ├── WORKFLOW.md.template
│   │       ├── TESTING.md.template
│   │       ├── SETUP_AND_MCP.md.template
│   │       ├── DOCUMENTATION_GUIDE.md.template
│   │       ├── ISSUE_GUIDELINES.md.template
│   │       ├── PR_AND_REVIEW.md.template
│   │       ├── REQUIREMENTS.md.template      # 要件定義用
│   │       ├── MEETING_LOG.md.template       # 打合せ記録用
│   │       └── DEPLOYMENT.md.template        # デプロイ手順用
│   │
│   ├── docs/                        # ユーザー向けドキュメント
│   │   ├── README.md.template
│   │   ├── SETUP.md.template
│   │   ├── API.md.template
│   │   ├── DATABASE.md.template
│   │   └── DEPLOYMENT.md.template   # ホスティング先別手順
│   │
│   ├── .serena/                     # Serenaメモリ初期テンプレート
│   │   └── memories/
│   │       ├── tier1/               # Tier 1: 3ファイル（小規模）
│   │       │   ├── project_overview.md.template
│   │       │   ├── current_issues_and_priorities.md.template
│   │       │   └── implementation_status.md.template
│   │       ├── tier2/               # Tier 2: 6ファイル（中規模）
│   │       │   └── (Tier 1 + 3ファイル追加)
│   │       └── tier3/               # Tier 3: 7+ファイル（大規模）
│   │           └── (Tier 2 + プロジェクト固有)
│   │
│   ├── backend/                     # バックエンドスケルトン
│   │   └── skeleton/
│   │       ├── fastapi/             # FastAPI用
│   │       │   ├── Dockerfile
│   │       │   ├── requirements.txt
│   │       │   ├── .env.example
│   │       │   └── app/
│   │       │       └── main.py
│   │       ├── django/              # Django用
│   │       │   ├── Dockerfile
│   │       │   ├── requirements.txt
│   │       │   └── .env.example
│   │       └── express/             # Express用
│   │           ├── Dockerfile
│   │           ├── package.json
│   │           └── .env.example
│   │
│   ├── frontend/                    # フロントエンドスケルトン
│   │   └── skeleton/
│   │       ├── nextjs/              # Next.js用
│   │       │   ├── Dockerfile
│   │       │   ├── package.json
│   │       │   ├── .env.example
│   │       │   └── app/
│   │       │       └── page.tsx
│   │       ├── react/               # React用
│   │       │   ├── Dockerfile
│   │       │   ├── package.json
│   │       │   └── .env.example
│   │       └── vue/                 # Vue.js用
│   │           ├── Dockerfile
│   │           ├── package.json
│   │           └── .env.example
│   │
│   └── deployment/                  # ホスティング先別設定
│       ├── vercel/
│       │   └── vercel.json.template
│       ├── netlify/
│       │   └── netlify.toml.template
│       ├── aws/
│       │   ├── buildspec.yml.template
│       │   └── deploy.sh.template
│       └── docker-deploy/
│           └── deploy-docker.sh.template
│
└── examples/                        # サンプルプロジェクト（参考用）
    └── minimal-fastapi-nextjs/
```

---

## 🚀 クイックスタート

### ステップ1: テンプレートリポジトリのクローン

```bash
cd /path/to/your/workspace
git clone <このリポジトリのURL> project-template
cd project-template
```

### ステップ2: 初期化スクリプトの実行

```bash
python init_project.py
```

**対話形式で以下を入力**：

1. **プロジェクト基本情報**
   - プロジェクト名（例: `my-webapp`）
   - 表示名（例: `My Web Application`）
   - プロジェクト説明
   - GitHub Owner名（例: `YourUsername`）

2. **技術スタック選択**
   - バックエンド: FastAPI / Django / Express
   - フロントエンド: Next.js / React / Vue.js
   - データベース: PostgreSQL / MySQL / SQLite / その他

3. **ホスティング先選択**（NEW）
   - フロントエンド: Vercel / Netlify / AWS / 自前サーバー / 未定
   - バックエンド: AWS / GCP / Heroku / 自前サーバー / 未定
   - ※ 未定の場合、後で `DEPLOYMENT.md` で設定可能

4. **ポート設定**
   - フロントエンド（デフォルト: 3000）
   - バックエンド（デフォルト: 8000）

5. **Serenaメモリ複雑度**
   - Tier 1: 小規模（3ファイル）
   - Tier 2: 中規模（6ファイル）
   - Tier 3: 大規模（7+ファイル、プロジェクト固有追加可）

6. **テストユーザー設定**
   - メールアドレス（例: `qa+test@example.com`）
   - パスワード（例: `TestPass!123`）

7. **MCPサーバー選択**
   - context7, github, serena（必須）
   - playwright, desktop-commander, codex（推奨）
   - supabase（DB次第）

### ステップ3: 生成されたプロジェクトの確認

```bash
cd ../my-webapp  # 生成されたプロジェクトディレクトリ
ls -la
```

**生成されるファイル**：
- `CLAUDE.md` - Claude Code設定（変数置換済み）
- `.mcp.json` - MCPサーバー設定（API key は手動設定）
- `.claude/settings.json` - 技術スタック別コマンド設定済み
- `docker-compose.yml` - 選択した技術スタックに対応
- `backend/` - 選択したスケルトンファイル
- `frontend/` - 選択したスケルトンファイル
- `.serena/memories/` - Tier別初期メモリファイル
- `ai-rules/` - 共通ルール + プロジェクト固有テンプレート
- `docs/` - 初期ドキュメント
- `ai-rules/{project_name}/REQUIREMENTS.md` - 要件定義用
- `ai-rules/{project_name}/MEETING_LOG.md` - 打合せ記録用
- `deployment/` - 選択したホスティング先の設定

### ステップ4: 環境変数の設定

```bash
# バックエンド
cp backend/.env.example backend/.env
# .envファイルを編集して実際の値を設定

# フロントエンド
cp frontend/.env.example frontend/.env
# .envファイルを編集して実際の値を設定
```

### ステップ5: API Keyの設定

**`.mcp.json`** を編集：
```json
{
  "mcpServers": {
    "context7": {
      "env": {
        "CONTEXT7_API_KEY": "YOUR_ACTUAL_API_KEY"
      }
    },
    "github": {
      "env": {
        "GITHUB_TOKEN": "YOUR_GITHUB_TOKEN"
      }
    }
  }
}
```

### ステップ6: 要件定義の実施

生成された `ai-rules/{project_name}/REQUIREMENTS.md` に要件を記入：

```markdown
# 要件定義

## 1. プロジェクト背景・目的
[なぜこのプロジェクトが必要か]

## 2. 主要機能
- [ ] 機能A: [詳細]
- [ ] 機能B: [詳細]

## 3. 技術要件
- 認証: [方法]
- データ永続化: [方法]
- ホスティング: [Vercel/AWS/etc]

## 4. 制約・前提条件
- 予算: [金額]
- 期限: [日付]
- チーム: [人数・役割]
```

### ステップ7: 初回打合せ後の記録

`ai-rules/{project_name}/MEETING_LOG.md` に打合せ内容を記録：

```markdown
# 打合せ記録

## 2025-10-09 - キックオフミーティング
**参加者**: [名前]
**議題**: 要件確認

### 決定事項
- 機能Aの優先実装
- APIはREST形式

### 次回アクション
- [ ] ワイヤーフレーム作成（担当: XX）
- [ ] DB設計案（担当: YY）
```

### ステップ8: Claude Codeで開発開始

```bash
# リポジトリ初期化
git init
git add .
git commit -m "Initial commit from template"

# リモートリポジトリ追加（事前に作成）
git remote add origin git@github.com:YourUsername/my-webapp.git
git push -u origin main

# Claude Codeを起動
claude
```

**初回プロンプト**：
```
プロジェクトを進めよう。

まず ai-rules/{project_name}/REQUIREMENTS.md を確認し、
Phase 1の実装計画を立ててください。
```

---

## 📊 テンプレート変数一覧

初期化スクリプトで以下の変数が置換されます：

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `{{PROJECT_NAME}}` | プロジェクト名（英数字） | `my-webapp` |
| `{{PROJECT_DISPLAY_NAME}}` | プロジェクト表示名 | `My Web Application` |
| `{{PROJECT_DESCRIPTION}}` | プロジェクト説明 | `A web app for managing tasks` |
| `{{GITHUB_OWNER}}` | GitHub Owner | `YourUsername` |
| `{{PORT_FRONTEND}}` | フロントエンドポート | `3000` |
| `{{PORT_BACKEND}}` | バックエンドポート | `8000` |
| `{{BACKEND_TECH}}` | バックエンド技術 | `fastapi` / `django` / `express` |
| `{{FRONTEND_TECH}}` | フロントエンド技術 | `nextjs` / `react` / `vue` |
| `{{DATABASE_TYPE}}` | データベース種類 | `postgresql` / `mysql` / `sqlite` |
| `{{TEST_USER_EMAIL}}` | テストユーザーメール | `qa+test@example.com` |
| `{{TEST_USER_PASSWORD}}` | テストユーザーパスワード | `TestPass!123` |
| `{{SERENA_TIER}}` | Serenaメモリ複雑度 | `tier1` / `tier2` / `tier3` |
| `{{HOSTING_FRONTEND}}` | フロントエンドホスティング | `vercel` / `netlify` / `aws` / `self` / `tbd` |
| `{{HOSTING_BACKEND}}` | バックエンドホスティング | `aws` / `gcp` / `heroku` / `self` / `tbd` |
| `{{USE_SUPABASE}}` | Supabase使用有無 | `true` / `false` |
| `{{CONTEXT7_API_KEY}}` | Context7 API Key | `(手動設定)` |
| `{{GITHUB_TOKEN}}` | GitHub Token | `(手動設定)` |
| `{{SUPABASE_PROJECT_REF}}` | Supabase Project Ref | `(手動設定)` |

---

## 🎯 技術スタック対応表

### バックエンド

| 技術 | Dockerfile | 初期ファイル | 備考 |
|------|-----------|------------|------|
| **FastAPI** | ✅ | `main.py`, `requirements.txt` | Python 3.11+ |
| **Django** | ✅ | `manage.py`, `requirements.txt` | Python 3.11+ |
| **Express** | ✅ | `index.js`, `package.json` | Node.js 20+ |

### フロントエンド

| 技術 | Dockerfile | 初期ファイル | 備考 |
|------|-----------|------------|------|
| **Next.js** | ✅ | `page.tsx`, `package.json` | App Router対応 |
| **React** | ✅ | `App.tsx`, `package.json` | Vite使用 |
| **Vue.js** | ✅ | `App.vue`, `package.json` | Vue 3 Composition API |

### データベース

| 種類 | Docker対応 | ORM推奨 | 備考 |
|------|-----------|---------|------|
| **PostgreSQL** | ✅ | SQLAlchemy / Prisma | 推奨（本番向き） |
| **MySQL** | ✅ | SQLAlchemy / Prisma | 互換性高い |
| **SQLite** | ✅（不要） | SQLAlchemy | 開発用途 |

### ホスティング

| サービス | フロントエンド | バックエンド | 設定ファイル |
|---------|-------------|------------|------------|
| **Vercel** | ✅ | △（Serverless Functions） | `vercel.json` |
| **Netlify** | ✅ | △（Netlify Functions） | `netlify.toml` |
| **AWS** | ✅（S3 + CloudFront） | ✅（EC2/ECS/Lambda） | `buildspec.yml`, CDK |
| **GCP** | ✅（Cloud Storage） | ✅（Cloud Run/GCE） | `app.yaml` |
| **Heroku** | △ | ✅ | `Procfile` |
| **自前サーバー** | ✅（Docker） | ✅（Docker） | `docker-compose.yml` |

---

## 📖 Serena 3段階設定

### Tier 1: 小規模プロジェクト（3ファイル）

**対象**: 個人プロジェクト、PoC、1-2週間開発

**ファイル**:
1. `project_overview.md` - プロジェクト概要・技術スタック
2. `current_issues_and_priorities.md` - 現在のタスク・優先度
3. `implementation_status.md` - 実装進捗・完了機能

### Tier 2: 中規模プロジェクト（6ファイル）

**対象**: チーム開発、1-3ヶ月開発

**ファイル** (Tier 1 + 以下):
4. `database_specifications.md` - DB詳細仕様
5. `api_specifications.md` - API詳細仕様
6. `system_architecture.md` - システムアーキテクチャ

### Tier 3: 大規模プロジェクト（7+ファイル）

**対象**: 複雑なシステム、長期開発

**ファイル** (Tier 2 + 以下):
7. `phase_progress.md` - フェーズ進捗管理
8. `{custom}_specifications.md` - プロジェクト固有仕様（例: 決済システム、権限管理）

---

## 🔄 ワークフロー

### 基本フロー

```
1. 要件定義（REQUIREMENTS.md）
   ↓
2. 初回打合せ（MEETING_LOG.md記録）
   ↓
3. Phase 1開始
   ├─ ブランチ作成（feat-xxx）
   ├─ 実装
   ├─ e2e-tester実行（コミット前）
   ├─ コミット
   ├─ PR作成
   ├─ code-reviewer実行
   ├─ マージ
   └─ docs-updater実行（必須）
   ↓
4. 定期打合せ（週1-2回推奨）
   ↓
5. Phase 2以降も同様
```

詳細は生成されたプロジェクトの `ai-rules/common/WORKFLOW.md` を参照。

---

## ⚙️ settings.json カスタマイズ

生成された `.claude/settings.json` は技術スタック別に最適化されています：

### FastAPI + Next.js の場合

```json
{
  "permissions": {
    "allow": [
      "Bash:npm run build*",
      "Bash:npm run dev*",
      "Bash:pip install*",
      "Bash:python*",
      "Bash:docker-compose up*"
    ]
  }
}
```

### Django + React の場合

```json
{
  "permissions": {
    "allow": [
      "Bash:npm run build*",
      "Bash:python manage.py*",
      "Bash:pip install*"
    ]
  }
}
```

---

## 🧪 サブエージェント

すべてのプロジェクトで以下の3つのサブエージェントが利用可能です：

1. **code-reviewer** - PR作成後の必須レビュー
2. **e2e-tester** - コミット前の動作確認
3. **docs-updater** - マージ後のドキュメント自動更新

設定は `.claude/agents/` 内の各ファイルで定義されています。

---

## 📚 関連ドキュメント

- [USAGE_GUIDE.md](./USAGE_GUIDE.md) - 詳細な使用手順
- [template/ai-rules/common/](./template/ai-rules/common/) - 汎用ルール集
- [examples/](./examples/) - サンプルプロジェクト

---

## 🛠️ トラブルシューティング

### Q1: init_project.py が動かない

**A**: Python 3.8+ が必要です。

```bash
python --version  # 3.8以上か確認
pip install -r requirements.txt  # 依存関係インストール
```

### Q2: Docker起動時にポート競合

**A**: 既存プロセスをkill、または `docker-compose.yml` のポートを変更。

```bash
# Windowsの場合
netstat -ano | findstr :3000
taskkill /F /PID <PID>

# Mac/Linuxの場合
lsof -ti:3000 | xargs kill -9
```

### Q3: MCPサーバーが認識されない

**A**: `.mcp.json` のAPI keyを設定してください。

```bash
# .mcp.jsonを編集
code .mcp.json
```

### Q4: ホスティング先を後で変更したい

**A**: 以下の手順で変更可能です：

1. `docs/DEPLOYMENT.md` を編集
2. `deployment/` 内の別ディレクトリから設定ファイルをコピー
3. `ai-rules/{project_name}/DEPLOYMENT.md.template` を更新

---

## 🤝 コントリビューション

テンプレートの改善提案は Issue または Pull Request でお願いします。

---

## 📝 ライセンス

MIT License

---

## 📞 サポート

質問・問題がある場合は Issue を作成してください。
