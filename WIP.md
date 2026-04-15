# WIP - 作業再開ガイド

## 現在の状態

- リポジトリ名変更 (`claude` → `dotagents`) 完了
- **design-docs プラグイン v1.0.0 実装完了** — `plugins/design-docs/` に全ファイル配置済み。実行テスト未実施

## 今やっていること

- design-docs プラグインの実行テスト
  - `claude --plugin-dir ./plugins/design-docs` でロードして `/design-docs:init` → `/design-docs:generate` の流れを通す
  - テスト用プロジェクト: `plugins/design-docs/examples/todo-app/`

## 保留中の作業

- DevFlow の commands/ → skills/ 移行
  - `commands/*.md` はレガシー。`skills/<name>/SKILL.md` が推奨形式
  - design-docs プラグインのテスト完了後に着手
- DevFlow v2.0 のテスト
  - `/devflow:dev` で Phase 1-4 が正しく動くか確認
