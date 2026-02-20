// OSEKKAI 各フォームに設定するGoogle Apps Script例です。
// 目的: フォーム送信時に Next.js API へ人数を通知し、DBの残席を更新する。
//
// 手順:
// 1) このスクリプトを各フォームにコピー
// 2) SESSION_ID を各フォーム用に変更
// 3) COUNT_TITLE / EMAIL_TITLE をフォームの質問文に合わせる
// 4) WEBHOOK_URL / WEBHOOK_TOKEN を環境に合わせて設定
// 5) onFormSubmit トリガーをインストール（フォーム送信時）

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

// 参加人数の質問タイトル（例: 何名で参加されますか？）
const COUNT_TITLE = "何名で参加されますか？"
// 通知に使うメールアドレス質問タイトル（例: メールアドレス）
const EMAIL_TITLE = "メールアドレス"

function onFormSubmit(e) {
  if (!e) return

  const rawCount = getAnswerValue_(e, COUNT_TITLE)
  const participantCount = parseCount_(rawCount)
  const mailAddress = String(getAnswerValue_(e, EMAIL_TITLE) || "").trim()

  const payload = {
    sessionId: SESSION_ID,
    action: "reserve",
    participantCount,
  }

  const response = UrlFetchApp.fetch(WEBHOOK_URL, {
    method: "post",
    contentType: "application/json",
    headers: {
      "x-webhook-token": WEBHOOK_TOKEN,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  })

  const responseCode = response.getResponseCode()
  if (responseCode !== 409) {
    return
  }

  // 変更理由: 過予約を受け付けない運用に合わせ、満席時は回答者へ通知して回答を自動削除する。
  notifyReservationFailure_(mailAddress, SESSION_ID)
  deleteFormResponse_(e)
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

function notifyReservationFailure_(mailAddress, sessionId) {
  if (!mailAddress) return

  const subject = "【OSEKKAI】ご予約満席のお知らせ"
  const body =
    "ご予約ありがとうございます。\n" +
    "お申し込み内容を確認した時点で、該当枠は満席となっておりました。\n" +
    "そのため今回のご予約は確定できず、回答は自動キャンセルとなっています。\n\n" +
    "対象セッション: " + sessionId + "\n" +
    "お手数ですが、空きのある別枠で再度お申し込みをお願いいたします。"

  MailApp.sendEmail({
    to: mailAddress,
    subject: subject,
    body: body,
  })
}

function deleteFormResponse_(e) {
  if (!e || !e.response || !e.source) return
  const responseId = e.response.getId()
  if (!responseId) return
  e.source.deleteResponse(responseId)
}
