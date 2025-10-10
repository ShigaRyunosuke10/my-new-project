# Reference Materials / 参考資料

このディレクトリには、プロジェクト開発時に参照する資料を格納します。

---

## 📁 格納対象

### ドキュメント
- 仕様書（PDF、Word、Excel等）
- 要件定義書
- 設計書
- ユーザーマニュアル
- API仕様書（外部サービス等）

### データファイル
- サンプルデータ（CSV、JSON等）
- テストデータ
- マスタデータ
- インポート用データ

### 画像・図表
- ワイヤーフレーム
- 画面遷移図
- ER図
- システム構成図
- UIデザインモックアップ

---

## 🤖 AI（Claude）の利用方法

### セッション開始時の確認

AIは開発開始前に以下を確認します：

```bash
# reference/ 内のファイル一覧を確認
ls reference/

# 特定ファイルの確認（例：仕様書）
Read reference/spec.pdf
Read reference/requirements.xlsx
```

### 実装時の参照

仕様や要件が不明な場合、AIは自動的にこのディレクトリ内の資料を参照します：

**例**：
- データベース設計時 → `reference/ER_diagram.png` を参照
- API実装時 → `reference/api_spec.pdf` を参照
- UI実装時 → `reference/wireframe.pdf` を参照

---

## 📋 推奨ファイル名規則

わかりやすいファイル名を使用してください：

### 良い例
- `requirements_v1.0.pdf` - 要件定義書
- `database_schema.xlsx` - データベーススキーマ
- `api_specification.pdf` - API仕様書
- `sample_data.csv` - サンプルデータ
- `wireframe_dashboard.png` - ダッシュボード画面のワイヤーフレーム

### 悪い例
- `document1.pdf` - 何のドキュメントか不明
- `新しいフォルダー (2)/仕様書最新版final_v2_修正版.docx` - 複雑すぎる

---

## ⚠️ 注意事項

### 機密情報
- 本番環境の認証情報は**絶対に格納しない**
- APIキー・パスワード等は`.env`ファイルで管理
- 個人情報を含むデータは匿名化してから格納

### バージョン管理
- Gitで管理される（`.gitignore`に含まれていません）
- バイナリファイル（PDF、Excel等）のサイズに注意
- 大容量ファイル（100MB超）はGit LFSの利用を検討

### 更新時
- 資料が更新された場合、古いバージョンは削除または`reference/archive/`に移動
- 最新版のみを`reference/`直下に配置

---

## 📂 ディレクトリ構成例

```
reference/
├── README.md（このファイル）
├── requirements_v1.0.pdf          # 要件定義書
├── database_schema.xlsx           # データベーススキーマ
├── api_specification.pdf          # API仕様書
├── wireframe_dashboard.png        # 画面デザイン
├── sample_users.csv               # サンプルユーザーデータ
└── archive/                       # 旧バージョン
    ├── requirements_v0.9.pdf
    └── old_wireframe.png
```

---

## 🔗 関連ドキュメント

- [CLAUDE.md](../CLAUDE.md) - Claude Code設定
- [ai-rules/_project_template/DOCUMENTATION_GUIDE.md](../ai-rules/_project_template/DOCUMENTATION_GUIDE.md) - ドキュメント管理ガイド
- [ai-rules/_project_template/WORKFLOW.md](../ai-rules/_project_template/WORKFLOW.md) - 開発ワークフロー

---

## ✅ チェックリスト

新しい資料を追加する際の確認事項：

- [ ] ファイル名はわかりやすいか
- [ ] 機密情報は含まれていないか
- [ ] ファイルサイズは適切か（100MB未満推奨）
- [ ] 旧バージョンは`archive/`に移動したか
- [ ] AIが参照しやすい形式か（PDF、画像、CSV、Excel等）
