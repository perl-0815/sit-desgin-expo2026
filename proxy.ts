import { NextRequest, NextResponse } from "next/server";

import {
  DEV_AUTH_COOKIE_NAME,
  isDevAuthEnabled,
  sanitizeFromPath,
} from "./lib/dev-auth";

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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
