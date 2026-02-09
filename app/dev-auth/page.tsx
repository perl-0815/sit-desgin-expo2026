import {
  getDevAuthPasscode,
  isDevAuthEnabled,
} from "@/lib/dev-auth";

// 開発環境の簡易認証用ページ。
// `develop=true`（または `DEVELOP=true`）のときのみ意味を持つ。
type DevAuthPageProps = {
  searchParams?: {
    from?: string;
    error?: string;
  };
};

const DevAuthPage = ({ searchParams }: DevAuthPageProps) => {
  const enabled = isDevAuthEnabled();
  const passcode = getDevAuthPasscode();
  const hasPasscode = passcode.length > 0;
  const showError = searchParams?.error === "1";
  const from = searchParams?.from ?? "/";

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* モバイルは画面幅いっぱいに広げるため、最大幅の制限はmd以上に限定します。 */}
      <div className="mx-auto flex min-h-screen w-full flex-col justify-center px-6 py-12 md:max-w-xl">
        <h1 className="text-2xl font-semibold">開発用アクセス認証</h1>
        <p className="mt-3 text-sm text-gray-600">
          デザイナー確認用の簡易認証です。開発フラグが有効な場合のみ入力が必要です。
        </p>

        {!enabled && (
          <div className="mt-6 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p>
              現在は開発用認証が無効です（`develop=true` または `DEVELOP=true`
              が未設定）。
            </p>
          </div>
        )}

        {enabled && !hasPasscode && (
          <div className="mt-6 rounded border border-red-300 bg-red-50 p-4 text-sm text-red-900">
            <p>
              認証パスコードが設定されていません。`.env` に
              `DEVELOP_AUTH_PASSCODE` を設定してください。
            </p>
          </div>
        )}

        {enabled && hasPasscode && (
          <form
            className="mt-6 flex flex-col gap-3"
            action="/api/dev-auth"
            method="post"
          >
            <input type="hidden" name="from" value={from} />
            <label className="text-sm font-medium" htmlFor="passcode">
              パスコード
            </label>
            <input
              id="passcode"
              name="passcode"
              type="password"
              className="rounded border border-gray-300 px-3 py-2 text-base"
              placeholder="パスコードを入力"
              required
            />
            {showError && (
              <p className="text-sm text-red-600">パスコードが違います。</p>
            )}
            <button
              type="submit"
              className="rounded bg-gray-900 px-4 py-2 text-white"
            >
              認証する
            </button>
          </form>
        )}
      </div>
    </main>
  );
};

export default DevAuthPage;
