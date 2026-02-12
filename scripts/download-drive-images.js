#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
// このスクリプトは Node.js 単体実行の CommonJS で運用しているため、require を維持する。
// 既存の実行方法や依存解決を変えずに lint エラーのみ解消する目的で、このファイルに限定して許可する。
// Google Drive の画像URLをローカルにダウンロードし、CSVの画像URLをローカルパスに整形する。
// 変更理由: 手動ダウンロードを自動化し、既存のアップロードスクリプトの前提（ローカルに画像がある）を満たすため。

const fs = require("fs")
const path = require("path")
const https = require("https")
const { parse } = require("csv-parse/sync")
const { stringify } = require("csv-stringify/sync")

const ROOT = path.resolve(__dirname, "..")
const RESEARCH_CSV = path.join(ROOT, "googleform", "research.csv")
const PORTFOLIO_CSV = path.join(ROOT, "googleform", "portfolios.csv")
const RESEARCH_DIR = path.join(ROOT, "googleform", "research")
const PORTFOLIO_DIR = path.join(ROOT, "googleform", "portfolio")

// 保存先ディレクトリがなければ作成する（既存なら何もしない）
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

// Google Drive URLのみ対象にする（フォルダURLや他のURLはスキップ対象）
const isDriveUrl = (value) => typeof value === "string" && value.includes("drive.google.com")

// Google Drive の各種URLから fileId を取り出す
const extractFileId = (url) => {
  if (!url) return null
  const trimmed = url.trim()
  // file/d/ 形式
  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (fileMatch) return fileMatch[1]
  // id= 形式
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (idMatch) return idMatch[1]
  // uc?export=download&id= 形式
  const ucMatch = trimmed.match(/\/uc\?export=download&id=([a-zA-Z0-9_-]+)/)
  if (ucMatch) return ucMatch[1]
  return null
}

// 画像データをバッファで取得する（リダイレクト対応）
const requestBuffer = (url, headers = {}, redirectCount = 0) =>
  new Promise((resolve, reject) => {
    const request = https.request(url, { headers }, (res) => {
      const status = res.statusCode || 0
      const location = res.headers.location
      if (status >= 300 && status < 400 && location && redirectCount < 5) {
        const nextUrl = new URL(location, url).toString()
        res.resume()
        requestBuffer(nextUrl, headers, redirectCount + 1).then(resolve).catch(reject)
        return
      }

      const chunks = []
      res.on("data", (chunk) => chunks.push(chunk))
      res.on("end", () => {
        resolve({
          status,
          headers: res.headers,
          body: Buffer.concat(chunks),
        })
      })
    })

    request.on("error", reject)
    request.end()
  })

// 大きいファイルで必要になる confirm トークンをHTMLから抽出する
const parseConfirmToken = (html) => {
  const match = html.match(/confirm=([0-9A-Za-z_]+)/)
  return match ? match[1] : null
}

// Content-Disposition からファイル名を取り出す（なければ null）
const filenameFromContentDisposition = (contentDisposition) => {
  if (!contentDisposition) return null
  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/)
  if (utfMatch) return decodeURIComponent(utfMatch[1])
  const match = contentDisposition.match(/filename="?([^";]+)"?/)
  return match ? match[1] : null
}

// Content-Type から拡張子を推定する（不明なら null）
const extFromContentType = (contentType) => {
  if (!contentType) return null
  const ct = contentType.split(";")[0].trim().toLowerCase()
  const mapping = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/heic": ".heic",
    "image/heif": ".heif",
    "image/bmp": ".bmp",
    "image/tiff": ".tif",
    "video/mp4": ".mp4",
  }
  return mapping[ct] || null
}

// Google Drive の fileId からファイルをダウンロードして保存し、保存したファイル名を返す
const downloadDriveFile = async (fileId, destBase) => {
  const initialUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
  const first = await requestBuffer(initialUrl)
  const contentType = first.headers["content-type"] || ""
  const contentDisposition = first.headers["content-disposition"]

  // HTMLが返ってきた場合はconfirmトークン付きの再取得を試す
  if (contentType.startsWith("text/html")) {
    const html = first.body.toString("utf8")
    const token = parseConfirmToken(html)
    if (!token) {
      throw new Error("Google Drive confirm token not found")
    }

    // confirmフローではCookieが必要なため、レスポンスのCookieを引き回す
    const cookieHeader = Array.isArray(first.headers["set-cookie"])
      ? first.headers["set-cookie"].map((value) => value.split(";")[0]).join("; ")
      : undefined

    const confirmUrl = `https://drive.google.com/uc?export=download&confirm=${token}&id=${fileId}`
    const second = await requestBuffer(confirmUrl, cookieHeader ? { Cookie: cookieHeader } : {})

    const filename =
      filenameFromContentDisposition(second.headers["content-disposition"]) ||
      `downloaded${extFromContentType(second.headers["content-type"]) || ".bin"}`
    const ext = path.extname(filename) || extFromContentType(second.headers["content-type"]) || ".bin"
    const outPath = `${destBase}${ext}`
    fs.writeFileSync(outPath, second.body)
    return path.basename(outPath)
  }

  // そのままファイルが取得できたケース
  const filename =
    filenameFromContentDisposition(contentDisposition) ||
    `downloaded${extFromContentType(contentType) || ".bin"}`
  const ext = path.extname(filename) || extFromContentType(contentType) || ".bin"
  const outPath = `${destBase}${ext}`
  fs.writeFileSync(outPath, first.body)
  return path.basename(outPath)
}

// CSVをバックアップしてから更新する（誤更新の巻き戻し用）
const backupCsv = (csvPath) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const backupPath = `${csvPath}.bak.${timestamp}`
  fs.copyFileSync(csvPath, backupPath)
  return backupPath
}

// CSV内のローカルパス表記に揃える
const normalizeLocalPath = (baseDirName, filename) => `${baseDirName}/${filename}`

// CSVの読み込み
const loadCsv = (filePath) => {
  const text = fs.readFileSync(filePath, "utf8")
  return parse(text, { columns: true, skip_empty_lines: true })
}

// CSVの書き込み
const saveCsv = (filePath, records) => {
  const out = stringify(records, { header: true })
  fs.writeFileSync(filePath, out, "utf8")
}

// research.csv の image_url に Google Drive URL がある行だけ処理する
const processResearch = async () => {
  const records = loadCsv(RESEARCH_CSV)
  let updated = 0
  let skipped = 0

  for (const row of records) {
    const imageUrl = (row.image_url || "").trim()
    // Google Drive 以外（ローカル/既存R2）は触らない
    if (!isDriveUrl(imageUrl)) {
      skipped += 1
      continue
    }

    const fileId = extractFileId(imageUrl)
    const studentId = (row.student_id || "").trim()
    if (!fileId || !studentId) {
      skipped += 1
      continue
    }

    const destBase = path.join(RESEARCH_DIR, `${studentId}_research_image`)
    const filename = await downloadDriveFile(fileId, destBase)
    row.image_url = normalizeLocalPath("research", filename)
    updated += 1
  }

  return { records, updated, skipped }
}

// portfolios.csv の image1_url / image2_url を同様に処理する
const processPortfolios = async () => {
  const records = loadCsv(PORTFOLIO_CSV)
  let updated = 0
  let skipped = 0

  for (const row of records) {
    let changed = false
    const studentId = (row.student_id || "").trim()
    if (!studentId) {
      skipped += 1
      continue
    }

    // image1_url が Google Drive の場合のみダウンロードして差し替える
    const img1 = (row.image1_url || "").trim()
    if (isDriveUrl(img1)) {
      const fileId = extractFileId(img1)
      if (fileId) {
        const destBase = path.join(PORTFOLIO_DIR, `${studentId}_portfolios_image1`)
        const filename = await downloadDriveFile(fileId, destBase)
        row.image1_url = normalizeLocalPath("portfolio", filename)
        changed = true
      }
    }

    // image2_url が Google Drive の場合のみダウンロードして差し替える
    const img2 = (row.image2_url || "").trim()
    if (isDriveUrl(img2)) {
      const fileId = extractFileId(img2)
      if (fileId) {
        const destBase = path.join(PORTFOLIO_DIR, `${studentId}_portfolios_image2`)
        const filename = await downloadDriveFile(fileId, destBase)
        row.image2_url = normalizeLocalPath("portfolio", filename)
        changed = true
      }
    }

    if (changed) {
      updated += 1
    } else {
      skipped += 1
    }
  }

  return { records, updated, skipped }
}

// 全体実行: ディレクトリ準備 → バックアップ → 変換 → CSV更新
const main = async () => {
  ensureDir(RESEARCH_DIR)
  ensureDir(PORTFOLIO_DIR)

  const researchBackup = backupCsv(RESEARCH_CSV)
  const portfolioBackup = backupCsv(PORTFOLIO_CSV)

  const researchResult = await processResearch()
  saveCsv(RESEARCH_CSV, researchResult.records)

  const portfolioResult = await processPortfolios()
  saveCsv(PORTFOLIO_CSV, portfolioResult.records)

  console.log(`Research updated: ${researchResult.updated}`)
  console.log(`Research skipped: ${researchResult.skipped}`)
  console.log(`Research backup: ${researchBackup}`)
  console.log(`Portfolio updated: ${portfolioResult.updated}`)
  console.log(`Portfolio skipped: ${portfolioResult.skipped}`)
  console.log(`Portfolio backup: ${portfolioBackup}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
