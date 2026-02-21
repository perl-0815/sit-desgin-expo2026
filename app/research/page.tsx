import { Suspense } from "react"
import type { Metadata } from "next"

import { buildPageMetadata } from "@/lib/site-metadata"

import ResearchWorksClient from "./ResearchWorksClient"

// 変更理由: 研究/作品一覧の内容を検索結果で伝えやすくするため、ページ固有メタを追加します。
export const metadata: Metadata = buildPageMetadata({
  title: "研究・作品一覧",
  description:
    "芝浦工業大学デザイン工学部 卒業展示2026の研究・作品一覧です。学生ごとの研究概要と制作物を閲覧できます。",
  path: "/research",
})

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
