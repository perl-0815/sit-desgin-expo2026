import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

type Params = {
  params: { id: string }
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const career = await prisma.career.findUnique({
      where: { id: params.id },
      include: { student: true },
    })

    if (!career) {
      return NextResponse.json({ error: "Career not found." }, { status: 404 })
    }

    return NextResponse.json(career)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch career." },
      { status: 500 },
    )
  }
}
