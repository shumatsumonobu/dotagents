# Contributing

> 最終更新: 2026-03-10

DevFlow の開発者および Claude Code セッション向けの内部情報。
ユーザー向けドキュメントは [README.md](plugins/devflow/README.md) / [README.ja.md](plugins/devflow/README.ja.md) を参照。

## プロジェクト構造

```
claude/                                    # マーケットプレイスリポジトリ
├── .claude-plugin/
│   └── marketplace.json                 # マーケットプレイスカタログ
├── plugins/
│   └── devflow/                         # DevFlow プラグイン
│       ├── .claude-plugin/
│       │   └── plugin.json              # プラグインマニフェスト
│       ├── agents/                      # 6つの専門エージェント
│       │   ├── explorer.md              # 分析 - コードベース分析、実行パストレース
│       │   ├── planner.md               # 設計 - アーキテクチャ候補、影響範囲分析
│       │   ├── coder.md                 # 実装 - 多言語対応
│       │   ├── tester.md                # テスト - 自動検出、テスト実行
│       │   ├── reviewer.md              # レビュー - 信頼度スコアリング付き
│       │   └── documenter.md            # ドキュメント - README、API仕様書
│       ├── commands/                    # カスタムスラッシュコマンド
│       │   ├── dev.md                   # /devflow:dev - PM ワークフロー（9フェーズ）
│       │   ├── explore.md               # /devflow:explore - コードベース分析
│       │   ├── history.md               # /devflow:history - セッション履歴参照
│       │   ├── design.md                # /devflow:design - 設計作成
│       │   ├── review.md                # /devflow:review - コードレビュー
│       │   ├── test.md                  # /devflow:test - テスト実行
│       │   └── docs.md                  # /devflow:docs - ドキュメント生成
│       ├── hooks/
│       │   └── hooks.json               # SubagentStart/Stop 通知フック
│       ├── scripts/
│       │   └── notify.js                # エージェント開始・終了の通知スクリプト
│       ├── CHANGELOG.md / CHANGELOG.ja.md
│       └── README.md / README.ja.md
├── CONTRIBUTING.md                      # このファイル
├── LICENSE
├── README.md / README.ja.md
└── WIP.md
```

**plugin.json**: `agents`, `commands`, `hooks` のパスを明示的に記載。自動検出も可能だが、何が含まれるか一目でわかるように明示する方針

## 設計上の重要なポイント

- **フラット階層**: `/devflow:dev` がメインコンテキストで直接ヒアリングし、Task ツールで全エージェントを起動。全サブエージェントが1階層目 → SubagentStart/Stop フックが全て発火する（公式 feature-dev と同じパターン）
- **並列実行**: 各サブエージェントは別コンテキストで動作。メイン会話は最終結果のみ受け取る → コンテキストウィンドウ効率化
- **読み取り専用エージェント**: explorer は Read/Glob/Grep のみ。reviewer は disallowedTools: Edit
- **AskUserQuestion**: 開発モード選択（Phase 1）、アーキテクチャ選択（Phase 4）、レビュー対応選択（Phase 7）でクリック選択UIを使用
- **コンパクション復帰**: `.devflow/session.md` + `.devflow/research.md` + `docs/DESIGN.md` の3ファイルで全文脈を復帰
- **セッション永続化**: PM のみが `.devflow/` 配下に書き込む。サブエージェントとの競合なし

## 公式ドキュメントとの整合性

[サブエージェント公式ドキュメント](https://code.claude.com/docs/en/sub-agents) と照合:

- **使用中のフィールド**: `name`, `description`, `tools`, `disallowedTools`, `permissionMode`, `model`, `color`, `memory`, `maxTurns` — すべて公式仕様通り
- **`permissionMode`**: サブエージェント5つに `acceptEdits` を設定。explorer は読み取り専用のため不要
- **`skills` フィールド**: 将来的にコーディング規約スキルを coder にプリロードする用途で検討
- **フラット階層の理由**: ネストされたサブエージェントは SubagentStart/Stop フックが発火しない。公式 [feature-dev](https://github.com/anthropics/claude-code/tree/main/plugins/feature-dev) も同じパターン
- **エージェントチーム不採用の理由**: (1) 実験的で不安定 (2) ワークフローが直列でエージェント間通信不要 (3) トークンコスト増大 (4) セッション再開不可 (5) split pane が tmux/iTerm2 依存

## 開発ガイドライン

### 新機能を追加する場合

1. `agents/` のエージェントマークダウンを修正
2. `CHANGELOG.md` の `[Unreleased]` セクションに追加
3. README.md と README.ja.md の両方を更新
4. `claude --plugin-dir ./plugins/devflow` でローカルテスト
5. セマンティックバージョニングに従ってバージョンアップ

### エージェントマークダウンの構造

```markdown
---
name: agent-name
description: "短い説明"
tools: Read, Edit, Write, Bash, Glob, Grep
disallowedTools: Edit  # 必要に応じて
permissionMode: acceptEdits  # サブエージェントのみ
model: sonnet
color: yellow  # blue/green/yellow/cyan/red/magenta
memory: project
maxTurns: 50
---
You are a [role].

## Session Context
## Role
## Workflow
## Notes
## Memory Management
```

**見出しルール**: `##` をメインの区切りに使用。`###` は長いエージェント（300行超）のみ。短いエージェントでは `**太字**` でサブセクション区切り

### カスタムコマンド

- 命名規則: `/devflow:*`
- エージェント呼び出し: `@devflow:agent-name`
- 引数: `argument-hint` でサポート。`$ARGUMENTS` がなくても末尾に `ARGUMENTS: <value>` が自動付与（[公式](https://code.claude.com/docs/en/skills#pass-arguments-to-skills)）

### フック

`hooks.json` は SubagentStart/Stop イベントを定義:
- 公式フォーマット: `[{ hooks: [{ type, command }] }]`
- `${CLAUDE_PLUGIN_ROOT}` でプラグインルートを参照
- スクリプトは Node.js の `process.stdin` でクロスプラットフォーム対応

### コミットガイドライン

- コミットメッセージは英語、Conventional Commits
- コミットは手動で行う

## 動作確認

### ローカルでの実行方法

claude リポジトリとは別の小さなプロジェクト（既存 or 新規）を用意し、`--plugin-dir` で直接読み込む:

```bash
claude --plugin-dir /path/to/claude/plugins/devflow
```

マーケットプレイス経由のインストールは不要。ソースを修正したら Claude Code を再起動するだけで反映される。

### テスト手順

**必須: Dev コマンド（Phase 1-4）**

```
/devflow:dev hello エンドポイントを追加
```

Phase 1: Discovery
- [ ] 1回の応答で質問が最大2つまで
- [ ] 開発モード選択が AskUserQuestion（クリック選択UI）で表示される
- [ ] `.devflow/session.md` が正しい構造で作成される（Development Mode, Project, Requirements, Expected Outputs, Progress）

Phase 2: Codebase Exploration
- [ ] 新規プロジェクトではスキップされる
- [ ] 既存プロジェクトでは 2-3 個の explorer が並列起動
- [ ] `.devflow/research.md` が作成される

Phase 3: Clarifying Questions
- [ ] スキップされない（必須フェーズ）
- [ ] session.md の Decisions に Q&A が追記される

Phase 4: Architecture Design
- [ ] `docs/DESIGN.md` に Architecture Candidates（3案 + Pros/Cons + Recommendation）
- [ ] アーキテクチャ選択が AskUserQuestion で表示される
- [ ] session.md の Decisions と Parallel Plan が更新される

**オプション: Phase 5-9（モード4 で最速確認）**
- [ ] Phase 5: coder が起動しコードが実装される
- [ ] Phase 8: documenter が起動し README.md が作成される
- [ ] Phase 9: `.devflow/history/` にセッションがアーカイブされる

**オプション: 個別コマンド**

```
/devflow:history
/devflow:explore 認証フロー
/devflow:design ヘルスチェックエンドポイントを追加
/devflow:review
/devflow:test
/devflow:docs
```

**オプション: セッション継続**

Dev コマンド実行後、同じプロジェクトで再度 `/devflow:dev` を実行:
- [ ] 未完了セッション検出 → 「継続 / 新規」の AskUserQuestion
- [ ] 継続: 最後に完了したフェーズから再開
- [ ] 新規: session.md + research.md を削除して Phase 1 から

### チェックリスト（ドキュメント出力）

- [ ] `docs/DESIGN.md` がアプリの設計情報のみ（ワークフロー情報を含まない）
- [ ] `docs/TEST_REPORT.md` が 100行以内
- [ ] `docs/REVIEW.md` が 200行以内、各指摘に [Confidence: XX] と file:line 参照
- [ ] README.md と DESIGN.md の内容が重複していない
- [ ] Expected Outputs に載っていないドキュメントが生成されない

## 掲載・提出状況

| 提出先 | 状態 |
|-------|------|
| [Anthropic 公式ディレクトリ](https://github.com/anthropics/claude-plugins-official) | 審査待ち |
| [ClaudePluginHub](https://www.claudepluginhub.com/) | 反映待ち（手動登録リクエスト済み） |
