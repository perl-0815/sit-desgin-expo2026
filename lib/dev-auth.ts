// 開発時のみ有効にする簡易認証の共通ロジック。
// ミドルウェア・API・ページで同じ判定を使うために切り出している。

export const DEV_AUTH_COOKIE_NAME = "dev_auth";

// `develop=true` または `DEVELOP=true` のどちらでも有効化できるようにする。
// 設定ミスの検出をしやすくするため、厳密に "true" のみを有効扱い。
export const isDevAuthEnabled = (): boolean => {
  return (
    process.env.DEVELOP === "true" ||
    process.env["develop"] === "true"
  );
};

// 認証パスコードの取得。未設定なら空文字を返す。
export const getDevAuthPasscode = (): string => {
  return process.env.DEVELOP_AUTH_PASSCODE ?? "";
};

// `from` パラメータを安全な内部パスに限定する。
// 先頭が "/" 以外の場合はトップページへフォールバック。
export const sanitizeFromPath = (from: string | null): string => {
  if (!from) return "/";
  if (!from.startsWith("/")) return "/";
  // 攻撃的なスキーム混入や `//` のような外部解釈を避ける。
  if (from.startsWith("//")) return "/";
  return from;
};
