import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

type Params = {
  params: { id: string }
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        lab: true,
        careers: true,
        portfolios: true,
        research: true,
      },
    })

    if (!student) {
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
