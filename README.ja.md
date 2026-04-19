[English](README.md) | [日本語](README.ja.md)

# dotagents

Agents, unchained.

## プラグイン

### [DevFlow](plugins/devflow/README.ja.md)

作りたいものを伝えるだけ。6 つの専門エージェントが探索・設計・実装・テスト・レビュー・ドキュメントの全サイクルを自動で処理。

```
あなた:  /devflow:dev "Gemini API を使ってチャット機能を追加"

DevFlow: Web UI と CLI、どっち？履歴は保存する？
あなた:  Web UI。セッション限りで。

DevFlow: どのアーキテクチャ？
         [Option 1: Minimal]  [Option 2: Clean]  [Option 3: Balanced]
あなた:  （Option 2 をクリック）

→ explore → design → code → test → review → docs → 完了
```

### [design-docs](plugins/design-docs/README.ja.md)

Webアプリケーションのソースコードから設計書を自動生成・自動同期。パターン駆動（フレームワーク非依存）— init がプロジェクトの実コードから ast-grep パターンを推論するため、ハードコードされたフレームワーク一覧は不要。

```
あなた:       /design-docs:init

design-docs: （ヒアリング）設計書の言語は？出力先は？コードはある？プロジェクト概要は？
あなた:       TypeScript、docs/design/、あり、Next.js の EC バックエンド

design-docs: 検出ファイル: src/routes/users.ts, src/routes/orders.ts, ...
             この分類で合っていますか？
あなた:       はい

design-docs: 推論パターン → 3 ファイルから 12 エンドポイント検出。正確ですか？
あなた:       はい

→ config.md + knowledge.md を生成。/design-docs:generate 実行可能
```

## インストール

```
/plugin marketplace add shumatsumonobu/dotagents
/plugin install devflow@dotagents
/plugin install design-docs@dotagents
```

| スコープ | 使用範囲 |
|---------|---------|
| **user**（デフォルト） | 全プロジェクトで利用可能 |
| **project** | Git 経由でチームと共有 |
| **local** | 個人利用のみ、Git 対象外 |

Claude Code を再起動後、`/agents` で確認。

## 動作要件

- Claude Code >= 1.0.0

## ライセンス

MIT

## 作者

shumatsumonobu ([@shumatsumonobu](https://github.com/shumatsumonobu))
