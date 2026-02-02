import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-white px-8 py-16 text-zinc-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        <header>
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            SIT Design Expo 2026
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            トップページ（仮）
          </h1>
          <p className="mt-4 text-lg text-zinc-600">
            ページ構成の仮置きです。各ページへ移動できます。
          </p>
        </header>

        <nav className="grid gap-4 sm:grid-cols-2">
          <Link className="rounded-lg border p-4 hover:bg-zinc-50" href="/">
            トップページ
          </Link>
          <Link
            className="rounded-lg border p-4 hover:bg-zinc-50"
            href="/research"
          >
            研究・作品紹介ページ
          </Link>
          <Link
            className="rounded-lg border p-4 hover:bg-zinc-50"
            href="/events"
          >
            イベントページ
          </Link>
          <Link
            className="rounded-lg border p-4 hover:bg-zinc-50"
            href="/about"
          >
            デザイン工学部についてページ
          </Link>
          <Link
            className="rounded-lg border p-4 hover:bg-zinc-50"
            href="/contact"
          >
            コンタクトページ
          </Link>
        </nav>
      </div>
    </main>
  )
}
