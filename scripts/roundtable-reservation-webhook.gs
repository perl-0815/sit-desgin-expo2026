// OSEKKAI 各フォームに設定するGoogle Apps Script例です。
// 目的: フォーム送信時に Next.js API へ人数を通知し、DBの残席を更新する。
//
// 手順:
// 1) このスクリプトを各フォームにコピー
// 2) SESSION_ID を各フォーム用に変更
// 3) WEBHOOK_URL / WEBHOOK_TOKEN を環境に合わせて設定
// 4) onFormSubmit トリガーをインストール（フォーム送信時）

const WEBHOOK_URL = "https://<YOUR_DOMAIN>/api/events/roundtables/reservations"
const WEBHOOK_TOKEN = "<EVENT_RESERVATION_WEBHOOK_TOKEN>"

// フォームごとに固定のセッションIDを設定してください。
// 例:
// 第1回: roundtable-session-001
// 第2回: roundtable-session-002
// 第3回: roundtable-session-003
// 第4回: roundtable-session-004
// 第5回: roundtable-session-005
// 第6回: roundtable-session-006
const SESSION_ID = "roundtable-session-001"

// Googleフォームの質問文（人数）に合わせて変更してください。
const COUNT_TITLE = "何名で参加されますか？"

function onFormSubmit(e) {
  if (!e) return

  const rawCount = getAnswerValue_(e, COUNT_TITLE)
  const participantCount = parseCount_(rawCount)

  const payload = {
    sessionId: SESSION_ID,
    participantCount,
    action: "reserve",
  }

  UrlFetchApp.fetch(WEBHOOK_URL, {
    method: "post",
    contentType: "application/json",
    headers: {
      "x-webhook-token": WEBHOOK_TOKEN,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  })
}

function getAnswerValue_(e, title) {
  if (e.response) {
    const items = e.response.getItemResponses()
    const found = items.find((r) => r.getItem().getTitle() === title)
    return found ? found.getResponse() : ""
  }

  if (e.namedValues && e.namedValues[title]) {
    return e.namedValues[title].join(", ")
  }

  return ""
}

function parseCount_(value) {
  if (!value) return 1

  const normalized = String(value)
    .replace(/[０-９]/g, function (char) {
      return String.fromCharCode(char.charCodeAt(0) - 0xfee0)
    })
    .replace(/[\s,]/g, "")

  const match = normalized.match(/\d+/)
  if (!match) return 1

  const parsed = Number(match[0])
  if (!Number.isFinite(parsed) || parsed <= 0) return 1

  return Math.floor(parsed)
}
