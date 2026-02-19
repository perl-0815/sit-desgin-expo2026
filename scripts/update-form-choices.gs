// Googleフォーム（編集画面URLの /d/ と /edit の間にあるID）
const FORM_ID = "REPLACE_WITH_FORM_ID"
// 回答スプレッドシートのタブ名（完全一致）
const SHEET_NAME = "フォームの回答 1"
// フォームの質問文（チェックボックス）
const QUESTION_TITLE = "参加したい座談会を選択してください。"
// フォームの質問文（人数）
const COUNT_TITLE = "何名で参加されますか？"
// フォームの質問文（名前）
const NAME_TITLE = "お名前"
// フォームの質問文（メールアドレス）
const EMAIL_TITLE = "メールアドレス"
// 各座談会の定員（人数）
const CAPACITY = 40
// 複数選択の区切り文字（Googleフォームの仕様に合わせる）
const DELIMITER = ","
// 管理者への通知先（複数可、カンマ区切りで送信）
const ADMIN_EMAILS = ["admin1@example.com", "admin2@example.com"]

function updateChoices() {
  // フォームを開く（権限が必要）
  const form = FormApp.openById(FORM_ID)
  // 回答スプレッドシートの対象タブを取得
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME)
  if (!sheet) throw new Error("Sheet not found: " + SHEET_NAME)

  // 回答データ（1行目はヘッダー）
  const values = sheet.getDataRange().getValues()
  if (values.length === 0) return

  // 1行目のヘッダーから列位置を特定
  const header = values[0]
  const idxSessions = header.indexOf(QUESTION_TITLE)
  const idxCount = header.indexOf(COUNT_TITLE)

  if (idxSessions === -1 || idxCount === -1) {
    throw new Error("Header not found. Check QUESTION_TITLE/COUNT_TITLE.")
  }

  // 座談会ごとの応募人数を集計
  const counts = new Map()
  for (let i = 1; i < values.length; i++) {
    const row = values[i]
    const rawSessions = row[idxSessions]
    const rawCount = row[idxCount]
    // 人数が空/不正なら1人として扱う
    const count = Number(rawCount) > 0 ? Number(rawCount) : 1
    if (!rawSessions) continue

    // カンマ区切りで座談会名を分割して加算
    String(rawSessions)
      .split(DELIMITER)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((s) => {
        counts.set(s, (counts.get(s) || 0) + count)
      })
  }

  // フォーム内の該当質問（チェックボックス）を取得
  const item = form
    .getItems()
    .find((it) => it.getTitle() === QUESTION_TITLE)
  if (!item) throw new Error("Question not found: " + QUESTION_TITLE)

  const checkbox = item.asCheckboxItem()
  // 既存の選択肢を取得し、満員のものだけ除外
  const currentChoices = checkbox.getChoices().map((c) => c.getValue())
  const availableChoices = currentChoices.filter(
    (name) => (counts.get(name) || 0) < CAPACITY,
  )

  // フォームの選択肢を更新（満員は消える）
  checkbox.setChoiceValues(availableChoices)
}

function onFormSubmit(e) {
  // フォーム送信イベントの想定外データは安全に無視する
  if (!e) return

  // 管理者向けの件名と本文を組み立てる
  const subject = "【自動】座談会の申込通知"

  // タイムスタンプはフォーム直結なら回答から、無ければ現在時刻を使う
  const submittedAt = e.response ? e.response.getTimestamp() : new Date()

  // フォーム直結トリガーは e.response、シート側トリガーは e.namedValues を利用する
  // 必要な項目をタイトル指定で取得する
  const name = getAnswerValue_(e, NAME_TITLE)
  const email = getAnswerValue_(e, EMAIL_TITLE)
  const countRaw = getAnswerValue_(e, COUNT_TITLE)
  const count = Number(countRaw) > 0 ? Number(countRaw) : 1
  const sessionsRaw = getAnswerValue_(e, QUESTION_TITLE)

  // 参加する座談会はカンマ区切りを改行に変換する
  const sessions = String(sessionsRaw || "")
    .split(DELIMITER)
    .map((s) => s.trim())
    .filter(Boolean)

  // 現在の予約人数を集計する（参加人数 * 参加する座談会で加算）
  const counts = countSessionsFromSheet_()

  // 座談会ごとの予約状況を本文に出力する
  const sessionsWithCounts = sessions.map((s) => {
    const reserved = counts.get(s) || 0
    return `${s}（現在予約 ${reserved} / ${CAPACITY}）`
  })

  // 本文は指定の項目だけを出力する（フォームIDは含めない）
  const body = [
    `タイムスタンプ: ${submittedAt}`,
    `名前: ${name || ""}`,
    `メールアドレス: ${email || ""}`,
    `人数: ${count}`,
    "参加する座談会:",
    ...sessionsWithCounts,
  ].join("\n")

  // 管理者へ一括通知する（配列をカンマ区切りにして送信）
  MailApp.sendEmail({
    to: ADMIN_EMAILS.join(","),
    subject,
    body,
  })
}

function getAnswerValue_(e, title) {
  // フォーム直結トリガーの回答から値を取得する
  if (e.response) {
    const items = e.response.getItemResponses()
    const found = items.find((r) => r.getItem().getTitle() === title)
    return found ? found.getResponse() : ""
  }

  // スプレッドシート側トリガーの回答から値を取得する
  if (e.namedValues && e.namedValues[title]) {
    return e.namedValues[title].join(", ")
  }

  return ""
}

function countSessionsFromSheet_() {
  // 回答スプレッドシートの対象タブを取得して応募人数を集計する
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME)
  if (!sheet) throw new Error("Sheet not found: " + SHEET_NAME)

  const values = sheet.getDataRange().getValues()
  if (values.length === 0) return new Map()

  const header = values[0]
  const idxSessions = header.indexOf(QUESTION_TITLE)
  const idxCount = header.indexOf(COUNT_TITLE)

  if (idxSessions === -1 || idxCount === -1) {
    throw new Error("Header not found. Check QUESTION_TITLE/COUNT_TITLE.")
  }

  const counts = new Map()
  for (let i = 1; i < values.length; i++) {
    const row = values[i]
    const rawSessions = row[idxSessions]
    const rawCount = row[idxCount]
    const count = Number(rawCount) > 0 ? Number(rawCount) : 1
    if (!rawSessions) continue

    String(rawSessions)
      .split(DELIMITER)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((s) => {
        counts.set(s, (counts.get(s) || 0) + count)
      })
  }

  return counts
}
