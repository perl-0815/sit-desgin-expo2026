import type { Metadata } from "next"

import { buildPageMetadata } from "@/lib/site-metadata"

import ContactClient from "./ContactClient"

// 変更理由: 問い合わせページを検索結果上でも用途が分かるよう、専用メタデータを設定します。
export const metadata: Metadata = buildPageMetadata({
  title: "お問い合せ",
  description:
    "芝浦工業大学デザイン工学部 卒業展示2026へのお問い合せ先・連絡方法を案内するページです。",
  path: "/contact",
})

export default function ContactPage() {
  return <ContactClient />
}
