import Link from "next/link"

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-white px-8 py-16 text-zinc-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <Link className="text-sm text-zinc-500 hover:text-zinc-900" href="/">
          ← トップへ戻る
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">
          イベントページ（仮）
        </h1>
        <p className="text-zinc-600">
          開催概要・日程・タイムテーブルなどの導線を置く想定です。
        </p>
      </div>
    </main>
  )
}
