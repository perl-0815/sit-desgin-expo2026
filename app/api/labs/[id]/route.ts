import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

type Params = {
  params: { id: string }
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const lab = await prisma.lab.findUnique({
      // 詳細ページ向けに学生を同時取得
      where: { id: params.id },
      include: { students: true },
    })

    if (!lab) {
      // ID 指定時に存在しない場合は 404
      return NextResponse.json({ error: "Lab not found." }, { status: 404 })
    }

    return NextResponse.json(lab)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch lab." },
      { status: 500 },
    )
  }
}
