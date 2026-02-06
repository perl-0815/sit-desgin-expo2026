#!/usr/bin/env node
/* eslint-disable no-console */
// Seed local Postgres from googleform CSVs (upsert by id).

const fs = require("fs")
const path = require("path")
const { parse } = require("csv-parse/sync")
const { PrismaClient } = require("@prisma/client")
const { PrismaPg } = require("@prisma/adapter-pg")
const { Pool } = require("pg")

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") })

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing in .env")
  process.exit(1)
}

if (process.env.DATABASE_URL.startsWith("prisma+postgres://")) {
  console.error(
    "This seed script is for local Postgres. Set DATABASE_URL to a direct postgres:// URL.",
  )
  process.exit(1)
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const ROOT = path.resolve(__dirname, "..")
const CSV_DIR = path.join(ROOT, "googleform")

const readCsv = (filename) => {
  const filePath = path.join(CSV_DIR, filename)
  const text = fs.readFileSync(filePath, "utf8")
  return parse(text, { columns: true, skip_empty_lines: true })
}

// イベント系CSVは存在しないこともあるため、任意読み込みを許可します。
const readCsvIfExists = (filename) => {
  const filePath = path.join(CSV_DIR, filename)
  if (!fs.existsSync(filePath)) return []
  const text = fs.readFileSync(filePath, "utf8")
  return parse(text, { columns: true, skip_empty_lines: true })
}

const normalize = (value) => {
  if (value === undefined || value === null) return null
  const trimmed = String(value).trim()
  return trimmed === "" ? null : trimmed
}

// CSV内の数値・真偽値を型変換します（空欄はnull）。
const normalizeNumber = (value) => {
  const normalized = normalize(value)
  if (normalized === null) return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

const normalizeBoolean = (value) => {
  const normalized = normalize(value)
  if (normalized === null) return null
  return ["true", "1", "yes", "y"].includes(normalized.toLowerCase())
}

const upsertAll = async (records, modelName, mapper) => {
  // Prisma Clientが古い場合はモデルが存在しないため、明示的にエラーを出します。
  if (!prisma[modelName] || typeof prisma[modelName].upsert !== "function") {
    throw new Error(
      `Prisma Clientにモデル(${modelName})が存在しません。` +
        " schema.prismaの更新後に `npx prisma generate` を実行してください。",
    )
  }
  let count = 0
  for (const row of records) {
    const data = mapper(row)
    if (!data || !data.id) continue
    await prisma[modelName].upsert({
      where: { id: data.id },
      create: data,
      update: data,
    })
    count += 1
  }
  return count
}

const main = async () => {
  const labs = readCsv("labs.csv")
  const students = readCsv("students.csv")
  const careers = readCsv("careers.csv")
  const portfolios = readCsv("portfolios.csv")
  const research = readCsv("research.csv")
  const eventRoundtables = readCsvIfExists(path.join("event", "roundtables.csv"))
  const eventSessions = readCsvIfExists(
    path.join("event", "roundtable_sessions.csv"),
  )
  const eventExhibitions = readCsvIfExists(
    path.join("event", "events.csv"),
  )

  const labCount = await upsertAll(labs, "lab", (row) => ({
    id: normalize(row.id),
    name: normalize(row.name),
    official_name: normalize(row.official_name),
    instructor: normalize(row.instructor),
    course: normalize(row.course),
    tagline: normalize(row.tagline),
    keywords: normalize(row.keywords),
    description: normalize(row.description),
  }))

  const studentCount = await upsertAll(students, "student", (row) => ({
    id: normalize(row.id),
    student_no: normalize(row.student_no),
    name: normalize(row.name),
    name_kana: normalize(row.name_kana),
    lab_id: normalize(row.lab_id),
  }))

  const careerCount = await upsertAll(careers, "career", (row) => ({
    id: normalize(row.id),
    student_id: normalize(row.student_id),
    category: normalize(row.category),
    category_type: normalize(row.category_type),
    detail: normalize(row.detail),
    job_type: normalize(row.job_type),
    // 業種はフォームの「就職先の業種」由来の値なので、category_type(分類)とは別フィールドで保持します。
    industry: normalize(row.industry),
    decision_reason: normalize(row.decision_reason),
    extra_notes: normalize(row.extra_notes),
    visibility: normalize(row.visibility),
  }))

  const portfolioCount = await upsertAll(portfolios, "portfolio", (row) => ({
    id: normalize(row.id),
    student_id: normalize(row.student_id),
    title1: normalize(row.title1),
    summary1: normalize(row.summary1),
    image1_url: normalize(row.image1_url),
    image1_thumb_url: normalize(row.image1_thumb_url),
    appeal_url_1: normalize(row.appeal_url_1),
    title2: normalize(row.title2),
    image2_url: normalize(row.image2_url),
    image2_thumb_url: normalize(row.image2_thumb_url),
    summary2: normalize(row.summary2),
    appeal_url_2: normalize(row.appeal_url_2),
    overall_portfolio_url: normalize(row.overall_portfolio_url),
  }))

  const researchCount = await upsertAll(research, "research", (row) => ({
    id: normalize(row.id),
    student_id: normalize(row.student_id),
    title: normalize(row.title),
    image_url: normalize(row.image_url),
    image_thumb_url: normalize(row.image_thumb_url),
    summary: normalize(row.summary),
    motivation: normalize(row.motivation),
    keywords: normalize(row.keywords),
    lab_relation: normalize(row.lab_relation),
    favorite_place: normalize(row.favorite_place),
    fun_in_research: normalize(row.fun_in_research),
    fun_outside_research: normalize(row.fun_outside_research),
    hard_episode: normalize(row.hard_episode),
    break_time: normalize(row.break_time),
    all_nighter_count: normalize(row.all_nighter_count),
    want_to_continue: normalize(row.want_to_continue),
  }))

  const eventRoundtableCount = await upsertAll(
    eventRoundtables,
    "eventRoundtable",
    (row) => ({
      id: normalize(row.id),
      title: normalize(row.title),
      description: normalize(row.description),
      location: normalize(row.location),
      schedule_note: normalize(row.schedule_note),
    }),
  )

  const eventSessionCount = await upsertAll(
    eventSessions,
    "eventRoundtableSession",
    (row) => ({
      id: normalize(row.id),
      roundtable_id: normalize(row.roundtable_id),
      start_at: normalize(row.start_at),
      end_at: normalize(row.end_at),
      capacity: normalizeNumber(row.capacity),
      remaining: normalizeNumber(row.remaining),
      is_full: normalizeBoolean(row.is_full) ?? false,
      sort_order: normalizeNumber(row.sort_order),
    }),
  )

  const eventExhibitionCount = await upsertAll(
    eventExhibitions,
    "eventExhibition",
    (row) => ({
      id: normalize(row.id),
      title: normalize(row.title),
      description: normalize(row.description),
      author: normalize(row.author),
      image_url: normalize(row.image_url),
      image_thumb_url: normalize(row.image_thumb_url),
      sort_order: normalizeNumber(row.sort_order),
    }),
  )

  console.log(`Labs: ${labCount}`)
  console.log(`Students: ${studentCount}`)
  console.log(`Careers: ${careerCount}`)
  console.log(`Portfolios: ${portfolioCount}`)
  console.log(`Research: ${researchCount}`)
  console.log(`EventRoundtables: ${eventRoundtableCount}`)
  console.log(`EventRoundtableSessions: ${eventSessionCount}`)
  console.log(`EventExhibitions: ${eventExhibitionCount}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
