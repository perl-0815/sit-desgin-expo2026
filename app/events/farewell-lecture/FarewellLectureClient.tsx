"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import Footer from "../../components/Footer"
import GlobalHeader from "../../components/GlobalHeader"
import useSectionReveal from "../../components/useSectionReveal"

type SlotStatus = "available" | "few" | "full"

type ScheduleSlot = {
  id: string
  sessionId: string
  start: string
  end: string
  receptionStart: string
  formUrl: string
  // APIが未取得/未設定のときに使う表示用フォールバックです。
  fallbackStatus: SlotStatus
}

type ScheduleDay = {
  id: string
  dateMain: string
  weekdayLabel: string
  weekdayColor: "normal" | "sat" | "sun"
  location: string
  slots: ScheduleSlot[]
}

type ApiRoundtableSession = {
  id: string
  start_at: string
  end_at: string
  reception_start_at: string | null
  location: string | null
  booking_form_url: string | null
  capacity: number | null
  remaining: number | null
  is_full: boolean
}

type ApiRoundtable = {
  id: string
  sessions: ApiRoundtableSession[]
}

// 注意事項の文中リンクはフッターの実問い合わせ先（Googleフォーム）に統一します。
const contactFormUrl = "https://forms.gle/9pBuxBWgC9YuFo8j8"

// Figmaの文言・並びを維持するため、本文コンテンツを定数化してコンポーネント内の差分を減らします。
const pointCards = [
  {
    title: "学生のリアルを間近で",
    description: ["普段の授業の様子を映した動画や、", "実際に作った作品を間近で見られる！"],
  },
  {
    title: "現役生とフリートーク",
    description: ["今年卒業する現役生とゆるくおしゃべりできる時間もたっぷり！"],
  },
  {
    title: "オリジナル特典",
    description: ["来場者には現役生デザインのオリジナルステッカープレゼント！"],
  },
]

// 各枠のフォームURLを固定で紐付けます。
// 1〜6はユーザー指定のGoogleフォームURL順です。
const scheduleDays: ScheduleDay[] = [
  {
    id: "0308",
    dateMain: "3月8日",
    weekdayLabel: "(日)",
    weekdayColor: "sun",
    location: "本部棟7階 オープンラボ",
    slots: [
      {
        id: "0308-1",
        sessionId: "roundtable-session-001",
        start: "11:00",
        end: "12:00",
        receptionStart: "10:50",
        formUrl: "https://forms.gle/ocL4dMyHuPdj6vn47",
        fallbackStatus: "available",
      },
      {
        id: "0308-2",
        sessionId: "roundtable-session-002",
        start: "14:00",
        end: "15:00",
        receptionStart: "13:50",
        formUrl: "https://forms.gle/RK83h976q9SQ6MY59",
        fallbackStatus: "few",
      },
    ],
  },
  {
    id: "0314",
    dateMain: "3月14日",
    weekdayLabel: "(土)",
    weekdayColor: "sat",
    location: "本部棟5階 オープンラボ",
    slots: [
      {
        id: "0314-1",
        sessionId: "roundtable-session-003",
        start: "11:00",
        end: "12:00",
        receptionStart: "10:50",
        formUrl: "https://forms.gle/Dwo2stkes9g5ghTU6",
        fallbackStatus: "available",
      },
      {
        id: "0314-2",
        sessionId: "roundtable-session-004",
        start: "13:00",
        end: "14:00",
        receptionStart: "12:50",
        formUrl: "https://forms.gle/AvZSVPWaTNw7oBCe7",
        fallbackStatus: "few",
      },
    ],
  },
  {
    id: "0315",
    dateMain: "3月15日",
    weekdayLabel: "(日)",
    weekdayColor: "sun",
    location: "本部棟6階 オープンラボ",
    slots: [
      {
        id: "0315-1",
        sessionId: "roundtable-session-005",
        start: "11:00",
        end: "12:00",
        receptionStart: "10:50",
        formUrl: "https://forms.gle/3bfDYSvL2LCeiZGf6",
        fallbackStatus: "full",
      },
      {
        id: "0315-2",
        sessionId: "roundtable-session-006",
        start: "14:00",
        end: "15:00",
        receptionStart: "13:50",
        formUrl: "https://forms.gle/ueExJwT8F3jA5sDs5",
        fallbackStatus: "few",
      },
    ],
  },
]

export default function FarewellLectureClient() {
  const router = useRouter()

  // 他ページと同じ表示トランジションに揃え、スクロール時の見え方を統一します。
  useSectionReveal()

  // DBの残席情報をセッションID単位で保持します。
  const [sessionMap, setSessionMap] = useState<Record<string, ApiRoundtableSession>>({})
  // 変更理由: API取得前の仮文言（プレースホルダー）を表示せず、読込中はスケルトンへ統一するための状態です。
  const [isSessionLoading, setIsSessionLoading] = useState(true)

  useEffect(() => {
    let active = true

    // 既存API(/api/events/roundtables)を再利用し、残席表示をDB値へ同期します。
    const loadSessions = async () => {
      try {
        const response = await fetch("/api/events/roundtables", { cache: "no-store" })
        if (!response.ok) return

        const data = (await response.json()) as ApiRoundtable[]
        if (!active || !Array.isArray(data)) return

        const nextMap: Record<string, ApiRoundtableSession> = {}
        for (const roundtable of data) {
          if (!Array.isArray(roundtable.sessions)) continue
          for (const session of roundtable.sessions) {
            nextMap[session.id] = session
          }
        }
        setSessionMap(nextMap)
      } catch {
        // APIが利用不可の場合もUIはフォールバック表示で継続させます。
      } finally {
        if (active) {
          setIsSessionLoading(false)
        }
      }
    }

    loadSessions()

    return () => {
      active = false
    }
  }, [])

  const enrichedDays = useMemo(() => {
    return scheduleDays.map((day) => ({
      ...day,
      slots: day.slots.map((slot) => {
        const apiSession = sessionMap[slot.sessionId]
        return {
          ...slot,
          apiSession,
        }
      }),
    }))
  }, [sessionMap])

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <GlobalHeader activeId="events" />

      <main className="pb-12 pt-[92px] md:pb-[48px] md:pt-[124px]">
        {/* 戻る導線はFigma通りヘッダー直下に固定高さで置き、一覧への復帰操作を分かりやすくします。 */}
        <div className="mx-auto w-full max-w-[760px] px-4 md:px-0">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                router.back()
                return
              }
              router.push("/events")
            }}
            className="inline-flex h-[80px] items-center gap-2 text-[13px] font-medium text-[#6A7378] md:gap-3 md:text-[15px]"
          >
            <BackChevronIcon />
            <span>戻る</span>
          </button>
        </div>

        {/* 変更理由: Figmaの縦リズム（SP 12px / PC 20px）に合わせ、ヒーロー直下の各要素間隔を調整します。 */}
        <section data-reveal className="mx-auto w-full max-w-[760px] px-4 pb-8 md:px-0 md:pb-14">
          <div className="space-y-3 md:space-y-5">
            <img
              src="/image/osekkai.png"
              alt="【高校生向けイベント】デザイン工学部なんでも相談会 OSEKKAI"
              className="aspect-[1920/1080] w-full rounded-[8px] object-cover md:rounded-[12px]"
            />

            <h1 className="text-[20px] font-extrabold leading-[1.5] tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px]">
              【高校生向けイベント】デザイン工学部なんでも相談会-OSEKKAI-
            </h1>

            <div className="space-y-0 text-[15px] leading-[2] tracking-[0.04em] text-[#4B5459] md:text-[18px]">
              <p>現役生によるデザイン工学部なんでも相談会です！学部4年生以上が参加しますのでこの機会にたくさん相談してください！</p>
              <p>「デザ工ってどんな雰囲気？」「勉強は大変？」「就活はどんな感じ？」</p>
              <p>そんな疑問に、現役の学生が「おせっかい」なくらい親身にお答えします！座談会や説明会とは少し違ったラフな状態でお話ししてみませんか？</p>
            </div>
          </div>
        </section>

        <section data-reveal className="mx-auto w-full max-w-[760px] px-4 pb-8 md:px-0 md:pb-14">
          {/* 見出し両端の罫線を疑似要素ではなく要素で構成し、SP/PCの見た目差分を安定させます。 */}
          <div className="flex items-center gap-6">
            <span className="h-px flex-1 bg-[#EBEEF0]" />
            <h2 className="text-center text-[20px] font-extrabold leading-[1.5] tracking-[0.02em] text-[#4B5459] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px]">
              OSEKKAI 3大ポイント
            </h2>
            <span className="h-px flex-1 bg-[#EBEEF0]" />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 md:mt-6 md:grid-cols-3 md:gap-5">
            {pointCards.map((point) => (
              <article
                key={point.title}
                className="rounded-[12px] border border-[#EBEEF0] bg-white/80 p-3 md:rounded-[20px] md:p-5"
              >
                <h3 className="text-[16px] font-medium leading-[1.5] text-[#D3793D] md:text-[20px]">{point.title}</h3>
                <div className="mt-1 text-[13px] leading-[1.9] tracking-[0.02em] text-[#6A7378] md:mt-2 md:text-[16px]">
                  {point.description.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <p className="mt-6 text-[15px] leading-[2] tracking-[0.04em] text-[#4B5459] md:mt-9 md:text-[18px]">
            大学生活への不安や勉強のコツなど、どんなに些細なことでも構いません。卒展開催に合わせたこの機会にぜひ、リアルな声を聴きに来てください！
          </p>
        </section>

        <section data-reveal className="mx-auto w-full max-w-[760px] px-4 pb-8 md:px-0 md:pb-[48px]">
          {/* 最新Figmaでは注意事項が予約見出しより前に配置されているため、順序を先に移動します。 */}
          <article className="rounded-[12px] border border-[#EBEEF0] bg-white/80 p-3 md:rounded-[20px] md:p-5">
            <div className="flex items-center gap-2">
              <InfoIcon />
              <p className="text-[13px] font-medium leading-[1.5] text-[#2E3437] md:text-[15px]">本イベントに関する注意事項</p>
            </div>
            <ul className="mt-1 list-disc pl-5 text-[13px] leading-[1.9] tracking-[0.02em] text-[#6A7378] md:mt-2 md:text-[16px] md:tracking-[0.02em]">
              <li>事前申込制となります。各枠とも満員になり次第、募集を終了させていただきます。</li>
              <li>全日程において開始時間の10分前から受付を開始します。</li>
              <li>当日の状況により、プログラム内容やスケジュールが一部変更になる場合がございます。</li>
              <li>
                お申し込み後にキャンセルされる場合は、お早めに
                <Link
                  href={contactFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D3793D] underline"
                >
                  お問い合せフォーム
                </Link>
                よりご連絡ください。
              </li>
            </ul>
          </article>

          {/* 変更理由: 予約見出し下線はFigma準拠でブランドカラーの1pxラインに統一します。 */}
          <div className="mt-6 border-b border-[#D3793D] pb-2 md:mt-8">
            <h2 className="text-[20px] font-extrabold leading-[1.5] tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px]">
              参加予約・スケジュール
            </h2>
          </div>

          <div className="mt-2 space-y-0.5 text-[13px] leading-[1.9] tracking-[0.02em] text-[#6A7378] md:mt-3 md:text-[14px] md:leading-[1.6]">
            <p>参加をご希望される方は時間を選び・項目を確認の上で、ご予約をお願いします。（Google Formsに遷移します。）</p>
            <p>日にちによって会場や開催時間が異なりますのでご注意ください。</p>
          </div>

          <div className="mt-4 space-y-5 md:mt-6 md:space-y-7">
            {enrichedDays.map((day) => (
              <article key={day.id} className="border-t border-[#EBEEF0] pt-3 md:border-t-0 md:pt-0">
                <div className="flex items-start justify-between gap-3 md:items-center">
                  <p className="text-[16px] font-medium leading-[1.5]">
                    <span className="text-[#2E3437]">{day.dateMain}</span>
                    <span className={weekdayColorClassName(day.weekdayColor)}>{day.weekdayLabel}</span>
                  </p>
                  <div className="flex items-center gap-1 text-[12px] leading-[1.6] tracking-[0.02em] text-[#4B5459] md:text-[14px]">
                    <LocationIcon />
                    <span>{day.slots[0]?.apiSession?.location ?? day.location}</span>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-1 gap-4 md:mt-2 md:grid-cols-2 md:gap-14">
                  {day.slots.map((slot) => (
                    <ScheduleCard key={slot.id} slot={slot} isLoading={isSessionLoading} />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function ScheduleCard({
  slot,
  isLoading,
}: {
  slot: ScheduleSlot & {
    apiSession?: ApiRoundtableSession
  }
  isLoading: boolean
}) {
  if (isLoading) {
    return <ScheduleCardSkeleton />
  }

  const derived = deriveSlotDisplay(slot)

  return (
    // 変更理由: Figmaノード1578:9060（Desktop予約カード）の角丸16px・余白24pxに合わせるため、PC側の24px/24px設定へ統一します。
    <article className="rounded-[16px] bg-white/80 p-6 shadow-[0_0_8px_rgba(106,115,120,0.1)] md:rounded-[16px] md:p-6">
      <div className="flex items-center justify-between border-b border-[#EBEEF0] pb-1">
        <p className="text-[24px] font-bold leading-[1.5] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[32px]">
          {slot.start} - {slot.end}
        </p>
        <div className="text-right">
          <p className={`text-[13px] font-medium leading-[1.5] md:text-[15px] ${derived.statusTextColor}`}>{derived.statusLabel}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:mt-9">
        <div>
          <p className="text-[10px] leading-[1.5] text-[#6A7378] md:text-[12px]">受付開始</p>
          <p className="text-[13px] font-medium leading-[1.5] text-[#4B5459] md:text-[15px]">{derived.receptionStart}</p>
        </div>
        <div>
          <p className="text-[10px] leading-[1.5] text-[#6A7378] md:text-[12px]">開始</p>
          <p className="text-[13px] font-medium leading-[1.5] text-[#4B5459] md:text-[15px]">{slot.start}</p>
        </div>
      </div>

      {derived.status === "full" ? (
        <button
          type="button"
          disabled
          className="mt-6 flex h-[48px] w-full items-center justify-center rounded-full bg-[#EBEEF0] px-8 text-[13px] font-medium leading-[1.5] text-[#A3ADB2] shadow-[0_0_8px_rgba(106,115,120,0.1)] md:mt-9 md:h-[72px] md:text-[15px]"
        >
          受付終了
        </button>
      ) : (
        <a
          href={slot.apiSession?.booking_form_url ?? slot.formUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex h-[48px] w-full items-center justify-center rounded-full bg-[#4B5459] px-8 text-[13px] font-medium leading-[1.5] text-[#F9F9F9] shadow-[0_0_8px_rgba(106,115,120,0.1)] transition-colors hover:bg-[#3f474c] md:mt-9 md:h-[72px] md:text-[15px]"
        >
          予約する
        </a>
      )}
    </article>
  )
}

function ScheduleCardSkeleton() {
  return (
    // 変更理由: 実カードと同一のサイズ感を保ち、ローディング時のレイアウトジャンプを防ぐためPCの角丸・余白を一致させます。
    <article className="rounded-[16px] bg-white/80 p-6 shadow-[0_0_8px_rgba(106,115,120,0.1)] md:rounded-[16px] md:p-6" aria-hidden="true">
      <div className="flex items-center justify-between border-b border-[#EBEEF0] pb-1">
        <SkeletonBlock className="h-9 w-40 rounded-md md:h-11 md:w-52" />
        <SkeletonBlock className="h-5 w-20 rounded-md" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:mt-9">
        <div>
          <SkeletonBlock className="h-3 w-12 rounded-md" />
          <SkeletonBlock className="mt-2 h-5 w-16 rounded-md" />
        </div>
        <div>
          <SkeletonBlock className="h-3 w-8 rounded-md" />
          <SkeletonBlock className="mt-2 h-5 w-16 rounded-md" />
        </div>
      </div>

      <SkeletonBlock className="mt-6 h-[48px] w-full rounded-full md:mt-9 md:h-[72px]" />
    </article>
  )
}

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden bg-[#EBEEF0] ${className}`}>
      <div className="absolute inset-0 skeleton-shimmer bg-linear-to-r from-transparent via-white/30 to-transparent" />
    </div>
  )
}

function deriveSlotDisplay(
  slot: ScheduleSlot & {
    apiSession?: ApiRoundtableSession
  },
) {
  const fallback = getSlotStatusFromTag(slot.fallbackStatus)

  if (!slot.apiSession) {
    return {
      ...fallback,
      status: slot.fallbackStatus,
      receptionStart: slot.receptionStart,
      remainingText: null as string | null,
    }
  }

  const capacity = slot.apiSession.capacity
  const remaining = slot.apiSession.remaining
  const isFull = slot.apiSession.is_full || (typeof remaining === "number" && remaining <= 0)
  const receptionStartFromApi = formatJstTime(slot.apiSession.reception_start_at)

  if (isFull) {
    return {
      ...getSlotStatusFromTag("full"),
      status: "full" as const,
      receptionStart: receptionStartFromApi ?? slot.receptionStart,
      // 変更理由: 「残り〇組」は逼迫時のみ表示する運用に合わせ、満席時は件数表示を出さない。
      remainingText: null,
    }
  }

  if (typeof remaining === "number") {
    if (remaining <= 5) {
      return {
        ...getSlotStatusFromTag("few"),
        status: "few" as const,
        receptionStart: receptionStartFromApi ?? slot.receptionStart,
        // 変更理由: 下段の「残り〇組」表示を廃止し、上段ラベルに具体的な残数を表示する。
        statusLabel: `△残り${remaining}組`,
        remainingText: null,
      }
    }

    return {
      ...getSlotStatusFromTag("available"),
      status: "available" as const,
      receptionStart: receptionStartFromApi ?? slot.receptionStart,
      // 変更理由: 残数が6組以上のときは件数表示を出さない（例: 「残り39組 / 40組」を非表示）。
      remainingText: null,
    }
  }

  return {
    ...fallback,
    status: slot.fallbackStatus,
    receptionStart: receptionStartFromApi ?? slot.receptionStart,
    remainingText: typeof capacity === "number" ? `定員 ${capacity} 組` : null,
  }
}

function formatJstTime(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tokyo",
  })
}

function getSlotStatusFromTag(tag: SlotStatus) {
  if (tag === "available") {
    return {
      statusLabel: "◎余裕あり",
      statusTextColor: "text-[#0A948A]",
    }
  }
  if (tag === "few") {
    return {
      statusLabel: "△残り1~5組",
      statusTextColor: "text-[#DA3529]",
    }
  }
  return {
    statusLabel: "×満員御礼",
    statusTextColor: "text-[#A3ADB2]",
  }
}

function weekdayColorClassName(weekday: ScheduleDay["weekdayColor"]) {
  if (weekday === "sat") {
    return "text-[#2C68D3]"
  }
  if (weekday === "sun") {
    return "text-[#DA3529]"
  }
  return "text-[#2E3437]"
}

function BackChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M9.5 3.5L5 8L9.5 12.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21C12 21 18.5 14.9 18.5 10.2C18.5 6.52 15.59 4 12 4C8.41 4 5.5 6.52 5.5 10.2C5.5 14.9 12 21 12 21Z"
        stroke="#D3793D"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="10.2" r="2.4" stroke="#D3793D" strokeWidth="1.8" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="#D3793D" strokeWidth="1.8" />
      <path d="M12 10.4V16" stroke="#D3793D" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="7.6" r="1" fill="#D3793D" />
    </svg>
  )
}
