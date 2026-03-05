# Flux プロジェクトメモリ

## プロジェクト概要

flux リポジトリは Claude Code プラグインのマーケットプレイス。現在 devflow プラグインのみ収録。

## DevFlow v2.0 作業状況（2026-02-23）

### 完了済み

- **ソースコード（10ファイル）**: 全て実装・レビュー済み
  - agents: explorer.md, planner.md, coder.md, tester.md, reviewer.md, documenter.md
  - commands: dev.md, explore.md, history.md
  - plugin.json (v2.0.0)
- **ドキュメント（10ファイル）**: 全て v2.0 に更新済み・レビュー済み
  - devflow/README.md, devflow/README.ja.md（ユーザーリファレンス）
  - README.md, README.ja.md（ルート、マーケットプレイス概要）
  - devflow/DEVELOPMENT.md（開発ガイド）
  - devflow/CHANGELOG.md, devflow/CHANGELOG.ja.md
  - devflow/TESTING.md（テスト手順、日本語）
  - .claude-plugin/marketplace.json (v2.0.0)
- **整理作業**:
  - devflow スタンドアロンリポジトリ削除済み
  - awesome-claude-code issue #662 クローズ済み
  - scripts/ ディレクトリ削除済み（sync-to-devflow.js 不要に）
  - DEVELOPMENT.md からリポ二重管理の記述削除済み
  - CHANGELOG の [Unreleased] 予定機能をコメントアウト

### 未実施

- **手動テスト**: TESTING.md の手順に従ってテスト（Priority 1: Test 3 Phase 1-4）
- **Git コミット**: 全変更が未コミット
- **マーケットプレイスへの push**: 未実施

## 開発ルール

- コミットに "Co-Authored-By: Claude" を付けない
- PLAN.md は日本語
- エージェント/コマンドのソースコード（プロンプト）は英語
- ユーザー向けドキュメントは EN/JA 両方を用意し、相互リンクを付ける
- コミットメッセージは英語、Conventional Commits

## 掲載状況

| 提出先 | 状態 |
|-------|------|
| Anthropic 公式ディレクトリ | 審査待ち |
| ClaudePluginHub | 反映待ち |
