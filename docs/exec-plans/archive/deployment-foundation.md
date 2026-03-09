# Deployment Foundation

## Status

Completed

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
- Railway の API サービスはリポジトリルートを前提にし、`yarn workspace @repo/api ...` で build / start する
- Railway の Watch Paths は `/apps/api/**`, `/packages/**` を使う
- Vercel の Web は `apps/web` を Root Directory にする
- Vercel の monorepo install 中に `apps/api` の Prisma 設定が読まれる前提で、install だけでは落ちない構成を維持する

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

## Incident Memo

### 2026-03-09 Vercel build failure caused by Prisma config evaluation

- 症状
  - Vercel の Production デプロイが `yarn install` で失敗した
  - 失敗ログには `PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL.` が出ていた
- 直接原因
  - Vercel の monorepo install 中に `apps/api/prisma.config.ts` が評価された
  - `apps/api/prisma.config.ts` が `env('DATABASE_URL')` を即時評価しており、Web デプロイ時でも API 用の `DATABASE_URL` が無いと落ちていた
- 対応
  - `apps/api/prisma.config.ts` を修正し、`DATABASE_URL` 未設定時はフォールバック URL を使って install 時の即死を防いだ
  - `turbo.json` の build 入力に `API_BASE_URL` と `NEXT_PUBLIC_API_BASE_URL`、`ENABLE_EXPERIMENTAL_COREPACK` を追加した
- 判断
  - 問題は「web と api のどちらに Prisma を寄せるか」ではなく、「web デプロイ時に api の Prisma config が読まれても install で落ちないこと」
  - API の実行時と migration では、引き続き Railway 側の正しい `DATABASE_URL` が必要
- 再発防止
  - `apps/api` で `postinstall` に Prisma 生成を置かない
  - API 側の Prisma 設定は、monorepo 全体の install で読まれても安全であることを前提に保つ
  - Vercel の Web では `API_BASE_URL` と `NEXT_PUBLIC_API_BASE_URL` を両方設定する

## Deployment Verification

- 2026-03-09 時点で以下を確認済み
  - Vercel: `nest-practice-01-web` の Production デプロイが `Ready`
  - Railway: `nest-practice-01` の最新デプロイが `SUCCESS`
  - `https://nest-practice-01-web.vercel.app` で `Connected` 表示を確認
  - `https://nest-practice-01-production.up.railway.app/health` が正常応答
  - 登録したデータを Railway Postgres に保存できていることを GUI クライアントでも確認

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

- この計画の対象だった PostgreSQL 移行、Vercel/Railway 公開、基本疎通確認は完了した
- `Next.js` と `NestJS` を Docker に入れる必要は今のところない
- 次の改善候補は `localStorage` ベース認証の Cookie 化
- デプロイ状態確認用の `package.json` scripts を追加する余地がある
- 本番動作確認のチェックリストを docs に切り出すと再確認しやすい
