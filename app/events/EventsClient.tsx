"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import Footer from "../components/Footer"
import GlobalHeader from "../components/GlobalHeader"
import useSectionReveal from "../components/useSectionReveal"

type EventsTab = "reserved" | "experience"

type ReservedEvent = {
  id: string
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  href?: string
  ariaLabel?: string
}

// Figma指定のカード内容を配列で一元管理し、文言/リンクの差し替えを局所化します。
const reservedEvents: ReservedEvent[] = [
  {
    id: "osekkai",
    title: "【高校生向け】 デザイン工学部なんでも相談会-OSEKKAI-",
    description:
      "現役生によるデザイン工学部なんでも相談会です！学部4年生以上が参加しますのでこの機会にたくさん質問してください。",
    imageSrc: "/image/osekkai.png",
    imageAlt: "OSEKKAIのイベントバナー",
    // 詳細ページの実装先に合わせ、一覧導線はOSEKKAIカード側に設定します。
    href: "/events/farewell-lecture",
    ariaLabel: "デザイン工学部なんでも相談会-OSEKKAI-ページへ",
  },
  {
    id: "farewell-lecture",
    title: "退職される先生の最終講義と懇親会",
    description:
      "2025年度をもって芝浦工業大学を退職される、島田明先生・吉武良治先生の最終講義および懇親会を実施します。",
    imageSrc: "/image/event-image.png",
    imageAlt: "退職される先生の最終講義と懇親会",
  },
]

export default function EventsClient() {
  // URLクエリにタブ状態を保持し、再訪時も前回の表示を維持します。
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const activeTab: EventsTab =
    searchParams.get("tab") === "experience" ? "experience" : "reserved"

  // 既存のページ遷移アニメーション設計に合わせるため、共通のrevealを継続利用します。
  useSectionReveal()

  // トグル操作をURLへ同期し、ブラウザの再読み込み後も選択状態を再現します。
  const handleSwitchTab = (nextTab: EventsTab) => {
    const nextParams = new URLSearchParams(searchParams.toString())
    if (nextTab === "experience") {
      nextParams.set("tab", "experience")
    } else {
      nextParams.delete("tab")
    }
    const nextQuery = nextParams.toString()
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    })
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <GlobalHeader activeId="events" />

      <main className="pb-12 pt-[92px] md:pb-0 md:pt-[144px]">
        <section
          data-reveal
          className="mx-auto w-full max-w-[1280px] px-4 py-3 md:px-[128px] md:py-5"
        >
          {/* Figmaの切替UIに合わせ、見出しを省いてトグルのみを上部に配置します。 */}
          <div className="rounded-full bg-[#EBEEF0] p-2 md:p-3">
            <div className="relative grid grid-cols-2">
              {/* アクティブ背景は実カードと同じ白80%+薄枠で統一し、デザインの一貫性を保ちます。 */}
              <div
                className="pointer-events-none absolute inset-y-0 left-0 w-1/2 rounded-full border border-[#F9F9F9] bg-white/80 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                  transform:
                    activeTab === "experience"
                      ? "translateX(100%)"
                      : "translateX(0%)",
                }}
                aria-hidden="true"
              />
              <button
                type="button"
                className={`relative z-10 w-full rounded-full px-1 py-3 text-[13px] font-medium leading-[1.5] text-[#6A7378] transition md:py-5 md:text-[15px] ${
                  activeTab === "reserved" ? "text-[#2E3437]" : "text-[#6A7378]"
                }`}
                aria-pressed={activeTab === "reserved"}
                onClick={() => handleSwitchTab("reserved")}
              >
                予約必須イベント
              </button>
              <button
                type="button"
                className={`relative z-10 w-full rounded-full px-1 py-3 text-[13px] font-medium leading-[1.5] text-[#6A7378] transition md:py-5 md:text-[15px] ${
                  activeTab === "experience" ? "text-[#2E3437]" : "text-[#6A7378]"
                }`}
                aria-pressed={activeTab === "experience"}
                onClick={() => handleSwitchTab("experience")}
              >
                体験展示
              </button>
            </div>
          </div>
        </section>

        <section
          data-reveal
          className="mx-auto w-full max-w-[1280px] px-4 pb-12 pt-3 md:px-[128px] md:pb-[128px] md:pt-4"
        >
          {activeTab === "reserved" ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-9">
              {reservedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <article className="flex h-[240px] items-center justify-center rounded-[12px] bg-white/80 p-6 text-center shadow-[0_0_8px_rgba(106,115,120,0.1)] md:h-[360px] md:rounded-[20px]">
              <p className="text-[22px] font-semibold tracking-[0.06em] text-[#6A7378] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[28px]">
                Coming Soon...
              </p>
            </article>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}

function EventCard({ event }: { event: ReservedEvent }) {
  const cardContent = (
    <article className="flex h-full flex-col gap-3 rounded-[12px] bg-white/80 p-4 shadow-[0_0_8px_rgba(106,115,120,0.1)] md:gap-5 md:rounded-[20px] md:p-6">
      <img
        src={event.imageSrc}
        alt={event.imageAlt}
        className="aspect-[1920/1080] w-full rounded-[8px] object-cover md:rounded-[12px]"
      />

      <div className="flex flex-col gap-1 md:gap-2">
        <h2 className="text-[20px] font-extrabold leading-[1.5] tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px]">
          {event.title}
        </h2>
        {/* 説明文はFigmaどおり2行で打ち切り、カード高さの揺れを抑えて整列を維持します。 */}
        <p
          className="text-[15px] leading-[2] tracking-[0.04em] text-[#6A7378] md:text-[18px]"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {event.description}
        </p>
      </div>

      <div className="mt-auto flex justify-end">
        <span className="inline-flex items-center gap-1 px-1 text-[13px] font-medium leading-[1.5] text-[#D3793D] md:gap-2 md:px-2 md:text-[15px]">
          <span>詳しく見る</span>
          <ChevronRightIcon />
        </span>
      </div>
    </article>
  )

  if (!event.href) {
    return cardContent
  }

  return (
    <Link
      href={event.href}
      aria-label={event.ariaLabel}
      className="block rounded-[12px] outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-[#FB9678] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F9F9F9] md:rounded-[20px]"
    >
      {cardContent}
    </Link>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <path
        d="M10 7L15 12L10 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
