"use client"

import { useMemo, useState } from "react"

import Footer from "../components/Footer"
import NavigationMenu from "../components/NavigationMenu"

type EventTab = "roundtable" | "exhibition"

type ScheduleSlot = {
  id: string
  time: string
  remaining?: string
  isFull?: boolean
}

type ScheduleDay = {
  id: string
  label: string
  isExpanded: boolean
  slots: ScheduleSlot[]
}

type ExhibitionCard = {
  id: string
  title: string
  author: string
  image: string
}

const exhibitionCards: ExhibitionCard[] = Array.from({ length: 6 }).map(
  (_, index) => ({
    id: `exhibition-${index + 1}`,
    title: "体験展示のタイトルが入ります。体験展示のタイトルが入ります。",
    author: "苗字 名前",
    image: "/image/event_background.png",
  }),
)

// イベントページのタブ内容をまとめて管理し、Figmaの画面切り替えを再現します。
export default function EventsClient() {
  const [activeTab, setActiveTab] = useState<EventTab>("roundtable")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({
    "day-1": true,
  })

  const scheduleDays: ScheduleDay[] = useMemo(
    () => [
      {
        id: "day-1",
        label: "3月8日(日)",
        isExpanded: expandedDays["day-1"] ?? false,
        slots: [
          { id: "day-1-slot-1", time: "11:00~12:00", remaining: "残り2人" },
          {
            id: "day-1-slot-2",
            time: "14:00~15:00",
            remaining: "満員",
            isFull: true,
          },
        ],
      },
      {
        id: "day-2",
        label: "3月14日(土)",
        isExpanded: expandedDays["day-2"] ?? false,
        slots: [],
      },
      {
        id: "day-3",
        label: "3月15日(日)",
        isExpanded: expandedDays["day-3"] ?? false,
        slots: [],
      },
    ],
    [expandedDays],
  )

  const menuItems = [
    { id: "top", label: "TOP", href: "/" },
    { id: "research", label: "研究紹介", href: "/research" },
    { id: "works", label: "作品紹介", href: "/research?tab=works" },
    { id: "career", label: "卒業生の進路", href: "/career" },
    { id: "events", label: "イベント", href: "/events" },
    { id: "contact", label: "お問い合わせ", href: "/contact" },
  ]

  const toggleDay = (dayId: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayId]: !prev[dayId],
    }))
  }

  return (
    <div className="relative mx-auto flex w-full max-w-[393px] flex-col bg-[#F9F9F9] pb-16">
      {/* 右上メニューは既存ページと同じUIを使い回し、統一感を保ちます。 */}
      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 flex justify-center bg-[#F9F9F9]">
          <NavigationMenu
            items={menuItems}
            activeId="events"
            onClose={() => setIsMenuOpen(false)}
          />
        </div>
      ) : null}

      {/* 右上メニューボタンはFigmaの丸いボタンに揃えて固定します。 */}
      <div className="sticky top-0 z-20 flex w-full justify-end bg-[#F9F9F9] px-4 pt-6">
        <button
          type="button"
          aria-label="メニュー"
          onClick={() => setIsMenuOpen(true)}
          className="grid h-12 w-12 place-items-center rounded-full bg-[#F9F9F9] shadow-[0_0_8px_rgba(106,115,120,0.15)]"
        >
          <svg
            aria-hidden="true"
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M4 7H20M4 12H20M4 17H20"
              stroke="#6A7378"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* 見出しはFigmaのグラデーションバーと書体を再現します。 */}
      <section className="px-4 pt-2">
        <div className="flex items-center gap-3">
          <span className="h-[32px] w-2 rounded-[4px] bg-gradient-to-b from-[#FB9678] to-[#E5A967]" />
          <h1 className="text-[24px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            イベント
          </h1>
        </div>
      </section>

      {/* 切り替えボタンはピル型の2分割で、選択状態の境界線を強調します。 */}
      <section className="px-4 pt-6">
        <div className="flex items-center rounded-full bg-[#EBEEF0] p-2">
          <button
            type="button"
            onClick={() => setActiveTab("roundtable")}
            className={`flex-1 rounded-full px-2 py-3 text-[13px] font-medium transition-colors ${
              activeTab === "roundtable"
                ? "border border-[#FB9678] bg-[#F9F9F9] text-[#2E3437]"
                : "text-[#6A7378]"
            }`}
          >
            座談会(予約必須)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("exhibition")}
            className={`flex-1 rounded-full px-2 py-3 text-[13px] font-medium transition-colors ${
              activeTab === "exhibition"
                ? "border border-[#FB9678] bg-[#F9F9F9] text-[#2E3437]"
                : "text-[#6A7378]"
            }`}
          >
            体験展示
          </button>
        </div>
      </section>

      {activeTab === "roundtable" ? (
        <section className="px-4 pb-12 pt-10">
          <h2 className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            卒業生との座談会
          </h2>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <GradientIcon type="calendar" />
              <p className="text-[13px] leading-[1.9] text-[#4B5459]">
                3/8(日),3/14(土),3/15(日)の午前・午後1回ずつ
              </p>
            </div>
            <div className="flex items-center gap-2">
              <GradientIcon type="location" />
              <p className="text-[13px] leading-[1.9] text-[#4B5459]">
                交流プラザ
              </p>
            </div>
          </div>
          <p className="mt-4 text-[15px] leading-[2.2] text-[#4B5459]">
            これはダミー文章です。これから入学する大学がどんなところか知りたい高校生や、先輩がどんなことをしていたか知りたい在学生のための座談会です。
          </p>

          <div className="mt-10 space-y-4">
            <div className="border-b border-[#14BDB1] pb-1">
              <p className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                参加予約・スケジュール
              </p>
            </div>
            <p className="text-[15px] leading-[2.2] text-[#4B5459]">
              空いている日時を確認し予約フォームから申し込みをお願いします。
            </p>
          </div>

          {/* 予約枠はアコーディオン式で展開し、空き状況を強調します。 */}
          <div className="mt-4 divide-y divide-[#EBEEF0]">
            {scheduleDays.map((day) => (
              <div key={day.id} className="py-6">
                <button
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className="flex w-full items-center justify-between"
                >
                  <span
                    className={`text-[16px] font-medium ${
                      day.isExpanded ? "text-[#D3793D]" : "text-[#2E3437]"
                    }`}
                  >
                    {day.label}
                  </span>
                  <span
                    className={`text-[#A3ADB2] transition-transform ${
                      day.isExpanded ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  >
                    <ChevronIcon />
                  </span>
                </button>
                {day.isExpanded && day.slots.length > 0 ? (
                  <div className="mt-4 flex gap-4">
                    {day.slots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`flex flex-1 flex-col items-center justify-center rounded-[12px] border px-4 py-3 text-center shadow-[0_0_8px_rgba(106,115,120,0.15)] ${
                          slot.isFull
                            ? "border-[#EBEEF0] bg-[#EBEEF0] text-[#A3ADB2]"
                            : "border-[#FB9678] bg-[#F9F9F9] text-[#4B5459]"
                        }`}
                      >
                        <p className="text-[13px] font-medium">
                          {slot.time}
                        </p>
                        <p className="text-[10px] text-[#6A7378]">
                          {slot.remaining}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="px-4 pb-12 pt-10">
          {/* 体験展示は2列グリッドで整列し、カードの高さを揃えます。 */}
          <div className="grid grid-cols-2 gap-6">
            {exhibitionCards.map((card) => (
              <article key={card.id} className="space-y-2">
                <div className="aspect-video overflow-hidden rounded-[4px]">
                  <img
                    src={card.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-1 text-[12px]">
                  {/* Tailwindのline-clamp依存を避け、2行省略はインラインで指定します。 */}
                  <p
                    className="h-[36px] overflow-hidden text-[#4B5459]"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {card.title}
                  </p>
                  <p className="text-right text-[#6A7378]">{card.author}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* フッターは既存コンポーネントをそのまま使い回します。 */}
      <Footer />
    </div>
  )
}

// Figmaのグラデーション付きアイコンを簡易的なSVGで再現します。
function GradientIcon({ type }: { type: "calendar" | "location" }) {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
    >
      <defs>
        <linearGradient id={`${type}-gradient`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FB9678" />
          <stop offset="100%" stopColor="#E5A967" />
        </linearGradient>
      </defs>
      {type === "calendar" ? (
        <path
          d="M7 3V5M17 3V5M4 9H20M5 5H19C19.552 5 20 5.448 20 6V19C20 19.552 19.552 20 19 20H5C4.448 20 4 19.552 4 19V6C4 5.448 4.448 5 5 5Z"
          stroke={`url(#${type}-gradient)`}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M12 3C8.686 3 6 5.686 6 9C6 13.5 12 21 12 21C12 21 18 13.5 18 9C18 5.686 15.314 3 12 3ZM12 11.5C10.619 11.5 9.5 10.381 9.5 9C9.5 7.619 10.619 6.5 12 6.5C13.381 6.5 14.5 7.619 14.5 9C14.5 10.381 13.381 11.5 12 11.5Z"
          fill={`url(#${type}-gradient)`}
        />
      )}
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M7 10L12 15L17 10"
        stroke="#A3ADB2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
