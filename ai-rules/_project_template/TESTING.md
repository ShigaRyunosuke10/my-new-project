# テストガイドライン（{{PROJECT_NAME}} 専用）

**プロジェクト固有**: このファイルは {{PROJECT_NAME}} プロジェクト専用の設定（テストユーザー情報等）を含みます。

---

## テスト実施の必須タイミング

### コミット前（必須）
- **動作確認を必ず実施**
- **e2e-tester サブエージェントでE2Eテストを実施**
- エラーがない状態でコミット
- エラー発見時はタスクを更新してから修正

### e2e-tester サブエージェント使用方法（推奨）

コミット前に以下のコマンドを実行：
```
> e2e-tester サブエージェントを使用してE2Eテストを実施
```

サブエージェントが自動的に：
- 環境確認（フロントエンド・バックエンド起動状態）
- テスト対象機能の把握（変更ファイルから推測）
- テストシナリオ作成（正常系・異常系・エッジケース）
- Playwright MCPでテスト実行
- スクリーンショット保存
- テスト結果レポート出力

**判定結果**:
- ✅ **コミット可**: すべてのテスト成功 → コミット実行
- ❌ **修正必要**: テスト失敗 → 修正してから再テスト

## テストの種類

### E2Eテスト（End-to-End）
- **ツール**: Playwright
- **実施方法**: Playwright MCPツール
- **対象**: ユーザーの実際の操作フロー
- **必須**: すべてのPR作成前

### 単体テスト
- **フロントエンド**: Jest + React Testing Library
- **バックエンド**: pytest
- **対象**: 個別の関数・コンポーネント

### 統合テスト
- **対象**: API + データベース
- **確認**: エンドポイントの正常動作

## E2Eテスト実施手順

### 1. 環境準備
```bash
# フロントエンド起動（ポート{{FRONTEND_PORT}}）
cd frontend
npm run dev

# バックエンド起動（ポート{{BACKEND_PORT}}）
cd backend
{{BACKEND_START_COMMAND}}
```

⚠️ **ポート番号は固定**: {{FRONTEND_PORT}}と{{BACKEND_PORT}}以外は使用禁止

### 2. テストユーザー情報

開発・テスト時は以下を使用：

```
メールアドレス: {{TEST_USER_EMAIL}}
パスワード: {{TEST_USER_PASSWORD}}
ユーザー名: {{TEST_USER_NAME}}
ユーザーID: {{TEST_USER_ID}}
```

### 3. Playwright MCPでテスト実行

```
playwright で [テストファイル] を実行して結果を出力
```

例：
```
playwright で tests/e2e/login.spec.ts を実行、
結果と失敗スクショを出力して
```

## テストケース作成ガイドライン

### E2Eテストの構造

```typescript
import { test, expect } from '@playwright/test';

test.describe('ログイン機能', () => {
  test('正常系: 正しい認証情報でログインできる', async ({ page }) => {
    // 1. ログインページにアクセス
    await page.goto('http://localhost:{{FRONTEND_PORT}}/login');

    // 2. 認証情報を入力
    await page.fill('input[name="email"]', '{{TEST_USER_EMAIL}}');
    await page.fill('input[name="password"]', '{{TEST_USER_PASSWORD}}');

    // 3. ログインボタンをクリック
    await page.click('button[type="submit"]');

    // 4. ダッシュボードにリダイレクトされることを確認
    await expect(page).toHaveURL('http://localhost:{{FRONTEND_PORT}}/dashboard');

    // 5. ユーザー名が表示されることを確認
    await expect(page.locator('text={{TEST_USER_NAME}}')).toBeVisible();
  });

  test('異常系: 誤ったパスワードでログインできない', async ({ page }) => {
    await page.goto('http://localhost:{{FRONTEND_PORT}}/login');
    await page.fill('input[name="email"]', '{{TEST_USER_EMAIL}}');
    await page.fill('input[name="password"]', 'wrong-password');
    await page.click('button[type="submit"]');

    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=パスワードが正しくありません')).toBeVisible();
  });
});
```

## テストケースの網羅性

### 正常系（Happy Path）
- [ ] 基本的な操作フローが正常に完了する
- [ ] 期待される結果が表示される
- [ ] データが正しく保存される

### 異常系（Error Cases）
- [ ] 不正な入力値でエラーメッセージが表示される
- [ ] 必須項目が未入力でエラーが出る
- [ ] 認証エラーが適切に処理される

### エッジケース
- [ ] 境界値（最大・最小値）での動作
- [ ] 特殊文字の入力
- [ ] 大量データの処理

## テスト実行時の注意点

### ポート使用状況の確認
```bash
# ポート{{FRONTEND_PORT}}が使用中か確認
lsof -i :{{FRONTEND_PORT}}

# ポート{{BACKEND_PORT}}が使用中か確認
lsof -i :{{BACKEND_PORT}}

# 使用中の場合はプロセスをkill
kill -9 <PID>
```

### テスト環境のクリーンアップ
- テスト実行前にデータベースをリセット（必要に応じて）
- テスト用データの投入
- キャッシュのクリア

## CI/CDでのテスト

### 自動テスト実行
- PRマージ前に自動実行
- すべてのテストがパスすることを確認
- 失敗時はマージをブロック

### レポート
- テスト結果をPRコメントに投稿
- スクリーンショット・動画を保存
- カバレッジレポートを生成

## テスト失敗時の対応

### 1. エラー内容の確認
- エラーメッセージを確認
- スクリーンショットを確認
- ログを確認

### 2. 原因の特定
- ローカルで再現を試みる
- 関連するコードを確認
- 最近の変更を確認

### 3. 修正
- 原因に応じた修正を実施
- 修正後に再テスト
- すべてのテストがパスすることを確認

### 4. 再発防止
- テストケースの追加（必要に応じて）
- ドキュメントの更新

## テストのベストプラクティス

### DRY原則
- テストコードも重複を避ける
- 共通処理はヘルパー関数にする

### 独立性
- テストは互いに独立させる
- テストの実行順序に依存しない

### 明確性
- テスト名から何を確認しているか分かる
- アサーションメッセージを明確にする

### 保守性
- テストコードも保守しやすく書く
- 不要なテストは削除する

## チェックリスト

コミット前の確認：

- [ ] E2Eテストを実施済み
- [ ] すべてのテストがパス
- [ ] エラーがない状態
- [ ] スクリーンショット・ログを確認済み
- [ ] テストユーザーで動作確認済み
