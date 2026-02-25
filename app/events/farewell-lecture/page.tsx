import type { Metadata } from "next"

import { buildPageMetadata } from "@/lib/site-metadata"

import FarewellLectureClient from "./FarewellLectureClient"

// 変更理由: 実際の公開URLは /events/farewell-lecture のため、
// このパスを正規ページとしてOGP/Twitterメタデータを定義します。
export const metadata: Metadata = buildPageMetadata({
  title: "デザイン工学部なんでも相談会-OSEKKAI-",
  description:
    "高校生向けデザイン工学部なんでも相談会 OSEKKAI の開催日程・会場・予約情報を掲載しています。",
  path: "/events/farewell-lecture",
  // 変更理由: このページをSNS共有した際はイベント固有の告知ビジュアルを表示したいため、
  // 共通OG画像ではなく OSEKKAI 専用画像を明示指定します。
  // さらに、一部SNSで発生していた「画像比率とOG寸法メタデータ(1200x630)の不一致」による
  // プレビュー欠落を防ぐため、OGP専用に 1200x630 へ調整したPNGを参照します。
  imageUrl: "/image/osekkai-ogp.png?v=20260225a",
})

export default function FarewellLecturePage() {
  return <FarewellLectureClient />
}
