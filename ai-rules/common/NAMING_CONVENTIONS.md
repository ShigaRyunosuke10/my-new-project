# 命名規則（汎用版）

**プロジェクト横断**: このファイルは複数プロジェクトで共通利用可能な汎用ガイドです。

---

## ファイル・ディレクトリ

### フロントエンド（Next.js）
- **ページコンポーネント**: `kebab-case` (例: `user-profile.tsx`)
- **再利用コンポーネント**: `PascalCase` (例: `UserCard.tsx`)
- **ユーティリティ**: `camelCase` (例: `formatDate.ts`)
- **型定義**: `PascalCase` (例: `UserTypes.ts`)

### バックエンド（FastAPI）
- **ルーター**: `snake_case` (例: `user_router.py`)
- **モデル**: `snake_case` (例: `user_model.py`)
- **スキーマ**: `snake_case` (例: `user_schema.py`)
- **ユーティリティ**: `snake_case` (例: `date_utils.py`)

## 変数・関数

### TypeScript/JavaScript
- **変数**: `camelCase` (例: `userName`, `totalCount`)
- **定数**: `UPPER_SNAKE_CASE` (例: `API_BASE_URL`, `MAX_RETRY`)
- **関数**: `camelCase` (例: `getUserData`, `calculateTotal`)
- **クラス**: `PascalCase` (例: `UserService`, `AuthManager`)
- **インターフェース**: `PascalCase` (例: `UserInterface`, `IUser`)
- **型エイリアス**: `PascalCase` (例: `UserType`)

### Python
- **変数**: `snake_case` (例: `user_name`, `total_count`)
- **定数**: `UPPER_SNAKE_CASE` (例: `API_BASE_URL`, `MAX_RETRY`)
- **関数**: `snake_case` (例: `get_user_data`, `calculate_total`)
- **クラス**: `PascalCase` (例: `UserService`, `AuthManager`)
- **プライベート変数/関数**: `_snake_case` (例: `_internal_data`)

## APIエンドポイント

### RESTful設計原則
- **リソース名**: 複数形の名詞を使用
- **パス**: `kebab-case`を使用（小文字）
- **動詞は使わない**: HTTPメソッドで表現

### エンドポイント例

#### CRUD操作
```
GET    /api/users              # ユーザー一覧取得
GET    /api/users/{id}         # 特定ユーザー取得
POST   /api/users              # ユーザー作成
PUT    /api/users/{id}         # ユーザー更新（全体）
PATCH  /api/users/{id}         # ユーザー更新（一部）
DELETE /api/users/{id}         # ユーザー削除
```

#### ネストされたリソース
```
GET    /api/projects/{id}/work-logs        # プロジェクトの作業履歴一覧
POST   /api/projects/{id}/work-logs        # 作業履歴作成
GET    /api/projects/{id}/work-logs/{log_id}  # 特定作業履歴取得
```

#### アクション（動詞が必要な場合）
```
POST   /api/auth/login         # ログイン
POST   /api/auth/logout        # ログアウト
POST   /api/auth/refresh       # トークンリフレッシュ
POST   /api/invoices/{id}/send # 請求書送信
```

### クエリパラメータ
- `snake_case`を使用
- 例: `/api/users?sort_by=created_at&order=desc`

## データベース

### テーブル名
- **複数形**: `users`, `projects`, `work_logs`
- **snake_case**: 小文字とアンダースコア

### カラム名
- **snake_case**: `user_id`, `created_at`, `is_active`
- **主キー**: `id` (UUID推奨)
- **外部キー**: `<テーブル名単数形>_id` (例: `user_id`, `project_id`)
- **タイムスタンプ**: `created_at`, `updated_at`

## 環境変数

### 形式
- **UPPER_SNAKE_CASE**: すべて大文字
- **値にクォートは付けない**

### 例
```env
DATABASE_URL=postgresql://localhost:5432/mydb
API_BASE_URL=http://localhost:8000
JWT_SECRET_KEY=your-secret-key
SUPABASE_PROJECT_REF=wwyrthkizkcgndyorcww
```

### 分類接頭辞（推奨）
- `DB_`: データベース関連
- `API_`: API関連
- `SUPABASE_`: Supabase関連
- `GITHUB_`: GitHub関連

## CSS/Tailwind

### クラス名（カスタムCSS使用時）
- **kebab-case**: `user-card`, `login-form`
- **BEM記法**（オプション）: `block__element--modifier`

### Tailwind優先
- 可能な限りTailwind CSSユーティリティクラスを使用
- カスタムCSSは最小限に
- 重複スタイルを避ける

## ブランチ名

```
feat-<機能名>        # 新機能
fix-<修正内容>       # バグ修正
refactor-<対象>      # リファクタリング
docs-<内容>          # ドキュメント
test-<対象>          # テスト追加
chore-<内容>         # その他
```

例:
```
feat-user-dashboard
fix-login-timeout
refactor-api-error-handling
docs-api-specification
```

## 命名の一般原則

1. **明確で説明的**: 名前から役割が分かる
2. **短すぎず長すぎず**: 適切な長さ
3. **一貫性**: プロジェクト全体で統一
4. **略語は慎重に**: 一般的な略語のみ使用
5. **予約語を避ける**: 言語の予約語は使わない
