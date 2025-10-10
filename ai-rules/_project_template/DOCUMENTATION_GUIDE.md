# ドキュメント管理ガイド（{{PROJECT_NAME}} 専用）

**プロジェクト固有**: このファイルは {{PROJECT_NAME}} プロジェクト専用の設定を含みます。

**最終更新**: {{CURRENT_DATE}}

このドキュメントでは、**Serenaメモリ** と **docs/** の使い分け、および追記・更新のフローを説明します。

---

## 📚 Serena vs docs の使い分け

### Serena メモリ（`.serena/memories/`）

**用途**: AI用の詳細な実装情報・セッション間の状態共有

**対象読者**: AI（Claude）のみ

**特徴**:
- ✅ 詳細な技術仕様（SQL、APIリクエスト/レスポンス例、実装コード例）
- ✅ 現在の課題・優先度・ブロッカー
- ✅ 作業中の中間状態
- ✅ 未確認事項・TODO
- ✅ セッション間のコンテキスト維持
- ✅ 実装判断の理由・設計意図
- ❌ 人間が読むことは想定していない

**更新頻度**: 頻繁（セッションごと、機能追加ごと）

**ファイル例**:
```
.serena/memories/
├── project_overview.md               # プロジェクト全体概要
├── database_specifications.md        # DB詳細仕様（CREATE TABLE文等）
├── api_specifications.md             # API詳細仕様（全エンドポイント）
├── system_architecture.md            # システムアーキテクチャ詳細
├── implementation_status.md          # 実装状況・進捗・技術的負債
└── current_issues_and_priorities.md  # 現在の課題・優先度（最重要）
```

---

### docs/（人間用ドキュメント）

**用途**: 公式ドキュメント・新メンバーのオンボーディング

**対象読者**: 人間（開発者・新メンバー・ステークホルダー）

**特徴**:
- ✅ 簡潔で読みやすい
- ✅ 概要・全体像の把握
- ✅ クイックリファレンス
- ✅ 環境構築手順
- ✅ プロジェクトの目的・背景
- ❌ 詳細な実装コード例は含まない
- ❌ 作業中の中間状態は記録しない

**更新頻度**: 低頻度（仕様確定時、マイルストーン達成時）

**ファイル例**:
```
docs/
├── README.md           # プロジェクト概要
├── SETUP.md            # 環境構築手順
├── DATABASE.md         # DB設計（簡潔版）
└── API.md              # API仕様（簡潔版）
```

---

### reference/（参考資料）

**用途**: ユーザーから提供された参考資料・サンプルファイル

**対象読者**: 開発者・AI

**特徴**:
- ✅ PDF、Excel、CSV等のバイナリファイル
- ✅ 仕様を確認するための元資料
- ✅ サンプルデータ
- ❌ 編集しない（Read Only）

**更新頻度**: 低頻度（新しい資料が提供されたとき）

**ファイル例**:
```
reference/
├── sample_spec.pdf
├── test_data.xlsx
└── user_manual.pdf
```

---

## 🔄 追記・更新のフロー

### 1️⃣ セッション開始時（必須）

**毎回必ず実施**: Serenaメモリから前回の状態を読み込む

```
1. mcp__serena__activate_project
   project: "{{PROJECT_NAME}}"

2. mcp__serena__list_memories
   → 利用可能なメモリを確認

3. mcp__serena__read_memory
   memory_file_name: "current_issues_and_priorities.md"
   → 現在の優先度・課題を把握

4. 必要に応じて他のメモリを読み込む
   - implementation_status.md（実装状況）
   - database_specifications.md（DB仕様）
   - api_specifications.md（API仕様）
```

---

### 2️⃣ 開発中（機能追加・修正時）

#### Serenaメモリの更新タイミング

**即座に更新**:
- ✅ 新しい課題・ブロッカーが発見された
- ✅ 優先度が変更された
- ✅ 重要な実装判断を行った
- ✅ 新しいテーブル・APIエンドポイントを追加した
- ✅ 技術的負債が発生した

**更新方法**:
```
mcp__serena__write_memory
  memory_name: "current_issues_and_priorities"
  content: "更新内容..."
```

**更新対象メモリ**:
- `current_issues_and_priorities.md` - 課題・優先度（最頻繁）
- `implementation_status.md` - 実装状況
- `database_specifications.md` - DB仕様変更時
- `api_specifications.md` - API変更時

#### docs/ の更新タイミング

**更新しない**:
- ❌ 開発中の一時的な変更
- ❌ 試験的な機能追加
- ❌ 未確定の仕様変更

**更新する**:
- ✅ 仕様が確定した（要件定義変更）
- ✅ マイルストーン達成（Phase完了等）
- ✅ 外部公開が必要な情報
- ✅ 新メンバーのオンボーディングに必要

---

### 3️⃣ PR作成時

#### Serenaメモリの更新

**必須**:
- ✅ `implementation_status.md` を更新
  - 完了した機能を記録
  - 進捗率を更新
  - 既知の問題を記録

#### docs/ の更新確認（必須）

**PR作成後、マージ前に必ず確認**:

```
✅ チェックリスト:

□ 新しいテーブル・カラムを追加した？
  → docs/DATABASE.md を更新

□ 新しいAPIエンドポイントを追加した？
  → docs/API.md を更新

□ 環境変数・ポート設定を変更した？
  → docs/SETUP.md を更新

□ 仕様が確定した？
  → docs/README.md 等を更新

□ 更新不要
  → docs/ は変更せず、Serenaメモリのみ更新
```

**更新方法**:
1. PR作成時のチェックリストで確認
2. 必要な場合、**同じPR内で** docs/ を更新
3. code-reviewer サブエージェント レビューで docs/ の更新漏れをチェック

詳細: [PR_AND_REVIEW.md](./PR_AND_REVIEW.md) の「docs/ 更新確認」セクション

---

### 4️⃣ マージ後

#### Serenaメモリの更新

**必須**:
- ✅ `current_issues_and_priorities.md` を更新
  - 完了したタスクを削除
  - 新しい課題を追加
  - 優先度を見直し

- ✅ `implementation_status.md` を更新
  - 進捗率を更新
  - 最近のPR履歴を記録

#### docs/ の更新（必要に応じて）

**確定した仕様のみ**:
- ✅ 仕様が確定し、外部公開が必要な場合のみ更新
- ✅ 新メンバーのオンボーディングに必要な情報

---

## 📋 Serenaメモリの一覧と役割

### 1. project_overview.md（プロジェクト概要）

**内容**:
- プロジェクトの目的・背景
- 技術スタック
- ディレクトリ構造
- テストユーザー情報
- 開発ワークフロー

**更新タイミング**:
- プロジェクト開始時（初回のみ）
- 技術スタック変更時
- ディレクトリ構造変更時

---

### 2. database_specifications.md（DB詳細仕様）⭐ 重要

**内容**:
- 全テーブルのCREATE TABLE文
- カラム詳細説明
- インデックス設計
- 外部キー制約
- マイグレーション順序
- パフォーマンス最適化

**更新タイミング**:
- 新しいテーブル追加時
- カラム追加・変更時
- インデックス追加時
- 外部キー制約変更時

---

### 3. api_specifications.md（API詳細仕様）⭐ 重要

**内容**:
- 全APIエンドポイント
- リクエスト/レスポンス例（JSON）
- 認証方法
- エラーレスポンス
- バリデーションルール
- ページネーション

**更新タイミング**:
- 新しいAPIエンドポイント追加時
- リクエスト/レスポンス形式変更時
- バリデーションルール変更時

---

### 4. system_architecture.md（システムアーキテクチャ）

**内容**:
- システム構成図
- 技術スタック詳細
- データフロー
- 設計判断の理由
- セキュリティ設計
- パフォーマンス最適化

**更新タイミング**:
- アーキテクチャ変更時
- 新しいサービス追加時
- セキュリティ要件変更時

---

### 5. implementation_status.md（実装状況）⭐ 最重要

**内容**:
- 全体進捗（Phase別）
- 完了済み機能一覧
- 未実装機能一覧
- 既知の問題・ブロッカー
- 技術的負債
- 最近のPR履歴

**更新タイミング**:
- PR作成時（必須）
- マージ後（必須）
- 新しい問題発見時
- 技術的負債発生時

---

### 6. current_issues_and_priorities.md（現在の課題・優先度）⭐ 最重要

**内容**:
- 最優先課題（Critical）
- ブロックされている課題
- 進行中のタスク
- 次のステップ
- 未確認事項
- メモ・記録事項

**更新タイミング**:
- セッション開始時（読み込み）
- 新しい課題発見時（即座に更新）
- 優先度変更時（即座に更新）
- タスク完了時（削除）
- セッション終了時（状態保存）

---

## 🔍 更新判断フローチャート

```
情報が発生した
    │
    ├── 一時的な情報？（作業中の状態、未確定の仕様）
    │   → Serenaメモリのみ更新
    │
    ├── 確定した仕様？（外部公開が必要、新メンバー向け）
    │   → docs/ + Serenaメモリの両方を更新
    │
    ├── 課題・優先度？
    │   → current_issues_and_priorities.md を即座に更新
    │
    ├── 実装完了？
    │   → implementation_status.md を更新
    │
    ├── DB変更？
    │   → database_specifications.md を更新
    │   → （確定したら）docs/DATABASE.md も更新
    │
    └── API変更？
        → api_specifications.md を更新
        → （確定したら）docs/API.md も更新
```

---

## ⚠️ 重要な注意事項

### DO（推奨）

- ✅ **毎セッション開始時に `current_issues_and_priorities.md` を読む**
- ✅ **課題・優先度の変更は即座にSerenaメモリに記録**
- ✅ **PR作成時に docs/ 更新の必要性を確認**
- ✅ **マージ後に implementation_status.md を更新**
- ✅ **Serenaメモリは詳細に、docs/は簡潔に**

### DON'T（非推奨）

- ❌ **Serenaメモリを読まずにセッションを開始しない**
- ❌ **一時的な情報を docs/ に書かない**
- ❌ **確定していない仕様を docs/ に書かない**
- ❌ **docs/ を頻繁に更新しない**（仕様確定時のみ）
- ❌ **Serenaメモリと docs/ の内容を重複させない**

---

## 📝 更新例

### 例1: 新しいAPIエンドポイントを追加した場合

**開発中**:
```
1. api_specifications.md に詳細を追加
   - リクエスト/レスポンス例
   - バリデーションルール
   - エラーハンドリング

2. implementation_status.md を更新
   - 完了した機能に追加
   - 進捗率を更新
```

**PR作成時**:
```
3. docs/ 更新確認
   - 仕様が確定している → docs/API.md に簡潔に追加
   - 試験的な実装 → docs/ は更新せず
```

---

### 例2: 新しい課題が発見された場合

**即座に**:
```
1. current_issues_and_priorities.md を更新
   - 課題の内容
   - 優先度（Critical/High/Medium/Low）
   - 影響範囲
   - 解決方法（案）
```

**docs/ は更新しない**（課題は一時的な情報）

---

### 例3: 仕様が確定した場合

**仕様確定後**:
```
1. Serenaメモリを更新
   - database_specifications.md または api_specifications.md

2. docs/ を更新
   - docs/DATABASE.md または docs/API.md に簡潔に追加
   - 新メンバーが理解できる内容に

3. current_issues_and_priorities.md を更新
   - 未確認事項から削除
   - 完了タスクとして記録
```

---

## 🔗 関連ドキュメント

- [WORKFLOW.md](./WORKFLOW.md) - 全体ワークフロー
- [PR_AND_REVIEW.md](./PR_AND_REVIEW.md) - PR・レビュー・マージプロセス
- [SETUP_AND_MCP.md](./SETUP_AND_MCP.md) - Serena MCP の使い方
- [../CLAUDE.md](../CLAUDE.md) - Claude Code 設定
