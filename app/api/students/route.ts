import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

const parseIncludes = (value: string | null) => {
  if (!value) return {}
  if (value === "all") {
    return {
      lab: true,
      careers: true,
      portfolios: true,
      research: true,
    }
  }

  const parts = value.split(",").map((part) => part.trim())
  return {
    lab: parts.includes("lab"),
    careers: parts.includes("careers"),
    portfolios: parts.includes("portfolios"),
    research: parts.includes("research"),
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const include = parseIncludes(searchParams.get("include"))

  try {
    const students = await prisma.student.findMany({
      include,
    })
    return NextResponse.json(students)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch students." },
      { status: 500 },
    )
  }
}
