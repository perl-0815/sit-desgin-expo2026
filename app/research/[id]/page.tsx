import type { Metadata } from "next"

import { prisma } from "@/lib/prisma"
import { buildPageMetadata } from "@/lib/site-metadata"

import ResearchDetailClient from "./ResearchDetailClient"

type PageProps = {
  params: Promise<{ id: string }>
}

const normalizeText = (value?: string | null) => value?.replace(/\s+/g, " ").trim() ?? ""

const buildResearchDescription = (
  summary?: string | null,
  keywords?: string | null,
  studentName?: string | null,
) => {
  const normalizedSummary = normalizeText(summary)
  if (normalizedSummary.length > 0) {
    return normalizedSummary
  }

  const normalizedKeywords = normalizeText(keywords)
  if (normalizedKeywords.length > 0) {
    return `研究キーワード: ${normalizedKeywords}`
  }

  const normalizedStudentName = normalizeText(studentName)
  return normalizedStudentName.length > 0
    ? `${normalizedStudentName}さんの研究詳細ページです。`
    : "卒業展示2026の研究詳細ページです。"
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const research = await prisma.research.findUnique({
    where: { id: resolvedParams.id },
    select: {
      title: true,
      summary: true,
      keywords: true,
      student: {
        select: {
          name: true,
        },
      },
    },
  })

  // 変更理由: 存在しないIDを検索結果に出さないよう、noindex を明示します。
  if (!research) {
    return buildPageMetadata({
      title: "研究詳細",
      description: "指定された研究は見つかりませんでした。",
      path: `/research/${resolvedParams.id}`,
      robots: {
        index: false,
        follow: false,
      },
    })
  }

  const title = normalizeText(research.title) || "研究詳細"
  const description = buildResearchDescription(
    research.summary,
    research.keywords,
    research.student?.name,
  )

  return buildPageMetadata({
    title,
    description,
    path: `/research/${resolvedParams.id}`,
    // 変更理由: 研究詳細は個人を特定できる情報（氏名・研究内容）を含むため、
    // 検索エンジンのインデックス対象から常時除外し、氏名検索でヒットしない運用に統一します。
    robots: {
      index: false,
      follow: false,
    },
  })
}

export default async function ResearchDetailPage({ params }: PageProps) {
  // Next.js 16 の動的ルート params は Promise になるため await してから渡す
  const resolvedParams = await params
  return (
    <main className="min-h-screen bg-white text-[#2E3437]">
      {/* 他ページと同じ枠組みに合わせ、余白が増えないように統一します。 */}
      <ResearchDetailClient id={resolvedParams.id} />
    </main>
  )
}
