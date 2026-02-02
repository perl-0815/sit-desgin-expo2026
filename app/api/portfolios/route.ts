import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const includeStudent = searchParams.get("include") === "student"

  try {
    const portfolios = await prisma.portfolio.findMany({
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
