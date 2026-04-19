# Contributing

> 最終更新: 2026-04-19

dotagents の開発者および Claude Code セッション向けの内部情報。ユーザー向けドキュメントは各プラグインの README を参照。

## プロジェクト構造

```
dotagents/                                 # マーケットプレイスリポジトリ
├── .claude-plugin/
│   └── marketplace.json                 # マーケットプレイスカタログ
├── plugins/
│   ├── devflow/                         # DevFlow プラグイン
│   └── design-docs/                     # design-docs プラグイン
├── CONTRIBUTING.md                      # このファイル
├── LICENSE
├── README.md
└── WIP.md
```

各プラグインは自己完結した配布単位。独立したバージョン管理・CHANGELOG を持つ。

## 共通の開発ガイドライン

### 新機能を追加する場合

1. 対象プラグインの該当ファイル（エージェント/スキル/ルール等）を修正
2. プラグインの `CHANGELOG.md` を更新
3. プラグインの README.md を更新（ユーザー影響がある場合）
4. `claude --plugin-dir ./plugins/{plugin-name}` でローカルテスト
5. セマンティックバージョニングに従ってバージョンアップ

### ローカルでの実行方法

マーケットプレイス経由のインストールは不要。ソース修正後に Claude Code を再起動すれば反映:

```bash
claude --plugin-dir /path/to/dotagents/plugins/{plugin-name}
```

### コミットガイドライン

- コミットメッセージは英語、Conventional Commits
- コミットは手動で行う
- Co-Authored-By は付けない

## プラグイン: devflow

### ディレクトリ構造

```
plugins/devflow/
├── .claude-plugin/
│   └── plugin.json                     # プラグインマニフェスト
├── agents/                             # 6つの専門エージェント
│   ├── explorer.md                     # 分析 - コードベース分析、実行パストレース
│   ├── planner.md                      # 設計 - アーキテクチャ候補、影響範囲分析
│   ├── coder.md                        # 実装 - 多言語対応
│   ├── tester.md                       # テスト - 自動検出、テスト実行
│   ├── reviewer.md                     # レビュー - 信頼度スコアリング付き
│   └── documenter.md                   # ドキュメント - README、API仕様書
├── commands/                           # カスタムスラッシュコマンド
│   ├── dev.md                          # /devflow:dev - PM ワークフロー（9フェーズ）
│   ├── explore.md                      # /devflow:explore - コードベース分析
│   ├── history.md                      # /devflow:history - セッション履歴参照
│   ├── design.md                       # /devflow:design - 設計作成
│   ├── review.md                       # /devflow:review - コードレビュー
│   ├── test.md                         # /devflow:test - テスト実行
│   └── docs.md                         # /devflow:docs - ドキュメント生成
├── hooks/
│   └── hooks.json                      # SubagentStart/Stop 通知フック
├── scripts/
│   └── notify.js                       # エージェント開始・終了の通知スクリプト
├── CHANGELOG.md
└── README.md
```

**plugin.json**: `agents`, `commands`, `hooks` のパスを明示的に記載。自動検出も可能だが、何が含まれるか一目でわかるように明示する方針

### 設計上の重要なポイント

- **フラット階層**: `/devflow:dev` がメインコンテキストで直接ヒアリングし、Task ツールで全エージェントを起動。全サブエージェントが1階層目 → SubagentStart/Stop フックが全て発火する（公式 feature-dev と同じパターン）
- **並列実行**: 各サブエージェントは別コンテキストで動作。メイン会話は最終結果のみ受け取る → コンテキストウィンドウ効率化
- **読み取り専用エージェント**: explorer は Read/Glob/Grep のみ。reviewer は disallowedTools: Edit
- **AskUserQuestion**: 開発モード選択（Phase 1）、アーキテクチャ選択（Phase 4）、レビュー対応選択（Phase 7）でクリック選択UIを使用
- **コンパクション復帰**: `.devflow/session.md` + `.devflow/research.md` + `docs/DESIGN.md` の3ファイルで全文脈を復帰
- **セッション永続化**: PM のみが `.devflow/` 配下に書き込む。サブエージェントとの競合なし

### 公式ドキュメントとの整合性

[サブエージェント公式ドキュメント](https://code.claude.com/docs/en/sub-agents) と照合:

- **使用中のフィールド**: `name`, `description`, `tools`, `disallowedTools`, `permissionMode`, `model`, `color`, `memory`, `maxTurns` — すべて公式仕様通り
- **`permissionMode`**: サブエージェント5つに `acceptEdits` を設定。explorer は読み取り専用のため不要
- **`skills` フィールド**: 将来的にコーディング規約スキルを coder にプリロードする用途で検討
- **フラット階層の理由**: ネストされたサブエージェントは SubagentStart/Stop フックが発火しない。公式 [feature-dev](https://github.com/anthropics/claude-code/tree/main/plugins/feature-dev) も同じパターン
- **エージェントチーム不採用の理由**: (1) 実験的で不安定 (2) ワークフローが直列でエージェント間通信不要 (3) トークンコスト増大 (4) セッション再開不可 (5) split pane が tmux/iTerm2 依存

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

## プラグイン: design-docs

### ディレクトリ構造

```
plugins/design-docs/
├── .claude-plugin/
│   └── plugin.json                     # プラグインマニフェスト
├── skills/                             # 5つのスキル
│   ├── init/SKILL.md                   # /design-docs:init - 5 Phase セットアップ
│   ├── generate/
│   │   ├── SKILL.md                    # /design-docs:generate - 設計書生成
│   │   └── templates/                  # 4テンプレート（api/screen/batch/module）
│   ├── sync/SKILL.md                   # /design-docs:sync - コード変更同期
│   ├── review/
│   │   ├── SKILL.md                    # /design-docs:review - 品質レビュー
│   │   └── rules/default.md            # 11 ライティングルール
│   └── explain/SKILL.md                # /design-docs:explain - Q&A
├── config/
│   └── config.example.md               # design-docs.config.md のサンプル
├── scripts/                            # Playwright スクリーンショット
│   ├── screenshot.js                   # フルページ撮影
│   ├── screenshot-element.js           # 要素切り出し
│   └── package.json
├── CHANGELOG.md
├── DESIGN.md                           # 設計書（開発者向け、日本語）
└── README.md
```

**plugin.json**: `skills` のパスを明示的に記載。

### 設計上の重要なポイント

- **パターン駆動（framework-agnostic）**: フレームワーク別パターンをハードコードしない。init がユーザーのプロジェクトから ast-grep パターンを推論し、`design-docs.knowledge.md` に保存
- **knowledge.md 限定**: ナレッジ蓄積は ast-grep パターンのみ。レビュー例外やカスタムルールは AI 判定依存で精度低下するため蓄積しない（業界の既知の失敗パターン）
- **サンプル確認 + マッチ結果確認**: init Phase 3/4 でユーザーが確認。パターンそのものではなく「検出されたエンドポイント一覧」を見せる
- **exact / approximate 分類**: review の検証項目を ✓（ast-grep）と ≈（AI判断）に分類して confidence を明示
- **sync の ast-grep diff**: detect-changes が Express の無名コールバックを拾わないため、knowledge.md のパターンを `git show` に対して実行して差分計算
- **段階的生成**: 複数設計書を一括生成しない。1つずつ承認を取りながら進める

### 必要な外部ツール

- `code-review-graph`: コード依存グラフ、blast radius 分析、コミュニティ検出
- `ast-grep`: AST ベースの構文パターンマッチ
- `playwright`（任意）: 画面テンプレートのワイヤーフレームスクリーンショット

### テスト手順

外部のテスト用プロジェクトで動作確認:

```bash
# テスト用プロジェクトを準備（例: shumatsumonobu/todo-app/）
cd /path/to/test-project
git init && npm install

# プラグインをロードして Claude Code 起動
claude --plugin-dir /path/to/dotagents/plugins/design-docs
```

**必須: init（5 Phase フロー）**

```
/design-docs:init
```

- [ ] Phase 1: 言語 / 出力先 / コード有無 / プロジェクト概要 の 4 問をヒアリング
- [ ] Phase 2（コードあり時）: 含まれるもの（API/画面/バッチ/モジュール）の multi-select
- [ ] Phase 3: サンプルファイルの自動検出結果をユーザー確認
- [ ] Phase 4: パターン推論 → マッチ結果（パターンそのものではなく）をユーザー確認
- [ ] Phase 5: config.md + knowledge.md 生成

**必須: generate**

```
/design-docs:generate {document-name}
```

- [ ] knowledge.md のパターンで情報抽出
- [ ] テンプレート（api/screen/batch/module）に従って生成
- [ ] 画面テンプレートの場合はワイヤーフレーム画像も生成（Playwright 必須）
- [ ] ユーザー承認後に書き出し

**必須: sync（コード変更時）**

```
/design-docs:sync {document-name}
```

- [ ] detect-changes で影響範囲特定
- [ ] git diff で変更内容取得
- [ ] knowledge.md のパターンで HEAD vs base commit の差分計算 → 新規/削除エンドポイント検出
- [ ] 更新提案を出力 → ユーザー承認後に編集

**必須: review**

```
/design-docs:review {document-name}
```

- [ ] テンプレート構造チェック
- [ ] 11 ルールチェック（1-4 常時 / 5-11 コードあり時）
- [ ] ソース照合（✓ exact / ≈ approximate で分類）

**必須: explain**

```
/design-docs:explain {question}
```

- [ ] 関連設計書の特定
- [ ] code-review-graph で依存コード追跡（コードあり時）
- [ ] mermaid 図付きで回答

## 掲載・提出状況

| 提出先 | 状態 |
|-------|------|
| [Anthropic 公式ディレクトリ](https://github.com/anthropics/claude-plugins-official) | 審査待ち |
| [ClaudePluginHub](https://www.claudepluginhub.com/) | 反映待ち（手動登録リクエスト済み） |
