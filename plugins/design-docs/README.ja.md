[English](README.md) | [日本語](README.ja.md)

# design-docs

Web アプリケーションのソースコードから設計書を自動生成・自動同期する Claude Code プラグイン。[code-review-graph](https://github.com/tirth8205/code-review-graph) で依存関係を分析し、[ast-grep](https://github.com/ast-grep/ast-grep) で構造情報を抽出することで、毎回安定した品質の設計書を生成する。

**Web アプリケーション専用**（フロントエンド + バックエンド + バッチ）。組み込み系やゲーム等は対象外。

## セットアップ

### 1. 必須ツールのインストール

```bash
# code-review-graph (Python 3.10+)
pip install code-review-graph[communities]

# ast-grep
npm install -g @ast-grep/cli
```

> **Windows:** code-review-graph 実行時に環境変数 `PYTHONUTF8=1` が必要。

### 2. プラグインのロード

```bash
claude --plugin-dir ./plugins/design-docs
```

### 3. 初期化

任意の Web アプリケーションプロジェクトで実行:

```
/design-docs:init
```

ソースコードを解析し、設計書の分割案を提案する。コードがまだない場合はヒアリングで設定を生成する。

### 任意: Playwright（画面ワイヤーフレーム用）

```bash
cd plugins/design-docs/scripts
npm install
npx playwright install chromium
```

Playwright がなくても他の機能はすべて動作する。

## コマンド

### `/design-docs:init`

5 Phase フローで設計書環境をセットアップ:

```
/design-docs:init
```

- **Phase 1:** 4 問のヒアリング — 設計書の言語、出力先、コード有無、プロジェクト概要（freeform）
- **Phase 2:** プロジェクトに含まれるもの（API / 画面 / バッチ / モジュール）を聞く
- **Phase 3:** Glob でサンプルファイルを自動検出、ユーザーが分類を確認
- **Phase 4:** 確認されたサンプルから ast-grep パターンを推論、マッチ結果（パターンそのものではなく）をユーザー確認
- **Phase 5:** `design-docs.config.md` + `design-docs.knowledge.md` を生成

コードがまだないプロジェクトでは、init は Phase 1 + 追加ヒアリング（何を作るか、主要機能、技術スタック）を実行し、機能名ベースの config.md と空の knowledge.md を生成する。コード実装後に init を再実行してパターンを追加する。

### `/design-docs:generate [設計書名]`

設計書を生成。

```
/design-docs:generate users-api.md    # 指定した設計書のみ
/design-docs:generate                 # 全設計書（段階的に）
```

- 適切なテンプレート（api/screen/batch/module）を選択、または自動構成
- ソースコードからエンドポイント、バリデーション、DB 操作を抽出
- 画面テンプレートの場合はワイヤーフレーム画像を生成（Playwright 必須）
- 書き出し前にユーザー承認を取得

### `/design-docs:sync [設計書名]`

コード変更を検知し、設計書の更新を提案。

```
/design-docs:sync users-api.md       # 指定した設計書のみ
/design-docs:sync                    # 全設計書
```

- 改訂履歴からベースコミットを特定
- blast radius 分析で影響範囲を特定
- 変更を「更新が必要」と「影響なし」に分類
- 編集前にユーザー承認を取得

### `/design-docs:review [設計書名]`

設計書の品質をレビュー。

```
/design-docs:review users-api.md     # 指定した設計書のみ
/design-docs:review                  # 全設計書
```

- テンプレート構造との整合性チェック
- 11 個のライティングルールの検証
- ast-grep でソースコードとの突き合わせ
- チェックリスト形式で結果出力

### `/design-docs:explain [質問]`

設計や機能に関する質問に回答。

```
/design-docs:explain ユーザー登録はどう動く？
/design-docs:explain 認証フローはどうなっている？
```

- 設計書とソースコードを横断的に調査
- 番号付きステップと mermaid 図で説明
- 情報源（ファイルパス、メソッド名）を引用

## 設定

`/design-docs:init` が生成する `design-docs.config.md`:

```markdown
# design-docs.config.md

## settings
- output: docs/design/
- language: ja
- framework: Express で Web API

## documents
| Document | Template | Entry Point |
|----------|----------|-------------|
| users-api.md | api | src/routes/users.js |
| dashboard.md | screen | src/pages/dashboard.html |
| cleanup.md | batch | src/batch/cleanup.js |
| logger.md | module | src/utils/logger.js |
```

コードなし時のフォーマットを含む完全な例は [config/config.example.md](config/config.example.md) を参照。

## 仕組みと限界

**フレームワーク非依存の設計。** `/design-docs:init` は実際のソースファイルを読み込み ast-grep パターンを推論する — 事前定義されたフレームワーク一覧には依存しない。init 時にサンプルファイルを指定できれば、どの言語・フレームワークでも動作する。

パターンはプロジェクトルートの `design-docs.knowledge.md` に保存され、以降の全コマンドで再利用される。チームで共有するため git にコミットすること。

### 検証の信頼度

**Exact (ast-grep 経由) — ✓**
- エンドポイントのメソッド / パス
- ミドルウェアの適用順序

**Approximate (AI 読み取り、~80-90% の精度) — ≈**
- リクエストバリデーションの一致
- レスポンス構造の一致
- エラーコード / ステータスの一致
- DB 操作の一致

review スキルは各検証項目に ✓ または ≈ のラベルを付け、信頼度をユーザーに伝える。

### 実行時間

- 設計書生成: 1 設計書あたり 10-30 秒
- レビュー: 1 設計書あたり 5-15 秒
- 同期: 1 設計書あたり 10-20 秒

### 適しているケース

- Web API プロジェクト（REST/GraphQL）、任意のフレームワーク
- Web 画面とワイヤーフレームを持つプロジェクト
- バッチ処理とバックエンドモジュール

### 適さないケース

- 静的なソースパターンがなく、エンドポイント / 画面が実行時に完全動的生成されるプロジェクト
- 非 Web アプリケーション（組み込み系、ゲーム）

### レビュー例外やルール蓄積をサポートしない理由

レビュー例外やカスタムルールの knowledge.md への蓄積は意図的にサポートしない。AI の判定を要するリストは規模が大きくなるほど精度が低下する — これは AI コーディングツール全般で知られている失敗パターン。knowledge.md には ast-grep パターン（プログラム実行、AI 判定不要）のみを保存する。

## テンプレート

4 種類の組み込みテンプレート。自動選択または手動指定が可能:

| テンプレート | 用途 |
|------------|------|
| api | REST/GraphQL API エンドポイント |
| screen | UI 画面・ページ |
| batch | バッチ・バックグラウンド処理 |
| module | その他の機能モジュール |

どれも適合しない場合、generate スキルはソースコードの特性に基づいてセクション構造を自動生成する。

テンプレートはカスタマイズ可能 — `skills/generate/templates/` 配下のファイルを編集する。

## ルール

品質チェックに使う 11 個のライティングルール:

- **常に適用（1-4）:** 体言止め、mermaid 図、不要な親見出し禁止、全体像が先
- **コードありの場合のみ（5-11）:** テーブル.カラム形式、出所の明示、実装箇所の明記、エンドポイント統一形式、JSON サンプルは実装準拠、連番項目の統一フォーマット、実装箇所一覧セクション禁止

詳細と例は [skills/review/rules/default.md](skills/review/rules/default.md) を参照。

## 対応シナリオ

- **コードあり** — 既存プロジェクトに後から設計書を付ける
- **コードなし** — 設計書を先に書いてから実装する（セクションは TBD で埋める）
