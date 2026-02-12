import type { Metadata } from "next"
import { Noto_Sans_JP, Roboto } from "next/font/google"
import localFont from "next/font/local"

import "./globals.css"

// SNS 共有の正規URLは常に本番ドメインを基準にします。
// 以前は VERCEL_URL を優先していたため、カスタムドメインでアクセスしても
// og:url / og:image が *.vercel.app になるケースがあり、媒体によって
// プレビュー画像が出ない要因になっていました。
// NEXT_PUBLIC_SITE_URL を最優先し、未設定時は本番公開ドメインへ固定します。
const resolvedSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.sit-design-expo2026.jp"

// SNS 共有画像は各プラットフォームで URL 単位に強くキャッシュされるため、
// 画像内容やOG設定を更新しても即時反映されないことがある。
// 共有媒体によっては相対URL解釈で取りこぼす場合があるため、絶対URLで明示します。
// クエリ付きの固定URLを使って再クロールを確実に発生させる。
const socialPreviewImageUrl = `${resolvedSiteUrl}/image/preview.png?v=20260212a`

// 日本語本文はNoto Sans JPを標準にし、Figma指定の字形に近づけます。
const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
})

// 英字ラベル（CONTACT/OFFICIAL SNSなど）はRobotoを使用します。
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-roboto",
  display: "swap",
})

// Shippori Mincho B1 OTF はローカルフォントとして読み込みます。
const shipporiMinchoB1 = localFont({
  src: [
    {
      path: "../public/fonts/ShipporiMinchoB1-OTF-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/ShipporiMinchoB1-OTF-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/ShipporiMinchoB1-OTF-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/ShipporiMinchoB1-OTF-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/ShipporiMinchoB1-OTF-ExtraBold.otf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-shippori-mincho-b1",
  display: "swap",
})

export const metadata: Metadata = {
  title: "芝浦工業大学デザイン工学部卒業展示2026",
  description:
    // トップページの紹介文（卒業・修了研究展とは）に合わせ、SNS上でも意図した説明が表示されるように更新します。
    "芝浦工業大学デザイン工学部の学生による、それぞれの研究を展示する場です。ここには、プロダクト・システム・UXなど、デザイン工学という広い領域における多様な研究が集まります。",
  // 実行環境に応じた公開URLを指定し、OG/Twitter の絶対URL解決に使います。
  metadataBase: new URL(resolvedSiteUrl),
  // public/icon/favicon.jpg から生成したファビコン/タッチアイコンを参照します。
  // favicon.ico は public 配下に置き、App Router の画像処理を避けます。
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16", type: "image/x-icon" },
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  // SNS 共有時に各サービスが画像を認識しやすいよう、OGの基本項目を明示します。
  openGraph: {
    title: "芝浦工業大学デザイン工学部卒業展示2026",
    description:
      "芝浦工業大学デザイン工学部の学生による、それぞれの研究を展示する場です。ここには、プロダクト・システム・UXなど、デザイン工学という広い領域における多様な研究が集まります。",
    // 共有対象ページの正規URLを絶対URLで明示し、クローラの解釈差分を減らす。
    url: resolvedSiteUrl,
    type: "website",
    siteName: "SIT DESIGN EXPO 2026",
    images: [
      {
        url: socialPreviewImageUrl,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "芝浦工業大学デザイン工学部卒業展示2026 キービジュアル",
      },
    ],
  },
  // Twitter 共有時も同一のプレビュー画像を使い、カード形式を大型にします。
  twitter: {
    card: "summary_large_image",
    title: "芝浦工業大学デザイン工学部卒業展示2026",
    description:
      "芝浦工業大学デザイン工学部の学生による、それぞれの研究を展示する場です。ここには、プロダクト・システム・UXなど、デザイン工学という広い領域における多様な研究が集まります。",
    images: [
      {
        url: socialPreviewImageUrl,
        alt: "芝浦工業大学デザイン工学部卒業展示2026 キービジュアル",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${notoSansJP.variable} ${roboto.variable} ${shipporiMinchoB1.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
