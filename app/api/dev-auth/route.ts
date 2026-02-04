import { NextRequest, NextResponse } from "next/server";

import {
  DEV_AUTH_COOKIE_NAME,
  getDevAuthPasscode,
  sanitizeFromPath,
} from "@/lib/dev-auth";

// 開発用の簡易認証API。
// 正しいパスコードの場合のみ認証クッキーを付与する。
export const POST = async (req: NextRequest) => {
  const formData = await req.formData();
  const rawPasscode = formData.get("passcode");
  const rawFrom = formData.get("from");

  const expectedPasscode = getDevAuthPasscode();
  if (!expectedPasscode) {
    return new NextResponse(
      "DEVELOP_AUTH_PASSCODE is not configured.",
      { status: 500 }
    );
  }

  const passcode = typeof rawPasscode === "string" ? rawPasscode : "";
  const from = sanitizeFromPath(typeof rawFrom === "string" ? rawFrom : "/");

  if (passcode !== expectedPasscode) {
    const redirectUrl = new URL("/dev-auth", req.url);
    redirectUrl.searchParams.set("from", from);
    redirectUrl.searchParams.set("error", "1");
    return NextResponse.redirect(redirectUrl);
  }

  const redirectUrl = new URL(from, req.url);
  const response = NextResponse.redirect(redirectUrl);

  // セッション固定を避けつつ、開発用途として十分な有効期限を設定。
  response.cookies.set(DEV_AUTH_COOKIE_NAME, "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
};

export const GET = () => {
  return new NextResponse("Method Not Allowed", { status: 405 });
};
