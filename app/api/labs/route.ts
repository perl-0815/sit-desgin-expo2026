import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const includeStudents = searchParams.get("include") === "students"

  try {
    const labs = await prisma.lab.findMany({
      include: includeStudents ? { students: true } : undefined,
    })
    return NextResponse.json(labs)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch labs." },
      { status: 500 },
    )
  }
}
