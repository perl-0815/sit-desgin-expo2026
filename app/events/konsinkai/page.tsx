import type { Metadata } from "next"

import { buildPageMetadata } from "@/lib/site-metadata"

import KonsinkaiClient from "./KonsinkaiClient"

export const metadata: Metadata = buildPageMetadata({
  title: "退職される先生の最終講義と懇親会",
  description:
    "島田明先生・吉武良治先生の最終講義および懇親会の開催日程・会場・申し込み情報を掲載しています。",
  path: "/events/konsinkai",
})

export default function KonsinkaiPage() {
  return <KonsinkaiClient />
}
