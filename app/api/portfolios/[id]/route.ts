import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

type Params = {
  params: { id: string }
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: params.id },
      include: { student: true },
    })

    if (!portfolio) {
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
