import { NextResponse } from "next/server"
import { JWT } from "google-auth-library"

export const runtime = "nodejs"

// 既定のスプレッドシートID・シート名
// 変更する場合は .env の GOOGLE_SHEET_ID / GOOGLE_SHEET_NAME を優先
const DEFAULT_SHEET_ID = "1L6Q23wcFNZS_pqB2qXCAoQCQnzdNn9qLwqz-dhQF5wU"
const DEFAULT_SHEET_NAME = "フォームの回答１"
// 1つの座談会の定員（人数）
// 定員ルールが変わる場合はここを調整
const CAPACITY_PER_SESSION = 20

// Google Form のヘッダー名（列名）と一致させる必要あり
// フォーム質問文を変更した場合は、ここを更新する
const HEADER_TIMESTAMP = "タイムスタンプ"
const HEADER_COUNT = "何名で参加されますか？"
const HEADER_SESSIONS = "参加したい座談会を選択してください。"

function getRequiredEnv(name: string) {
  const value = process.env[name]
  return value && value.trim().length > 0 ? value : undefined
}

function normalizePrivateKey(raw: string) {
  return raw.replace(/\\n/g, "\n")
}

function normalizeSheetTitle(title: string) {
  return title.trim()
}

function escapeSheetTitle(title: string) {
  return title.replace(/'/g, "''")
}

function parseCount(value: string | undefined) {
  // 人数の入力が空/不正な場合は1人として扱う
  // ルールを厳密にしたい場合はここでバリデーションを強化
  if (!value) return 1
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

function parseSessions(value: string | undefined) {
  // 複数選択の区切り文字（現在はカンマ）を変更する場合はここ
  if (!value) return []
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

export async function GET() {
  const sheetId = getRequiredEnv("GOOGLE_SHEET_ID") ?? DEFAULT_SHEET_ID
  const sheetName = getRequiredEnv("GOOGLE_SHEET_NAME") ?? DEFAULT_SHEET_NAME
  const clientEmail = getRequiredEnv("GOOGLE_CLIENT_EMAIL")
  const privateKey = getRequiredEnv("GOOGLE_PRIVATE_KEY")

  if (!clientEmail || !privateKey) {
    return NextResponse.json(
      {
        error:
          "Missing GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY. Set them in .env.local.",
      },
      { status: 500 },
    )
  }

  try {
    // サービスアカウントでJWT認証（シート読み取り専用）
    const auth = new JWT({
      email: clientEmail,
      key: normalizePrivateKey(privateKey),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    // JWTクライアントから直接APIリクエストを送る
    // スプレッドシートのメタ情報から正確なシート名を取得
    // シート名の微妙な違い（全角/半角/スペース等）に備えるため
    const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=sheets(properties(title))`
    const metaResponse = await auth.request<{
      sheets?: { properties?: { title?: string } }[]
    }>({ url: metaUrl })
    const sheetTitles =
      metaResponse.data.sheets
        ?.map((sheet) => sheet.properties?.title)
        .filter((title): title is string => Boolean(title)) ?? []

    const normalizedTarget = normalizeSheetTitle(sheetName)
    const exactMatch =
      sheetTitles.find((title) => normalizeSheetTitle(title) === normalizedTarget) ??
      sheetTitles[0]

    if (!exactMatch) {
      return NextResponse.json(
        { error: "No sheets found in the spreadsheet." },
        { status: 500 },
      )
    }

    // シート名に空白や全角文字があっても確実に取れるようA1記法で範囲指定
    // 取得範囲は A:Z を想定（列が増える場合はここを拡張）
    const range = `'${escapeSheetTitle(exactMatch)}'!A:Z`
    const encodedRange = encodeURIComponent(range)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodedRange}`
    const response = await auth.request<{ values?: string[][] }>({ url })
    const values = response.data.values ?? []

    if (values.length === 0) {
      return NextResponse.json({
        capacityPerSession: CAPACITY_PER_SESSION,
        sessions: [],
        fullSessions: [],
        entries: [],
        totalEntries: 0,
      })
    }

    const [headerRow, ...rows] = values
    // ヘッダー行から列名→インデックスの対応表を作成
    const headerIndex = new Map<string, number>()
    headerRow.forEach((label: string, index: number) =>
      headerIndex.set(label, index),
    )

    // 指定ヘッダーに該当するセル値を取得
    // ヘッダーが変更された場合は undefined が返るので、HEADER_* を更新する
    const getCell = (row: string[], header: string) => {
      const idx = headerIndex.get(header)
      if (idx === undefined) return undefined
      return row[idx]
    }

    // 応募一覧を整形
    // 個人情報は扱わず、人数と参加座談会のみを扱う
    // 追加で必要な項目が出たら、HEADER_* を追加してここで取り出す
    const entries = rows.map((row: string[]) => {
      const count = parseCount(getCell(row, HEADER_COUNT))
      const sessions = parseSessions(getCell(row, HEADER_SESSIONS))

      return {
        timestamp: getCell(row, HEADER_TIMESTAMP) ?? "",
        count,
        sessions,
      }
    })

    // 座談会名ごとに応募人数を合計
    // 集計ルール（人数ではなく件数にしたい等）はここを変更
    const sessionTotals = new Map<string, number>()
    for (const entry of entries) {
      for (const session of entry.sessions) {
        sessionTotals.set(session, (sessionTotals.get(session) ?? 0) + entry.count)
      }
    }

    // 座談会ごとの満員判定と残席数を算出
    // 定員ルールが複雑になった場合はここで計算ロジックを置き換える
    const sessions = Array.from(sessionTotals.entries())
      .map(([name, reserved]) => {
        const remaining = Math.max(CAPACITY_PER_SESSION - reserved, 0)
        return {
          name,
          reserved,
          remaining,
          isFull: reserved >= CAPACITY_PER_SESSION,
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name, "ja"))

    const fullSessions = sessions.filter((s) => s.isFull).map((s) => s.name)

    return NextResponse.json({
      capacityPerSession: CAPACITY_PER_SESSION,
      sessions,
      fullSessions,
      entries,
      totalEntries: entries.length,
    })
  } catch (error) {
    console.error("Failed to fetch spreadsheet data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch spreadsheet data.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
