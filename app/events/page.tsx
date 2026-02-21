import type { Metadata } from "next"

import { buildPageMetadata } from "@/lib/site-metadata"

import EventsClient from "./EventsClient"

// 変更理由: イベント一覧を検索結果で判別しやすくするため、ページ固有の title/description を設定します。
export const metadata: Metadata = buildPageMetadata({
  title: "イベント",
  description:
    "卒業展示2026で開催されるイベント情報ページです。高校生向け相談会 OSEKKAI や最終講義・懇親会の案内を掲載しています。",
  path: "/events",
})

export default function EventsPage() {
  // 変更理由: タブ切替用の searchParams 依存を撤去したため、Suspenseラップは不要です。
  return <EventsClient />
}
