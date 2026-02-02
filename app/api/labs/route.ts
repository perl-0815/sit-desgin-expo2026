import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  // include=students のときだけ紐づく学生を展開する
  const includeStudents = searchParams.get("include") === "students"

  try {
    const labs = await prisma.lab.findMany({
      // 必要な時だけリレーションを読み込む（無駄なJOINを避ける）
      include: includeStudents ? { students: true } : undefined,
    })
    return NextResponse.json(labs)
  } catch (error) {
    // 内部エラーは固定メッセージにして情報漏えいを防ぐ
    return NextResponse.json(
      { error: "Failed to fetch labs." },
      { status: 500 },
    )
  }
}
