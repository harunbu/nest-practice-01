# AGENTS.md

このファイルは、このリポジトリで作業する人やエージェント向けの作業ガイドです。

## リポジトリ概要

- モノレポ構成は `Yarn Workspaces + Turborepo`
- フロントエンドは `apps/web` の Next.js
- バックエンドは `apps/api` の NestJS
- 共有コードは `packages/*` に配置する

## ディレクトリ方針

```text
apps/
  web/      Next.js frontend
  api/      NestJS API
packages/
  shared/   共通型、定数、ユーティリティ
  ui/       共通 UI
```

## 基本コマンド

ルートで以下を実行する。

```bash
yarn dev
yarn build
yarn lint
yarn test
```

## ポート方針

- `apps/web` は `3000`
- `apps/api` は `3001`

競合を避けるため、API の既定ポートは `3001` とする。

## 作業ルール

- 変更前にルートの `package.json`、`turbo.json`、対象アプリの `package.json` を確認する
- 複数ワークスペースに関わる変更は、ルートコマンドで build / lint / test の影響を見る
- 共有可能な型、定数、関数は `packages/shared` を優先する
- 共通 UI が必要になったら `packages/ui` に切り出す
- 新しい依存やスクリプトを追加したら README とこのファイルを更新する

## スクリプト方針

- ルートスクリプトは Turborepo 経由で統一する
- ワークスペースごとの基本タスク名は `dev` / `build` / `lint` / `test` に揃える
- `lint` は自動修正前提ではなく、検査コマンドとして扱う

## 実装方針

- Next.js は App Router 前提で進める
- NestJS の API 契約はフロントエンドとずれないように管理する
- 共有契約が増えたら `packages/shared` に明示的に切り出す
- 命名、責務分割、ディレクトリ構成は一貫性を優先する

## ドキュメント更新ルール

- セットアップ手順が変わったら `README.md` を更新する
- ディレクトリ構成や運用方針が変わったら `AGENTS.md` を更新する
- ポート、スクリプト、ワークスペース名を変えた場合も反映する

## 未確定事項

- DB の採用有無と選定
- 認証方式
- API クライアント共有方式
- テスト戦略の拡張
- CI / CD
- デプロイ構成
