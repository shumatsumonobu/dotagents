[English README](README.md)

# Flux

Claude Code の開発ワークフローを加速するプラグイン集

## 利用可能なプラグイン

### [DevFlow](devflow/README.ja.md)

「こんなの作りたい」って伝えるだけ。6つの専門エージェントがコードベース分析から設計・実装・テスト・レビュー・ドキュメント生成まで自動で回します。

```
あなた:  /devflow:dev
        「Gemini APIを使ったチャット機能を追加したい」

DevFlow: Web UI？CLI？履歴の保存は？
あなた:  Web UIで。履歴はセッション中だけでOK。

DevFlow: どのアーキテクチャにしますか？
         [候補1: 最小変更]  [候補2: クリーン]  [候補3: バランス]
あなた:  (候補2をクリック)

-> あとは自動で 分析→設計→実装→テスト→レビュー→ドキュメント
```

**特徴**: 対話で要件を固める、コードベース分析、アーキテクチャ候補、多言語対応（TS/JS, Python, Go, Rust）、並列実行、開発モード選択、自動修正ループ、信頼度スコアリング、セッション履歴、セキュリティチェック、メモリ

## インストール

### 1. マーケットプレイスを追加

```
/plugin marketplace add takuya-motoshima/flux
```

### 2. プラグインをインストール

```
/plugin install devflow@flux
```

スコープを選択:

| スコープ | 用途 |
|---------|------|
| **user** (デフォルト) | 全プロジェクトで使用 |
| **project** | チーム開発で共有（Git管理） |
| **local** | 個人用（Git除外） |

### 3. 再起動して確認

Claude Code を再起動してから実行:

```
/agents
```

## 必要要件

- Claude Code >= 1.0.0

## ライセンス

MIT

## 作者

Takuya Motoshima ([@takuya-motoshima](https://github.com/takuya-motoshima))
