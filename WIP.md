# WIP - 作業再開ガイド

## 現在の状態

DevFlow v2.0 の実装改善が完了。Claude 公式 feature-dev プラグインを参考に全エージェント・コマンドを改善済み。**未テスト**。

## 次の作業（順番通り）

### 1. テスト

テスト手順: [devflow/TESTING.md](devflow/TESTING.md)

```bash
# flux とは別のプロジェクトディレクトリで実行
claude --plugin-dir /path/to/flux/devflow
```

最優先: `/devflow:dev` で Phase 1-4 が正しく動くか確認（テスト 3）

### 2. GitHub アカウント・ディレクトリの移動

移動後に更新が必要な箇所:
- `devflow/.claude-plugin/plugin.json` — `homepage`, `repository`, `author.url`
- `devflow/DEVELOPMENT.md` — GitHub URL, 連絡先セクション
- `README.md` / `README.ja.md` — `/plugin marketplace add <owner>/flux`
- `devflow/README.md` / `devflow/README.ja.md` — インストール手順の owner 名
- `.claude-plugin/marketplace.json` — `owner`
- Anthropic 公式ディレクトリ / ClaudePluginHub の登録情報

### 3. クリーンアップ

テスト・移動が完了したら `HANDOFF.md` と `WIP.md` を削除。
