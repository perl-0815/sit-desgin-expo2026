import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

const parseIncludes = (value: string | null) => {
  if (!value) return {}
  if (value === "all") {
    // include=all で全リレーションを展開
    return {
      lab: true,
      careers: true,
      portfolios: true,
      research: true,
    }
  }

  const parts = value.split(",").map((part) => part.trim())
  // include=lab,careers のような指定を個別に展開
  return {
    lab: parts.includes("lab"),
    careers: parts.includes("careers"),
    portfolios: parts.includes("portfolios"),
    research: parts.includes("research"),
  }
}

const buildInclude = (
  include: ReturnType<typeof parseIncludes>,
  visibility: string | null,
) => {
  if (!include.careers) return include
  // 公開ページ向けの表示制御に合わせて、必要なときだけ非公開の進路を除外します。
  const careerWhere =
    visibility === "public"
      ? {
          NOT: {
            visibility: "非公開",
          },
        }
      : undefined
  return {
    ...include,
    careers: {
      where: careerWhere,
    },
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { searchParams } = new URL(req.url)
  // include パラメータに応じて必要なリレーションだけ取得
  const include = parseIncludes(searchParams.get("include"))
  const visibility = searchParams.get("visibility")
  const includeWithCareers = buildInclude(include, visibility)
  // Next.js の動的 API では params が Promise になるため、明示的に await して id を取り出します。
  const { id } = await params

  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: includeWithCareers,
    })

    if (!student) {
      return NextResponse.json(
        { error: "Student not found." },
        { status: 404 },
      )
    }

    return NextResponse.json(student)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch student." },
      { status: 500 },
    )
  }
}
