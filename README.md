# nest-practice-01

Next.js と NestJS の練習用アプリケーションを構築するためのモノレポです。

現在の構成は `Yarn Workspaces + Turborepo + Next.js + NestJS` です。

## 構成

```text
.
├── apps/
│   ├── api/          # NestJS API
│   └── web/          # Next.js frontend
├── packages/
│   ├── shared/       # 共通型、定数、ユーティリティ用
│   └── ui/           # 共通 UI 用
├── AGENTS.md
├── README.md
├── package.json
├── turbo.json
└── yarn.lock
```

## 技術スタック

- Frontend: Next.js 16
- Backend: NestJS 11
- Package manager: Yarn 4
- Monorepo: Yarn Workspaces
- Task runner: Turborepo
- Language: TypeScript

## 動作確認済み環境

- Node.js `v22.18.0`
- Yarn `4.13.0`

## セットアップ

1. Corepack を有効化します。
2. Yarn を有効化します。
3. 依存をインストールします。

```bash
corepack enable
corepack prepare yarn@stable --activate
yarn install
```

## 開発コマンド

ルートで実行します。

```bash
yarn dev
yarn build
yarn lint
yarn test
```

各アプリの既定ポートは以下です。

- `apps/web`: `3000`
- `apps/api`: `3001`

ローカル起動後の確認ポイントは以下です。

- `http://localhost:3000`
  - Next.js 側のトップページが表示される
- `http://localhost:3001/health`
  - NestJS 側の health response が JSON で返る
- Next.js のトップページ上で `Connected` と表示される
  - Web から API の疎通が取れている状態

## 各ワークスペース

- `apps/web`
  - Next.js App Router 構成
- `apps/api`
  - NestJS の初期アプリ構成
- `packages/shared`
  - 共通ロジックの受け皿
- `packages/ui`
  - 共通 UI の受け皿

## 運用方針

- フロントエンドとバックエンドは同一リポジトリで管理する
- 共通型やユーティリティは `packages/shared` に集約する
- UI を共有する場合は `packages/ui` に切り出す
- build / lint / test / dev は可能な限りルートから Turborepo 経由で実行する
- 構成変更時は README と AGENTS.md を更新する

## 今後決めること

- DB を利用するか
- 認証方式をどうするか
- API クライアントと共通型の管理方法
- テスト戦略の詳細
- CI / CD の導入
- デプロイ先の構成

## ドキュメント

- 開発ルール: [AGENTS.md](./AGENTS.md)
