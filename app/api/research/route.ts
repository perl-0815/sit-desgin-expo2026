import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  // include=student の場合のみ学生情報を付与
  const includeStudent = searchParams.get("include") === "student"

  try {
    const research = await prisma.research.findMany({
      // 条件付きでリレーションを取得
      include: includeStudent ? { student: true } : undefined,
    })
    return NextResponse.json(research)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch research." },
      { status: 500 },
    )
  }
}
