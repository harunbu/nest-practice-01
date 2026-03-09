# AGENTS.md

このファイルは、このリポジトリで作業する人やエージェント向けの入口です。詳細は `docs/` を参照してください。

## 最初に確認するファイル

- ルートの `package.json`
- `turbo.json`
- 対象アプリの `package.json`
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## リポジトリ概要

- モノレポ構成は `Yarn Workspaces + Turborepo`
- フロントエンドは `apps/web` の Next.js
- バックエンドは `apps/api` の NestJS
- 共有コードは `packages/*` に配置する

## 作業ルール

- 複数ワークスペースに関わる変更は、ルートコマンドで build / lint / test の影響を見る
- 共有可能な型、定数、関数は `packages/shared` を優先する
- 共通 UI が必要になったら `packages/ui` に切り出す
- 新しい依存やスクリプトを追加したら `README.md` と関連ドキュメントを更新する
- 複雑な変更は `docs/exec-plans/active/` に実行計画を残す
- Git のコミットメッセージは日本語で書く
- Git 操作は逐次実行する。`git add` / `git commit` / `git push` を並列実行しない
- `.git/index.lock` エラーを避けるため、コミット前後に別の Git プロセスや IDE の自動 Git 操作が競合していないことを確認する
- `apps/api` では `postinstall` で Prisma を生成しない。`build` 実行時は `prebuild` で Prisma Client を自動生成するが、`schema.prisma` を変更して `dev` で確認する場合は明示的に `yarn workspace @repo/api db:generate` を実行する

## ドキュメントの置き場所

- セットアップと実行手順: [README.md](./README.md)
- 構成方針と依存ルール: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- 現行のプロダクト前提: [docs/product-specs/monorepo-baseline.md](./docs/product-specs/monorepo-baseline.md)
- メモアプリ要件: [docs/product-specs/memo-app.md](./docs/product-specs/memo-app.md)
- 実行計画の運用: [docs/exec-plans/README.md](./docs/exec-plans/README.md)
