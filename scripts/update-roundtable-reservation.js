#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
// このスクリプトは運用時に `node` で直接実行するため CommonJS を利用します。
// 既存 scripts 配下の実行方式に合わせ、依存解決の挙動を統一します。

const path = require("path")
const { PrismaClient } = require("@prisma/client")
const { PrismaPg } = require("@prisma/adapter-pg")
const { Pool } = require("pg")

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") })

const DEFAULT_OVERBOOK_LIMIT = 2

function readArg(flag) {
  const index = process.argv.indexOf(flag)
  if (index === -1) return null
  return process.argv[index + 1] ?? null
}

function hasFlag(flag) {
  return process.argv.includes(flag)
}

function parsePositiveInt(value, fallback) {
  const parsed = Number(value)
  if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed)
  return fallback
}

function parseNonNegativeInt(value, fallback) {
  const parsed = Number(value)
  if (Number.isFinite(parsed) && parsed >= 0) return Math.floor(parsed)
  return fallback
}

function printUsageAndExit() {
  console.log(`Usage:
  node scripts/update-roundtable-reservation.js --session-id <id> [--action reserve|cancel] [--count <n>] [--dry-run]

Examples:
  node scripts/update-roundtable-reservation.js --session-id roundtable-session-006 --action cancel --count 1
  node scripts/update-roundtable-reservation.js --session-id roundtable-session-002 --action reserve --count 2 --dry-run`)
  process.exit(1)
}

const sessionId = readArg("--session-id")
if (!sessionId) {
  console.error("--session-id is required.")
  printUsageAndExit()
}

const actionArg = readArg("--action")
const action = actionArg === "cancel" ? "cancel" : "reserve"
const count = parsePositiveInt(readArg("--count"), 1)
const dryRun = hasFlag("--dry-run")
const overbookLimit = parseNonNegativeInt(
  process.env.EVENT_RESERVATION_OVERBOOK_LIMIT,
  DEFAULT_OVERBOOK_LIMIT,
)

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing in .env")
  process.exit(1)
}

const databaseUrl = process.env.DATABASE_URL
const useAccelerate = databaseUrl.startsWith("prisma+postgres://")

let pool = null
const prisma = (() => {
  if (useAccelerate) {
    // 本番相当で Accelerate URL を使う場合でも、API と同じ更新ロジックを使えるよう分岐します。
    return new PrismaClient({ accelerateUrl: databaseUrl, log: ["error"] })
  }

  pool = new Pool({ connectionString: databaseUrl })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter, log: ["error"] })
})()

async function lockSession(tx, id) {
  const rows = await tx.$queryRaw`
    SELECT "id", "capacity", "remaining"
    FROM "EventRoundtableSession"
    WHERE "id" = ${id}
    FOR UPDATE
  `
  return rows[0] ?? null
}

async function main() {
  // API(`/api/events/roundtables/reservations`)と同じ考え方で、
  // 同時更新でも残席計算が崩れないようにトランザクション + 行ロックで更新します。
  const result = await prisma.$transaction(async (tx) => {
    const session = await lockSession(tx, sessionId)
    if (!session) {
      throw new Error("SESSION_NOT_FOUND")
    }

    const currentRemaining =
      typeof session.remaining === "number"
        ? session.remaining
        : typeof session.capacity === "number"
          ? session.capacity
          : 0

    let nextRemaining = currentRemaining
    if (action === "reserve") {
      if (currentRemaining - count < -overbookLimit) {
        throw new Error("INSUFFICIENT_REMAINING")
      }
      nextRemaining = currentRemaining - count
    } else {
      if (typeof session.capacity === "number") {
        // キャンセル時は定員を超えない範囲まで残席を戻すことで、過剰な戻しを防ぎます。
        nextRemaining = Math.min(currentRemaining + count, session.capacity)
      } else {
        nextRemaining = currentRemaining + count
      }
    }

    const nextIsFull = nextRemaining <= 0

    if (dryRun) {
      return {
        id: session.id,
        capacity: session.capacity,
        remaining: currentRemaining,
        is_full: currentRemaining <= 0,
        nextRemaining,
        nextIsFull,
        updated: false,
      }
    }

    const updated = await tx.eventRoundtableSession.update({
      where: { id: session.id },
      data: {
        remaining: nextRemaining,
        is_full: nextIsFull,
      },
    })

    return {
      id: updated.id,
      capacity: updated.capacity,
      remaining: currentRemaining,
      is_full: currentRemaining <= 0,
      nextRemaining: updated.remaining,
      nextIsFull: updated.is_full,
      updated: true,
    }
  })

  console.log(JSON.stringify({ ok: true, action, count, dryRun, session: result }, null, 2))
}

main()
  .catch((error) => {
    if (error instanceof Error && error.message === "SESSION_NOT_FOUND") {
      console.error(`Session not found: ${sessionId}`)
      process.exit(1)
    }
    if (error instanceof Error && error.message === "INSUFFICIENT_REMAINING") {
      console.error(
        `No remaining slots (including overbook limit=${overbookLimit}). sessionId=${sessionId}`,
      )
      process.exit(1)
    }

    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    if (pool) {
      await pool.end()
    }
  })
