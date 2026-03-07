# Memo App

認証付きのシンプルなメモアプリを作り、`Next.js + NestJS` の基本的なフルスタック実装を一通り学べる状態を目指す。

## 目的

- ユーザー認証のある Web アプリを一通り実装できるようにする
- メモ CRUD を通して API 設計、状態管理、画面遷移を学ぶ
- タグ検索と Markdown 対応まで含めて、少し実用的なアプリの形にする

## 機能要件

- ユーザー登録ができる
- ログインができる
- ログインしたユーザーが自分のメモを作成できる
- ログインしたユーザーが自分のメモを一覧表示できる
- ログインしたユーザーが自分のメモ詳細を閲覧できる
- ログインしたユーザーが自分のメモを編集できる
- ログインしたユーザーが自分のメモを削除できる
- メモにタグを付けられる
- タグでメモを検索できる
- メモ本文を Markdown で保存できる
- メモ本文を Markdown として表示できる

## 画面要件

- ユーザー登録画面
- ログイン画面
- メモ一覧画面
- メモ詳細画面
- メモ作成画面
- メモ編集画面

## API 要件

最低限必要な API:

- `POST /auth/register`
- `POST /auth/login`
- `GET /notes`
- `GET /notes/:id`
- `POST /notes`
- `PATCH /notes/:id`
- `DELETE /notes/:id`
- `GET /notes?tag=react`

API の前提:

- 認証が必要な API は JWT を利用する
- メモ取得系 API はログインユーザー本人のデータだけを返す
- タグ検索はクエリパラメータで受け取る

## データ要件

### User

- `id`
- `email`
- `passwordHash`
- `createdAt`

### Note

- `id`
- `userId`
- `title`
- `content`
- `createdAt`
- `updatedAt`

### Tag

- `id`
- `name`

### NoteTag

- `noteId`
- `tagId`

## 認証要件

- JWT 認証を使う
- メモ操作はログインユーザー本人のデータだけに制限する
- 未認証時は保護 API にアクセスできない

## フロントエンド要件

- フォーム管理を導入する
- API クライアント層を用意する
- 認証状態を扱う仕組みを用意する
- 一覧、詳細、作成、編集の各画面を分けて実装する

## バックエンド要件

- Controller を分けて API を公開する
- Service にユースケースを寄せる
- DTO と Validation を導入する
- ORM は Prisma または TypeORM を採用候補とする

## 学習テーマ

- NestJS
  - Controller
  - Service
  - DTO
  - Validation
  - JWT 認証
  - Prisma / TypeORM
- React / Next.js
  - フォーム管理
  - API クライアント
  - 認証状態管理
  - 一覧 + 詳細 + 編集画面

## 実装優先順位

1. ユーザー登録 / ログイン
2. メモ CRUD
3. タグ付けとタグ検索
4. Markdown 表示
5. UI 改善とバリデーション強化

## 未確定事項

- 認証トークンの保存場所を Cookie にするか、別方式にするか
- Markdown の表示ライブラリを何にするか
- タグ入力 UI を自由入力にするか、候補選択にするか

## 現在の技術選定

- ORM は Prisma を採用する
- 開発/本番 DB は PostgreSQL を採用する
- 認証は JWT Bearer Token を採用する
- 認証 API は `register` と `login` を先に実装する
- 最初の実装は API 側を優先し、Web 側は API 契約が固まってから接続する
