import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  // include=student のときだけ学生情報を展開（コース表示に必要な研究室情報も合わせて取得）
  const includeStudent = searchParams.get("include") === "student"
  // visibility=public 指定時のみ公開可能な進路だけを返します。
  // 変更理由: 匿名公開の進路も詳細ページや進路ページに表示しない運用に統一するため、
  // 「非公開」と「匿名公開」をどちらも除外します。
  const visibility = searchParams.get("visibility")
  const where =
    visibility === "public"
      ? {
          NOT: {
            visibility: {
              in: ["非公開", "匿名公開"],
            },
          },
        }
      : undefined

  try {
    const careers = await prisma.career.findMany({
      // 必要なときだけ JOIN を走らせる（進学理由のコース表示に lab を含める）
      include: includeStudent
        ? {
            student: {
              include: {
                lab: true,
              },
            },
          }
        : undefined,
      // 公開ページ向けのフィルタは明示指定時のみ適用します。
      where,
    })
    return NextResponse.json(careers)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch careers." },
      { status: 500 },
    )
  }
}
