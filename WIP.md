# WIP - 作業再開ガイド

## 現在の状態

リポジトリ名変更 (`claude` → `dotagents`) 完了。全ファイルの参照更新済み（未コミット）。

## 次の作業

### 1. リネーム関連の変更をコミット・プッシュ

未コミット:
- `README.md`（ルート）— タイトル・description・インストールコマンド更新
- `.claude-plugin/marketplace.json` — name・description 更新
- `plugins/devflow/README.md` — インストール/アンインストール/更新コマンド更新
- `plugins/devflow/.claude-plugin/plugin.json` — homepage・repository URL 更新
- `plugins/devflow/CHANGELOG.md` — リネーム履歴更新

### 2. 新ディレクトリ構造の作成

`skills/` と `agents/` をルートに追加（スタンドアロン用）

### 3. DevFlow v2.0 のテスト

テスト手順: [CONTRIBUTING.md](CONTRIBUTING.md) の「動作確認」セクション

```bash
claude --plugin-dir /path/to/dotagents/plugins/devflow
```

最優先: `/devflow:dev` で Phase 1-4 が正しく動くか確認

### 4. 掲載情報の更新

リポ名変更後、以下の登録情報を更新する可能性あり:
- Anthropic 公式ディレクトリ
- ClaudePluginHub
