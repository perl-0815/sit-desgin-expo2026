import { NextRequest, NextResponse } from "next/server";

import {
  DEV_AUTH_COOKIE_NAME,
  isDevAuthEnabled,
  sanitizeFromPath,
} from "./lib/dev-auth";

// SNS のリンクプレビュー生成で使われる主要クローラの User-Agent 断片。
// 認証を強制すると OG/Twitter メタタグを読めず、共有カード画像が表示されなくなるため、
// プレビュー生成に必要なリクエストだけを最小限で通過させる。
const SOCIAL_PREVIEW_BOT_UA_PATTERNS = [
  "twitterbot",
  "facebookexternalhit",
  "facebot",
  "linkedinbot",
  "slackbot-linkexpanding",
  "discordbot",
  "whatsapp",
  "line",
];

// User-Agent が SNS プレビュー用クローラかどうかを判定する。
// 大文字小文字の揺れに対応するため lower-case 化して部分一致で評価する。
const isSocialPreviewBot = (userAgent: string | null): boolean => {
  if (!userAgent) return false;
  const normalizedUserAgent = userAgent.toLowerCase();
  return SOCIAL_PREVIEW_BOT_UA_PATTERNS.some((pattern) =>
    normalizedUserAgent.includes(pattern)
  );
};

// 開発用の簡易認証。
// `develop=true`（または `DEVELOP=true`）のときだけ有効化し、
// 認証済みクッキーが無い場合はパスコード画面へリダイレクトする。
// Next.js の警告回避のため、ファイル名・エクスポート名を middleware から proxy に変更している。
export const proxy = (req: NextRequest) => {
  if (!isDevAuthEnabled()) return NextResponse.next();

  const { pathname, search } = req.nextUrl;

  // 認証ページと認証APIは除外（無限ループ回避のため）。
  if (pathname === "/dev-auth" || pathname === "/api/dev-auth") {
    return NextResponse.next();
  }

  // SNS クローラには認証を課さず、リンクプレビュー生成に必要なメタ情報を取得可能にする。
  // これにより DEVELOP=true の運用時でも共有カード画像が表示される。
  const userAgent = req.headers.get("user-agent");
  if (isSocialPreviewBot(userAgent)) {
    return NextResponse.next();
  }

  const cookieValue = req.cookies.get(DEV_AUTH_COOKIE_NAME)?.value;
  if (cookieValue === "ok") return NextResponse.next();

  // 元の遷移先を保持して認証ページへ。
  const redirectUrl = req.nextUrl.clone();
  redirectUrl.pathname = "/dev-auth";
  redirectUrl.searchParams.set(
    "from",
    sanitizeFromPath(`${pathname}${search}`)
  );

  return NextResponse.redirect(redirectUrl);
};

export const config = {
  // 静的アセットはミドルウェアを通さない。
  // SNSクローラが画像を取得できるよう、/image 配下も認証対象から除外します。
  // favicon / アイコン類もクローラが参照できるよう除外します。
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|image/|icon.png|apple-icon.png|manifest.webmanifest).*)",
  ],
};
