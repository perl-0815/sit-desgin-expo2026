import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

type Params = {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  try {
    const research = await prisma.research.findUnique({
      // 詳細表示向けに学生情報を含める
      where: { id },
      include: { student: true },
    })

    if (!research) {
      // 存在しない場合は 404
      return NextResponse.json(
        { error: "Research not found." },
        { status: 404 },
      )
    }

    return NextResponse.json(research)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch research." },
      { status: 500 },
    )
  }
}
