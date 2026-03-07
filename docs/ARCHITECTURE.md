# Architecture

このドキュメントは、モノレポ全体の構成方針と依存ルールを定義します。

## 技術スタック

- Frontend: Next.js 16
- Backend: NestJS 11
- Package manager: Yarn 4
- Monorepo: Yarn Workspaces
- Task runner: Turborepo
- Language: TypeScript

## ディレクトリ方針

```text
apps/
  web/      Next.js frontend
  api/      NestJS API
packages/
  shared/   共通型、定数、ユーティリティ
  ui/       共通 UI
docs/
  ARCHITECTURE.md
  product-specs/
  exec-plans/
```

## 実装方針

- Next.js は App Router 前提で進める
- NestJS の API 契約はフロントエンドとずれないように管理する
- 共有契約が増えたら `packages/shared` に明示的に切り出す
- 命名、責務分割、ディレクトリ構成は一貫性を優先する

## 依存ルール

- `apps/web` は `apps/api` の実装を直接 import しない
- `apps/api` と `apps/web` が共有する型は `packages/shared` に置く
- `packages/ui` は UI コンポーネントに限定し、API 契約やサーバー実装を持ち込まない
- ルートスクリプトは Turborepo 経由で統一する
- ワークスペースごとの基本タスク名は `dev` / `build` / `lint` / `test` に揃える

## ポート方針

- `apps/web` は `3000`
- `apps/api` は `3001`

競合を避けるため、API の既定ポートは `3001` とする。

## ドキュメント更新ルール

- セットアップ手順が変わったら `README.md` を更新する
- ディレクトリ構成や運用方針が変わったらこのファイルを更新する
- ポート、スクリプト、ワークスペース名を変えた場合も反映する
- 要件や未確定事項が変わったら `docs/product-specs/` を更新する
- 複雑な変更の進行中メモは `docs/exec-plans/active/` に残す
