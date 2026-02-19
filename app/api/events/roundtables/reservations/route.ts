import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

type ReservationAction = "reserve" | "cancel"

type ReservationPayload = {
  sessionId?: string
  participantCount?: number
  action?: ReservationAction
  token?: string
}

function parsePositiveInt(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value)
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.floor(parsed)
    }
  }

  return fallback
}

function resolveToken(request: NextRequest, payloadToken?: string) {
  // Apps Script側はヘッダー送信・本文送信のどちらでも扱えるようにします。
  const headerToken = request.headers.get("x-webhook-token")
  return headerToken ?? payloadToken
}

export async function POST(request: NextRequest) {
  let payload: ReservationPayload

  try {
    payload = (await request.json()) as ReservationPayload
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 })
  }

  const sessionId = payload.sessionId?.trim()
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required." }, { status: 400 })
  }

  const webhookToken = process.env.EVENT_RESERVATION_WEBHOOK_TOKEN
  if (!webhookToken) {
    return NextResponse.json(
      { error: "EVENT_RESERVATION_WEBHOOK_TOKEN is not configured." },
      { status: 500 },
    )
  }

  const providedToken = resolveToken(request, payload.token)
  if (providedToken !== webhookToken) {
    return NextResponse.json({ error: "Unauthorized webhook token." }, { status: 401 })
  }

  const action: ReservationAction = payload.action === "cancel" ? "cancel" : "reserve"
  const participantCount = parsePositiveInt(payload.participantCount, 1)

  try {
    // 同時送信時の競合を避けるため、更新処理はトランザクションで一括処理します。
    const updated = await prisma.$transaction(async (tx) => {
      const session = await tx.eventRoundtableSession.findUnique({
        where: { id: sessionId },
      })

      if (!session) {
        throw new Error("SESSION_NOT_FOUND")
      }

      const capacity = session.capacity ?? 0
      const currentRemaining = session.remaining ?? capacity

      let nextRemaining = currentRemaining
      if (action === "reserve") {
        nextRemaining = Math.max(currentRemaining - participantCount, 0)
      } else {
        // キャンセルは定員を超えない範囲で残席を戻します。
        if (capacity > 0) {
          nextRemaining = Math.min(currentRemaining + participantCount, capacity)
        } else {
          nextRemaining = currentRemaining + participantCount
        }
      }

      const isFull = nextRemaining <= 0

      return tx.eventRoundtableSession.update({
        where: { id: sessionId },
        data: {
          remaining: nextRemaining,
          is_full: isFull,
        },
      })
    })

    return NextResponse.json({
      ok: true,
      session: {
        id: updated.id,
        capacity: updated.capacity,
        remaining: updated.remaining,
        is_full: updated.is_full,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === "SESSION_NOT_FOUND") {
      return NextResponse.json({ error: "Session not found." }, { status: 404 })
    }

    return NextResponse.json({ error: "Failed to update reservation count." }, { status: 500 })
  }
}
