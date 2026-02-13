"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

import Footer from "../components/Footer"
import GlobalHeader from "../components/GlobalHeader"
import useSectionReveal from "../components/useSectionReveal"

type EventsTab = "reserved" | "experience"

export default function EventsClient() {
  // URLの tab クエリで現在のタブを復元し、再訪時も同じ表示状態を維持できるようにします。
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const activeTab: EventsTab =
    searchParams.get("tab") === "experience" ? "experience" : "reserved"

  // イベントページ内の要素に既存の表示アニメーションを適用して、他ページと体験を揃えます。
  useSectionReveal()

  // トグル切り替え時はURLクエリに状態を同期し、ページリロード後も選択状態を保持します。
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
      <div className="relative mx-auto flex min-h-screen w-full flex-col bg-[#F9F9F9] md:max-w-[1280px]">
        <GlobalHeader activeId="events" />

        <div className="pt-[84px] md:pt-[96px]">
          <section data-reveal className="px-4 pt-6 md:px-[128px] md:pt-[36px]">
            <div className="flex items-center gap-3">
              <span className="h-[32px] w-2 rounded-[4px] bg-gradient-to-b from-[#FB9678] to-[#E5A967]" />
              <h1 className="text-[24px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                イベント
              </h1>
            </div>

            {/* 研究・作品紹介ページと同じピル型トグルを使い、予約必須イベント/体験展示を切り替え可能にします。 */}
            <div className="mt-6 w-full">
              <div className="rounded-full bg-[#EBEEF0] p-2 md:rounded-[9999px]">
                <div className="relative grid grid-cols-2 gap-0">
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
                    className={`relative z-10 w-full rounded-full px-1 py-3 text-[13px] font-medium transition outline-none focus:outline-none focus-visible:outline-none ${
                      activeTab === "reserved" ? "text-[#2E3437]" : "text-[#6A7378]"
                    }`}
                    aria-pressed={activeTab === "reserved"}
                    onClick={() => handleSwitchTab("reserved")}
                  >
                    予約必須イベント
                  </button>
                  <button
                    type="button"
                    className={`relative z-10 w-full rounded-full px-1 py-3 text-[13px] font-medium transition outline-none focus:outline-none focus-visible:outline-none ${
                      activeTab === "experience" ? "text-[#2E3437]" : "text-[#6A7378]"
                    }`}
                    aria-pressed={activeTab === "experience"}
                    onClick={() => handleSwitchTab("experience")}
                  >
                    体験展示
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section data-reveal className="mt-6 px-4 pb-16 md:px-[128px]">
            {activeTab === "reserved" ? (
              // 予約必須イベントタブは、懇親会カードと準備中カードの2カラム構成を維持します。
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                {/* 懇親会カードは詳細ページへの導線なので、カード全体をクリック可能にして遷移しやすくします。 */}
                <Link
                  href="/events/farewell-lecture"
                  className="block rounded-[24px] outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-[#FB9678] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F9F9F9] md:h-full"
                  aria-label="退職される先生の最終講義と懇親会ページへ"
                >
                  {/* 懇親会カードはFigmaに合わせ、白ベタではなく淡いグレー背景・弱い枠線/影・やや大きい角丸に調整します。 */}
                  <article className="rounded-[24px] border border-[#E6E9EC] bg-[#F4F6F7] p-6 shadow-[0_8px_24px_rgba(46,52,55,0.08)] md:h-full md:p-8">
                    <h2 className="text-[20px] font-bold leading-[1.65] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px]">
                      退職される先生の最終講義と懇親会
                    </h2>

                    <div className="mt-6 space-y-4 text-[14px] leading-[2] text-[#4B5459] md:text-[16px]">
                      <p className="flex items-center gap-2.5">
                        {/* Figma準拠でアイコンをオレンジ系にして、本文とのコントラストを揃えます。 */}
                        <span className="shrink-0 text-[#E5A967]" aria-hidden="true">
                          <CalendarIcon />
                        </span>
                        <span>3/14(土) 14:00~</span>
                      </p>
                      <p className="flex items-center gap-2.5">
                        <span className="shrink-0 text-[#E5A967]" aria-hidden="true">
                          <PinIcon />
                        </span>
                        <span>
                          最終講義：交流棟6階大講義室
                          <br />
                          懇親会：本部棟6階
                        </span>
                      </p>
                    </div>

                    <p className="mt-7 text-[14px] leading-[2.05] text-[#4B5459] md:text-[15px]">
                      2025年度をもって芝浦工業大学を退職される、島田明先生・吉武良治先生の最終講義および懇親会を実施します。
                    </p>
                  </article>
                </Link>

                {/* 準備中カードは研究・作品紹介ページと同じ配色/枠線/影/文字スタイルへ揃えて統一感を持たせます。 */}
                <article className="flex min-h-[280px] items-center justify-center rounded-[24px] border border-[#E6E9EC] bg-[#ECEFF1] p-6 text-center shadow-[0_8px_24px_rgba(46,52,55,0.08)] md:h-full md:min-h-0">
                  <p className="text-[22px] font-semibold tracking-[0.06em] text-[#6A7378] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[28px]">
                    Coming Soon...
                  </p>
                </article>
              </div>
            ) : (
              // 体験展示タブは要望どおり全体を準備中表示にし、1枚の全幅カードで見せます。
              <article className="flex h-[240px] items-center justify-center rounded-[24px] border border-[#E6E9EC] bg-[#ECEFF1] px-6 text-center shadow-[0_8px_24px_rgba(46,52,55,0.08)] md:h-[360px]">
                <p className="text-[22px] font-semibold tracking-[0.06em] text-[#6A7378] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[28px]">
                  Coming Soon...
                </p>
              </article>
            )}
          </section>
        </div>

        <Footer />
      </div>
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" role="img">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 9.5H21" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 3V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" role="img">
      <path
        d="M12 21C12 21 19 14.35 19 9.5C19 5.91 15.87 3 12 3C8.13 3 5 5.91 5 9.5C5 14.35 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="9.5" r="2.6" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}
