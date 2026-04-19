# WIP - 作業再開ガイド

## 現在の状態

- リポジトリ名変更 (`claude` → `dotagents`) 完了
- **design-docs プラグイン v1.0.0** — パターン駆動設計に再構築、実行テスト未実施
  - `design-docs.knowledge.md` を導入（プロジェクト固有 ast-grep パターンを init で推論→保存）
  - フレームワークハードコードを廃止（framework-agnostic）
  - review を exact（✓）/approximate（≈）に分類
  - sync に ast-grep diff（新規/削除エンドポイント検出）追加

## 次にやること（手動作業）

- [ ] design-docs プラグインの実行テスト
  1. テスト用プロジェクトを準備: `../todo-app/`（shumatsumonobu 直下、dotagents の外）で `git init && npm install`
  2. プラグインをロード: `claude --plugin-dir ./plugins/design-docs`
  3. `/design-docs:init` を実行 → 5 Phase フロー（ヒアリング → サンプル確認 → パターン推論 → マッチ結果確認 → 保存）が動作するか、config.md + knowledge.md が生成されるか
  4. `/design-docs:generate todos-api.md` → knowledge.md のパターンを使って API 設計書が生成されるか
  5. `/design-docs:generate dashboard.md` → 画面設計書+ワイヤーフレームが生成されるか
  6. コードを変更して `/design-docs:sync todos-api.md` → ast-grep diff で新規エンドポイントが検出されるか、更新提案が出るか
  7. `/design-docs:review todos-api.md` → ✓/≈ 分類のチェックリストが出力されるか
  8. `/design-docs:explain TODOのCRUDはどう動く？` → 設計書+ソースから回答されるか
- [ ] テスト結果に基づいてSKILL.mdを修正（必要であれば）

## 保留中の作業

- DevFlow の commands/ → skills/ 移行
  - `commands/*.md` はレガシー。`skills/<name>/SKILL.md` が推奨形式
  - design-docs プラグインのテスト完了後に着手
- DevFlow v2.0 のテスト
  - `/devflow:dev` で Phase 1-4 が正しく動くか確認
