import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // 座談会本体とセッション情報をまとめて取得し、画面側の結合負荷を下げます。
    const roundtables = await prisma.eventRoundtable.findMany({
      include: {
        sessions: {
          // 日付順・開始時刻順で安定した並び順を保証します。
          orderBy: [{ start_at: "asc" }, { sort_order: "asc" }],
        },
      },
      orderBy: [{ id: "asc" }],
    })

    return NextResponse.json(roundtables)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch roundtable events." },
      { status: 500 },
    )
  }
}
