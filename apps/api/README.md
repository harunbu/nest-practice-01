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

- Root Directory は `apps/api`
- Build Command は `yarn workspace @repo/api build`
- Start Command は `yarn workspace @repo/api start:railway`
- PostgreSQL は Railway の接続情報を `DATABASE_URL` に設定する
