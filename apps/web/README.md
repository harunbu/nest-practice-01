# apps/web

Next.js 16 のフロントエンドです。

## 主な環境変数

- `NEXT_PUBLIC_API_BASE_URL`
  - ブラウザからアクセスする API の公開 URL
- `API_BASE_URL`
  - Server Component から参照する API URL
  - 未設定時は `NEXT_PUBLIC_API_BASE_URL` を使います

## ローカル開発

```bash
cp apps/web/.env.example apps/web/.env.local
yarn workspace @repo/web dev
```

既定では `http://127.0.0.1:3001` を API として参照します。

## Vercel デプロイ

- Root Directory は `apps/web`
- Framework Preset は `Next.js`
- 環境変数に `NEXT_PUBLIC_API_BASE_URL` と `API_BASE_URL` を設定する
