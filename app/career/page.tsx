import type { Metadata } from "next"

import { buildPageMetadata } from "@/lib/site-metadata"

import CareerClient from "./CareerClient"

// 変更理由: 卒業生の進路データページを検索結果から直接理解できるように説明文を追加します。
export const metadata: Metadata = buildPageMetadata({
  title: "卒業生の進路",
  description:
    "芝浦工業大学デザイン工学部 卒業展示2026の卒業生進路データページです。就職・進学などの進路傾向を掲載しています。",
  path: "/career",
})

export default function CareerPage() {
  return (
    <main className="min-h-screen bg-[#F9F9F9] text-[#2E3437]">
      {/* 卒業生の進路ページはインタラクションがあるため、クライアント側のUIに委譲します。 */}
      <CareerClient />
    </main>
  )
}
