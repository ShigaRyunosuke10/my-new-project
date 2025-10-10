# settings.json 設定ガイド

Claude Codeの動作をカスタマイズするための設定ファイルガイドです。

## ファイル構成

### `.claude/settings.json`（プロジェクト共有設定）
- **用途**: チーム全体で共有する設定
- **Git管理**: コミット推奨
- **対象**: 通常ツール（Bash, Read, Edit等）の自動承認

### `.claude/settings.local.json`（個人設定）
- **用途**: 個人環境固有の設定
- **Git管理**: `.gitignore`に追加（コミット禁止）
- **対象**: MCPツール、個人的な自動承認設定

## MCPツール自動承認の設定方法

### 手順1: ツールIDを把握

MCPツールIDは`mcp__{server}__{tool}`形式です。

**確認方法A**: 権限ダイアログで確認
- ツール初回呼び出し時の確認ダイアログに表示されるツール名をコピー

**確認方法B**: 接続ログで確認
- Claude Code/Desktopのデバッグログに列挙される`tools`リストを参照

### 手順2: `.claude/settings.local.json`に追加

**推奨構成**（必要最小限のツールのみ許可）:

```json
{
  "permissions": {
    "allow": [
      "// --- GitHub MCP (読み取り) ---",
      "mcp__github__get_pull_request",
      "mcp__github__get_pull_request_files",
      "mcp__github__get_pull_request_diff",

      "// --- GitHub MCP (書き込み・要注意) ---",
      "mcp__github__create_pull_request",
      "mcp__github__merge_pull_request",

      "// --- Serena MCP ---",
      "mcp__serena__activate_project",
      "mcp__serena__list_memories",
      "mcp__serena__read_memory",
      "mcp__serena__write_memory",

      "// --- Playwright MCP ---",
      "mcp__playwright__browser_navigate",
      "mcp__playwright__browser_click",
      "mcp__playwright__browser_type",
      "mcp__playwright__browser_snapshot",

      "// --- Supabase MCP ---",
      "mcp__supabase__list_tables",
      "mcp__supabase__execute_sql",

      "// --- Context7 MCP ---",
      "mcp__context7__resolve-library-id",
      "mcp__context7__get-library-docs",

      "// --- Desktop Commander MCP ---",
      "mcp__desktop-commander__read_file",
      "mcp__desktop-commander__write_file"
    ],
    "ask": [],
    "deny": []
  },
  "enableAllProjectMcpServers": false
}
```

### 手順3: 設定の有効化

**重要**: `enableAllProjectMcpServers`オプション

- `true`: **全MCPツールを自動承認**（非推奨・破壊的操作も含む）
- `false`: `permissions.allow`リストのツールのみ自動承認（**推奨**）

## セキュリティベストプラクティス

### 1. 最小権限の原則
- 必要なツールのみを`allow`に追加
- ワイルドカード（`mcp__serena__*`）は使用不可（個別列挙必須）

### 2. 破壊的操作の扱い
以下のツールは`ask`に残すことを推奨:

```json
{
  "permissions": {
    "ask": [
      "mcp__github__merge_pull_request",
      "mcp__supabase__execute_sql",
      "mcp__github__delete_branch"
    ]
  }
}
```

### 3. 禁止リスト
絶対に自動承認してはいけないツール:

```json
{
  "permissions": {
    "deny": [
      "mcp__github__delete_repository",
      "mcp__supabase__drop_table"
    ]
  }
}
```

## 通常ツール（Bash等）の自動承認

`.claude/settings.json`で設定（プロジェクト共有）:

```json
{
  "permissions": {
    "allow": [
      "Bash:git status",
      "Bash:git diff*",
      "Bash:npm run build*",
      "Read:**/*.ts",
      "Edit:**/*.tsx",
      "Write:**/*.md"
    ],
    "deny": [
      "Bash:rm -rf*",
      "Bash:git push --force*",
      "Delete:**"
    ]
  }
}
```

## よくある質問

### Q1: MCPツールが自動承認されない
**A**: 以下を確認:
1. `enableAllProjectMcpServers: false`になっているか
2. ツールIDが正確か（大文字小文字、アンダースコア数）
3. `.claude/settings.local.json`に記載しているか

### Q2: `enableAllProjectMcpServers: true`との違いは？
**A**:
- `true`: すべてのMCPツールを無条件承認（破壊的操作含む）
- `false` + `permissions.allow`: 指定ツールのみ承認（**推奨**）

### Q3: ワイルドカード（`mcp__serena__*`）は使える？
**A**: **使えません**。個別ツールを列挙する必要があります。

## 参考情報

- [CLAUDE.md](../../CLAUDE.md) - プロジェクト全体設定
- [WORKFLOW.md](./WORKFLOW.md) - 開発ワークフロー
- [SESSION_MANAGEMENT.md](./SESSION_MANAGEMENT.md) - セッション管理
