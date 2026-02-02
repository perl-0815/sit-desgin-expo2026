import Link from "next/link"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white px-8 py-16 text-zinc-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <Link className="text-sm text-zinc-500 hover:text-zinc-900" href="/">
          ← トップへ戻る
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">
          デザイン工学部について（仮）
        </h1>
        <p className="text-zinc-600">
          学部の概要、教育方針、研究室紹介への導線などを配置する想定です。
        </p>
      </div>
    </main>
  )
}
