# WIP - 作業再開ガイド

## 現在の状態

リポジトリ名変更 (`flux` → `claude`) 完了。全ファイルの参照更新・プッシュ済み。
README 4ファイルをリライト済み（未コミット）。

## 次の作業

### 1. README リライトをコミット・プッシュ

未コミット:
- `README.md`（ルート）
- `plugins/devflow/README.md`
- 日本語版ドキュメント削除（`*.ja.md`）
- CONTRIBUTING.md / CHANGELOG.md の日本語版参照除去

### 2. DevFlow v2.0 のテスト

テスト手順: [CONTRIBUTING.md](CONTRIBUTING.md) の「動作確認」セクション

```bash
claude --plugin-dir /path/to/claude/plugins/devflow
```

最優先: `/devflow:dev` で Phase 1-4 が正しく動くか確認

### 3. 掲載情報の更新

リポ名変更後、以下の登録情報を更新する可能性あり:
- Anthropic 公式ディレクトリ
- ClaudePluginHub
