# DevFlow v2.0 テストガイド

## 前提条件

- flux リポジトリとは別の小さなプロジェクト（既存 or 新規）を用意する

## ローカルの devflow を実行する方法

テスト対象のプロジェクトディレクトリで、`--plugin-dir` オプションを使って flux リポジトリ内の devflow を直接読み込む:

```bash
claude --plugin-dir /path/to/flux/devflow
```

マーケットプレイス経由のインストールは不要。ソースを修正したら Claude Code を再起動するだけで反映される

---

## テスト 1: History コマンド

```
/devflow:history
```

**期待結果**: 「セッション履歴が見つかりません。セッションは `/devflow:dev` の Phase 9 完了時にアーカイブされます。」的なメッセージが表示される

---

## テスト 2: Explore コマンド

```
/devflow:explore 認証フロー
```

（引数はプロジェクトに合わせて変更する）

**チェックリスト**:
- [ ] explorer エージェントが起動する
- [ ] 分析結果に file:line 参照が含まれる
- [ ] `.devflow/research.md` が作成される

---

## テスト 3: Dev コマンド（メインワークフロー）

```
/devflow:dev hello エンドポイントを追加
```

（小さい機能であればなんでもOK）

### Phase 1: Discovery

- [ ] 1回の応答で質問が最大2つまで
- [ ] 最初の深掘り質問で「推奨で」のヒントが含まれる
- [ ] 開発モード選択が AskUserQuestion（クリック選択UI）で表示される
- [ ] `.devflow/session.md` が正しい構造で作成される:
  - [ ] Development Mode セクション
  - [ ] Project セクション
  - [ ] Requirements セクション
  - [ ] Expected Outputs セクション（最低でも docs/DESIGN.md + README.md がリストされる）
  - [ ] Progress セクション（Phase 2-9）

### Phase 2: Codebase Exploration

- [ ] 新規プロジェクトではスキップされる（即座に完了扱い）
- [ ] 既存プロジェクトでは 2-3 個の explorer エージェントが並列起動
- [ ] `.devflow/research.md` が作成される
- [ ] session.md の Progress が更新される

### Phase 3: Clarifying Questions

- [ ] スキップされない（必須フェーズ）
- [ ] エッジケース、エラーハンドリング等に関する質問がある
- [ ] session.md の Decisions セクションに Q&A が追記される

### Phase 4: Architecture Design

- [ ] planner エージェントが起動する
- [ ] `docs/DESIGN.md` が作成され、以下を含む:
  - [ ] Architecture Candidates（3候補 + Pros/Cons）
  - [ ] Recommendation（推奨案）
- [ ] アーキテクチャ選択が AskUserQuestion（クリック選択UI）で表示される
- [ ] session.md の Decisions にアーキテクチャ選択が追記される
- [ ] session.md の Parallel Plan が更新される

### Phase 5-9（オプション、最速ならモード4で）

- [ ] Phase 5: coder エージェントが起動し、コードが実装される
- [ ] Phase 8: documenter エージェントが起動し、README.md が作成される
- [ ] Phase 9: 完了報告が表示され、`.devflow/history/` にセッションがアーカイブされる（session.md + design.md のコピー）

---

## テスト 4: 既存コマンド（オプション）

v1 のコマンドがエラーなく動作することを確認する。

```
/devflow:design ヘルスチェックエンドポイントを追加
/devflow:review
/devflow:test
/devflow:docs
```

- [ ] 各コマンドが正しいエージェントに委譲される
- [ ] パス変更に関するエラーが出ない

---

## テスト 5: セッション継続（オプション）

テスト 3 の後、同じプロジェクトで再度 `/devflow:dev` を実行する。

- [ ] 未完了フェーズのある session.md を検出する
- [ ] AskUserQuestion: 「前回のセッションを継続」/「新規セッションを開始」
- [ ] 継続: 最後に完了したフェーズから再開する
- [ ] 新規: session.md + research.md を削除して Phase 1 から開始する

---

## 優先度

**必須**: テスト 3（Phase 1-4）— v2.0 の変更の核心部分

**あれば良い**: テスト 1, 2, 4, 5
