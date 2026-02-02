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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  // include パラメータに応じて必要なリレーションだけ取得
  const include = parseIncludes(searchParams.get("include"))

  try {
    const students = await prisma.student.findMany({
      include,
    })
    return NextResponse.json(students)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch students." },
      { status: 500 },
    )
  }
}
