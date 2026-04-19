# design-docs プラグイン 設計書

> ソースコードから設計書を自動生成・自動更新するClaude Codeプラグイン

## 概要

「コードが先に進んで設計書が腐る」を解決する。

- ソースコードを解析して設計書を**自動生成**
- コード変更時に設計書の**腐敗を検知**して更新提案
- 設計書が品質基準を満たしているか**自動レビュー**
- HTMLワイヤーフレームから**画像を自動生成**して設計書に埋め込む

## スコープ

**Webアプリケーション（フロントエンド + バックエンド + バッチ）専用。** 組み込み系やゲーム等は対象外。

対応シナリオ:
- **コードあり** — 既存プロジェクトに後から設計書を付ける
- **コードなし** — 設計書を先に書いてから実装する

## 設計思想

### 「Claude に普通に頼めばできること」はスキルにしない

このプラグインの価値:

- **code-review-graph で依存グラフを構築** → 対象ファイルを手動で列挙しなくても、エントリポイントから関連コードを自動で辿れる
- **ast-grep で構造的に情報抽出** → ソースを全部読まなくても、エンドポイント定義・バリデーション・DB操作をピンポイントで取れる
- **blast radius で影響範囲を自動特定** → コード変更時に「設計書のどこを直すべきか」を人間が判断しなくていい
- **品質ルールを機械的に適用** → レビューのたびに同じ指摘を繰り返さない

「ソースコード読んで設計書書いて」とClaudeに頼むだけでは再現性がない。**OSSツールで構造を理解した上でAIが判断する**から、毎回安定した品質が出る。

## OSSツール統合

### 必須ツール

code-review-graph と ast-grep は**必須**（コードありシナリオ）。コードありでスキルを実行する際、未インストールならエラーメッセージを出して停止する。コードなしシナリオ（設計書を先に書く場合）ではツールチェックをスキップする。

### code-review-graph

- GitHub: https://github.com/tirth8205/code-review-graph
- `pip install code-review-graph[communities]`（Python 3.10+。communitiesオプション必須 — initの分割提案で使用）
- Tree-sitterでAST解析 → SQLiteに関数・クラス・依存関係をグラフ保存
- blast radius分析で平均8.2倍のトークン削減
- インクリメンタル更新（変更ファイルだけ再解析、2,900ファイルで2秒以下）
- 対応言語19種（JS/TS/Python/Go/Java/Rust/PHP/Ruby等、Web系は全てカバー）
- **gitリポジトリが前提** — git追跡ファイルのみインデックスされる。initでグラフ構築する前にgit initされていること
- **CLIコマンドをBashで叩いて結果を受け取る**（MCPも可能だが22ツール定義のコンテキストコストが高いためCLI方式を採用）
- **Windows環境:** `PYTHONUTF8=1` 環境変数が必要（cp932エンコーディング問題の回避）

**主要CLIコマンド:**
| コマンド | 用途 | 使うスキル |
|---------|------|-----------|
| `build` | コードベース全体をグラフ化 | init |
| `update` | 変更ファイルだけ差分更新 | sync |
| `detect-changes` | リスクスコア付き影響分析 | sync |
| `wiki` | コミュニティ検出→マークダウン生成 | generate（関連ファイル特定に活用） |
| `status` | グラフ統計の表示 | init（確認用） |

⚠️ CLIの出力フォーマットはREADMEに詳細がない。**スキルに組み込む前に実際にCLIで実行して出力を確認すること。** 期待通りの情報が取れない場合は、SQLite（`.code-review-graph/` 内）を直接クエリする方式に切り替える。

### ast-grep

- GitHub: https://github.com/ast-grep/ast-grep
- `npm install -g @ast-grep/cli`（Rust製バイナリ、ゼロ設定）
- ASTベースの構文パターンマッチ

**パターン駆動、フレームワーク非依存:** プラグインはフレームワーク別のパターンをハードコードしない。`/design-docs:init` がユーザーのプロジェクトから実際のコードを読んでパターンを推論し、`design-docs.knowledge.md` に保存する。

パターン例（推論される内容の一例）:
```bash
# Express (推論例)
sg --pattern 'router.$METHOD($PATH, $$$)' --lang js --json=compact

# Laravel (推論例)
sg --pattern 'Route::$METHOD($PATH, $$$)' --lang php --json=compact

# 関数シグネチャ
sg --pattern 'async function $NAME($$$) { $$$ }' --lang js --json=compact
```

**出力形式:** `--json=compact` オプションで構造化JSON出力が可能。スキルはJSON出力をパースして情報を取得する。JSON の `metaVariables.single.{NAME}.text` でメタ変数の値を取得。

### Playwright（画面設計書用）

Playwrightが未インストールなら警告してスキップ（Playwrightのみフォールバック許容）。

**ワイヤーフレームの生成フロー:**

画面（screen）テンプレートのgenerate時に以下の順で処理:

1. 設計書出力先の `assets/` ディレクトリに既存HTMLワイヤーフレームがあるか確認
2. **あれば**: そのまま Playwright で PNG 変換
3. **なければ**: Claude がソースコード（コードあり）またはヒアリング内容（コードなし）から HTML ワイヤーフレームを生成 → Playwright で PNG 変換
4. 生成した PNG を設計書の「画面レイアウト」セクションに埋め込む

**HTMLワイヤーフレームの規約:**
- 白黒のみ（色は使わない）
- すべて黒 `#000`（薄い文字は使わない）
- シンプルな罫線 `1px solid #000`
- デザイン性を持たせない（項目とレイアウトの確認が目的）
- 数値はサンプルデータらしいものを使用

**スクリプト:**
- `screenshot.js` — フルページ撮影（1440×900）
- `screenshot-element.js` — `.card`要素またはbody直下の最初の要素をぴったり切り出し

**ファイル配置（設計書はフラット、assetsは共有ディレクトリ）:**
- 設計書: `{出力先}/dashboard.md`
- HTML: `{出力先}/assets/dashboard-wireframe.html`
- PNG: `{出力先}/assets/dashboard-wireframe.png`

## design-docs.config.md

### 役割

各コマンドが「どのソースから」「どの設計書を」「どのテンプレートで」作るかを知るための設定ファイル。ヒアリング結果の永続化先でもあり、セッション圧縮で情報が失われても、このファイルから復元できる。

### 生成タイミング

`/design-docs:init` の Phase 5 で config.md を生成する。init の詳細フローは本ファイル下部「コマンド設計 > /design-docs:init」セクションを参照。

### ファイル形式

**コードありの場合:**
```markdown
# design-docs.config.md

## settings
- output: docs/design/
- language: ja
- framework: Laravel で社内管理画面

## documents
| 設計書 | テンプレート | エントリポイント |
|--------|------------|----------------|
| user-api.md | api | src/routes/users.ts |
| dashboard.md | screen | src/pages/Dashboard.tsx |
| daily-report.md | batch | src/batch/dailyReport.ts |
```

`framework` は Q4 の freeform description。プラグインは内部でフレームワーク名を解釈しない（knowledge.md のパターンを使うため）。ユーザーと Claude の文脈共有用のメモ。

**コードなしの場合:**
```markdown
# design-docs.config.md

## settings
- output: docs/design/
- language: ja
- framework: Next.js で SaaS フロントエンド（予定）

## documents
| 設計書 | テンプレート | エントリポイント |
|--------|------------|----------------|
| user-api.md | api | ユーザーCRUD API |
| dashboard.md | screen | ダッシュボード画面 |
| daily-report.md | batch | 日次レポート生成 |
```

エントリポイント列がファイルパス（`src/...`）ならコードあり、日本語の機能名ならコードなしと判定する。コード実装後に `init` を再実行すればファイルパスに更新される。ユーザーはいつでも手動で行を追加・編集できる。

## design-docs.knowledge.md

### 役割

プロジェクト固有の ast-grep パターンを保持する**必須ファイル**（コードあり時）。このプラグインはフレームワーク依存のハードコードパターンを持たない。代わりに、init でユーザーのプロジェクトから**パターンを推論**して knowledge.md に保存する。

### 設計方針

**パターン駆動（pattern-driven）、フレームワーク非依存。**

- フレームワーク名・ORM名をハードコードしない
- 新しいフレームワークが出ても、プラグイン側の更新は不要
- どんな独自DSL・社内フレームワークでも、init でパターンを推論すれば対応可能

### スコープを patterns のみに絞る理由

他のナレッジ（レビュー例外、sync無視パターン、カスタムルール等）は AI の実行時判定に依存するため、蓄積すると精度が低下する（業界での既知の失敗パターン）。ast-grep パターンは**プログラムが実行する**ので蓄積しても判定精度に影響しない。

### ファイル形式

```markdown
# design-docs.knowledge.md

## Project context
{Q4 からの自由記述}

## Detected language
{package.json 等から自動検出}

## Custom ast-grep patterns

- **Section:** API list
  **Pattern:** `router.$METHOD($PATH, $$$)`
  **Language:** ts
  **Extracts:** METHOD, PATH
  **Scope:** `src/routes/**/*.ts`

- **Section:** Processing flow
  **Pattern:** `async function $NAME($$$) { $$$ }`
  **Language:** ts
  **Extracts:** NAME
  **Scope:** `src/routes/**/*.ts, src/services/**/*.ts`
```

- **Section:** generate の情報収集ガイドラインの項目（API list / Processing flow / DB operations / Middleware / Screen items）
- **Pattern:** ast-grep のパターン
- **Language:** 対象言語（未指定時は `## Detected language` を使用）
- **Extracts:** 抽出するメタ変数
- **Scope:** 適用範囲の Glob（モノレポ対応）

`## Detected language` はプロジェクト全体のデフォルト言語（init で package.json 等から自動検出）。単一言語プロジェクトでは各パターンの `Language` を省略してこのデフォルトを使える。モノレポ等で言語が混在する場合は、各パターンで `Language` を明示する。

### パターン推論と利用

パターン推論フローの詳細は本ファイル下部「コマンド設計 > /design-docs:init」セクションを参照。各スキルでの利用方法は各スキルのコマンド設計（generate/sync/review）を参照。

### 自動蓄積

行わない。init 時に 1 回推論して確定。後から変更したい場合は `/design-docs:init` を再実行するか、手動で編集。

### フォールバック

- **code-present** で knowledge.md にパターンがない場合: generate は「init を実行してください」と案内して停止
- **code-not-present** で knowledge.md が空: 正常（コード実装後に init 再実行でパターン追加）

### サイズ監視

patterns が 50 件を超えたら警告を出す（実行は継続）。通常は 5-15 件程度。

### Git管理

knowledge.md は git管理を推奨する（チーム共有のため）。プロジェクト固有のパターンをチームメンバー全員で共有する。

## 文体

**体言止め・敬語なし。** 選択肢にしない。

- OK: 「ユーザーを作成し、トークンを発行」「リクエストパラメータの検証」
- NG: 「ユーザーを作成します」「リクエストパラメータを検証いたします」

## コマンド設計

### 共通設計: Iron Law（不可侵ルール）

各スキルに3つ以内の「絶対守るルール」をSKILL.mdに定義する。AIの暴走を防ぐ安全弁。

### 共通設計: allowed-tools（最小権限）

各スキルに必要最小限のツールのみ許可する。SKILL.mdのfrontmatterで制御。

### 共通設計: 引数

全コマンド共通で、引数に**設計書名**を取る（config.mdのdocumentsテーブルの設計書列に対応）。

- 引数あり → 指定した設計書のみ対象
- 引数なし → config.mdの全設計書を対象（initは引数不要）

例: `/design-docs:generate user-api.md`、`/design-docs:review`（全件）

### 共通設計: 段階的生成

設計書は**1つずつ生成・確認**する。複数の設計書を一括生成すると不整合が発生しやすい。引数なし（全件）で実行した場合も内部的には1つずつ順番に処理し、各設計書の生成後にユーザー承認を取る。

次の設計書を生成する際、**code-review-graphの依存グラフで関連する既存設計書だけ**をコンテキストに含める（全設計書を含めるとコンテキストが膨大になるため）。

### `/design-docs:init` — プロジェクトの初期セットアップ

**allowed-tools:** `Read Grep Glob Bash Write`
**Iron Law:**
1. ユーザーの確認なしに `design-docs.config.md` や `design-docs.knowledge.md` を書き出さない
2. 自動検出結果を事実として断定しない（「検出」「推定」と明示）
3. パターン推論結果はマッチ結果（検出されたエンドポイント等）を見せて確認し、パターンそのものは見せない

**5 Phase 構造:**

1. **事前チェック**: config.md の存在確認、既存なら上書き確認。

2. **Phase 1: 基本ヒアリング**（AskUserQuestion 4問）
   - Q1: 設計書の言語（日本語 / English）
   - Q2: 出力先ディレクトリ（デフォルト `docs/design/`）
   - Q3: コードの有無（自動検出して確認）
   - Q4: プロジェクト概要（freeform、例: "Laravel で社内管理画面"）

3. **コード有無で分岐:**
   - **コードあり**:
     a. 必須ツール（code-review-graph, ast-grep）のインストール確認。未インストールならエラー停止
     b. 主要言語を package.json / requirements.txt / go.mod 等から自動検出（ast-grep `--lang` に使用）
     c. Phase 2-5 を実行
   - **コードなし**:
     a. 追加ヒアリング（何を作るか / 主要機能 / 技術スタック）
     b. Phase 5 で knowledge.md は空テンプレートのみ生成（ツールチェック・言語検出はスキップ）

4. **Phase 2: プロジェクト構成ヒアリング**（コードあり時、AskUserQuestion 1問）
   - Q5: 含まれるもの（multi-select: API / 画面 / バッチ / モジュール）

5. **Phase 3: サンプルファイル確認**（コードあり時）
   - Q5 の選択に応じて Glob で候補ファイル検出
   - ユーザーに提示して分類を確認

6. **Phase 4: パターン推論とマッチ結果確認**（コードあり時）
   - 確認されたサンプルを Read → ast-grep パターン推論
   - 推論パターンを実行してマッチ結果を取得
   - **パターンそのものではなくマッチ結果**（検出されたエンドポイント等）をユーザーに提示
   - 不一致なら追加サンプル要求、パターン再推論

7. **Phase 5: 保存**
   - config.md を生成（documents テーブル、設定）
   - knowledge.md を生成（Phase 4 で確定したパターン、コードなし時は空テンプレート）
   - git管理推奨を案内

### `/design-docs:generate` — 設計書の生成

**allowed-tools:** `Read Grep Glob Bash Write`
**Iron Law:**
1. ソースコードに存在しない情報を推測で書かない（コードなし時は「TBD（実装後に記載）」と明記）
2. ユーザーの承認なしにファイルを書き出さない
3. テンプレートの必須セクションを省略しない

**手順:**
1. `design-docs.config.md` から対象を特定。config.md が見つからなければ init を案内して終了
2. コードの有無を判定（エントリポイント列がファイルパスか機能名かで判断）
3. 出力パス決定: `{config.md settings.output}/{document name}`
4. `design-docs.knowledge.md` からパターンを読み込み
   - コードあり時にパターンなし → init を案内して終了
   - コードなし時にパターンなし → 正常（パターン不要）
5. テンプレート選択（api/screen/batch/module、または自動構成）
6. コード有無で分岐:
   - **コードあり:**
     a. code-review-graph でグラフ更新し wiki 生成 → 関連ファイル特定
     b. knowledge.md のパターンを使って ast-grep で構造情報抽出（下記「情報収集ガイドライン」参照）
     c. 詳細が必要な箇所だけソースを直接 Read
     d. テンプレートに従って設計書を生成
     e. コミットハッシュを改訂履歴に記録
   - **コードなし:**
     a. config.md のヒアリング内容と機能名からテンプレート骨格を生成
     b. 各セクションは「TBD（実装後に記載）」で埋める。以下は可能な限り記載: 概要、処理フロー（想定）、API一覧やデータ構造
     c. 改訂履歴のソースコミット列は「-（未実装）」
7. 画面テンプレートの場合のワイヤーフレーム処理:
   - 既存HTMLワイヤーフレームがあれば Playwright で PNG 変換
   - なければ Claude がソース（コードあり）またはヒアリング内容（コードなし）から HTML 生成 → PNG 変換
   - Playwright 未インストール → 警告してスキップ
8. **ユーザーの承認を取得してから書き出し**

段階的生成: 引数なし全件実行時は1つずつ処理。次の設計書生成時に、関連する既存設計書のみコンテキストに含める。

**情報収集ガイドライン（コードありの場合）:**

各セクションで「パターン（knowledge.md から）で取るか、直接 Read で取るか」を定義。ast-grep パターンで構造を先に把握し、詳細が必要な箇所だけ Read する。

| セクション | knowledge.md パターン | 直接 Read |
|-----------|-------------------|-----------|
| API一覧 | エンドポイント定義（Section = "API list"） | — |
| リクエストパラメータ | — | バリデーション定義 |
| レスポンス | — | res.json / res.send の引数構造 |
| エラーレスポンス | — | throw / res.status の条件分岐 |
| 処理フロー | 関数シグネチャ（Section = "Processing flow"） | 分岐条件、トランザクション |
| DB操作 | モデル呼び出し（Section = "DB operations"） | WHERE条件、JOIN |
| ミドルウェア | ミドルウェアチェーン（Section = "Middleware"） | 認証・認可ロジック詳細 |
| 画面項目定義 | コンポーネント props / state（Section = "Screen items"） | バリデーション、イベントハンドラ |
| バッチ対象データ | — | SQLクエリ、対象条件のロジック |

パターンがない場合は該当セクションで直接 Read にフォールバック。

パターンサイズ監視: knowledge.md のエントリが50件を超えたら警告（実行は継続）。

### `/design-docs:sync` — 設計書の同期（腐敗検知 + 更新）

**コードありでのみ動作。** コードなし（改訂履歴のソースコミットが「-」）の場合は「コード実装後に `/design-docs:sync` で同期してください」とガイドして終了。

**allowed-tools:** `Read Grep Glob Bash Edit Write`
**Iron Law:**
1. ユーザーの承認なしに設計書を編集しない
2. 影響範囲外の変更を「要更新」と判定しない
3. 設計書に存在しないセクションを勝手に追加しない

**手順:**
1. config.md 読み込み（なければ init を案内して終了）
2. 設計書の改訂履歴からベースコミットを取得。「-（未実装）」ならガイドメッセージを出して終了
3. code-review-graph の `detect-changes` で影響範囲を特定（blast radius）
4. 影響範囲のファイルの実際の変更内容を `git diff {ベースコミット}..HEAD -- {影響ファイル}` で取得
5. **ast-grep diff による新規/削除エンドポイント検出**（knowledge.md のパターン使用）
   - HEAD でパターン実行
   - `git show {ベースコミット}:{file}` でベースコミットのファイル取得してパターン実行
   - 集合差分で新規/削除エンドポイントを特定（detect-changes が拾えない無名コールバック対応）
6. 変更内容を分析し、設計書のどのセクションに影響するか判定
7. 影響のある変更だけを分類:
   - **設計書の更新が必要** — エンドポイント変更、処理フロー変更、DB操作変更
   - **影響なし** — リファクタリング、テスト追加、コメント変更
8. 更新提案を出力（現在の記載 → 提案する更新、の差分形式）
9. **ユーザーの承認を取得してから更新**

### `/design-docs:review` — 設計書のレビュー

**allowed-tools:** `Read Grep Glob Bash`
**Iron Law:**
1. ルールにない観点で指摘しない
2. ソースコードを確認せずに「不一致」と判定しない
3. 推測に基づく指摘を事実として報告しない

**手順:**
1. config.md 読み込み（なければ init を案内して終了）、対象設計書を特定して読み込み
2. テンプレート構造との照合
3. ルール（記述規約）への準拠チェック
4. コード有無で分岐:
   - **コードあり:**
     a. knowledge.md のパターンで ast-grep を実行し、ソースから事実を抽出 → 設計書の記載と突き合わせ
     b. 検証項目を exact（ast-grep）と approximate（AI判断）に分類:
        - Exact（✓）: エンドポイントのメソッド/パス、ミドルウェア適用順序
        - Approximate（≈、80-90%精度）: バリデーション一致、レスポンスJSON構造一致、エラーコード一致、DB操作一致
     c. 抜け漏れチェック（ソースに存在するが設計書に書かれていない機能）
   - **コードなし:**
     a. ソースコード照合セクションは「ソース未実装のためスキップ」と出力
     b. TBDセクションの残数を報告（「TBD残り: N箇所」）
5. チェックリスト形式で結果出力

**出力形式:**
```markdown
## レビュー結果: {設計書名}

### テンプレート: {api / screen / batch / module}

### 構造チェック
- [x] 必須セクション（目次・改訂履歴・概要）
- [x] セクション順序
- [ ] 不要な親見出しなし ← 該当箇所を指摘

### ルールチェック（1-4: 常に適用 / 5-11: コードありのみ）
- [x] 1. 体言止め
- [x] 2. mermaid図
- [x] 5. テーブル.カラム形式
- [ ] 6. 出所の明示 ← 該当箇所を指摘
- ...

### ソースコード照合（✓ exact / ≈ approximate）
- ✓ [x] エンドポイントのHTTPメソッド・パスがルート定義と一致
- ✓ [x] ミドルウェア適用順序がルート定義と一致
- ≈ [ ] リクエストパラメータの型・必須/任意がバリデーション定義と一致 ← 差分を指摘
- ≈ [x] レスポンスのJSON構造が実際のレスポンスオブジェクトと一致
- ≈ [x] エラーコード・HTTPステータスがthrow/res.statusの値と一致
- ≈ [ ] DB操作（テーブル・カラム・条件）が実装と一致 ← 差分を指摘

> ✓ = ast-grep による exact 検証。≈ = AI 読み取りによる approximate 検証（~80-90% 精度）。

### 指摘事項

#### 修正必須
1. {箇所} — {具体的な指摘内容}

#### 改善推奨
1. {箇所} — {具体的な指摘内容}
```

### `/design-docs:explain` — 設計に関するQ&A

**allowed-tools:** `Read Grep Glob Bash`
**Iron Law:**
1. 設計書とソースコードに差異がある場合、両方を提示する（片方を正とみなさない）
2. 確信度が低い回答を断定調で書かない
3. 質問のスコープ外に回答を広げない

**手順:**
1. config.md 読み込み（なければ init を案内して終了）、質問に関連する設計書を特定
2. コードの有無を判定
3. コード有無で分岐:
   - **コードあり:**
     a. code-review-graphの依存グラフで関連コードを辿る
     b. 設計書 → ソースコード → DBスキーマ の優先順位で回答
   - **コードなし:**
     a. 設計書の内容のみで回答（「ソース未実装のため設計書の記載に基づく回答」と明示）
4. 必要に応じてmermaid図を含める

## テンプレート

4種類。Webアプリケーションのコード構造に対応:

- **api** — エンドポイントがある（REST, GraphQL等）
- **screen** — UIコンポーネント/ページがある
- **batch** — 定期実行/バックグラウンド処理がある
- **module** — 上のどれでもない機能単位（ライブラリ、共通処理、外部連携等）

サンプルとして提供し、ユーザーがカスタマイズ可能にする。テンプレート種別は `/design-docs:init` で自動判定するが、ユーザーが追加・編集できる。

### 各テンプレートの段落構成

**共通（全テンプレート先頭）:**
- タイトル
- 目次
- 改訂履歴（日付 / バージョン / ソースコミット / 変更内容）
- 概要

**api:**
- 処理フロー（mermaid sequenceDiagram）
- API一覧（エンドポイント一覧テーブル）
- 各APIの詳細（エンドポイント情報 / リクエストパラメータ / レスポンス / エラーレスポンス / 処理フロー）
- DB設計（テーブル・カラム定義）

**screen:**
- 処理フロー（初期表示 / 作成 / 更新 / 削除）
- 画面レイアウト（ワイヤーフレーム画像）
- 画面項目定義
- 操作仕様
- アクセス権限
- ルーティング設定
- 関連ファイル

**batch:**
- 実行仕様（スケジュール / コマンド / 排他制御）
- 処理フロー（mermaid flowchart）
- 対象データ（処理対象の条件）
- 通知（Slack / メール等）
- エラーハンドリング

**module:**
- 処理フロー（mermaid）
- 処理パターン別の詳細
- 共通処理
- データ構造（入出力のJSON / テーブル定義）

## ルール

品質チェックルール:

**常に適用（コードあり/なし共通）:**
1. **体言止め** — 敬語・丁寧語は使わない
2. **mermaid図** — フロー図・シーケンス図・ER図はmermaidで記述
3. **不要な親見出し禁止** — 中身のないラッパー見出しは作らない
4. **全体像が先、詳細は後** — 概要→処理フロー図→詳細仕様の順

**コードありの場合のみ適用:**
5. **テーブル.カラム形式** — カラム参照は必ず `テーブル名.カラム名`
6. **出所の明示** — 条件や値の出所（テーブル名・定数名・環境変数名）を常に明記
7. **実装箇所の明記** — 処理ごとにファイルパスとメソッド名を記載
8. **エンドポイント統一形式** — メソッド/パス/認証/パラメータ/レスポンス/エラーを統一テーブルで記述
9. **JSONサンプルは実装準拠** — 想像やドキュメントのコピーではなく実際のレスポンス構造
10. **連番項目の統一フォーマット** — タイトル/ファイル/メソッド/説明の構造で記述
11. **実装箇所一覧セクション禁止** — 情報の重複を避ける（修正セクション内に集約）

## ディレクトリ構成

```
plugins/design-docs/
├── .claude-plugin/
│   └── plugin.json           # プラグインマニフェスト
├── DESIGN.md                 # この設計書
├── README.md
├── CHANGELOG.md
├── skills/
│   ├── init/
│   │   └── SKILL.md          # /design-docs:init
│   ├── generate/
│   │   ├── SKILL.md          # /design-docs:generate
│   │   └── templates/
│   │       ├── api.md
│   │       ├── screen.md
│   │       ├── batch.md
│   │       └── module.md
│   ├── sync/
│   │   └── SKILL.md          # /design-docs:sync
│   ├── review/
│   │   ├── SKILL.md          # /design-docs:review
│   │   └── rules/
│   │       └── default.md
│   └── explain/
│       └── SKILL.md          # /design-docs:explain
├── config/
│   └── config.example.md     # design-docs.config.md のサンプル
└── scripts/
    ├── screenshot.js
    ├── screenshot-element.js
    └── package.json
```

## 完了の定義

1. **全5コマンドが実際のWebアプリプロジェクトで動く** — 設計書が生成・レビュー・更新できること
2. **READMEの手順通りにセットアップできる** — 初見のユーザーが使い始められること
3. **code-review-graphのCLI出力を実機確認済み** — detect-changes / wiki の出力フォーマットが確定していること
4. **プラグイン内に特定プロジェクト固有の情報が含まれていない** — grep で顧客名・内部URL・固有テーブル名が出ないこと
5. **GitHubにpush済み**
