import type { Metadata } from "next"

import { buildPageMetadata } from "@/lib/site-metadata"

import OsekkaiClient from "./OsekkaiClient"

export const metadata: Metadata = buildPageMetadata({
  title: "【デザ工1,2年生向け】デザイン工学部なんでも相談会-OSEKKAⅡ-",
  description:
    "豊洲で勉強する先輩によるデザイン工学部なんでも相談会 OSEKKAⅡ の開催日程・会場・参加情報を掲載しています。",
  path: "/events/osekkai-ii",
  imageUrl: "/image/osekkai-ogp.png?v=20260225a",
})

export default function OsekkaiPage() {
  return <OsekkaiClient />
}
