import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

type RouteContext = {
  // Next.js の型制約に合わせて params を Promise として受け取る
  params: Promise<{ id: string }>
}

export async function GET(_: NextRequest, { params }: RouteContext) {
  // params は Promise なので await してから参照する
  const resolvedParams = await params
  const id = (resolvedParams.id ?? "").trim()
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
