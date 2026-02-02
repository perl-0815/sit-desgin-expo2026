import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

type Params = {
  params: { id: string }
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const portfolio = await prisma.portfolio.findUnique({
      // 詳細表示時に学生情報も取得
      where: { id: params.id },
      include: { student: true },
    })

    if (!portfolio) {
      // 対象がない場合は 404 を返す
      return NextResponse.json(
        { error: "Portfolio not found." },
        { status: 404 },
      )
    }

    return NextResponse.json(portfolio)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch portfolio." },
      { status: 500 },
    )
  }
}
