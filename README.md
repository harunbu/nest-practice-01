# nest-practice-01

Next.js と NestJS の練習用アプリケーションを構築するためのモノレポです。

現在の構成は `Yarn Workspaces + Turborepo + Next.js + NestJS` です。
公開先は `apps/web = Vercel`、`apps/api = Railway` を前提に整備します。

## セットアップ

1. Corepack を有効化します。
2. Yarn を有効化します。
3. 依存をインストールします。
4. PostgreSQL を起動します。
5. API / Web の環境変数を用意します。
6. Prisma migration を適用します。

```bash
corepack enable
corepack prepare yarn@stable --activate
yarn install
docker compose up -d postgres
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
yarn workspace @repo/api db:migrate:dev
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
- `FRONTEND_ORIGIN`

Web 用の主な環境変数:

- `NEXT_PUBLIC_API_BASE_URL`
- `API_BASE_URL`

API ワークスペースの補助コマンド:

- `yarn workspace @repo/api db:generate`
- `yarn workspace @repo/api db:migrate:dev`
- `yarn workspace @repo/api db:migrate:deploy`

ローカル起動後の確認ポイント:

- `http://localhost:3000`
  - Next.js 側のトップページが表示される
- `http://localhost:3000/auth`
  - 登録とログインを専用画面で試せる
- `http://localhost:3000/notes`
  - 認証後にメモ一覧とタグ検索を試せる
- `http://localhost:3001/health`
  - NestJS 側の health response が JSON で返る
- Next.js のトップページ上で `Connected` と表示される
  - Web から API の疎通が取れている状態

Web 側の認証運用:

- ログイン後のセッションは `httpOnly` Cookie で保持する
- Web は `apps/web/src/app/api/*` の Route Handler 経由で API を呼び出す
- メモ画面は `/notes`, `/notes/new`, `/notes/:id`, `/notes/:id/edit` に分割している

## ローカル PostgreSQL

DB はルートの `compose.yml` で起動します。

```bash
docker compose up -d postgres
docker compose ps
docker compose down
```

既定の接続先:

- DB 名: `memo_app`
- User: `postgres`
- Password: `postgres`
- Port: `5432`

## デプロイ手順

### 1. Railway に API を作成する

1. GitHub リポジトリを Railway に接続する
2. Root Directory はリポジトリのルートのまま運用する
3. Railway PostgreSQL を追加し、その接続情報を `DATABASE_URL` に設定する
4. API 環境変数を設定する

API 環境変数:

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_ORIGIN=https://memo.<your-domain>`

推奨コマンド:

- Build Command: `yarn workspace @repo/api build`
- Start Command: `yarn workspace @repo/api start:railway`
- Watch Paths: `/apps/api/**`, `/packages/**`

公開後の確認:

- `https://memo-api.<your-domain>/health` が JSON を返す

### 2. Vercel に Web を作成する

1. 同じ GitHub リポジトリを Vercel に接続する
2. `apps/web` を Root Directory に設定する
3. Web 環境変数を設定する

Web 環境変数:

- `NEXT_PUBLIC_API_BASE_URL=https://memo-api.<your-domain>`
- `API_BASE_URL=https://memo-api.<your-domain>`

補足:

- Vercel は monorepo の `yarn install` 中に `apps/api` を読むことがある
- `apps/api/prisma.config.ts` は `DATABASE_URL` が未設定でも install で即死しないようにしている
- `API_BASE_URL` と `NEXT_PUBLIC_API_BASE_URL` は `turbo.json` の build 入力に追加済み

公開後の確認:

- `https://memo.<your-domain>` のトップで `Connected` が表示される
- 登録、ログイン、メモ CRUD が動く

## デプロイ確認

Vercel と Railway は公式 CLI で確認できます。CLI はグローバルインストール前提でも構いません。

```bash
# Vercel
cd apps/web
vercel whoami
vercel list nest-practice-01-web
vercel inspect <deployment-url> --wait
vercel inspect <deployment-url> --logs

# Railway
cd apps/api
railway whoami
railway service status --service nest-practice-01
railway logs --service nest-practice-01
```

反映待ちの注意:

- `git push` 直後は、Vercel と Railway が同時にデプロイを開始しても反映完了の時刻は揃わない
- 数十秒から数分、古いデプロイが本番エイリアスを向いたままになることがある
- 先に `vercel list ...` と `railway service status ...` で `Ready` / `SUCCESS` を確認してから本番 URL を見る
- 保護ルートは未ログイン時に `/auth` へリダイレクトされるため、`/notes` の `307 -> /auth` は正常挙動
- `/auth` や `/notes` が一時的に 404 の場合、旧デプロイがまだ切り替わっていない可能性がある

本番の疎通確認:

```bash
curl -sS https://nest-practice-01-production.up.railway.app/health
curl -sS https://nest-practice-01-web.vercel.app
curl -I -sS https://nest-practice-01-web.vercel.app/auth
curl -I -sS https://nest-practice-01-web.vercel.app/notes
```

## トラブルシュート

### Vercel の install 中に Prisma で落ちる

過去に、Vercel の `yarn install` 中に `apps/api/prisma.config.ts` が評価され、`DATABASE_URL` 未設定で `PrismaConfigEnvError` になったことがある。

対策:

- `apps/api/prisma.config.ts` では `DATABASE_URL` 未設定時にフォールバック値を使う
- API の実運用では必ず Railway 側で `DATABASE_URL` を設定する
- Web 側の API URL は `API_BASE_URL` と `NEXT_PUBLIC_API_BASE_URL` を両方設定する

### Railway の DB を GUI クライアントで見たい

Railway の外部接続情報は `Postgres` サービスの変数から確認する。

```bash
cd apps/api
railway variables --service Postgres --environment production
```

PHPStorm などの GUI クライアントには、内部向けの `DATABASE_URL` ではなく外部接続用の `DATABASE_PUBLIC_URL` 相当の Host / Port を使う。

### 3. 独自ドメインを接続する

- Vercel 側に `memo.<your-domain>` を設定する
- Railway 側に `memo-api.<your-domain>` を設定する
- DNS に CNAME または各サービスの案内するレコードを追加する
- `FRONTEND_ORIGIN` と `NEXT_PUBLIC_API_BASE_URL` / `API_BASE_URL` を本番ドメインへ更新する

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
