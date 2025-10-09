# 次セッション作業指示

**⚠️ 重要**: このファイルはテンプレート作成プロジェクトの作業指示用です。
**テンプレートファイルではありません。すべての作業完了後、このファイルを削除してください。**

**作成日**: 2025-10-09
**プロジェクト**: Claude Code プロジェクトテンプレート

---

## ✅ 完了済み作業

### 1. ドキュメント作成（完了）
- ✅ README.md - テンプレートリポジトリの概要
- ✅ USAGE_GUIDE.md - 詳細な使い方ガイド
- ✅ reference/README.md.template - リファレンスフォルダの説明

### 2. 初期化スクリプト（完了・拡張済み）
- ✅ init_project.py - 基本実装完了
- ✅ Docker設定用の変数生成追加（DATABASE_IMAGE、DATABASE_URL、BACKEND_COMMAND、FRONTEND_COMMAND等）
- ✅ データベース認証情報収集機能追加（collect_database_credentials）
- ✅ OAuth環境変数生成追加（OAUTH_ENV_VARS、OAUTH_INFO等）
- ✅ 日付・JWT_SECRET自動生成追加

### 3. 要件定義システム（完了）
- ✅ REQUIREMENTS_PROMPT.md.template - 11ステップ対話フロー（Step 0: リファレンス資料確認を含む）
- ✅ REQUIREMENTS_ASSISTANT.md.template - AIベストプラクティス

### 4. 基本テンプレートファイル（完了）
- ✅ CLAUDE.md.template - Claude Code メイン設定
- ✅ README.md.template - プロジェクトREADME
- ✅ .gitignore - Git除外設定
- ✅ docker-compose.yml.template - Docker設定（変数置換対応）
- ✅ .mcp.json.template - MCP設定

---

## 🚧 残タスク（優先度順）

### 【最優先】サブエージェント設定テンプレート

**必要ファイル**:
```
template/.claude/agents/
├── code-reviewer.md.template
├── e2e-tester.md.template
└── docs-updater.md.template
```

**参考**: `C:\Users\shiga\Desktop\Dev\nisseisp\.claude\agents\*.md`

**内容**:
- code-reviewer: PR作成後のコードレビュー専門家
- e2e-tester: コミット前の動作確認専門家（TEST_USER_EMAIL、TEST_USER_PASSWORD変数使用）
- docs-updater: マージ後のドキュメント更新専門家

---

### 【優先度高】Serenaメモリ初期テンプレート

**必要ディレクトリ**:
```
template/.serena/memories/
├── tier1/
│   ├── project_overview.md.template
│   ├── current_issues_and_priorities.md.template
│   └── implementation_status.md.template
├── tier2/
│   ├── project_overview.md.template
│   ├── current_issues_and_priorities.md.template
│   ├── implementation_status.md.template
│   ├── database_specifications.md.template
│   ├── api_specifications.md.template
│   └── system_architecture.md.template
└── tier3/
    ├── （tier2のすべて）
    └── phase_progress.md.template
```

**参考**: `C:\Users\shiga\Desktop\Dev\nisseisp\.serena\memories\*.md`

**変数置換**:
- {{PROJECT_NAME}}, {{PROJECT_DISPLAY_NAME}}, {{PROJECT_DESCRIPTION}}
- {{BACKEND_TECH}}, {{FRONTEND_TECH}}, {{DATABASE_TYPE}}
- {{CURRENT_DATE}}

---

### 【優先度高】技術スタック別スケルトンファイル

**必要ディレクトリ**:
```
template/backend/skeleton/
├── fastapi/
│   ├── app/
│   │   ├── main.py.template
│   │   ├── models/
│   │   ├── routers/
│   │   └── utils/
│   ├── tests/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example.template
├── django/
│   └── （Django構造）
└── express/
    └── （Express構造）

template/frontend/skeleton/
├── nextjs/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── public/
│   ├── Dockerfile
│   ├── package.json.template
│   └── .env.example.template
├── react/
│   └── （React構造）
└── vue/
    └── （Vue.js構造）
```

**スケルトン内容**:
- 基本的なプロジェクト構造
- Hello World レベルの動作確認用コード
- 必要な依存関係（package.json/requirements.txt）
- Dockerfile（Docker動作確認用）
- .env.example.template（環境変数テンプレート）

---

### 【優先度中】deployment/ 設定ファイル

**必要ディレクトリ**:
```
template/deployment/
├── vercel/
│   └── README.md.template
├── netlify/
│   └── README.md.template
├── aws/
│   └── README.md.template
├── gcp/
│   └── README.md.template
├── heroku/
│   └── README.md.template
└── docker-deploy/
    └── README.md.template
```

**内容**: 各ホスティングサービスへのデプロイ手順

---

### 【優先度中】docs/ テンプレート

**必要ファイル**:
```
template/docs/
├── README.md.template（プロジェクト概要）
├── SETUP.md.template（環境構築手順）
├── API.md.template（API仕様）
└── DATABASE.md.template（DB設計）
```

**参考**: `C:\Users\shiga\Desktop\Dev\nisseisp\docs\*.md`

---

### 【優先度中】ai-rules/common ディレクトリ

**必要ファイル**:
```
template/ai-rules/common/
├── WORKFLOW.md
├── COMMIT_GUIDELINES.md
├── NAMING_CONVENTIONS.md
├── SETTINGS_JSON_GUIDE.md
├── PHASE_MANAGEMENT.md
└── SESSION_MANAGEMENT.md
```

**参考**: `C:\Users\shiga\Desktop\Dev\nisseisp\ai-rules\common\*.md`

**注意**: これらはプロジェクト共通ルールなので、変数置換不要

---

### 【優先度低】.env.example テンプレート

**必要ファイル**:
```
template/backend/.env.example.template
template/frontend/.env.example.template
```

**内容**:
- バックエンド: DATABASE_URL、JWT_SECRET、OAUTH設定
- フロントエンド: NEXT_PUBLIC_API_URL、OAUTH設定

---

### 【最終】動作確認・テスト

1. **init_project.py の実行テスト**:
   ```bash
   python init_project.py
   ```
   - 対話フローが正常に動作するか
   - すべてのファイルが適切に生成されるか
   - 変数置換が正しく行われているか

2. **生成されたプロジェクトのDocker起動テスト**:
   ```bash
   cd ../test-project
   docker-compose up -d
   ```
   - Docker設定が正しいか
   - フロントエンド・バックエンドが起動するか

3. **Claude Codeでの読み込みテスト**:
   - CLAUDE.mdが正しく読み込まれるか
   - .mcp.jsonが正しく認識されるか
   - Serenaメモリが正しく読み込まれるか

---

## 📝 作業開始時の手順

### ⚠️ 最重要: フォルダの開き方

**Claude Codeで開くフォルダ**:
```
C:\Users\shiga\Desktop\Dev\project-template
```

**設定済み**:
- `.claude/settings.json` に `additionalWorkingDirectories` で `nisseisp` を指定済み
- `nisseisp` のファイルも参照可能だが、他のプロジェクトは見えない

**確認方法**:
```bash
pwd
# → C:\Users\shiga\Desktop\Dev\project-template

# nisseisp のファイルも読み込める
ls ../nisseisp/.serena/memories/
```

### 作業フロー

1. **このファイル（next_session_prompt.md）を確認**（今ここ）
2. **次の優先タスクから開始**: Serenaメモリ tier2 作成の続き
3. **nisseisp プロジェクトを参考**: `nisseisp/.serena/memories/*.md`
4. **変数置換を意識**: {{PROJECT_NAME}}等を適切に配置
5. **TODOリストを更新**: 完了したタスクをcompletedに

---

## 💡 重要なポイント

### 変数置換について
- init_project.pyの`replace_variables()`関数で`{{VARIABLE_NAME}}`を置換
- .template拡張子は自動で削除される
- 変数は大文字のSNAKE_CASE（例: {{PROJECT_NAME}}）

### ファイル構造
```
project-template/
├── README.md                    # 完了
├── USAGE_GUIDE.md              # 完了
├── init_project.py             # 完了（拡張済み）
├── next_session_prompt.md      # このファイル
└── template/
    ├── CLAUDE.md.template       # 完了
    ├── README.md.template       # 完了
    ├── .gitignore              # 完了
    ├── docker-compose.yml.template  # 完了
    ├── .mcp.json.template      # 完了
    ├── .claude/agents/         # ← 次に作成
    ├── .serena/memories/       # ← 次に作成
    ├── backend/skeleton/       # ← 次に作成
    ├── frontend/skeleton/      # ← 次に作成
    ├── deployment/             # ← 次に作成
    ├── docs/                   # ← 次に作成
    ├── ai-rules/
    │   ├── common/             # ← 次に作成
    │   └── _project_template/  # 完了（REQUIREMENTS_PROMPT.md等）
    └── reference/
        └── README.md.template  # 完了
```

### nisseisp プロジェクトの参照パス
- サブエージェント: `C:\Users\shiga\Desktop\Dev\nisseisp\.claude\agents\*.md`
- Serenaメモリ: `C:\Users\shiga\Desktop\Dev\nisseisp\.serena\memories\*.md`
- ai-rules: `C:\Users\shiga\Desktop\Dev\nisseisp\ai-rules\`
- docs: `C:\Users\shiga\Desktop\Dev\nisseisp\docs\`

---

## 🎯 次のセッション目標

1. ✅ サブエージェント設定テンプレート作成（3ファイル）
2. ✅ Serenaメモリ初期テンプレート作成（tier1,2,3）
3. ✅ バックエンドスケルトン作成（fastapi最優先）
4. ✅ フロントエンドスケルトン作成（nextjs最優先）

**目標時間**: 2-3時間（スケルトンはシンプルなHello Worldレベルで十分）

---

**作成者**: Claude Code
**最終更新**: 2025-10-09
