import type { Metadata } from "next"

import { buildPageMetadata } from "@/lib/site-metadata"

import FarewellLectureClient from "./FarewellLectureClient"

// 変更理由: イベント詳細の検索導線を強化するため、個別ページのメタ情報を明示します。
export const metadata: Metadata = buildPageMetadata({
  title: "デザイン工学部なんでも相談会-OSEKKAI-",
  description:
    "高校生向けデザイン工学部なんでも相談会 OSEKKAI の開催日程・会場・予約情報を掲載しています。",
  path: "/events/farewell-lecture",
})

export default function FarewellLecturePage() {
  return <FarewellLectureClient />
}
