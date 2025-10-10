# コミットメッセージガイドライン（汎用版）

**プロジェクト横断**: このファイルは複数プロジェクトで共通利用可能な汎用ガイドです。

---

## 基本フォーマット

```
<type>: <subject>

<body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Type（必須）

- `feat`: 新機能追加
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: コードの意味に影響しない変更（空白、フォーマット等）
- `refactor`: バグ修正や機能追加を含まないコードの変更
- `perf`: パフォーマンス改善
- `test`: テストの追加・修正
- `chore`: ビルドプロセスやツールの変更

## Subject（必須）

- 50文字以内
- 日本語で簡潔に記述
- 命令形で記述（「〜を追加」「〜を修正」）
- 末尾にピリオドを付けない

## Body（任意）

- 詳細な変更内容
- 変更理由
- 影響範囲
- 72文字で改行

## 例

### 新機能追加
```
feat: ユーザーダッシュボード画面を追加

- プロジェクト一覧表示機能
- 工事進捗グラフ表示
- 最近の作業履歴表示

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### バグ修正
```
fix: ログイン時のトークン検証エラーを修正

JWTトークンのデコード処理でタイムゾーンの
扱いが不正だったため、UTCで統一

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### ドキュメント更新
```
docs: API仕様書にエラーレスポンス例を追加

各エンドポイントのエラーケースを明記

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## コミット前の確認

- [ ] 動作確認が完了している
- [ ] エラーがない状態
- [ ] E2Eテストを実施済み
- [ ] コミットメッセージが規約に準拠している
