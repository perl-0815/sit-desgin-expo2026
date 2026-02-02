import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const includeStudent = searchParams.get("include") === "student"

  try {
    const careers = await prisma.career.findMany({
      include: includeStudent ? { student: true } : undefined,
    })
    return NextResponse.json(careers)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch careers." },
      { status: 500 },
    )
  }
}
