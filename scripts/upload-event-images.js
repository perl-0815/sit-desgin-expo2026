#!/usr/bin/env node
/* eslint-disable no-console */
// イベント画像をR2へアップロードし、サムネイルを生成してCSVを更新します。

const fs = require("fs")
const os = require("os")
const path = require("path")
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")
const sharp = require("sharp")
const { parse } = require("csv-parse/sync")
const { stringify } = require("csv-stringify/sync")

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") })

const ROOT = path.resolve(__dirname, "..")
const CSV_PATH = path.join(ROOT, "googleform", "event", "events.csv")
const IMAGES_DIR = path.join(ROOT, "googleform", "event")

const REQUIRED_ENV = [
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_BUCKET_ENDPOINT",
  "R2_ENDPOINT",
]

const missing = REQUIRED_ENV.filter((key) => !process.env[key])
if (missing.length > 0) {
  console.error(`Missing env: ${missing.join(", ")}`)
  process.exit(1)
}

const BUCKET_NAME = process.env.R2_BUCKET_NAME
const BUCKET_ENDPOINT = process.env.R2_BUCKET_ENDPOINT.replace(/\/+$/, "")
const R2_ENDPOINT = process.env.R2_ENDPOINT

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

const contentTypeFor = (filename) => {
  const ext = path.extname(filename).toLowerCase()
  if (ext === ".png") return "image/png"
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg"
  if (ext === ".webp") return "image/webp"
  if (ext === ".gif") return "image/gif"
  return "application/octet-stream"
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
const backupPath = `${CSV_PATH}.bak.${timestamp}`
fs.copyFileSync(CSV_PATH, backupPath)

const csvText = fs.readFileSync(CSV_PATH, "utf8")
const records = parse(csvText, {
  columns: true,
  skip_empty_lines: true,
})

const tmpDir = path.join(os.tmpdir(), "sit-design-expo2026-event")
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true })
}

const uploadOne = async (key, body, contentType) => {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  )
}

const main = async () => {
  let updated = 0
  let skipped = 0

  for (const row of records) {
    const imageUrl = (row.image_url || "").trim()
    if (!imageUrl) {
      skipped += 1
      continue
    }

    const filename = path.basename(imageUrl)
    const srcPath = path.join(IMAGES_DIR, filename)
    if (!fs.existsSync(srcPath)) {
      console.warn(`Missing source image: ${srcPath}`)
      skipped += 1
      continue
    }

    const baseName = path.parse(filename).name
    const originalKey = `events/images/${filename}`
    const thumbName = `${baseName}_thumb.jpg`
    const thumbKey = `events/images/${thumbName}`

    const originalBuffer = fs.readFileSync(srcPath)
    await uploadOne(originalKey, originalBuffer, contentTypeFor(filename))

    const thumbBuffer = await sharp(originalBuffer)
      .rotate()
      .resize({ width: 480, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer()

    const thumbPath = path.join(tmpDir, thumbName)
    fs.writeFileSync(thumbPath, thumbBuffer)
    await uploadOne(thumbKey, thumbBuffer, "image/jpeg")

    // CSVのURLをR2のパスに更新します。
    row.image_url = `${BUCKET_ENDPOINT}/events/images/${filename}`
    row.image_thumb_url = `${BUCKET_ENDPOINT}/events/images/${thumbName}`
    updated += 1
  }

  const out = stringify(records, { header: true })
  fs.writeFileSync(CSV_PATH, out, "utf8")

  console.log(`Updated rows: ${updated}`)
  console.log(`Skipped rows: ${skipped}`)
  console.log(`Backup: ${backupPath}`)
  console.log(`Thumbs cached: ${tmpDir}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
