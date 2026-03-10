[English version](CHANGELOG.md)

# 変更履歴

このプロジェクトの注目すべき変更をすべて記録します。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) に基づき、
[Semantic Versioning](https://semver.org/lang/ja/spec/v2.0.0.html) に準拠しています。

## [Unreleased]

<!--
### 予定
- 追加言語サポート（Java, C# 等）
- 外部コードレビューツールとの連携
- パフォーマンスプロファイリング統合
- CI/CD パイプライン生成
-->

## [2.0.0] - 2026-02-23

### 追加
- **explorer エージェント**: 読み取り専用のコードベース分析エージェント（Read, Glob, Grep のみ）
  - file:line 参照付きのエントリポイント特定
  - 実行フロートレース、アーキテクチャ層マッピング
  - 設計の根拠となる必読ファイルリスト（5-10件）
- **`/devflow:explore` コマンド**: 1-3 個の explorer エージェントによるスタンドアロンのコードベース分析
  - 分析結果を `.devflow/research.md` に出力
- **`/devflow:history` コマンド**: 過去のセッションアーカイブの検索・参照
  - 引数によるキーワードフィルタリング
  - 日付、目標、技術スタック、モードのサマリテーブル
- **9フェーズワークフロー**（`/devflow:dev`）:
  - Phase 2: コードベース分析（2-3 個の explorer エージェントを並列起動）
  - Phase 3: 追加質問（必須、スキップ不可）
  - Phase 9: 完了報告とセッションアーカイブ
- **アーキテクチャ候補**（planner 出力の docs/DESIGN.md）:
  - 3つの候補（最小変更、クリーンアーキテクチャ、実用的バランス）
  - 各候補に Pros/Cons と推奨案
  - 実装前に AskUserQuestion でユーザーが選択
- **信頼度スコアリング**（reviewer）:
  - 各指摘に 0-100 のスコアを付与
  - 報告閾値: 信頼度 >= 75 のみ報告
  - 各指摘に [Confidence: XX]、file:line 参照、具体的な修正提案を必須化
- **セッション履歴アーカイブ**: 完了セッションを `.devflow/history/YYYY-MM-DD-HHmm-{タイトル}/` にアーカイブ
  - session.md（要件、決定事項、進捗）と design.md（アーキテクチャ詳細）を含む
- **セッション継続**: 未完了セッションがある場合、AskUserQuestion で継続/新規開始を選択
- **AskUserQuestion 統合**: 開発モード選択（Phase 1）、アーキテクチャ選択（Phase 4）、レビュー対応（Phase 7）でクリック選択UIを使用
- **Expected Outputs 制御**: session.md に期待する出力ファイルを列挙。サブエージェントはリストにあるファイルのみ生成

### 変更
- **エージェント数**: 5 → 6（explorer 追加）
- **ワークフロー**: 3ステップ → 9フェーズパイプライン（Discovery → Exploration → Clarifying → Architecture → Implementation → Testing → Review → Documentation → Summary）
- **セッション保存先**: `.claude/memory/dev-session.md` → `.devflow/session.md`
- **分析結果保存先**: explorer の分析結果を `.devflow/research.md` に保存（書き手は PM、explorer ではない）
- **planner**: `.devflow/research.md` を読み込んで explorer の分析結果を活用
- **reviewer 出力**: 各指摘に [Confidence: XX] と file:line 参照を必須化
- **全エージェントプロンプト**: トークン効率と指示追従の向上のため日本語から英語に変換
- **コンパクション復帰**: 1ファイルから3ファイル（session.md + research.md + DESIGN.md）に拡張
- **プラグインバージョン**: 1.0.0 → 2.0.0

### 削除
- **言語選択**（Step 0）: Claude がユーザーの入力言語に自然に合わせるため不要に
- **`.claude/memory/user-preferences.md`**: 言語選択の廃止に伴い不要に
- **日本語エージェントプロンプト**: すべて英語に変換

## [1.0.0] - 2026-02-08

### 追加
- **`/devflow:dev` コマンド**: PM的なヒアリング、設計、実装、テスト、レビュー、ドキュメント生成のワークフロー
  - Step 0: 会話言語の選択（初回のみ）
  - Step 1: プロジェクト環境の自動分析（既存プロジェクトの場合）
  - Step 2: 7つの原則に基づく要件ヒアリング
  - Step 3: 並列タスク管理による開発実行
  - オーケストレーションロジックをコマンドに直接統合（フック互換性のためフラットなサブエージェント階層）
- **planner エージェント**: 設計と影響範囲分析
- **coder エージェント**: 多言語対応の実装サポート（TypeScript/JavaScript, Python, Go, Rust）
  - コーディング規約の自動検出
- **tester エージェント**: テストフレームワークの自動検出と実行
  - Vitest/Jest/Mocha/Jasmine/Ava, pytest/unittest/nose, Go testing/testify, cargo test
  - カバレッジ測定サポート
- **reviewer エージェント**: コード品質とセキュリティのレビュー
  - セキュリティチェックリスト（XSS, SQLインジェクション, コマンドインジェクション等）
  - 言語固有のセキュリティチェック
  - レビュー結果を docs/REVIEW.md に出力
- **documenter エージェント**: ドキュメント生成（README.md, OpenAPI仕様書, アーキテクチャドキュメント）
- **カスタムコマンド**（`/devflow:*`）: `/devflow:dev`, `/devflow:design`, `/devflow:review`, `/devflow:test`, `/devflow:docs`
- **SubagentStart/Stop フック**: エージェントの開始・終了通知
- **開発モード選択**: ヒアリング時に4つのモードから選択（フル、テストなし、レビューなし、テスト・レビューなし）
- **エージェント `color` フィールド**: planner(green), coder(yellow), tester(cyan), reviewer(red), documenter(magenta)
- プラグインマーケットプレイス対応（marketplace.json, plugin.json）

### 機能
- coder x N + tester の動的並列実行（coder の数はタスク構造に応じて決定）
- tester のフェーズ制御: Phase 1（仕様書作成、coder と並列）と Phase 2（テスト実行、逐次）
- `.claude/memory/dev-session.md` によるセッション永続化（Requirements Summary, Parallel Plan, Progress）
- コンパクション復帰: コンテキスト圧縮後に dev-session.md から状態を自動復元
- テストリトライ: 最大3回の再試行後に次へ進む
- 全生成ドキュメントでの絵文字禁止
- notify.js のデバッグログ切り替え（`DEBUG_LOG` フラグ）
- プロジェクトメモリスコープによる知識の永続化
- 多言語コーディング規約の適用
- ソースコード保護: reviewer（`disallowedTools: Edit` による読み取り専用）、documenter（プロンプト指示によるドキュメントのみ編集）
- エージェント見出し構造: `##` と `**太字**` サブセクション（公式プラグインパターンに準拠）
- ドキュメント出力の強制: エージェントプロンプトに具体的な H2 セクション名を記載
- 全エージェントに `maxTurns` を設定して暴走実行を防止
- 全コマンドに `disable-model-invocation`（ユーザー起動のみ）
- 全コマンドに `argument-hint`（自動補完 UX）
