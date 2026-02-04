import Link from "next/link"

import TestRoundtablesClient from "./TestRoundtablesClient"

export default function TestPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-12 text-zinc-900 sm:px-8 sm:py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Link className="text-sm text-zinc-500 hover:text-zinc-900" href="/">
          ← トップへ戻る
        </Link>
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">
          SIT Design Expo 2026
        </p>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">テストページ</h1>
          <p className="text-base text-zinc-600">
            座談会予約フォームの応募状況を確認します。
          </p>
        </div>
        <TestRoundtablesClient />
      </div>
    </main>
  )
}
