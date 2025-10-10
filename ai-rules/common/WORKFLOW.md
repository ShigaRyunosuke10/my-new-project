# 開発ワークフロー（汎用）

全プロジェクト共通の開発ワークフロー定義。

## 基本フロー

```
セッション開始
    ↓
状況把握（Serenaメモリ読み込み）
    ↓
フェーズ・仕様確認
    ↓
ブランチ作成
    ↓
実装・テスト
    ↓
コミット
    ↓
PR作成
    ↓
コードレビュー
    ↓
レビュー指摘対応
    ↓
マージ
    ↓
ドキュメント更新
    ↓
セッション終了
```

## 1. セッション開始時

### 必須作業
1. **Serenaメモリ読み込み**（最重要）
   ```
   mcp__serena__activate_project
   mcp__serena__list_memories
   mcp__serena__read_memory("current_issues_and_priorities.md")
   mcp__serena__read_memory("phase_progress.md")  # フェーズ管理時
   ```

2. **現在のフェーズ・Issue確認**
   - どのフェーズにいるか
   - 優先度の高いIssueは何か
   - 前回の未完了タスクはあるか

3. **仕様確認**
   - フェーズ開始直後の場合: ユーザーと実装内容を合意
   - 実装中の場合: 仕様の再確認（不明点があれば質問）

## 2. ブランチ作成

### ブランチ命名規則
```
feat-<feature-name>    # 新機能
fix-<bug-name>         # バグ修正
docs-<doc-name>        # ドキュメント更新
refactor-<target>      # リファクタリング
test-<test-name>       # テスト追加
```

### 注意事項
- mainブランチでの直接作業は**絶対禁止**
- 1ブランチ = 1機能/1Issue が原則

## 3. 実装・テスト

### コミット前の確認
- [ ] 動作確認を実施
- [ ] E2Eテスト実施（該当する場合）
- [ ] エラーがない状態

### コミット規約
詳細は [COMMIT_GUIDELINES.md](./COMMIT_GUIDELINES.md) を参照。

## 4. PR作成

### PR作成時のチェックリスト
- [ ] PRタイトルが明確（コミット規約に準拠）
- [ ] PR本文に変更内容のサマリを記載
- [ ] 関連Issueをリンク（Closes #XX）
- [ ] レビュアーを指定（人間 or code-reviewerサブエージェント）

詳細は [PR_PROCESS.md](./PR_PROCESS.md) または各プロジェクト固有のPRガイドを参照。

## 5. コードレビュー

### レビュー方法
1. **code-reviewerサブエージェント**でレビュー依頼（推奨）
2. レビュー結果を評価（Critical/Major/Minor）
3. 指摘事項への対応：
   - **Critical**: 必ず修正してから再レビュー
   - **Major**: 修正 or Issue化（緊急度による）
   - **Minor**: Issue化して後で対応

### 再レビュー
- Critical問題を修正した場合は**必ず再レビュー**
- 再レビューでマージ可になるまで繰り返す

詳細は各プロジェクト固有のレビューガイド（例: nissei/PR_AND_REVIEW.md）を参照。

## 6. マージ

### マージ前の最終確認
- [ ] レビュー承認済み
- [ ] CIパス（該当する場合）
- [ ] コンフリクト解消済み

### マージ後の必須作業（重要）
1. **docs/ の更新**
   - API.md, DATABASE.md など人間用ドキュメント
   - 変更内容を反映

2. **Serenaメモリの更新**
   - `.serena/memories/` 内のAI用詳細仕様
   - 該当ファイルを更新（api_specifications.md, database_specifications.md等）
   - phase_progress.md の進捗を更新

⚠️ **重要**: **PR作成→レビュー→マージ→ドキュメント更新までを1セットとして完了**

## 7. フェーズ完了時

### フェーズ完了チェックリスト
- [ ] 全機能の実装完了
- [ ] E2Eテスト完了
- [ ] **仕様との整合性確認**（ユーザーと最終確認）
- [ ] ドキュメント更新完了（docs/ + Serenaメモリ）
- [ ] 次フェーズの準備（必要に応じて）

詳細は [PHASE_MANAGEMENT.md](./PHASE_MANAGEMENT.md) を参照。

## ベストプラクティス

### ✅ 推奨
- セッション開始時に必ずSerenaメモリを読む
- 仕様不明点は実装前に必ず確認
- コミット前の動作確認を徹底
- レビュー指摘には誠実に対応
- ドキュメント更新を先送りしない

### ❌ 非推奨
- Serenaメモリを読まずに作業開始
- 仕様未確認での実装
- 動作確認なしのコミット
- レビュー指摘の無視
- ドキュメント更新の放置

## トラブルシューティング

### Q: 前回の作業内容を忘れた
A: Serenaメモリを読む
```
mcp__serena__read_memory("current_issues_and_priorities.md")
mcp__serena__read_memory("phase_progress.md")
```

### Q: 仕様が曖昧で実装できない
A: ユーザーに確認
- 具体的な動作例を聞く
- テストケースで仕様を明確化
- 曖昧な箇所を列挙して質問

### Q: レビューでCritical指摘を受けた
A: 以下の手順で対応
1. 指摘内容を理解
2. 修正方針を決定
3. 修正実装
4. 再レビュー依頼
5. マージ可になるまで繰り返す

### Q: マージ後にドキュメント更新を忘れた
A: 即座に更新
1. docs/ を更新してコミット
2. Serenaメモリを更新（mcp__serena__write_memory）
3. 次回から忘れないようCLAUDE.mdを再確認
