# nest-practice-01

Next.js と NestJS の練習用アプリケーションを構築するためのモノレポです。

現在の構成は `Yarn Workspaces + Turborepo + Next.js + NestJS` です。

## セットアップ

1. Corepack を有効化します。
2. Yarn を有効化します。
3. 依存をインストールします。
4. API 用の環境変数を用意します。
5. Prisma の client 生成とローカル DB 初期化を行います。

```bash
corepack enable
corepack prepare yarn@stable --activate
yarn install
cp apps/api/.env.example apps/api/.env
yarn workspace @repo/api db:generate
yarn workspace @repo/api db:init
```

動作確認済み環境:

- Node.js `v22.18.0`
- Yarn `4.13.0`

## 開発コマンド

ルートで実行します。

```bash
yarn dev
yarn build
yarn lint
yarn test
```

各アプリの既定ポート:

- `apps/web`: `3000`
- `apps/api`: `3001`

API 用の主な環境変数:

- `DATABASE_URL`
- `JWT_SECRET`

API ワークスペースの補助コマンド:

- `yarn workspace @repo/api db:generate`
- `yarn workspace @repo/api db:init`

ローカル起動後の確認ポイント:

- `http://localhost:3000`
  - Next.js 側のトップページが表示される
- `http://localhost:3001/health`
  - NestJS 側の health response が JSON で返る
- Next.js のトップページ上で `Connected` と表示される
  - Web から API の疎通が取れている状態

## ワークスペース

```text
.
├── apps/
│   ├── api/          # NestJS API
│   └── web/          # Next.js frontend
├── docs/
│   ├── ARCHITECTURE.md
│   ├── exec-plans/
│   └── product-specs/
├── packages/
│   ├── shared/       # 共通型、定数、ユーティリティ
│   └── ui/           # 共通 UI
├── AGENTS.md
├── package.json
├── turbo.json
└── yarn.lock
```

## ドキュメント

- 開発ガイド: [AGENTS.md](./AGENTS.md)
- アーキテクチャ方針: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- 現行のプロダクト前提: [docs/product-specs/monorepo-baseline.md](./docs/product-specs/monorepo-baseline.md)
- メモアプリ要件: [docs/product-specs/memo-app.md](./docs/product-specs/memo-app.md)
- 実行計画の運用: [docs/exec-plans/README.md](./docs/exec-plans/README.md)
