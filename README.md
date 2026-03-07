# nest-practice-01

React.js と NestJS を使った練習用アプリケーションを構築するためのモノレポです。

現時点では初期ドキュメントのみを配置しています。構成は `Yarn Workspaces + Turborepo + Next.js + NestJS` を前提とします。

## 目的

- React.js でフロントエンドを構築する
- NestJS で API サーバーを構築する
- モノレポ構成でフロントエンドとバックエンドを一元管理する
- 開発、ビルド、テストの流れを統一する

## 想定構成

以下は初期構成の叩き台です。

```text
.
├── apps/
│   ├── web/        # Next.js アプリ
│   └── api/        # NestJS アプリ
├── packages/
│   ├── shared/     # 共通型、定数、ユーティリティ
│   └── ui/         # 共通 UI が必要になった場合に利用
├── package.json
├── turbo.json
├── yarn.lock
├── README.md
└── AGENTS.md
```

## 技術スタック

- Frontend: Next.js
- Backend: NestJS
- Package manager: Yarn
- Monorepo tool: Turborepo
- Workspace management: Yarn Workspaces
- Linter / Formatter: 未確定
- Test runner: 未確定

## セットアップ手順

実装前のため、以下は初期構築の想定手順です。

1. このリポジトリを clone します。
2. Node.js の推奨バージョンを揃えます。
3. Yarn を有効化します。
4. ルートに `package.json` と `turbo.json` を作成し、workspaces を定義します。
5. `apps/web` に Next.js アプリを作成します。
6. `apps/api` に NestJS アプリを作成します。
7. 必要に応じて `packages/` 配下へ共通コードを切り出します。

## 開発方針

- フロントエンドとバックエンドは同一リポジトリで管理する
- 共通で使う型やユーティリティは `packages/` に集約する
- ビルド、Lint、テストの実行は Turborepo 経由で統一する
- ドキュメントと実装の差分が出たら README / AGENTS.md を先に更新する

## 予定しているアプリ

- `apps/web`: Next.js を使ったフロントエンド
- `apps/api`: NestJS を使った API サーバー

## 今後決めること

- DB を使うか、使うなら何を選ぶか
- テスト戦略をどうするか
- CI を導入するか
- `packages/ui` を用意するか
- API クライアントや共通型の管理方法をどうするか

## ドキュメント

- 開発ルール: [AGENTS.md](./AGENTS.md)

## ステータス

初期化前の叩き台です。次のステップは、Yarn Workspaces と Turborepo の初期設定、および `apps/web` と `apps/api` の作成です。
