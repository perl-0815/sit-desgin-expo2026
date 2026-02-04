// Googleフォーム（編集画面URLの /d/ と /edit の間にあるID）
const FORM_ID = "REPLACE_WITH_FORM_ID"
// 回答スプレッドシートのタブ名（完全一致）
const SHEET_NAME = "フォームの回答 1"
// フォームの質問文（チェックボックス）
const QUESTION_TITLE = "参加したい座談会を選択してください。"
// フォームの質問文（人数）
const COUNT_TITLE = "何名で参加されますか？"
// 各座談会の定員（人数）
const CAPACITY = 20
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
  const subject = "Googleフォームの回答が送信されました"
  const submittedAt = new Date()

  // 回答内容を「質問: 回答」の形式で並べる
  // フォーム直結トリガーは e.response、シート側トリガーは e.namedValues を利用する
  let lines = []
  if (e.response) {
    lines = e.response
      .getItemResponses()
      .map((r) => `${r.getItem().getTitle()}: ${r.getResponse()}`)
  } else if (e.namedValues) {
    lines = Object.entries(e.namedValues).map(
      ([title, values]) => `${title}: ${values.join(", ")}`,
    )
  }

  // どのフォームからの通知か分かるようにIDを明記する
  const body = [
    "フォームに新しい回答が送信されました。",
    `フォームID: ${FORM_ID}`,
    `送信日時: ${submittedAt}`,
    "",
    "回答内容:",
    ...lines,
  ].join("\n")

  // 管理者へ一括通知する（配列をカンマ区切りにして送信）
  MailApp.sendEmail({
    to: ADMIN_EMAILS.join(","),
    subject,
    body,
  })
}
