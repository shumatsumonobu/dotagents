# design-docs 実装計画

> DESIGN.md の設計に基づく実装タスク。各タスクに status を付けて進捗管理する。

## ステータス凡例

- `[ ]` 未着手
- `[~]` 作業中
- `[x]` 完了

---

## Phase 1: ディレクトリ構成 + TODOアプリ + Playwrightスクリプト

基盤を全て先に作る。並行作業可能。

### 1.1 プラグインマニフェストとディレクトリ構成 `[x]`

- [ ] `.claude-plugin/plugin.json` 作成
- [ ] skills/ 配下の全ディレクトリ作成（init, generate, sync, review, explain）
- [ ] config/ ディレクトリ作成
- [ ] scripts/ ディレクトリ作成
- [ ] examples/ ディレクトリ作成

### 1.2 examples/todo-app の作成 `[x]`

スキルのテストに使う実際に動くExpressアプリ。全テンプレート種別（api, screen, batch, module）をテストできる構成。

- [ ] package.json（express, sequelize, sqlite3）
- [ ] src/routes/todos.js — CRUD API（apiテンプレートのメインテスト用）
- [ ] src/routes/users.js — 認証API（複数APIのテスト用）
- [ ] src/services/TodoService.js — ビジネスロジック
- [ ] src/models/Todo.js — Sequelizeモデル
- [ ] src/models/User.js — Sequelizeモデル
- [ ] src/middleware/auth.js — 認証ミドルウェア
- [ ] src/pages/dashboard.html — 画面（screenテンプレートのテスト用）
- [ ] src/batch/cleanup.js — 古いTODO削除バッチ（batchテンプレートのテスト用）
- [ ] src/utils/logger.js — ロガー（moduleテンプレートのテスト用）
- [ ] app.js — エントリポイント
- [ ] `npm start` で起動確認

### 1.3 Playwrightスクリプト `[x]`

generateのscreenテンプレートテスト（Phase 3）で必要なため先に作る。

- [ ] scripts/screenshot.js（フルページ撮影、1440×900）
- [ ] scripts/screenshot-element.js（.card要素切り出し）
- [ ] scripts/package.json（playwright依存）
- [ ] todo-appのdashboard.htmlで撮影テスト

---

## Phase 2: OSSツールのインストールとCLI出力確認

todo-appを使って実際のCLI出力を確認する。

### 2.1 インストール `[x]`

- [ ] `pip install code-review-graph[communities]`
- [ ] `npm install -g @ast-grep/cli`

### 2.2 code-review-graph CLI確認 `[x]`

todo-appディレクトリで実行:

- [ ] `code-review-graph build` → グラフ構築の出力確認
- [ ] `code-review-graph status` → 統計出力の確認
- [ ] `code-review-graph wiki` → コミュニティ検出結果の出力フォーマット確認
- [ ] `code-review-graph detect-changes` → 影響分析の出力フォーマット確認
- [ ] 出力フォーマットが期待通りでない場合、DESIGN.md に反映（SQLite直接クエリ等）

### 2.3 ast-grep CLI確認 `[x]`

todo-appディレクトリで実行:

- [ ] `sg --pattern 'router.$METHOD($PATH, $$$)' --lang js --json=compact` → エンドポイント抽出確認
- [ ] `sg --pattern 'async function $NAME($$$) { $$$ }' --lang js --json=compact` → 関数シグネチャ抽出確認
- [ ] JSON出力のフィールド構造を確認

---

## Phase 3: テンプレート・ルール・設定サンプル

### 3.1 テンプレート作成 `[x]`

DESIGN.md「各テンプレートの段落構成」に従って作成。

- [ ] skills/generate/templates/api.md
- [ ] skills/generate/templates/screen.md
- [ ] skills/generate/templates/batch.md
- [ ] skills/generate/templates/module.md

### 3.2 ルール作成 `[x]`

DESIGN.md「ルール」セクション（11項目、常に適用4 + コードありのみ7）を落とし込む。

- [ ] skills/review/rules/default.md

### 3.3 設定ファイルサンプル `[x]`

- [ ] config/config.example.md（コードあり/なし両方のサンプル）

---

## Phase 4: 5スキルの実装

各SKILL.mdにfrontmatter（name, description, allowed-tools, disable-model-invocation）+ Iron Law + 手順を記述。

### 4.1 init スキル `[x]`

- [ ] skills/init/SKILL.md
- [ ] todo-appで実行テスト → config.md が正しく生成されるか

### 4.2 generate スキル `[x]`

- [ ] skills/generate/SKILL.md（情報収集ガイドラインを含む）
- [ ] テスト: todos-api.md（apiテンプレート、メインCRUD）が生成されるか
- [ ] テスト: user-api.md（apiテンプレート、認証）が生成されるか
- [ ] テスト: dashboard.md（screenテンプレート、ワイヤーフレーム含む）が生成されるか
- [ ] テスト: cleanup.md（batchテンプレート）が生成されるか
- [ ] テスト: logger.md（moduleテンプレート）が生成されるか

### 4.3 sync スキル `[x]`

- [ ] skills/sync/SKILL.md
- [ ] テストシナリオ: todos.js に `PATCH /todos/:id/toggle` エンドポイントを追加 → sync実行 → API一覧と処理フローの更新が提案されるか
- [ ] テストシナリオ: TodoService.js のバリデーションロジックを変更 → sync実行 → リクエストパラメータの更新が提案されるか
- [ ] テストシナリオ: logger.js にコメント追加のみ → sync実行 → 「影響なし」と判定されるか

### 4.4 review スキル `[x]`

- [ ] skills/review/SKILL.md
- [ ] テスト: 生成したtodos-api.mdに対してreview → チェックリストが正しく出力されるか
- [ ] テスト: 意図的にルール違反（敬語混入、テーブル.カラム未記載）を入れた設計書 → 検出されるか

### 4.5 explain スキル `[x]`

- [ ] skills/explain/SKILL.md
- [ ] テスト: 「TODOのCRUDはどう動く？」→ 設計書+ソースから回答されるか
- [ ] テスト: 「認証の仕組みは？」→ user-api.md + auth.js から回答されるか

---

## Phase 5: ドキュメントとリリース

### 5.1 README.md `[ ]`

- [ ] 概要（Webアプリ向けと明記）
- [ ] デモ（todo-appでinit → generate → syncの流れ）
- [ ] セットアップ手順
- [ ] 各コマンドの使い方
- [ ] 設定ファイルの書き方
- [ ] テンプレートとルールのカスタマイズ方法

### 5.2 CHANGELOG.md `[ ]`

- [ ] v1.0.0 初版

### 5.3 最終チェック `[ ]`

- [ ] 特定プロジェクト固有情報の漏洩チェック（grep で顧客名・内部URL・固有テーブル名）
- [ ] 全5コマンドがtodo-appで動作確認済み
- [ ] READMEの手順通りにセットアップできるか確認

### 5.4 Git push `[ ]`

- [ ] `git add` → `git commit -m "feat: add design-docs plugin"` → `git push`

---

## 依存関係

```
Phase 1（ディレクトリ + TODOアプリ + Playwright）
  ↓
Phase 2（OSSツール確認 ← todo-appが必要）
  ↓
Phase 3（テンプレート/ルール ← Phase 2のCLI確認結果でDESIGN.md修正の可能性）
  ↓
Phase 4（スキル実装 ← テンプレート/ルール/CLI確認結果が必要）
  ↓
Phase 5（ドキュメント/リリース）
```

**並行可能:**
- Phase 1 内の 1.1, 1.2, 1.3 は互いに独立
- Phase 3 内の 3.1, 3.2, 3.3 は互いに独立
