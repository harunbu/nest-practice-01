# Memo Backend Foundation

## Status

Completed

## Goal

- メモアプリの API 基盤を最初に成立させる
- Prisma と SQLite を導入し、User / Note / Tag の永続化を始める
- JWT 認証付きで `register` / `login` / `notes` の基本 API を作る

## Decisions

- ORM は Prisma
- 開発用 DB は SQLite
- 認証方式は JWT Bearer Token
- 今回は API と共有契約を優先し、Web 画面は次の工程で接続する

## Steps

1. 依存関係を追加する
2. Prisma schema を作成する
3. `auth` / `notes` モジュールを追加する
4. 共有契約を `packages/shared` に追加する
5. 基本テストを追加する
6. `yarn lint` と `yarn test` で確認する

## Done When

- `POST /auth/register` と `POST /auth/login` が動く
- `GET /notes`、`GET /notes/:id`、`POST /notes`、`PATCH /notes/:id`、`DELETE /notes/:id` の基本形が動く
- ユーザー単位のアクセス制御が入っている

## Verification

- `yarn workspace @repo/api db:generate`
- `yarn workspace @repo/api db:init`
- `yarn lint`
- `yarn test`
- `yarn build`
