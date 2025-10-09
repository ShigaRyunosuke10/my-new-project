#!/usr/bin/env python3
"""
Claude Code Project Template Initializer

対話形式でプロジェクトを初期化し、
テンプレートファイルを変数置換してコピーします。

使用方法:
    python init_project.py

バージョン: 1.0
作成日: 2025-10-09
"""

import os
import re
import shutil
import sys
from pathlib import Path
from typing import Dict, List, Optional


class Color:
    """ターミナル色定義"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def print_header(text: str):
    """ヘッダー出力"""
    print(f"\n{Color.HEADER}{Color.BOLD}{'=' * 60}{Color.ENDC}")
    print(f"{Color.HEADER}{Color.BOLD}{text}{Color.ENDC}")
    print(f"{Color.HEADER}{Color.BOLD}{'=' * 60}{Color.ENDC}\n")


def print_success(text: str):
    """成功メッセージ"""
    print(f"{Color.OKGREEN}✅ {text}{Color.ENDC}")


def print_info(text: str):
    """情報メッセージ"""
    print(f"{Color.OKCYAN}💡 {text}{Color.ENDC}")


def print_warning(text: str):
    """警告メッセージ"""
    print(f"{Color.WARNING}⚠️  {text}{Color.ENDC}")


def print_error(text: str):
    """エラーメッセージ"""
    print(f"{Color.FAIL}❌ {text}{Color.ENDC}")


def ask_input(prompt: str, default: Optional[str] = None) -> str:
    """ユーザー入力取得"""
    if default:
        result = input(f"{prompt} [{default}]: ").strip()
        return result if result else default
    return input(f"{prompt}: ").strip()


def ask_yes_no(prompt: str, default: bool = True) -> bool:
    """Yes/No質問"""
    default_str = "Y/n" if default else "y/N"
    result = input(f"{prompt} ({default_str}): ").strip().lower()
    if not result:
        return default
    return result in ['y', 'yes']


def ask_choice(prompt: str, choices: List[str], default: int = 1) -> int:
    """選択肢から選択"""
    print(f"\n{prompt}")
    for i, choice in enumerate(choices, 1):
        print(f"  {i}. {choice}")

    while True:
        choice_str = ask_input(f"選択 (1-{len(choices)})", str(default))
        try:
            choice = int(choice_str)
            if 1 <= choice <= len(choices):
                return choice
            print_error(f"1-{len(choices)}の数値を入力してください")
        except ValueError:
            print_error("数値を入力してください")


def validate_project_name(name: str) -> bool:
    """プロジェクト名の検証"""
    if not re.match(r'^[a-z0-9-]+$', name):
        print_error("プロジェクト名は英小文字・数字・ハイフンのみ使用可能です")
        return False
    if name.startswith('-') or name.endswith('-'):
        print_error("プロジェクト名の先頭・末尾にハイフンは使用できません")
        return False
    return True


def validate_email(email: str) -> bool:
    """メールアドレスの検証"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        print_error("有効なメールアドレスを入力してください")
        return False
    return True


def validate_password(password: str) -> bool:
    """パスワードの検証"""
    if len(password) < 8:
        print_error("パスワードは8文字以上必要です")
        return False
    if not re.search(r'[A-Za-z]', password):
        print_error("パスワードには英字を含めてください")
        return False
    if not re.search(r'[0-9]', password):
        print_error("パスワードには数字を含めてください")
        return False
    return True


def collect_project_info() -> Dict[str, str]:
    """プロジェクト情報を収集"""
    print_header("プロジェクト基本情報")

    config = {}

    # プロジェクト名
    while True:
        project_name = ask_input("[1/4] プロジェクト名（英数字・ハイフンのみ、例: my-webapp）")
        if validate_project_name(project_name):
            config['PROJECT_NAME'] = project_name
            break

    # 表示名
    config['PROJECT_DISPLAY_NAME'] = ask_input(
        "[2/4] プロジェクト表示名（日本語可、例: 私のWebアプリ）"
    )

    # 説明
    print("[3/4] プロジェクト説明（1-2行）:")
    description_lines = []
    while True:
        line = input("> ").strip()
        if line:
            description_lines.append(line)
        else:
            break
        if len(description_lines) >= 2:
            print_info("2行入力されました。Enterで次へ")
    config['PROJECT_DESCRIPTION'] = '\n'.join(description_lines)

    # GitHub Owner
    config['GITHUB_OWNER'] = ask_input(
        "[4/4] GitHub Owner名（例: YourUsername）"
    )

    return config


def collect_tech_stack() -> Dict[str, str]:
    """技術スタック選択"""
    print_header("技術スタック選択")

    config = {}

    # バックエンド
    backend_choices = [
        "FastAPI（Python、高速、非同期対応）",
        "Django（Python、フル機能、管理画面付き）",
        "Express（Node.js、軽量、JS統一）"
    ]
    backend_choice = ask_choice(
        "[1/3] バックエンド技術を選択してください:",
        backend_choices
    )
    backend_map = {1: "fastapi", 2: "django", 3: "express"}
    config['BACKEND_TECH'] = backend_map[backend_choice]

    # フロントエンド
    frontend_choices = [
        "Next.js（React、SSR、App Router）",
        "React（SPA、Vite使用）",
        "Vue.js（SPA、Composition API）"
    ]
    frontend_choice = ask_choice(
        "[2/3] フロントエンド技術を選択してください:",
        frontend_choices
    )
    frontend_map = {1: "nextjs", 2: "react", 3: "vue"}
    config['FRONTEND_TECH'] = frontend_map[frontend_choice]

    # データベース
    database_choices = [
        "PostgreSQL（本番推奨）",
        "MySQL（互換性高い）",
        "SQLite（開発用）",
        "その他（手動設定）"
    ]
    database_choice = ask_choice(
        "[3/3] データベースを選択してください:",
        database_choices
    )
    database_map = {1: "postgresql", 2: "mysql", 3: "sqlite", 4: "other"}
    config['DATABASE_TYPE'] = database_map[database_choice]

    # Docker用データベース設定
    db_config = {
        "postgresql": {
            "IMAGE": "postgres:15-alpine",
            "PORT": "5432",
            "INTERNAL_PORT": "5432",
            "VOLUME_NAME": "postgres_data",
            "VOLUME_PATH": "postgresql",
            "ENV_VARS": "POSTGRES_USER={{DATABASE_USER}}\n      POSTGRES_PASSWORD={{DATABASE_PASSWORD}}\n      POSTGRES_DB={{DATABASE_NAME}}",
            "URL": "postgresql://{{DATABASE_USER}}:{{DATABASE_PASSWORD}}@db:5432/{{DATABASE_NAME}}"
        },
        "mysql": {
            "IMAGE": "mysql:8.0",
            "PORT": "3306",
            "INTERNAL_PORT": "3306",
            "VOLUME_NAME": "mysql_data",
            "VOLUME_PATH": "mysql",
            "ENV_VARS": "MYSQL_ROOT_PASSWORD={{DATABASE_PASSWORD}}\n      MYSQL_DATABASE={{DATABASE_NAME}}\n      MYSQL_USER={{DATABASE_USER}}\n      MYSQL_PASSWORD={{DATABASE_PASSWORD}}",
            "URL": "mysql://{{DATABASE_USER}}:{{DATABASE_PASSWORD}}@db:3306/{{DATABASE_NAME}}"
        },
        "sqlite": {
            "IMAGE": "alpine:latest",
            "PORT": "0",
            "INTERNAL_PORT": "0",
            "VOLUME_NAME": "sqlite_data",
            "VOLUME_PATH": "sqlite",
            "ENV_VARS": "",
            "URL": "sqlite:///./{{DATABASE_NAME}}.db"
        },
        "other": {
            "IMAGE": "postgres:15-alpine",
            "PORT": "5432",
            "INTERNAL_PORT": "5432",
            "VOLUME_NAME": "db_data",
            "VOLUME_PATH": "data",
            "ENV_VARS": "# 手動設定してください",
            "URL": "# 手動設定してください"
        }
    }

    db_type = config['DATABASE_TYPE']
    config['DATABASE_IMAGE'] = db_config[db_type]["IMAGE"]
    config['DATABASE_PORT'] = db_config[db_type]["PORT"]
    config['DATABASE_INTERNAL_PORT'] = db_config[db_type]["INTERNAL_PORT"]
    config['DATABASE_VOLUME_NAME'] = db_config[db_type]["VOLUME_NAME"]
    config['DATABASE_VOLUME_PATH'] = db_config[db_type]["VOLUME_PATH"]
    config['DATABASE_ENV_VARS'] = db_config[db_type]["ENV_VARS"]
    config['DATABASE_URL'] = db_config[db_type]["URL"]

    # Express の場合のみ ORM 選択
    if config['BACKEND_TECH'] == 'express':
        orm_choices = [
            "Prisma（モダン、型安全、推奨）",
            "TypeORM（フル機能、デコレータ使用）",
            "Sequelize（老舗、実績豊富）"
        ]
        orm_choice = ask_choice(
            "Express用ORM/Query Builderを選択してください:",
            orm_choices
        )
        orm_map = {1: "prisma", 2: "typeorm", 3: "sequelize"}
        config['EXPRESS_ORM'] = orm_map[orm_choice]
    else:
        config['EXPRESS_ORM'] = "none"

    # Docker用コマンド設定
    backend_commands = {
        "fastapi": "uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload",
        "django": "python manage.py runserver 0.0.0.0:8000",
        "express": "npm run dev"
    }
    config['BACKEND_COMMAND'] = backend_commands[config['BACKEND_TECH']]

    frontend_commands = {
        "nextjs": "npm run dev",
        "react": "npm start",
        "vue": "npm run dev"
    }
    config['FRONTEND_COMMAND'] = frontend_commands[config['FRONTEND_TECH']]

    return config


def collect_hosting_info() -> Dict[str, str]:
    """ホスティング先選択"""
    print_header("ホスティング先選択")

    config = {}

    # フロントエンド
    frontend_hosting_choices = [
        "Vercel（Next.js推奨、無料プランあり）",
        "Netlify（静的サイト向け、無料プランあり）",
        "AWS（S3 + CloudFront、柔軟性高い）",
        "自前サーバー（Docker使用）",
        "未定（後で決定）"
    ]
    frontend_hosting_choice = ask_choice(
        "[1/2] フロントエンドのホスティング先を選択してください:",
        frontend_hosting_choices
    )
    frontend_hosting_map = {
        1: "vercel", 2: "netlify", 3: "aws", 4: "self", 5: "tbd"
    }
    config['HOSTING_FRONTEND'] = frontend_hosting_map[frontend_hosting_choice]

    # バックエンド
    backend_hosting_choices = [
        "AWS（EC2/ECS、本番推奨）",
        "GCP（Cloud Run、コンテナ向け）",
        "Heroku（簡単デプロイ、有料）",
        "自前サーバー（Docker使用）",
        "未定（後で決定）"
    ]
    backend_hosting_choice = ask_choice(
        "[2/2] バックエンドのホスティング先を選択してください:",
        backend_hosting_choices
    )
    backend_hosting_map = {
        1: "aws", 2: "gcp", 3: "heroku", 4: "self", 5: "tbd"
    }
    config['HOSTING_BACKEND'] = backend_hosting_map[backend_hosting_choice]

    return config


def collect_port_settings() -> Dict[str, str]:
    """ポート設定"""
    print_header("ポート設定")

    config = {}

    config['PORT_FRONTEND'] = ask_input(
        "[1/2] フロントエンドポート", "3000"
    )

    config['PORT_BACKEND'] = ask_input(
        "[2/2] バックエンドポート", "8000"
    )

    print_info("複数プロジェクトを並行開発する場合、ポートを変えてください")
    print_info("例: プロジェクトA（3000/8000）、プロジェクトB（3001/8001）")

    return config


def collect_serena_tier() -> Dict[str, str]:
    """Serenaメモリ複雑度選択"""
    print_header("Serenaメモリ複雑度選択")

    config = {}

    tier_choices = [
        "Tier 1 - 小規模（3ファイル、個人開発・1-2週間）",
        "Tier 2 - 中規模（6ファイル、チーム開発・1-3ヶ月）",
        "Tier 3 - 大規模（7+ファイル、複雑システム・長期開発）"
    ]
    tier_choice = ask_choice(
        "プロジェクト規模を選択してください:",
        tier_choices,
        default=2
    )
    tier_map = {1: "tier1", 2: "tier2", 3: "tier3"}
    config['SERENA_TIER'] = tier_map[tier_choice]

    # Tier別ファイル一覧表示
    tier_files = {
        "tier1": [
            "project_overview.md",
            "current_issues_and_priorities.md",
            "implementation_status.md"
        ],
        "tier2": [
            "project_overview.md",
            "current_issues_and_priorities.md",
            "implementation_status.md",
            "database_specifications.md",
            "api_specifications.md",
            "system_architecture.md"
        ],
        "tier3": [
            "project_overview.md",
            "current_issues_and_priorities.md",
            "implementation_status.md",
            "database_specifications.md",
            "api_specifications.md",
            "system_architecture.md",
            "phase_progress.md",
            "（プロジェクト固有ファイルを追加可能）"
        ]
    }

    print_success(f"{tier_map[tier_choice].upper()}を選択しました。以下のSerenaメモリファイルが生成されます:")
    for file in tier_files[tier_map[tier_choice]]:
        print(f"   - {file}")

    return config


def collect_test_user() -> Dict[str, str]:
    """テストユーザー設定"""
    print_header("テストユーザー設定")

    config = {}

    # メールアドレス
    while True:
        email = ask_input("[1/2] テストユーザーのメールアドレス", "qa+test@example.com")
        if validate_email(email):
            config['TEST_USER_EMAIL'] = email
            break

    # パスワード
    while True:
        password = ask_input("[2/2] テストユーザーのパスワード（8文字以上、英数記号含む）", "TestPass!123")
        if validate_password(password):
            config['TEST_USER_PASSWORD'] = password
            break

    print_warning("これらの情報は .claude/agents/e2e-tester.md に記載されます")

    return config


def collect_database_credentials() -> Dict[str, str]:
    """データベース認証情報設定"""
    print_header("データベース認証情報設定")

    config = {}

    config['DATABASE_NAME'] = ask_input(
        "[1/3] データベース名（英数字・アンダースコアのみ）",
        "myapp_db"
    )

    config['DATABASE_USER'] = ask_input(
        "[2/3] データベースユーザー名",
        "dbuser"
    )

    config['DATABASE_PASSWORD'] = ask_input(
        "[3/3] データベースパスワード（開発用）",
        "Dev!Pass123"
    )

    print_warning("本番環境では必ず強固なパスワードを使用してください")

    return config


def collect_auth_settings() -> Dict[str, str]:
    """認証方式設定"""
    print_header("認証方式設定")

    config = {}

    config['USE_JWT'] = "true"

    # OAuth設定
    use_oauth = ask_yes_no(
        "OAuth（Google/GitHub）認証を有効にしますか？",
        default=True
    )
    config['USE_OAUTH'] = "true" if use_oauth else "false"
    config['OAUTH_ENABLED'] = "true" if use_oauth else "false"

    # Docker用OAuth環境変数
    if use_oauth:
        config['OAUTH_ENV_VARS'] = "\n      - OAUTH_GOOGLE_CLIENT_ID=${OAUTH_GOOGLE_CLIENT_ID}\n      - OAUTH_GOOGLE_CLIENT_SECRET=${OAUTH_GOOGLE_CLIENT_SECRET}\n      - OAUTH_GITHUB_CLIENT_ID=${OAUTH_GITHUB_CLIENT_ID}\n      - OAUTH_GITHUB_CLIENT_SECRET=${OAUTH_GITHUB_CLIENT_SECRET}"
        config['OAUTH_FRONTEND_ENV'] = "\n      - NEXT_PUBLIC_OAUTH_ENABLED=true"
        config['OAUTH_INFO'] = " + OAuth（Google, GitHub）"
        print_info("OAuth認証が有効化されます。以下の設定が必要です:")
        print_info("  - Google: OAuth 2.0クライアントID取得")
        print_info("  - GitHub: OAuth Appの作成")
        print_info("詳細は生成された docs/SETUP.md を参照してください")
    else:
        config['OAUTH_ENV_VARS'] = ""
        config['OAUTH_FRONTEND_ENV'] = ""
        config['OAUTH_INFO'] = ""

    return config


def collect_mcp_servers() -> Dict[str, str]:
    """MCPサーバー選択"""
    print_header("MCPサーバー選択")

    config = {}

    print("以下のMCPサーバーを有効化しますか？（Y/n）\n")

    print(f"{Color.BOLD}[必須]{Color.ENDC}")
    config['MCP_CONTEXT7'] = "true" if ask_yes_no("  - context7: ライブラリ最新仕様取得") else "false"
    config['MCP_GITHUB'] = "true" if ask_yes_no("  - github: GitHub連携") else "false"
    config['MCP_SERENA'] = "true" if ask_yes_no("  - serena: コードベース管理") else "false"

    print(f"\n{Color.BOLD}[推奨]{Color.ENDC}")
    config['MCP_PLAYWRIGHT'] = "true" if ask_yes_no("  - playwright: E2Eテスト") else "false"
    config['MCP_DESKTOP_COMMANDER'] = "true" if ask_yes_no("  - desktop-commander: システム操作") else "false"
    config['MCP_CODEX'] = "true" if ask_yes_no("  - codex: コード生成補助", default=False) else "false"

    print(f"\n{Color.BOLD}[オプション]{Color.ENDC}")
    use_supabase = ask_yes_no("  - supabase: Supabase連携（PostgreSQL以外は不要）", default=False)
    config['MCP_SUPABASE'] = "true" if use_supabase else "false"
    config['USE_SUPABASE'] = "true" if use_supabase else "false"

    print_success("MCPサーバー設定完了")

    return config


def replace_variables(content: str, variables: Dict[str, str]) -> str:
    """テンプレート変数を置換"""
    for key, value in variables.items():
        placeholder = f"{{{{{key}}}}}"
        content = content.replace(placeholder, value)
    return content


def copy_template_file(
    src: Path,
    dst: Path,
    variables: Dict[str, str],
    is_template: bool = True
):
    """テンプレートファイルをコピー"""
    # ディレクトリ作成
    dst.parent.mkdir(parents=True, exist_ok=True)

    if is_template:
        # テンプレートファイル（変数置換）
        with open(src, 'r', encoding='utf-8') as f:
            content = f.read()

        content = replace_variables(content, variables)

        with open(dst, 'w', encoding='utf-8') as f:
            f.write(content)
    else:
        # 通常ファイル（そのままコピー）
        shutil.copy2(src, dst)


def initialize_project(config: Dict[str, str]):
    """プロジェクト初期化"""
    print_header("プロジェクト初期化中...")

    # パス設定
    template_dir = Path(__file__).parent / "template"
    project_name = config['PROJECT_NAME']
    project_dir = Path(__file__).parent.parent / project_name

    # プロジェクトディレクトリ存在確認
    if project_dir.exists():
        print_warning(f"プロジェクトディレクトリ {project_dir} は既に存在します")
        overwrite = ask_yes_no("上書きしますか？", default=False)
        if not overwrite:
            print_error("初期化をキャンセルしました")
            sys.exit(1)
        shutil.rmtree(project_dir)

    # プロジェクトディレクトリ作成
    project_dir.mkdir(parents=True, exist_ok=True)
    print_success(f"プロジェクトディレクトリ作成: {project_dir}")

    # テンプレートファイルコピー
    print_info("テンプレートファイルをコピー中...")

    # ルートファイル
    root_files = [
        ("CLAUDE.md.template", "CLAUDE.md", True),
        ("README.md.template", "README.md", True),
        (".gitignore", ".gitignore", False),
        (".mcp.json.template", ".mcp.json", True),
        ("docker-compose.yml.template", "docker-compose.yml", True),
    ]

    for src_name, dst_name, is_template in root_files:
        src = template_dir / src_name
        dst = project_dir / dst_name
        if src.exists():
            copy_template_file(src, dst, config, is_template)
            print_success(f"  ✅ {dst_name}")

    # .claude/ ディレクトリ
    claude_dir = template_dir / ".claude"
    if claude_dir.exists():
        for item in claude_dir.rglob("*"):
            if item.is_file():
                rel_path = item.relative_to(claude_dir)
                src = item
                dst_name = str(rel_path).replace(".template", "")
                dst = project_dir / ".claude" / dst_name
                is_template = item.suffix == ".template" or ".template" in item.name
                copy_template_file(src, dst, config, is_template)
        print_success("  ✅ .claude/")

    # ai-rules/ ディレクトリ
    ai_rules_dir = template_dir / "ai-rules"
    if ai_rules_dir.exists():
        # common/ をそのままコピー
        common_src = ai_rules_dir / "common"
        common_dst = project_dir / "ai-rules" / "common"
        if common_src.exists():
            shutil.copytree(common_src, common_dst)
            print_success("  ✅ ai-rules/common/")

        # _project_template/ をプロジェクト名に変更してコピー
        project_template_src = ai_rules_dir / "_project_template"
        project_specific_dst = project_dir / "ai-rules" / project_name
        if project_template_src.exists():
            project_specific_dst.mkdir(parents=True, exist_ok=True)
            for item in project_template_src.rglob("*"):
                if item.is_file():
                    rel_path = item.relative_to(project_template_src)
                    src = item
                    dst_name = str(rel_path).replace(".template", "")
                    dst = project_specific_dst / dst_name
                    is_template = item.suffix == ".template" or ".template" in item.name
                    copy_template_file(src, dst, config, is_template)
            print_success(f"  ✅ ai-rules/{project_name}/")

    # docs/ ディレクトリ
    docs_dir = template_dir / "docs"
    if docs_dir.exists():
        for item in docs_dir.rglob("*"):
            if item.is_file():
                rel_path = item.relative_to(docs_dir)
                src = item
                dst_name = str(rel_path).replace(".template", "")
                dst = project_dir / "docs" / dst_name
                is_template = item.suffix == ".template" or ".template" in item.name
                copy_template_file(src, dst, config, is_template)
        print_success("  ✅ docs/")

    # .serena/ ディレクトリ（Tier別）
    serena_tier = config['SERENA_TIER']
    serena_src = template_dir / ".serena" / "memories" / serena_tier
    serena_dst = project_dir / ".serena" / "memories"
    if serena_src.exists():
        serena_dst.mkdir(parents=True, exist_ok=True)
        for item in serena_src.rglob("*"):
            if item.is_file():
                rel_path = item.relative_to(serena_src)
                src = item
                dst_name = str(rel_path).replace(".template", "")
                dst = serena_dst / dst_name
                is_template = item.suffix == ".template" or ".template" in item.name
                copy_template_file(src, dst, config, is_template)
        print_success(f"  ✅ .serena/memories/ ({serena_tier.upper()})")

    # backend/ スケルトン
    backend_tech = config['BACKEND_TECH']
    backend_src = template_dir / "backend" / "skeleton" / backend_tech
    backend_dst = project_dir / "backend"
    if backend_src.exists():
        shutil.copytree(backend_src, backend_dst)
        print_success(f"  ✅ backend/ ({backend_tech})")

    # frontend/ スケルトン
    frontend_tech = config['FRONTEND_TECH']
    frontend_src = template_dir / "frontend" / "skeleton" / frontend_tech
    frontend_dst = project_dir / "frontend"
    if frontend_src.exists():
        shutil.copytree(frontend_src, frontend_dst)
        print_success(f"  ✅ frontend/ ({frontend_tech})")

    # deployment/ 設定（ホスティング先別）
    hosting_frontend = config['HOSTING_FRONTEND']
    hosting_backend = config['HOSTING_BACKEND']
    deployment_dir = template_dir / "deployment"

    if hosting_frontend != "tbd" and (deployment_dir / hosting_frontend).exists():
        src_dir = deployment_dir / hosting_frontend
        dst_dir = project_dir / "deployment" / hosting_frontend
        dst_dir.mkdir(parents=True, exist_ok=True)
        for item in src_dir.rglob("*"):
            if item.is_file():
                rel_path = item.relative_to(src_dir)
                src = item
                dst_name = str(rel_path).replace(".template", "")
                dst = dst_dir / dst_name
                is_template = item.suffix == ".template" or ".template" in item.name
                copy_template_file(src, dst, config, is_template)
        print_success(f"  ✅ deployment/{hosting_frontend}/")

    if hosting_backend != "tbd" and hosting_backend != hosting_frontend:
        if (deployment_dir / hosting_backend).exists():
            src_dir = deployment_dir / hosting_backend
            dst_dir = project_dir / "deployment" / hosting_backend
            dst_dir.mkdir(parents=True, exist_ok=True)
            for item in src_dir.rglob("*"):
                if item.is_file():
                    rel_path = item.relative_to(src_dir)
                    src = item
                    dst_name = str(rel_path).replace(".template", "")
                    dst = dst_dir / dst_name
                    is_template = item.suffix == ".template" or ".template" in item.name
                    copy_template_file(src, dst, config, is_template)
            print_success(f"  ✅ deployment/{hosting_backend}/")

    # GitHub テンプレート
    github_dir = template_dir / ".github"
    if github_dir.exists():
        for item in github_dir.rglob("*"):
            if item.is_file():
                rel_path = item.relative_to(github_dir)
                src = item
                dst_name = str(rel_path).replace(".template", "")
                dst = project_dir / ".github" / dst_name
                is_template = item.suffix == ".template" or ".template" in item.name
                copy_template_file(src, dst, config, is_template)
        print_success("  ✅ .github/")

    print_success(f"\n🎉 プロジェクト初期化完了！")


def print_next_steps(config: Dict[str, str]):
    """次のステップ表示"""
    project_name = config['PROJECT_NAME']
    project_dir = Path(__file__).parent.parent / project_name

    print_header("次のステップ")

    print(f"{Color.BOLD}プロジェクト名:{Color.ENDC} {project_name}")
    print(f"{Color.BOLD}生成先:{Color.ENDC} {project_dir}\n")

    print(f"{Color.BOLD}📁 生成されたファイル:{Color.ENDC}")
    important_files = [
        "CLAUDE.md",
        ".mcp.json（⚠️ API key要設定）",
        "docker-compose.yml",
        ".claude/settings.json",
        f"backend/ ({config['BACKEND_TECH']})",
        f"frontend/ ({config['FRONTEND_TECH']})",
        f".serena/memories/ ({config['SERENA_TIER'].upper()})",
        "ai-rules/",
        "docs/",
    ]

    if config['HOSTING_FRONTEND'] != "tbd":
        important_files.append(f"deployment/{config['HOSTING_FRONTEND']}/ (Frontend)")
    if config['HOSTING_BACKEND'] != "tbd" and config['HOSTING_BACKEND'] != config['HOSTING_FRONTEND']:
        important_files.append(f"deployment/{config['HOSTING_BACKEND']}/ (Backend)")

    for file in important_files:
        print(f"  ✅ {file}")

    print(f"\n{Color.BOLD}📋 次のステップ:{Color.ENDC}")
    steps = [
        f"cd ../{project_name}",
        "環境変数設定（backend/.env, frontend/.env）",
        "API key設定（.mcp.json）",
        f"要件定義（ai-rules/{project_name}/REQUIREMENTS.md）",
        'git init && git add . && git commit -m "Initial commit"',
        "開発開始！"
    ]

    for i, step in enumerate(steps, 1):
        print(f"  {i}. {step}")

    print(f"\n{Color.OKCYAN}詳細は USAGE_GUIDE.md を参照してください。{Color.ENDC}")

    # 重要な注意事項
    print(f"\n{Color.WARNING}{Color.BOLD}⚠️ 重要な設定（必ず実施）:{Color.ENDC}")
    print("  1. .mcp.json の API key を設定")
    print("     - CONTEXT7_API_KEY: Context7で取得")
    print("     - GITHUB_TOKEN: GitHub Personal Access Token")
    if config['USE_SUPABASE'] == "true":
        print("     - SUPABASE_PROJECT_REF: Supabaseで取得")

    print("\n  2. 環境変数ファイルを設定")
    print("     - backend/.env.example → backend/.env")
    print("     - frontend/.env.example → frontend/.env.local")

    print(f"\n  3. 要件定義を記入")
    print(f"     - ai-rules/{project_name}/REQUIREMENTS.md")

    print(f"\n{Color.OKGREEN}Happy Coding! 🚀{Color.ENDC}\n")


def get_recommended_config(project_name: str, project_display_name: str, project_description: str, github_owner: str) -> Dict[str, str]:
    """おすすめ設定を返す"""
    import secrets
    from datetime import datetime

    config = {
        # プロジェクト基本情報
        'PROJECT_NAME': project_name,
        'PROJECT_DISPLAY_NAME': project_display_name,
        'PROJECT_DESCRIPTION': project_description,
        'GITHUB_OWNER': github_owner,
        'CURRENT_DATE': datetime.now().strftime('%Y-%m-%d'),

        # 技術スタック（おすすめ）
        'BACKEND_TECH': 'FastAPI',
        'FRONTEND_TECH': 'Next.js',
        'DATABASE_TYPE': 'PostgreSQL',
        'DATABASE_IMAGE': 'postgres:15-alpine',
        'DATABASE_PORT': '5432',
        'DATABASE_INTERNAL_PORT': '5432',

        # データベース認証情報
        'DATABASE_NAME': f"{project_name.replace('-', '_')}_db",
        'DATABASE_USER': 'dbuser',
        'DATABASE_PASSWORD': 'Dev!Pass123',

        # ホスティング（おすすめ）
        'FRONTEND_HOSTING': 'Vercel',
        'BACKEND_HOSTING': 'Render',

        # ポート設定（固定）
        'PORT_FRONTEND': '3000',
        'PORT_BACKEND': '8000',

        # Serenaメモリ（tier2推奨）
        'SERENA_TIER': 'tier2',

        # テストユーザー
        'TEST_USER_EMAIL': 'qa+test@example.com',
        'TEST_USER_PASSWORD': 'TestPass!123',

        # 認証（JWT + OAuth有効）
        'USE_JWT': 'true',
        'USE_OAUTH': 'true',
        'OAUTH_ENABLED': 'true',
        'OAUTH_ENV_VARS': "\n      - OAUTH_GOOGLE_CLIENT_ID=${OAUTH_GOOGLE_CLIENT_ID}\n      - OAUTH_GOOGLE_CLIENT_SECRET=${OAUTH_GOOGLE_CLIENT_SECRET}\n      - OAUTH_GITHUB_CLIENT_ID=${OAUTH_GITHUB_CLIENT_ID}\n      - OAUTH_GITHUB_CLIENT_SECRET=${OAUTH_GITHUB_CLIENT_SECRET}",
        'OAUTH_FRONTEND_ENV': "\n      - NEXT_PUBLIC_OAUTH_ENABLED=true",
        'OAUTH_INFO': ' + OAuth（Google, GitHub）',

        # JWT Secret
        'JWT_SECRET': secrets.token_urlsafe(32),

        # MCP Servers（すべて有効）
        'USE_CONTEXT7': 'true',
        'USE_GITHUB': 'true',
        'USE_SERENA': 'true',
        'USE_PLAYWRIGHT': 'true',
        'USE_DESKTOP_COMMANDER': 'true',
        'USE_CODEX': 'true',
        'USE_SUPABASE': 'false',
        'USE_IDE': 'false',
    }

    # Docker設定の生成
    db_config = {
        "postgresql": {
            "IMAGE": "postgres:15-alpine",
            "PORT": "5432",
            "VOLUME_NAME": "postgres_data",
            "VOLUME_PATH": "/var/lib/postgresql/data",
            "ENV_VARS": f"\n      - POSTGRES_DB={config['DATABASE_NAME']}\n      - POSTGRES_USER={config['DATABASE_USER']}\n      - POSTGRES_PASSWORD={config['DATABASE_PASSWORD']}",
            "URL": f"postgresql://{config['DATABASE_USER']}:{config['DATABASE_PASSWORD']}@db:5432/{config['DATABASE_NAME']}"
        }
    }

    backend_commands = {
        "fastapi": "uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
    }

    frontend_commands = {
        "nextjs": "npm run dev"
    }

    config['DATABASE_VOLUME_NAME'] = db_config['postgresql']['VOLUME_NAME']
    config['DATABASE_VOLUME_PATH'] = db_config['postgresql']['VOLUME_PATH']
    config['DATABASE_ENV_VARS'] = db_config['postgresql']['ENV_VARS']
    config['DATABASE_URL'] = db_config['postgresql']['URL']
    config['BACKEND_COMMAND'] = backend_commands['fastapi']
    config['FRONTEND_COMMAND'] = frontend_commands['nextjs']

    return config


def main():
    """メイン処理"""
    print_header("Claude Code プロジェクトテンプレート初期化")

    # モード選択
    print(f"{Color.OKCYAN}初期化モードを選択してください:{Color.ENDC}\n")
    print("  1. おすすめ設定で自動生成（簡単・高速）")
    print("  2. カスタム設定（詳細に選択）\n")

    mode = ask_choice("モードを選択", ["おすすめ設定", "カスタム設定"], default=1)

    config = {}

    if mode == 1:
        # おすすめ設定モード
        print_header("おすすめ設定モード")
        print_info("最小限の質問で、実績のある技術スタックで初期化します\n")

        print(f"{Color.BOLD}おすすめ構成:{Color.ENDC}")
        print("  • バックエンド: FastAPI (Python)")
        print("  • フロントエンド: Next.js (React)")
        print("  • データベース: PostgreSQL")
        print("  • 認証: JWT + OAuth (Google/GitHub)")
        print("  • ホスティング: Vercel (フロント) + Render (バック)")
        print("  • Serenaメモリ: Tier 2 (中規模プロジェクト)\n")

        # 最小限の質問のみ
        project_name = ""
        while True:
            project_name = ask_input("[1/4] プロジェクト名（英小文字・数字・ハイフン）", "my-awesome-app")
            if validate_project_name(project_name):
                break

        project_display_name = ask_input("[2/4] プロジェクト表示名", project_name.replace('-', ' ').title())

        project_description = ask_input("[3/4] プロジェクト説明（1行）", "素晴らしいWebアプリケーション")

        github_owner = ask_input("[4/4] GitHubユーザー名/組織名", "your-username")

        # おすすめ設定を自動生成
        config = get_recommended_config(project_name, project_display_name, project_description, github_owner)

        print_success("\n✨ おすすめ設定でプロジェクトを生成します！")

    else:
        # カスタム設定モード
        print_header("カスタム設定モード")
        print(f"{Color.OKCYAN}対話形式でプロジェクトを初期化します。{Color.ENDC}")
        print(f"{Color.OKCYAN}各質問に回答してください。{Color.ENDC}\n")

        # 1. プロジェクト基本情報
        config.update(collect_project_info())

        # 2. 技術スタック
        config.update(collect_tech_stack())

        # 3. ホスティング先
        config.update(collect_hosting_info())

        # 4. ポート設定
        config.update(collect_port_settings())

        # 5. データベース認証情報
        config.update(collect_database_credentials())

        # 6. Serenaメモリ複雑度
        config.update(collect_serena_tier())

        # 7. テストユーザー
        config.update(collect_test_user())

        # 8. 認証方式
        config.update(collect_auth_settings())

        # 9. MCP Servers
        config.update(collect_mcp_servers())

    # 共通処理（両モード共通）
    # プレースホルダー設定（空のAPI key）
    config['CONTEXT7_API_KEY'] = "YOUR_CONTEXT7_API_KEY"
    config['GITHUB_TOKEN'] = "YOUR_GITHUB_TOKEN"
    config['SUPABASE_PROJECT_REF'] = "YOUR_SUPABASE_PROJECT_REF"

    # 確認
    print_header("設定確認")
    print(f"{Color.BOLD}プロジェクト名:{Color.ENDC} {config['PROJECT_NAME']}")
    print(f"{Color.BOLD}バックエンド:{Color.ENDC} {config['BACKEND_TECH']}")
    print(f"{Color.BOLD}フロントエンド:{Color.ENDC} {config['FRONTEND_TECH']}")
    print(f"{Color.BOLD}データベース:{Color.ENDC} {config['DATABASE_TYPE']}")
    print(f"{Color.BOLD}ホスティング:{Color.ENDC} {config['FRONTEND_HOSTING']} (FE) / {config['BACKEND_HOSTING']} (BE)")
    print(f"{Color.BOLD}Serena Tier:{Color.ENDC} {config['SERENA_TIER'].upper()}")
    print()

    proceed = ask_yes_no("この設定でプロジェクトを初期化しますか？")
    if not proceed:
        print_error("初期化をキャンセルしました")
        sys.exit(0)

    # プロジェクト初期化
    initialize_project(config)

    # 次のステップ表示
    print_next_steps(config)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print_error("\n\n初期化をキャンセルしました")
        sys.exit(1)
    except Exception as e:
        print_error(f"\nエラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
