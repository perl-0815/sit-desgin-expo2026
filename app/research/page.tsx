import Link from "next/link"

import ResearchWorksClient from "./ResearchWorksClient"

export default function ResearchPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-12 text-zinc-900 sm:px-8 sm:py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Link className="text-sm text-zinc-500 hover:text-zinc-900" href="/">
          ← トップへ戻る
        </Link>
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">
          SIT Design Expo 2026
        </p>
        <ResearchWorksClient />
      </div>
    </main>
  )
}
