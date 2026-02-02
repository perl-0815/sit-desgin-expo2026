import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  // include=student のときだけ学生情報を付与
  const includeStudent = searchParams.get("include") === "student"

  try {
    const portfolios = await prisma.portfolio.findMany({
      // 大量取得時の負荷を避けるため条件付きで取得
      include: includeStudent ? { student: true } : undefined,
    })
    return NextResponse.json(portfolios)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch portfolios." },
      { status: 500 },
    )
  }
}
