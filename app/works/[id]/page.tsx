import type { Metadata } from "next"

import { prisma } from "@/lib/prisma"
import { buildPageMetadata } from "@/lib/site-metadata"

import WorksDetailClient from "./WorksDetailClient"

type PageProps = {
  params: Promise<{ id: string }>
}

const normalizeText = (value?: string | null) => value?.replace(/\s+/g, " ").trim() ?? ""

const buildPortfolioDescription = (
  summary1?: string | null,
  summary2?: string | null,
  studentName?: string | null,
) => {
  const summary = normalizeText(summary1) || normalizeText(summary2)
  if (summary.length > 0) {
    return summary
  }
  const normalizedStudentName = normalizeText(studentName)
  return normalizedStudentName.length > 0
    ? `${normalizedStudentName}さんの作品詳細ページです。`
    : "卒業展示2026の作品詳細ページです。"
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const work = await prisma.portfolio.findUnique({
    where: { id: resolvedParams.id },
    select: {
      title1: true,
      title2: true,
      summary1: true,
      summary2: true,
      student: {
        select: {
          name: true,
        },
      },
    },
  })

  // 変更理由: 存在しないIDを検索エンジンに載せないため、該当データなしの場合は noindex を返します。
  if (!work) {
    return buildPageMetadata({
      title: "作品詳細",
      description: "指定された作品は見つかりませんでした。",
      path: `/works/${resolvedParams.id}`,
      robots: {
        index: false,
        follow: false,
      },
    })
  }

  const title = normalizeText(work.title1) || normalizeText(work.title2) || "作品詳細"
  const description = buildPortfolioDescription(
    work.summary1,
    work.summary2,
    work.student?.name,
  )

  return buildPageMetadata({
    title,
    description,
    path: `/works/${resolvedParams.id}`,
    // 変更理由: 作品詳細は個人名と紐づく公開情報を含むため、
    // 氏名検索での露出を防ぐ目的で常時 noindex/nofollow を設定します。
    robots: {
      index: false,
      follow: false,
    },
  })
}

export default async function WorksDetailPage({ params }: PageProps) {
  // Next.js 16 の動的ルート params は Promise になるため await してから渡す
  const resolvedParams = await params
  return <WorksDetailClient id={resolvedParams.id} />
}
