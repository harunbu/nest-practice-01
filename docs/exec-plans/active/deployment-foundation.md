# Deployment Foundation

## Status

Planned

## Goal

- ローカル開発を `web/api = Mac`、`PostgreSQL = Docker` に移行する
- 公開環境を `Vercel + Railway` 前提で動かせる状態にする
- 独自ドメインのサブドメインで公開できるようにする

## Target Architecture

- Local
  - `apps/web`: Mac 上で `yarn dev`
  - `apps/api`: Mac 上で `yarn dev`
  - `PostgreSQL`: Docker で起動
- Production
  - `apps/web`: Vercel
  - `apps/api`: Railway
  - `PostgreSQL`: Railway PostgreSQL
- Domains
  - Web: `memo.<your-domain>`
  - API: `memo-api.<your-domain>`

## Decisions

- SQLite は開発/公開ともにやめる
- Prisma は PostgreSQL 前提に切り替える
- フロントと API は引き続きホスト OS 上で開発する
- DB だけ Docker でローカル再現する
- 独自ドメインは最初からサブドメインで構成する

## Steps

1. `apps/api` の Prisma schema を PostgreSQL 用に変更する
2. SQLite 前提の `db:init` や関連コードを整理し、migration 前提に切り替える
3. Docker で PostgreSQL を起動するための `compose.yml` を追加する
4. ローカル用 env を PostgreSQL 接続に更新する
5. API の CORS を env ベースに変更する
6. Railway 用の env 一覧とデプロイ条件を README / docs に追加する
7. Vercel 用の env 一覧と設定内容を README / docs に追加する
8. `memo.<your-domain>` と `memo-api.<your-domain>` の DNS 設定手順をまとめる
9. ローカルで `register/login/notes CRUD` が PostgreSQL で動くことを確認する
10. 公開環境へデプロイして同じ操作を確認する

## Environment Variables

- API local / production
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `FRONTEND_ORIGIN`
- Web local / production
  - `NEXT_PUBLIC_API_BASE_URL`

## Verification Checklist

- Docker で PostgreSQL が起動する
- Prisma migration が適用できる
- `yarn lint`
- `yarn test`
- `yarn build`
- ブラウザから登録、ログイン、メモ CRUD、タグ検索が動く
- CORS エラーが出ない
- Vercel の Web から Railway API へ接続できる

## Notes For Next Session

- まずは公開作業に入る前に、ローカル DB を PostgreSQL に切り替える
- `Next.js` と `NestJS` を Docker に入れる必要は今のところない
- 本番公開前に `localStorage` ベース認証を Cookie 化するかは別途判断する
