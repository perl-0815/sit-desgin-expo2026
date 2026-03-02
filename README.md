このプロジェクトは [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) で作成した [Next.js](https://nextjs.org) アプリです。

## はじめに（初回セットアップ）

このセクションだけ順番に実行すれば、初めてでも「クローン -> ローカル起動」まで進められます。

1. Node.js / npm をインストール（推奨: Node.js 20 以上）
2. GitHub からリポジトリをクローン

```bash
git clone https://github.com/syogakusya/sit-desgin-expo2026.git
cd sit-desgin-expo2026
```

3. 依存関係をインストール

```bash
npm install
```

4. `.env` を作成して環境変数を設定（後述の「環境変数」を参照）

`.env` の最小例（ローカル DB 起動まで）:

```dotenv
DATABASE_URL="postgres://sit:sitpass@localhost:5432/sit_design_expo?schema=public"
DATABASE_DIRECT_URL="postgres://sit:sitpass@localhost:5432/sit_design_expo?schema=public"
```

5. ローカル Postgres を起動（後述の「ローカル Postgres (Docker)」を参照）

```bash
./scripts/docker-postgres.sh start
```

6. Prisma マイグレーションと Prisma Client 再生成を実行

```bash
npx prisma migrate dev
npx prisma generate
```

7. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと表示されます。  
`app/page.tsx` を編集すると自動で更新されます。

補足:
- Yarn / pnpm / bun でも起動できます。
- 本番環境に対して `npx prisma migrate dev` は実行しないでください（開発環境専用）。
- `GOOGLE_CLIENT_EMAIL` / `GOOGLE_PRIVATE_KEY` などが未設定でも、Google Sheets を使う機能以外は動作確認できます。

## ローカル Postgres (Docker)

ローカルで Postgres を起動するためのスクリプトが含まれています。

起動（bashで実行してください）:

```bash
./scripts/docker-postgres.sh start
```

状態確認（bashで実行してください）:

```bash
./scripts/docker-postgres.sh status
```

停止（bashで実行してください）:

```bash
./scripts/docker-postgres.sh stop
```

接続文字列（ローカル開発用に `.env` に設定）:

```text
DATABASE_URL="postgres://sit:sitpass@localhost:5432/sit_design_expo?schema=public"
DATABASE_DIRECT_URL="postgres://sit:sitpass@localhost:5432/sit_design_expo?schema=public"
```

## 環境変数

このプロジェクトで使用している `.env` の主な環境変数をまとめます。

### Prisma / Postgres

- `DATABASE_URL`  
  Prisma が使用する接続文字列。ローカル開発では Docker の Postgres を指します。
- `DATABASE_DIRECT_URL`  
  Prisma の一部コマンドで使われる直接接続用の文字列。通常は `DATABASE_URL` と同値。

### Google Sheets (座談会予約フォーム)

座談会予約フォームの応募状況を取得する API（`GET /api/roundtables`）で使用します。  
サービスアカウントの JSON から以下を転記してください。

- `GOOGLE_CLIENT_EMAIL`  
  サービスアカウントの `client_email`。スプレッドシートに閲覧権限で共有が必要。
- `GOOGLE_PRIVATE_KEY`  
  サービスアカウントの `private_key`。改行は `\n` 形式で保存すること。
- `GOOGLE_SHEET_ID`  
  スプレッドシートの ID。URL の `/d/` と `/edit` の間にある文字列。
- `GOOGLE_SHEET_NAME`  
  取得対象のシート名（タブ名）。例: `フォームの回答１`

### Cloudflare R2

画像アップロード系のスクリプトで使用します。

- `R2_ACCESS_KEY_ID`  
  R2 のアクセスキー ID。
- `R2_SECRET_ACCESS_KEY`  
  R2 のシークレットキー。
- `R2_BUCKET_NAME`  
  使用するバケット名。
- `R2_BUCKET_ENDPOINT`  
  バケットにアクセスするためのエンドポイント。
- `R2_ENDPOINT`  
  R2 の S3 互換エンドポイント。

マイグレーション実行:

これは開発環境用
```bash
npx prisma migrate dev
```

これは本番環境用
```bash
npx prisma migrate deploy
```

マイグレーションが終わった後に Prisma Client の再生成をしてください
```bash
npx prisma generate
```

## スクリプト一覧

プロジェクトには運用補助のスクリプトが含まれています。

### CSV 取り込み (ローカル DB)

`googleform/*.csv` をローカル Postgres に upsert で取り込みます。

```bash
node scripts/seed-csv.js
```

前提:
- `.env` の `DATABASE_URL` が `postgres://` 形式
- ローカル DB が起動済み（`./scripts/docker-postgres.sh start`）

### Research 画像アップロード + CSV 更新

`googleform/research.csv` の画像パスに対応する元画像をアップロードし、  
横幅 480px の JPEG サムネイルを生成して R2 に保存します。  
アップロード後、`image_url` / `image_thumb_url` を R2 URL に更新します。

```bash
node scripts/upload-research-images.js
```

前提:
- `.env` に R2 の以下の環境変数が設定されていること  
  `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_BUCKET_ENDPOINT`, `R2_ENDPOINT`

### Portfolio 画像アップロード + CSV 更新

`googleform/portfolios.csv` の `image1_url` / `image2_url` を元にアップロードし、  
それぞれのサムネイルを生成して R2 に保存します。  
アップロード後、`image1_*` / `image2_*` の URL を更新します。

```bash
node scripts/upload-portfolio-images.mjs
```

前提:
- `.env` に R2 の以下の環境変数が設定されていること  
  `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_BUCKET_ENDPOINT`, `R2_ENDPOINT`

### Google フォームの選択肢自動更新 (Apps Script)

`scripts/update-form-choices.gs` に Google Apps Script の例を置いています。  
回答スプレッドシートの応募数に応じて、フォームのチェックボックス選択肢から満員の座談会を削除します。

使い方:
- `FORM_ID`, `SHEET_NAME`, `QUESTION_TITLE`, `COUNT_TITLE` を実際の値に置き換え
- Apps Script エディタに貼り付け
- 5分おきの時間主導トリガーで `updateChoices` を実行

注意:
- フォームの質問文を変更した場合は `QUESTION_TITLE` / `COUNT_TITLE` を更新
- 満員の選択肢は「削除」され、表示されなくなります

このプロジェクトは [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) を使って [Geist](https://vercel.com/font) フォントを最適化して読み込みます。

## 参考

Next.js の詳細は以下を参照してください:

- [Next.js Documentation](https://nextjs.org/docs) - 機能や API の詳細
- [Learn Next.js](https://nextjs.org/learn) - チュートリアル

[Next.js の GitHub リポジトリ](https://github.com/vercel/next.js) も参照できます。フィードバックやコントリビュートも歓迎されています。

## Vercel へのデプロイ

最も簡単なデプロイ方法は、Next.js の開発元である [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) を使うことです。

このリポジトリでの基本手順:

1. GitHub のリポジトリを Vercel に Import する
2. Project Settings -> Environment Variables に `.env` の値を登録する  
   最低限 `DATABASE_URL` と `DATABASE_DIRECT_URL` は必須です。  
   座談会 API を使う場合は `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_NAME` も設定してください。
3. 本番 DB を使う場合は、接続先が本番 DB であることを確認して `npx prisma migrate deploy` を実行する
4. デプロイ後、必要に応じて `npm run lint` と動作確認を行う

補足:
- `npm run build` は `scripts/vercel-build.sh` を実行する設定です。
- `npx prisma migrate dev` は開発環境専用です。Vercel / 本番 DB では使用しないでください。

詳しくは [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) を参照してください。
