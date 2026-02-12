import { Suspense } from "react"

import ResearchWorksClient from "./ResearchWorksClient"

export default function ResearchPage() {
  return (
    <main className="min-h-screen bg-[#F9F9F9] text-[#2E3437]">
      {/* useSearchParams を含むクライアントコンポーネントを安全にプリレンダーするため、Suspense で明示的に境界を作ります */}
      {/* 一瞬表示される "Loading..." テキストがチラつかないよう、空のプレースホルダーに差し替えます */}
      <Suspense fallback={<div className="px-6 py-10" aria-hidden />}>
        <ResearchWorksClient />
      </Suspense>
    </main>
  )
}
