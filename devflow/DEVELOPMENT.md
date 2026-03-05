# DevFlow - 開発ガイド

> 最終更新: 2026-02-23

DevFlow の開発者および Claude Code セッション向けのコンテキスト情報

## プロジェクト概要

**DevFlow** は、6つの専門エージェントと PM コマンドを使って開発ワークフローを自動化する Claude Code プラグイン。PM のように段階的に要件を深掘りし、コードベース分析・設計・実装・テスト・レビュー・ドキュメントを9フェーズのパイプラインで実行する

**マーケットプレイス**: [Flux](https://github.com/shumatsumonobu/flux)

### 主要機能
- **PM的なヒアリング**: `/devflow:dev` コマンドが段階的な質問で要件を深掘り
- **コードベース分析**: explorer エージェントが既存コードを分析し、設計の根拠を提供
- **アーキテクチャ候補**: planner が3案を Pros/Cons 付きで提案、ユーザーが選択
- **信頼度スコアリング**: reviewer が信頼度 >= 75 の指摘のみ報告（量より質）
- **多言語対応**: TypeScript/JavaScript、Python、Go、Rust をサポート
- **並列実行**: coder x N + tester を並列で実行（coder の数はタスクに応じて動的に決定）
- **セッション永続化**: `.devflow/session.md` に全状態を保存。コンテキスト圧縮後も自動復帰
- **セッション履歴**: 完了セッションを `.devflow/history/` にアーカイブ
- **セキュリティチェック**: XSS、SQLインジェクション、コマンドインジェクションを検出
- **メモリ管理**: プロジェクトスコープで知識を永続化

### インストール
```
/plugin marketplace add shumatsumonobu/flux
/plugin install devflow@flux

# 確認
/agents
/devflow:dev
```

## リポジトリ

[flux](https://github.com/shumatsumonobu/flux) の `/devflow/` ディレクトリが唯一のソース。マーケットプレイス経由で配布する

## プロジェクト構造

```
flux/                                # マーケットプレイスリポジトリ
├── .claude-plugin/
│   └── marketplace.json             # マーケットプレイスカタログ (name: "flux")
├── devflow/                         # DevFlow プラグイン
│   ├── .claude-plugin/
│   │   └── plugin.json              # プラグインマニフェスト
│   ├── agents/                      # 6つの専門エージェント
│   │   ├── explorer.md              # 分析担当 - コードベース分析、実行パストレース
│   │   ├── planner.md               # 設計担当 - アーキテクチャ候補、影響範囲分析
│   │   ├── coder.md                 # 実装担当 - 多言語対応実装
│   │   ├── tester.md                # テスト担当 - 自動検出、テスト実行
│   │   ├── reviewer.md              # レビュー担当 - 信頼度スコアリング付き品質・セキュリティチェック
│   │   └── documenter.md            # ドキュメント担当 - README、API仕様書
│   ├── commands/                    # カスタムスラッシュコマンド
│   │   ├── dev.md                   # /devflow:dev - PM ワークフロー（9フェーズ）
│   │   ├── explore.md               # /devflow:explore - コードベース分析
│   │   ├── history.md               # /devflow:history - セッション履歴参照
│   │   ├── design.md                # /devflow:design - 設計作成
│   │   ├── review.md                # /devflow:review - コードレビュー
│   │   ├── test.md                  # /devflow:test - テスト実行
│   │   └── docs.md                  # /devflow:docs - ドキュメント生成
│   ├── hooks/
│   │   └── hooks.json               # SubagentStart/Stop 通知フック
│   ├── scripts/
│   │   └── notify.js                # エージェント開始・終了の通知スクリプト
│   ├── CHANGELOG.md
│   ├── CHANGELOG.ja.md
│   ├── DEVELOPMENT.md               # このファイル
│   ├── LICENSE
│   ├── README.md                    # 英語ドキュメント
│   ├── README.ja.md                 # 日本語ドキュメント
│   └── TESTING.md                   # 動作確認手順
├── LICENSE
├── README.md                        # マーケットプレイス概要（EN）
└── README.ja.md                     # マーケットプレイス概要（JP）
```

**plugin.json について**: `agents`, `commands`, `hooks` のパスを明示的に記載。デフォルトディレクトリは自動検出も可能だが、何が含まれるか一目でわかるように明示する方針

## エージェントアーキテクチャ

### 実行フロー（9フェーズ）

```
/devflow:dev (PM役 — メインコンテキストで実行)
  ├── Phase 1: Discovery — 段階的な要件ヒアリング → .devflow/session.md を作成
  ├── Phase 2: Codebase Exploration — explorer x 2-3 並列起動 → .devflow/research.md を作成
  ├── Phase 3: Clarifying Questions — 分析結果を踏まえた追加質問（スキップ不可）
  ├── Phase 4: Architecture Design — planner → docs/DESIGN.md（3案提示 → ユーザー選択）
  ├── Phase 5: Implementation — coder x N [+ tester Phase 1] 並列実行
  ├── Phase 6: Testing — tester Phase 2（テスト実行、最大3回リトライ）【オプション】
  ├── Phase 7: Quality Review — reviewer（信頼度スコアリング → ユーザー選択）【オプション】
  ├── Phase 8: Documentation — documenter → README.md 等
  └── Phase 9: Summary — 完了報告 + .devflow/history/ にアーカイブ
```

### 各エージェントの役割

| コンポーネント | 目的 | 成果物 | 備考 |
|---|---|---|---|
| **`/devflow:dev`** | 要件ヒアリング、ワークフロー管理 | `.devflow/session.md` | メインコンテキストで実行。全エージェントを Task ツールで起動 |
| **explorer** | コードベース分析（読み取り専用） | 分析レポート（PM経由で research.md に集約） | Read/Glob/Grep のみ。Write 不可 |
| **planner** | 設計作成、アーキテクチャ候補生成 | `docs/DESIGN.md` | 3案 + 推奨。並列実行推奨を返答テキストで伝達 |
| **coder** | 多言語対応の実装 | ソースコード | x N 並列実行可能 |
| **tester** | テスト自動検出・実行 | `docs/TEST_SPEC.md`、`docs/TEST_REPORT.md`、テストコード | Vitest/Jest/pytest/cargo test 等を自動検出 |
| **reviewer** | 品質・セキュリティレビュー | `docs/REVIEW.md` | **読み取り専用**（disallowedTools: Edit）。信頼度 >= 75 のみ報告 |
| **documenter** | ドキュメント生成・更新 | README, API仕様書 | **ソースコード変更不可**（.md, .yaml のみ編集） |

### 出力ファイル構成

```
プロジェクトルート/
  README.md                          <- documenter
  docs/
    DESIGN.md                        <- planner
    TEST_SPEC.md                     <- tester
    TEST_REPORT.md                   <- tester
    REVIEW.md                        <- reviewer
    ARCHITECTURE.md                  <- documenter（条件付き）
    API.md                           <- documenter（条件付き）

.devflow/
  session.md                         <- PM（セッション状態 + 全決定事項）
  research.md                        <- PM（explorer 分析結果を集約）
  history/
    YYYY-MM-DD-HHmm-{要約タイトル}/
      session.md                     <- session.md のコピー
      design.md                      <- docs/DESIGN.md のコピー
```

### 設計上の重要なポイント

- **フラット階層**: `/devflow:dev` コマンドがメインコンテキストで直接ヒアリングし、Task ツールで全エージェントを起動する。全サブエージェントが1階層目になるため、SubagentStart/Stop フックが全て発火する（公式 feature-dev プラグインと同じパターン）
- **並列実行**: 各サブエージェントは別コンテキストで動作。メイン会話は最終結果のみ受け取るため、コンテキストウィンドウを効率的に使える
- **読み取り専用エージェント**: explorer と reviewer はソースコードを変更しない設計。explorer は Read/Glob/Grep のみ。reviewer は disallowedTools: Edit
- **AskUserQuestion**: 開発モード選択（Phase 1）、アーキテクチャ選択（Phase 4）、レビュー対応選択（Phase 7）でクリック選択UIを使用
- **開発モード**: ヒアリング時に4つのモードから選択可能。テスト・レビューを個別にオプション化（documenter は常に実行）
- **コンパクション復帰**: `.devflow/session.md` + `.devflow/research.md` + `docs/DESIGN.md` の3ファイルで全文脈を復帰
- **セッション永続化**: PM のみが `.devflow/` 配下のファイルに書き込む。サブエージェントとの競合なし
- **セッション履歴**: Phase 9 完了時に `.devflow/history/YYYY-MM-DD-HHmm-{タイトル}/` にアーカイブ。`/devflow:history` で検索可能

### 公式ドキュメントとの整合性（調査メモ）

[サブエージェント公式ドキュメント](https://code.claude.com/docs/en/sub-agents) と照合した結果:

- **使用中のフィールド**: `name`, `description`, `tools`, `disallowedTools`, `permissionMode`, `model`, `color`, `memory`, `maxTurns` — すべて公式仕様通り
- **`permissionMode`**: サブエージェント5つ（planner, coder, tester, reviewer, documenter）に `acceptEdits` を設定。explorer は読み取り専用のため不要
- **`skills` フィールド**: スキルをサブエージェントに事前ロード可能。将来的にコーディング規約スキルを coder にプリロードする用途で検討
- **フラット階層の理由**: ネストされたサブエージェント（サブエージェントが Task で起動したサブエージェント）は SubagentStart/Stop フックが発火しない。コマンドから直接 Task で起動すれば全サブエージェントが1階層目となり、フックが正常に動作する。公式 [feature-dev プラグイン](https://github.com/anthropics/claude-code/tree/main/plugins/feature-dev) も同じパターンを採用
- **エージェントチーム**（[公式ドキュメント](https://code.claude.com/docs/en/agent-teams)）: 複数の Claude Code インスタンスがメッセージで直接会話・協調する仕組み。実験的機能（`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` 必須）。DevFlow は現行のサブエージェント方式で十分なため不採用。理由: (1) 実験的で不安定 (2) ワークフローが直列でエージェント間通信不要 (3) トークンコストが大幅に増加 (4) セッション再開不可 (5) split pane が tmux/iTerm2 依存。安定化後に並列レビュー（セキュリティ/パフォーマンス/テスト）等で検討

## 開発ガイドライン

### 新機能を追加する場合

1. `agents/` のエージェントマークダウンファイルを修正
2. `CHANGELOG.md` の `[Unreleased]` セクションに追加
3. README.md と README.ja.md の両方を更新
4. `claude --plugin-dir ./devflow` でローカルテスト（下記チェックリスト参照）
5. セマンティックバージョニングに従ってバージョンアップ

### 動作確認チェックリスト

ローカルテスト時に以下を確認する。全項目を毎回チェックする必要はなく、変更に関連する項目を選んで確認する

#### ワークフロー
- [ ] モード1（フル開発）で Phase 1-9 が順に動くか
- [ ] モード4（テスト・レビューなし）で Phase 6/7 がスキップされるか
- [ ] `.devflow/session.md` にモード、要件、決定事項、進捗が正しく保存されるか
- [ ] セッション継続判定: 未完了セッションで AskUserQuestion が表示されるか
- [ ] Phase 2: explorer エージェントが起動し、`.devflow/research.md` が作成されるか
- [ ] Phase 3: スキップされずに追加質問が来るか
- [ ] Phase 4: アーキテクチャ候補が3案提示され、AskUserQuestion で選択できるか
- [ ] Phase 7: 信頼度スコア付きの指摘が表示され、対応を選択できるか
- [ ] Phase 9: `.devflow/history/` にセッションがアーカイブされるか

#### ドキュメント出力
- [ ] `docs/DESIGN.md` がアプリの設計情報のみで、エージェントのワークフロー情報を含まないか
- [ ] `docs/DESIGN.md` に Architecture Candidates（3案 + Recommendation）が含まれるか
- [ ] `docs/TEST_SPEC.md` が Phase 1 で生成されるか
- [ ] `docs/TEST_REPORT.md` が 100行以内か
- [ ] `docs/REVIEW.md` が 200行以内か。各指摘に [Confidence: XX] と file:line 参照があるか
- [ ] README.md と DESIGN.md の内容が重複していないか
- [ ] CLI プロジェクトで API仕様書が生成されないか
- [ ] 単一モジュールのプロジェクトで ARCHITECTURE.md が生成されないか
- [ ] Expected Outputs に載っていないドキュメントが生成されないか

### エージェントマークダウンの構造

```markdown
---
name: agent-name
description: "エージェントの短い説明"
tools: Read, Edit, Write, Bash, Glob, Grep
disallowedTools: Edit  # 必要に応じて
permissionMode: acceptEdits  # サブエージェントのみ
model: sonnet
color: yellow  # blue/green/yellow/cyan/red/magenta
memory: project
maxTurns: 50  # 役割に応じて調整
---
You are a [role].

## Session Context
[Read .devflow/session.md for context]

## Role
[What this agent does]

## Workflow
[Step-by-step process]

## Notes
[Special considerations, constraints]

## Memory Management
[What to record in memory after completion]
```

**見出しルール**: `##` をメインの区切りに使用。`###` は長いエージェント（300行超）で順序ステップを示す場合のみ。短いエージェントでは `**太字**` でサブセクションを区切る

### カスタムコマンド

`commands/` のコマンドはエージェントを直接呼び出す:
- 命名規則: `/devflow:*`
- エージェント呼び出し: `@devflow:agent-name`
- 引数の受け渡し: `argument-hint` で引数をサポート。skill 本文に `$ARGUMENTS` がなくても、ユーザーの入力は末尾に `ARGUMENTS: <value>` として自動付与される（[公式ドキュメント](https://code.claude.com/docs/en/skills#pass-arguments-to-skills)）

### フック

`hooks.json` は SubagentStart/Stop イベントを定義:
- エージェントの開始・終了を `scripts/notify.js` で通知
- 公式フォーマット: `[{ hooks: [{ type, command }] }]`
- `${CLAUDE_PLUGIN_ROOT}` でプラグインルートを参照
- スクリプトは Node.js の `process.stdin` でクロスプラットフォーム対応

## コミットガイドライン

- コミットは手動で行う（"Co-Authored-By: Claude" の記載なし）
- コミットメッセージは英語
- Conventional Commits に従う

## 今後の開発予定

`CHANGELOG.md` → `[Unreleased]` セクションを参照

## トラブルシューティング

### インストール後に `/agents` にエージェントが表示されない

プラグインのホットリロードは未実装（[#18174](https://github.com/anthropics/claude-code/issues/18174), [#6497](https://github.com/anthropics/claude-code/issues/6497)）。インストール後は **Claude Code を再起動** する必要がある

```
/plugin install devflow@flux
→ Claude Code を終了して再起動
→ /agents で確認
```

### インストール時にバリデーションエラーが出る

`agents: Invalid input` や `commands: Invalid input` が出る場合、以下を順番に試す

1. **キャッシュクリア** — Claude Code のプラグインキャッシュは自動無効化されない既知バグがある（[#14061](https://github.com/anthropics/claude-code/issues/14061), [#16866](https://github.com/anthropics/claude-code/issues/16866)）
   ```bash
   rm -rf ~/.claude/plugins/cache/
   cd ~/.claude/plugins/marketplaces/flux && git pull
   /plugin install devflow@flux
   ```
2. **マーケットプレイスの名前衝突を確認** — 同名プラグインが別マーケットプレイスにあると、そちらが優先されることがある
   ```bash
   cat ~/.claude/plugins/known_marketplaces.json
   /plugin marketplace remove <古いマーケットプレイス名>
   ```
3. **マーケットプレイスの再登録**
   ```bash
   /plugin marketplace remove flux
   /plugin marketplace add shumatsumonobu/flux
   rm -rf ~/.claude/plugins/cache/
   /plugin install devflow@flux
   ```

## 掲載・提出状況

| 提出先 | 方法 | 状態 | URL |
|-------|------|------|-----|
| [Anthropic 公式ディレクトリ](https://github.com/anthropics/claude-plugins-official) | フォーム提出 | 審査待ち | フォーム経由のため追跡URLなし |
| [ClaudePluginHub](https://www.claudepluginhub.com/) (11,000+ plugins) | 自動スキャン + フィードバック送信 | 反映待ち | GitHub 検索インデックス未登録のため手動登録をリクエスト済み |

## 関連リソース

- [プラグインドキュメント](https://code.claude.com/docs/ja/plugins)
- [プラグインリファレンス](https://code.claude.com/docs/ja/plugins-reference)
- [サブエージェント](https://code.claude.com/docs/en/sub-agents)
- [エージェントシステム](https://code.claude.com/docs/ja/agents)
- [マーケットプレイス](https://code.claude.com/docs/ja/plugin-marketplaces)

## 連絡先

- **著者**: shumatsumonobu
- **GitHub**: https://github.com/shumatsumonobu
- **X**: https://x.com/shumatsumonobu
- **リポジトリ**: https://github.com/shumatsumonobu/flux
