# AGENTS.md

このリポジトリで作業するエージェント向けのガイドです。

## 基本方針

- 機密情報（`.env`、`keys/`）はコミットしない。
- 変更前後で `git status -sb` を確認する。
- データベース操作は慎重に行う（本番/検証/ローカルの混同を避ける）。
- コードには日本語で詳細なコメントを残す（特に変更箇所と理由）。

## 技術スタック

- Next.js (App Router)
- TypeScript
- Prisma / PostgreSQL
- Tailwind CSS
- Google Sheets API（`/api/roundtables`）
- Google Apps Script（`scripts/update-form-choices.gs`）

## よく使うコマンド

```bash
npm run dev
npm run lint
```

## 実行環境

- ローカル開発: `npm run dev`
- DB (ローカル): `./scripts/docker-postgres.sh start`
- マイグレーション: `npx prisma migrate dev`（開発用）, `npx prisma migrate deploy`（本番用）
- Prisma Client 再生成: `npx prisma generate`

運用環境での注意:
- 本番 DB に対して破壊的な操作（`migrate dev` / `reset` 等）を行わない。
- 操作前に対象環境（ローカル/ステージング/本番）を必ず確認する。

## 環境変数

- `.env` に依存（README の「環境変数」セクション参照）。
- `GOOGLE_CLIENT_EMAIL` / `GOOGLE_PRIVATE_KEY` は必須。

## 追加時の注意

- Googleフォームのヘッダー名が変わる場合は `app/api/roundtables/route.ts` の `HEADER_*` を更新。
- Apps Script の設定値は `scripts/update-form-choices.gs` のコメントに従う。

## Git接続先（remote）

- 現在の接続先は3つ: `origin` / `test` / `development`
- `origin`: `https://github.com/syogakusya/sit-desgin-expo2026.git`
- `test`: `https://github.com/perl-0815/sit-design-expo2026-test.git`
- `development`: `https://github.com/perl-0815/sit-design-expo2026-Development.git`
