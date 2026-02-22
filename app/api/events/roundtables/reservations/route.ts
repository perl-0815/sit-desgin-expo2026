import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"

type ReservationAction = "reserve" | "cancel"

type ReservationPayload = {
  sessionId?: string
  participantCount?: number
  action?: ReservationAction
  token?: string
}

type LockedSessionRow = {
  id: string
  capacity: number | null
  remaining: number | null
}

const DEFAULT_OVERBOOK_LIMIT = 2

function parseNonNegativeInt(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.floor(value)
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed >= 0) {
      return Math.floor(parsed)
    }
  }

  return fallback
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

function getCurrentRemaining(session: LockedSessionRow) {
  if (typeof session.remaining === "number") return session.remaining
  if (typeof session.capacity === "number") return session.capacity
  return 0
}

function resolveOverbookLimit() {
  // 変更理由: フロント表示上限(40組)は維持しつつ、送信タイミング競合時のみ運用許容分を受け入れるため。
  // 未設定時は 2組ぶんを既定値として扱い、必要に応じて環境変数で上書きします。
  return parseNonNegativeInt(process.env.EVENT_RESERVATION_OVERBOOK_LIMIT, DEFAULT_OVERBOOK_LIMIT)
}

async function lockSession(tx: Prisma.TransactionClient, sessionId: string) {
  const lockedRows = await tx.$queryRaw<LockedSessionRow[]>`
    SELECT "id", "capacity", "remaining"
    FROM "EventRoundtableSession"
    WHERE "id" = ${sessionId}
    FOR UPDATE
  `
  return lockedRows[0] ?? null
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
  const overbookLimit = resolveOverbookLimit()

  try {
    // 変更理由: 同時回答時の過予約を防ぐため、残席判定と更新を同一トランザクションで直列化します。
    const updated = await prisma.$transaction(async (tx) => {
      const session = await lockSession(tx, sessionId)
      if (!session) {
        throw new Error("SESSION_NOT_FOUND")
      }

      const currentRemaining = getCurrentRemaining(session)
      const capacity = session.capacity

      let nextRemaining = currentRemaining
      if (action === "reserve") {
        // 変更理由: 送信時点で満席へ変化したケースでも、運用許容数までは予約成立にするため。
        // remaining は負値を許容し、-overbookLimit を下回る更新だけ拒否します。
        if (currentRemaining - participantCount < -overbookLimit) {
          throw new Error("INSUFFICIENT_REMAINING")
        }
        nextRemaining = currentRemaining - participantCount
      } else {
        // キャンセルは定員を超えない範囲で残席を戻します。
        if (typeof capacity === "number") {
          nextRemaining = Math.min(currentRemaining + participantCount, capacity)
        } else {
          nextRemaining = currentRemaining + participantCount
        }
      }

      return tx.eventRoundtableSession.update({
        where: { id: sessionId },
        data: {
          remaining: nextRemaining,
          is_full: nextRemaining <= 0,
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
    if (error instanceof Error) {
      if (error.message === "SESSION_NOT_FOUND") {
        return NextResponse.json({ error: "Session not found." }, { status: 404 })
      }

      if (error.message === "INSUFFICIENT_REMAINING") {
        return NextResponse.json(
          { error: "No remaining slots (including overbook limit)." },
          { status: 409 },
        )
      }
    }

    return NextResponse.json({ error: "Failed to update reservation count." }, { status: 500 })
  }
}
