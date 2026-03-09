# Memo Frontend Hardening

## Status

In Progress

## Goal

- 認証付きメモアプリを、学習用デモから継続して触れる構成へ引き上げる
- `localStorage` 依存の認証を見直し、画面要件に沿ったルーティングへ整理する
- Web と API の主要フローをテストで再確認できる状態にする

## Why Now

- デプロイ基盤の整理は完了し、次はアプリ本体の使い勝手と運用安全性を上げる段階に入った
- 現在の Web は 1 ページに認証とメモ操作を集約しており、要件の「画面を分ける」と差分がある
- 認証トークンは `localStorage` 保存のため、本番運用を意識すると改善優先度が高い
- ルートの `lint` / `test` / `build` は通るが、ユーザーフロー全体を守るテストはまだ薄い

## Scope

- Web 側の認証状態管理
- 画面分割とルーティング整理
- メモ一覧 / 詳細 / 作成 / 編集の UI 分離
- 主要フローのテスト追加

## Non Goals

- 権限モデルの追加
- リアルタイム同期
- タグ候補 UI の高度化
- Markdown エディタの作り込み

## Decisions

- 次の実装単位はバックエンド拡張より、Web の認証運用と画面構成を優先する
- 認証の保存方式は Cookie ベースを第一候補にし、必要なら API / Web 間の責務を再整理する
- 既存の API 契約は極力維持し、UI とセッション管理の刷新を先に進める
- 変更後もルートの `yarn lint` / `yarn test` / `yarn build` を通過条件にする

## Steps

1. 現在の認証フローを整理し、Cookie 化に必要な API / Web の責務を決める
2. `localStorage` ベース実装を置き換えるセッション管理方針を決める
3. Web のトップページ集中構成を、認証画面とメモ画面に分割する
4. メモ一覧、詳細、作成、編集の画面責務と遷移を整理する
5. 共通化できる API クライアントとフォーム処理を切り出す
6. API の認証 / notes 主要フローに対する統合テストを追加する
7. Web の主要操作に対する最低限の UI テストまたは E2E テストを追加する
8. README とプロダクト仕様の差分を更新する

## Progress Memo

- 2026-03-09 時点で Step 1 から Step 5 は実装済み
- Web は Next Route Handler を BFF として使い、`httpOnly` Cookie でセッションを保持する構成へ切り替えた
- 画面は `/auth`, `/notes`, `/notes/new`, `/notes/[id]`, `/notes/[id]/edit` へ分割した
- API 側は AuthController / NotesController の統合テストを追加し、認証・CRUD・タグ検索・所有者チェックを確認できるようにした
- `yarn lint`, `yarn test`, `yarn build` は通過済み

## Done When

- 認証トークンが `localStorage` 依存ではなくなる
- 登録、ログイン、メモ一覧、詳細、作成、編集が画面として分離される
- 既存の notes CRUD とタグ検索が新しい画面構成でも動く
- 主要フローをカバーするテストが追加される
- `yarn lint`
- `yarn test`
- `yarn build`

## Risks

- Cookie 化では CORS、SameSite、ローカル開発時の挙動差分を丁寧に扱う必要がある
- 画面分割と同時に認証方式も変えるため、責務を曖昧にすると変更が広がりやすい
- テスト基盤を先に決めないと、UI 再編後の回帰確認コストが上がる

## Verification

- ローカルで登録、ログイン、ログアウトができる
- ローカルでメモ作成、一覧、詳細、更新、削除、タグ検索ができる
- 未認証時に保護画面や保護 API へ直接アクセスできない
- ページ遷移後も認証状態が期待どおりに維持される
- `yarn lint`
- `yarn test`
- `yarn build`

## Notes For Next Session

- 次は Step 6 と Step 7 のテスト拡張を進める
- API 統合テストは追加済みなので、次は Web E2E または UI テストを足す
- Markdown 表示はこの計画の後半、または次テーマに回してよい
