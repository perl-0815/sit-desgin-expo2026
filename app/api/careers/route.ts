import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  // include=student のときだけ学生情報を展開（コース表示に必要な研究室情報も合わせて取得）
  const includeStudent = searchParams.get("include") === "student"
  // visibility=public は従来どおり「非公開」「匿名公開」を除外します。
  // 変更理由: 研究詳細ページでは個人ごとの進路表示になるため、
  // 匿名公開データも表示対象外のままにして運用を維持します。
  // visibility=public_include_anonymous は「非公開」のみ除外します。
  // 変更理由: 進路ページのグラフ集計では匿名公開データも公開対象に含めるため、
  // ページごとに公開条件を切り替えられるようにします。
  const visibility = searchParams.get("visibility")
  const where = (() => {
    if (visibility === "public") {
      return {
        NOT: {
          visibility: {
            in: ["非公開", "匿名公開"],
          },
        },
      }
    }
    if (visibility === "public_include_anonymous") {
      return {
        NOT: {
          visibility: "非公開",
        },
      }
    }
    return undefined
  })()

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
