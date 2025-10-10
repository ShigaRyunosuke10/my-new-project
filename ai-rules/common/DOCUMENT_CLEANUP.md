# ドキュメント整理・整合性チェックガイド

## 目的

プロジェクトのドキュメント（`docs/` と `.serena/memories/`）をMECE（Mutually Exclusive, Collectively Exhaustive）に整理し、情報の重複・欠落・矛盾を防ぐ。

## 実施タイミング

以下のタイミングで必ず実施：
1. **フェーズ完了時**（Phase 1, 2, 3...の完了時）
2. **大規模機能追加後**（3つ以上のファイル変更を伴うPRマージ後）
3. **月次メンテナンス**（最低月1回）
4. **ユーザーからの明示的な依頼時**

## 整理フロー

### ステップ1: 現状把握

```bash
# 1. Serenaメモリ一覧を確認
mcp__serena__list_memories

# 2. docs/ディレクトリ構造を確認
ls -la docs/

# 3. 最終更新日を確認（古い情報の特定）
```

**チェック項目**:
- [ ] 各ドキュメントの最終更新日
- [ ] 重複している可能性のある内容
- [ ] 現在のフェーズ・実装状況

### ステップ2: MECEチェック

#### Mutually Exclusive（相互排他性）チェック

**重複の特定**:
1. **同じ情報が複数箇所に記載されていないか**
   - API仕様（`docs/API.md` vs `.serena/memories/api_specifications.md`）
   - DB仕様（`docs/DATABASE.md` vs `.serena/memories/database_specifications.md`）
   - システム構成（`docs/README.md` vs `.serena/memories/system_architecture.md`）

2. **情報の粒度が適切か**
   - `docs/`: 人間用・簡潔版（概要のみ）
   - `.serena/memories/`: AI用・詳細版（実装詳細含む）

**対応方法**:
- **人間用（docs/）**: 概要・使い方に限定
- **AI用（Serena）**: 詳細仕様・技術情報を記載
- **重複削除**: 詳細情報はSerenaのみ、docs/は参照リンクのみ

#### Collectively Exhaustive（網羅性）チェック

**欠落の特定**:
1. **必須ドキュメントの存在確認**

   **人間用（docs/）**:
   - [ ] README.md（プロジェクト概要）
   - [ ] SETUP.md（環境構築手順）
   - [ ] API.md（APIエンドポイント一覧）
   - [ ] DATABASE.md（テーブル構造概要）
   - [ ] PHASES.md（フェーズ計画）※オプション

   **AI用（.serena/memories/）**:
   - [ ] current_issues_and_priorities.md（最優先・必須）
   - [ ] phase_progress.md（フェーズ管理時・必須）
   - [ ] project_overview.md
   - [ ] system_architecture.md
   - [ ] database_specifications.md
   - [ ] api_specifications.md
   - [ ] implementation_status.md
   - [ ] （プロジェクト固有の仕様メモリ）

2. **最新情報の反映確認**
   - [ ] 実装済み機能がドキュメントに記載されているか
   - [ ] 廃止された機能の記載が削除されているか
   - [ ] 現在のフェーズ情報が正しいか

### ステップ3: 整合性チェック

**矛盾の特定**:
1. **docs/ ⟷ Serenaメモリ間の整合性**
   - API仕様の一致確認（エンドポイント、レスポンス形式）
   - DB仕様の一致確認（テーブル名、カラム名）
   - フェーズ進捗の一致確認

2. **実装 ⟷ ドキュメント間の整合性**
   - 実装済みAPIがドキュメント化されているか
   - ドキュメント記載の機能が実装されているか
   - マイグレーションとDB仕様の一致確認

3. **古い情報の特定**
   - 3ヶ月以上更新されていないメモリ
   - 現在のフェーズと異なる記載
   - 廃止された機能の記載

**対応方法**:
- **矛盾**: 最新の実装に合わせて全ドキュメントを修正
- **古い情報**: 削除 or アーカイブ
- **欠落**: 追加

### ステップ4: 実施・記録

**整理の実行**:
1. 重複情報を削減
2. 欠落情報を追加
3. 矛盾を解消
4. 古い情報を削除

**変更の記録**:
```markdown
## ドキュメント整理履歴

### YYYY-MM-DD（フェーズX完了時）

**削除した重複**:
- docs/API.mdから詳細レスポンス例を削除 → Serenaメモリに集約

**追加した欠落**:
- api_specifications.mdに新規エンドポイント3件を追加

**解消した矛盾**:
- DATABASE.mdのテーブル名をマイグレーションに合わせて修正

**削除した古い情報**:
- implementation_status.mdから完了済みPhase 0の記載を削除
```

### ステップ5: コミット・反映

**コミット方針**:
```bash
git add docs/ .serena/memories/
git commit -m "docs: ドキュメント整理・整合性チェック（Phase X完了時）

整理内容:
- 重複情報の削減（3箇所）
- 欠落情報の追加（5箇所）
- 矛盾の解消（2箇所）
- 古い情報の削除（4箇所）

詳細はドキュメント整理履歴を参照
"
git push origin main
```

## チェックリスト（実施時に使用）

### 事前確認
- [ ] Serenaメモリ一覧を確認
- [ ] docs/ディレクトリ構造を確認
- [ ] 現在のフェーズ・実装状況を把握

### MECEチェック
- [ ] 重複情報を特定（docs/ ⟷ Serena間）
- [ ] 必須ドキュメントの存在確認
- [ ] 最新情報の反映確認

### 整合性チェック
- [ ] docs/ ⟷ Serena間の整合性確認
- [ ] 実装 ⟷ ドキュメント間の整合性確認
- [ ] 古い情報の特定（3ヶ月以上未更新）

### 実施
- [ ] 重複情報を削減
- [ ] 欠落情報を追加
- [ ] 矛盾を解消
- [ ] 古い情報を削除
- [ ] 変更履歴を記録

### 事後確認
- [ ] コミット・プッシュ完了
- [ ] 整理履歴を current_issues_and_priorities.md に記録

## ベストプラクティス

### 1. 情報の分離原則

| ドキュメント種別 | 対象読者 | 記載内容 | 粒度 |
|----------------|---------|---------|------|
| docs/ | 人間（開発者・運用者） | 概要・使い方 | 簡潔 |
| .serena/memories/ | AI | 詳細仕様・実装詳細 | 詳細 |

### 2. 更新頻度の目安

| ドキュメント | 更新頻度 |
|------------|---------|
| current_issues_and_priorities.md | 毎セッション終了時 |
| phase_progress.md | フェーズ進捗変更時 |
| implementation_status.md | 機能追加時 |
| api_specifications.md | APIエンドポイント追加時 |
| database_specifications.md | テーブル追加・変更時 |
| docs/API.md | API公開仕様変更時 |
| docs/DATABASE.md | DB構造変更時 |

### 3. 削除判断基準

**即座に削除**:
- 廃止された機能の記載
- 実装と矛盾する古い仕様
- 完全に重複している情報

**アーカイブ検討**:
- 将来参考になる可能性がある古い設計
- 過去の意思決定の記録
- 技術的負債として残す項目

**保持**:
- 現在有効な仕様・実装
- フェーズ計画・履歴
- 技術的負債の記録

### 4. 参考資料の管理（CSV, Excel, PDF等）

**配置ルール**:
- `docs/`: ドキュメント（Markdown）のみ配置
- `reference/`: 参考資料（CSV, Excel, PDF等）を配置
  - ユーザーが手動でアップロード
  - AI/開発者は参照のみ

**docs/ に参考資料がある場合の対応**:
1. `reference/` ディレクトリが存在するか確認
2. ファイルを `docs/` → `reference/` に移動
3. `docs/README.md` で参考資料の場所を案内

**移動コマンド例**:
```bash
# 参考資料を docs/ から reference/ に移動
mv docs/*.csv reference/
mv docs/*.xlsx reference/
mv docs/*.pdf reference/

# README.md に参考資料の説明を追加
echo "参考資料は reference/ ディレクトリを参照してください" >> docs/README.md
```

**README.md への記載例**:
```markdown
## 参考資料

プロジェクト関連の参考資料（CSV、Excel、PDF等）は [`reference/`](../reference/) ディレクトリに配置されています。

- `reference/sample_data.csv` - サンプルデータ
- `reference/specification.xlsx` - 仕様書
- `reference/design_doc.pdf` - 設計資料
```

## トラブルシューティング

### 重複が多すぎる場合

1. **段階的整理**: 優先度の高い領域から順次整理
   - Phase 1: API仕様の整理
   - Phase 2: DB仕様の整理
   - Phase 3: その他の整理

2. **自動化検討**: 重複検出スクリプトの導入

### 矛盾が多すぎる場合

1. **実装を正とする**: 実装に合わせてドキュメントを修正
2. **Issue化**: 修正規模が大きい場合はIssueとして管理
3. **段階的修正**: Critical → Major → Minor の順で対応

### 古い情報が多すぎる場合

1. **アーカイブフォルダ作成**: `docs/archive/`, `.serena/memories/archive/`
2. **履歴として保持**: フェーズ移行履歴は残す
3. **一括削除検討**: 3ヶ月以上前の完了済み情報は削除
