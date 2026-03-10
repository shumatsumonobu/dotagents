# WIP - 作業再開ガイド

## 現在の状態

plugins/ 配下への構造変更が完了。**ローカルコミット済み・未プッシュ**。

## 未コミットの変更内容

- `devflow/` → `plugins/devflow/` に移動
- `marketplace.json` の source を `./plugins/devflow` に更新
- `README.md` / `README.ja.md` のリンクパス更新
- `HANDOFF.md` / `WIP.md`（旧）削除

## 次の作業（順番通り）

### 1. リポジトリ名の変更

GitHub Settings > General > Repository name で `flux` → `claude` に変更。

変更後に必要な更新（リポ内）:

**`.claude-plugin/marketplace.json`**
- `name`: `flux` → `claude`

**`plugins/devflow/.claude-plugin/plugin.json`**
- L9: `homepage`: `shumatsumonobu/flux` → `shumatsumonobu/claude`
- L10: `repository`: `shumatsumonobu/flux` → `shumatsumonobu/claude`

**`plugins/devflow/DEVELOPMENT.md`**（※ディレクトリ構造の記述も古い）
- L11: `github.com/shumatsumonobu/flux` → `shumatsumonobu/claude`
- L27: `shumatsumonobu/flux` → `shumatsumonobu/claude`
- L28: `devflow@flux` → `devflow@claude`
- L37: `github.com/shumatsumonobu/flux` → `shumatsumonobu/claude`、`/devflow/` → `/plugins/devflow/`
- L42-76: ディレクトリツリーが旧構造（`devflow/` 直下）→ `plugins/devflow/` に更新
- L160: `./devflow` → `./plugins/devflow`
- L255: `devflow@flux` → `devflow@claude`
- L268: `flux` → `claude`（マーケットプレイスパス）
- L278: `flux` → `claude`（マーケットプレイス名）
- L303: `github.com/shumatsumonobu/flux` → `shumatsumonobu/claude`

**`plugins/devflow/README.md`**
- L57: `shumatsumonobu/flux` → `shumatsumonobu/claude`
- L58, 67-68: `devflow@flux` → `devflow@claude`
- L402: `devflow@flux` → `devflow@claude`
- L409: `marketplaces/flux` → `marketplaces/claude`

**`plugins/devflow/README.ja.md`**
- L57: `shumatsumonobu/flux` → `shumatsumonobu/claude`
- L58, 67-68: `devflow@flux` → `devflow@claude`
- L402: `devflow@flux` → `devflow@claude`
- L409: `marketplaces/flux` → `marketplaces/claude`

**`README.md` / `README.ja.md`**（ルート）
- `shumatsumonobu/flux` → `shumatsumonobu/claude`
- `devflow@flux` → `devflow@claude`

**ローカル git remote URL**
- `git remote set-url origin git@github.com:shumatsumonobu/claude.git`

変更後に必要な更新（外部: zenn リポジトリ）:

**`zenn/README.md`**
- L128: `github.com/shumatsumonobu/flux` → `github.com/shumatsumonobu/claude`

**`zenn/articles/5893c3b56a05c9.md`**
- L28: `github.com/shumatsumonobu/flux` → `github.com/shumatsumonobu/claude`

**`zenn/articles/d8f49350c1b526.md`**
- L46: `github.com/shumatsumonobu/flux` → `github.com/shumatsumonobu/claude`
- L48: `shumatsumonobu/flux` → `shumatsumonobu/claude`
- L56-59: インストール手順の `@flux` → `@claude`
- L257: `github.com/shumatsumonobu/flux` → `github.com/shumatsumonobu/claude`

### 2. まとめてコミット・プッシュ

構造変更 + リポ名変更をまとめて1コミットでプッシュ。
その後 zenn リポの外部リンクも更新。

### 3. DevFlow v2.0 のテスト

テスト手順: [CONTRIBUTING.md](CONTRIBUTING.md) の「動作確認」セクション

```bash
claude --plugin-dir /path/to/claude/plugins/devflow
```

最優先: `/devflow:dev` で Phase 1-4 が正しく動くか確認

### 4. 掲載情報の更新

リポ名変更後、以下の登録情報を更新する可能性あり:
- Anthropic 公式ディレクトリ
- ClaudePluginHub
