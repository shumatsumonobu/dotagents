# WIP - 作業再開ガイド

## 現在の状態

- リポジトリ名変更 (`claude` → `dotagents`) 完了。全ファイル更新・push済み
- Skills 設計中 — 方向性を検討中（DESIGN.md）

## 今やっていること

- Skills の方向性決め（DESIGN.md で議論中）
  - やらないと決めたこと: 「Claude に普通に頼めばできること」のコマンド化、シェル注入ラッパー
  - 目指す方向: AI が自律的に考え・判断し・アクションするスキル

## 保留中の作業

- DevFlow の commands/ → skills/ 移行
  - `commands/*.md` はレガシー。`skills/<name>/SKILL.md` が推奨形式
  - スキルの方向性が決まってから着手
- DevFlow v2.0 のテスト
  - `/devflow:dev` で Phase 1-4 が正しく動くか確認
