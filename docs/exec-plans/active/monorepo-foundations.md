# Monorepo Foundations

## Status

Completed

## Goal

- ドキュメントを入口と詳細に分離する
- API 契約を `packages/shared` に移す
- 依存ルールを壊しにくくする検査を追加する

## Steps

1. `README.md` と `AGENTS.md` を入口に整理する
2. `docs/ARCHITECTURE.md` と `docs/product-specs/` を追加する
3. `/health` の契約型を共有パッケージへ移す
4. 境界ルールを検査できる lint を追加する
5. ルートの `yarn lint` と `yarn test` で確認する

## Verification

- `yarn lint`
- `yarn test`

## Done When

- 主要ドキュメントの役割が分離されている
- Web と API が同じ health 契約型を使う
- `apps/web` から `apps/api` への直接 import を lint で防げる
