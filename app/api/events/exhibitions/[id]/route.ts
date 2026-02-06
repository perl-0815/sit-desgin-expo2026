import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: { id: string }
}

export async function GET(_: Request, { params }: RouteContext) {
  const id = (params.id ?? "").trim()
  if (!id) {
    return NextResponse.json(
      { error: "Missing exhibition id." },
      { status: 400 },
    )
  }

  try {
    const exhibition = await prisma.eventExhibition.findUnique({
      where: { id },
    })

    if (!exhibition) {
      return NextResponse.json(
        { error: "Event exhibition not found." },
        { status: 404 },
      )
    }

    return NextResponse.json(exhibition)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch exhibition event." },
      { status: 500 },
    )
  }
}
