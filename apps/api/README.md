# apps/api

NestJS 11 と Prisma の API アプリです。

## 主な環境変数

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_ORIGIN`
- `PORT`

## ローカル開発

```bash
cp apps/api/.env.example apps/api/.env
docker compose up -d postgres
yarn workspace @repo/api db:migrate:dev
yarn workspace @repo/api dev
```

## Railway デプロイ

- Root Directory はリポジトリのルートのまま運用する
- Build Command は `yarn workspace @repo/api build`
- Start Command は `yarn workspace @repo/api start:railway`
- Watch Paths は `/apps/api/**`, `/packages/**`
- PostgreSQL は Railway の接続情報を `DATABASE_URL` に設定する
- `prisma.config.ts` は monorepo の install 時に読まれることがあるため、`DATABASE_URL` 未設定でも install では落ちない構成にしている

## 運用メモ

- 状態確認: `railway service status --service nest-practice-01`
- ログ確認: `railway logs --service nest-practice-01`
- 本番 DB の外部接続情報確認: `railway variables --service Postgres --environment production`
