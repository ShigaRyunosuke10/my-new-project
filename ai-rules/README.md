# AI Rules - Google Apps Script プロジェクト用ガイドライン

このディレクトリには、Google Apps Scriptプロジェクトの開発ガイドラインが格納されています。

**プロジェクト**: 工数管理スプレッドシート
**最終更新**: 2025-10-10

---

## 📁 ディレクトリ構造

```
ai-rules/
├── common/                     # プロジェクト横断（汎用ガイドライン）
│   ├── COMMIT_GUIDELINES.md    # コミット規約
│   ├── NAMING_CONVENTIONS.md   # 命名規則
│   └── SESSION_MANAGEMENT.md   # セッション管理ガイドライン
│
└── README.md                   # このファイル
```

---

## 🌍 common/ - プロジェクト横断（汎用ガイドライン）

**用途**: 複数プロジェクトで共通利用可能な汎用ルール

### ファイル一覧

**[COMMIT_GUIDELINES.md](./common/COMMIT_GUIDELINES.md)** - コミットメッセージガイドライン
- コミットメッセージの形式（type, subject, body）
- コミット前の確認事項

**[NAMING_CONVENTIONS.md](./common/NAMING_CONVENTIONS.md)** - 命名規則
- ファイル・ディレクトリ命名
- 変数・関数命名（Google Apps Script準拠）

**[SESSION_MANAGEMENT.md](./common/SESSION_MANAGEMENT.md)** - セッション管理ガイドライン
- セッション切り替えタイミング
- セッション終了時の作業

---

## 🚀 クイックスタート

### セッション開始時

```bash
# 1. 最新コードを取得
clasp pull

# 2. Git状態確認
git status

# 3. 作業開始
```

### 開発フロー

```
[clasp pull] → [静的解析] → [修正] → [clasp push] → [手動テスト] → [Git commit & push]
```

---

## ⚠️ 重要な注意事項

- ✅ **セッション開始時に `clasp pull` で最新コード取得**
- ✅ **`clasp push` 前に構文エラーチェック**
- ✅ **コミット前にデバッグコード削除**
- ✅ **コミットメッセージは [COMMIT_GUIDELINES.md](./common/COMMIT_GUIDELINES.md) に準拠**
- ✅ **Git commit後は必ずGitHubへpush**

---

## 📝 更新履歴

- **2025-10-10**: Google Apps Script用に簡素化
