import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  // include=student のときだけ学生情報を展開
  const includeStudent = searchParams.get("include") === "student"

  try {
    const careers = await prisma.career.findMany({
      // 必要なときだけ JOIN を走らせる
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
