import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

type Params = {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  try {
    const student = await prisma.student.findUnique({
      where: { id },
      // 画面で必要になりやすい関連データをまとめて取得
      include: {
        lab: true,
        careers: true,
        portfolios: true,
        research: true,
      },
    })

    if (!student) {
      // 該当する学生がいない場合は 404
      return NextResponse.json({ error: "Student not found." }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch student." },
      { status: 500 },
    )
  }
}
