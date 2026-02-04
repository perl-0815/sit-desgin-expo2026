import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // 体験展示は表示順を保つため、sort_orderとidでソートします。
    const exhibitions = await prisma.eventExhibition.findMany({
      orderBy: [{ sort_order: "asc" }, { id: "asc" }],
    })

    return NextResponse.json(exhibitions)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch exhibition events." },
      { status: 500 },
    )
  }
}
