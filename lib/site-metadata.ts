import type { Metadata } from "next"

// 変更理由: ページごとに title/description/OG/Twitter の定義が重複すると
// 文言修正時に差分漏れが起きやすいため、サイト共通のSEO設定を1か所に集約します。
export const siteName = "SIT DESIGN EXPO 2026"
export const siteTitle = "芝浦工業大学デザイン工学部卒業展示2026"
export const siteDescription =
  "芝浦工業大学デザイン工学部の学生による、それぞれの研究を展示する場です。ここには、プロダクト・システム・UXなど、デザイン工学という広い領域における多様な研究が集まります。"
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.sit-design-expo2026.jp"
// 変更理由: 共通OG画像の実ファイルは preview.webp なのに preview.png を参照していたため、
// 一部SNSで画像取得に失敗してファビコンへフォールバックされていました。
// 実在する preview.webp を既定OG画像として明示し、全ページで安定してプレビュー画像が出るようにします。
export const socialPreviewImageUrl = `${siteUrl}/image/preview.webp?v=20260225a`

type BuildPageMetadataOptions = {
  title: string
  description: string
  path: string
  imageUrl?: string
  robots?: Metadata["robots"]
}

const normalizePath = (path: string) => (path.startsWith("/") ? path : `/${path}`)

const trimDescription = (value: string, maxLength = 140) => {
  const normalized = value.replace(/\s+/g, " ").trim()
  return normalized.length <= maxLength
    ? normalized
    : `${normalized.slice(0, maxLength - 1)}…`
}

const detectImageMimeType = (imageUrl: string) => {
  const normalized = imageUrl.toLowerCase()
  // 変更理由: OGP画像にWebP/JPEGを使うページでも type を正しく出せるようにし、
  // 実ファイル拡張子とメタ情報の不一致を防ぎます。
  if (normalized.includes(".webp")) return "image/webp"
  if (normalized.includes(".png")) return "image/png"
  if (normalized.includes(".jpg") || normalized.includes(".jpeg")) return "image/jpeg"
  return undefined
}

export function buildPageMetadata({
  title,
  description,
  path,
  imageUrl,
  robots,
}: BuildPageMetadataOptions): Metadata {
  const normalizedPath = normalizePath(path)
  const absoluteUrl = `${siteUrl}${normalizedPath}`
  const normalizedDescription = trimDescription(description)
  const selectedImageUrl = imageUrl?.trim() || socialPreviewImageUrl
  const selectedImageType = detectImageMimeType(selectedImageUrl)

  return {
    title,
    description: normalizedDescription,
    alternates: {
      canonical: normalizedPath,
    },
    openGraph: {
      title,
      description: normalizedDescription,
      url: absoluteUrl,
      type: "website",
      locale: "ja_JP",
      siteName,
      images: [
        {
          url: selectedImageUrl,
          width: 1200,
          height: 630,
          ...(selectedImageType ? { type: selectedImageType } : {}),
          alt: `${title} | ${siteName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: normalizedDescription,
      images: [{ url: selectedImageUrl, alt: `${title} | ${siteName}` }],
    },
    ...(robots ? { robots } : {}),
  }
}
