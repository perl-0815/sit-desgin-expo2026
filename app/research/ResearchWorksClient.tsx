"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import Footer from "../components/Footer"
import GlobalHeader from "../components/GlobalHeader"
import useSectionReveal from "../components/useSectionReveal"

type PageTab = "research" | "works"

type TabContent = {
  description: string
  activeHeaderId: "research" | "works"
}

const tabContents: Record<PageTab, TabContent> = {
  research: {
    description:
      "このページは現在準備中です。卒展に出展している学生の研究をコース・研究室ごとに閲覧できるようになります。",
    activeHeaderId: "research",
  },
  works: {
    description:
      "このページは現在準備中です。卒展に出展している学生の作品をコースごとに閲覧できるようになります。",
    activeHeaderId: "works",
  },
}

export default function ResearchWorksClient() {
  // URLの tab クエリで研究/作品のどちらを表示するかを決め、ヘッダーのアクティブ表示も揃えます。
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const activeTab: PageTab =
    searchParams.get("tab") === "works" ? "works" : "research"

  // スクロール時の表示アニメーションは既存ページと同じフックを利用して統一します。
  useSectionReveal()

  const activeContent = tabContents[activeTab]

  // タブ切り替え時はURLクエリも同期し、ヘッダーの作品紹介導線（/research?tab=works）と挙動を一致させます。
  const handleSwitchTab = (nextTab: PageTab) => {
    const nextParams = new URLSearchParams(searchParams.toString())
    if (nextTab === "works") {
      nextParams.set("tab", "works")
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
      {/* イベントページと同様に、中央寄せの固定幅レイアウトで簡易公開版の体裁を統一します。 */}
      <div className="relative mx-auto flex min-h-screen w-full flex-col bg-[#F9F9F9] md:max-w-[1280px]">
        <GlobalHeader activeId={activeContent.activeHeaderId} />

        {/* 固定ヘッダーの重なりを避けるため、本文開始位置に上余白を確保します。 */}
        <div className="pt-[84px] md:pt-[96px]">
          <section data-reveal className="px-4 pt-6 md:px-[128px] md:pt-[36px]">
            <div className="flex items-center gap-3">
              <span className="h-[32px] w-2 rounded-[4px] bg-gradient-to-b from-[#FB9678] to-[#E5A967]" />
              <h1 className="text-[24px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                研究・作品紹介
              </h1>
            </div>

            {/* 研究/作品の切り替えは、元実装と同じピル型トグルに戻します。 */}
            <div className="mt-6 w-full">
              <div className="rounded-full bg-[#EBEEF0] p-2 md:rounded-[9999px]">
                <div className="relative grid grid-cols-2 gap-0">
                  <div
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/2 rounded-full border border-[#F9F9F9] bg-white/80 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    style={{
                      transform:
                        activeTab === "works"
                          ? "translateX(100%)"
                          : "translateX(0%)",
                    }}
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    className={`relative z-10 w-full rounded-full px-1 py-3 text-[13px] font-medium transition outline-none focus:outline-none focus-visible:outline-none ${
                      activeTab === "research"
                        ? "text-[#2E3437]"
                        : "text-[#6A7378]"
                    }`}
                    aria-pressed={activeTab === "research"}
                    onClick={() => handleSwitchTab("research")}
                  >
                    研究
                  </button>
                  <button
                    type="button"
                    className={`relative z-10 w-full rounded-full px-1 py-3 text-[13px] font-medium transition outline-none focus:outline-none focus-visible:outline-none ${
                      activeTab === "works"
                        ? "text-[#2E3437]"
                        : "text-[#6A7378]"
                    }`}
                    aria-pressed={activeTab === "works"}
                    onClick={() => handleSwitchTab("works")}
                  >
                    作品
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-6 text-[15px] leading-[2.2] text-[#4B5459] md:text-[16px]">
              {activeContent.description}
            </p>
          </section>

          {/* イベントページと同じ構成で「Coming Soon」カードを配置し、公開前ページの見た目を統一します。 */}
          <section data-reveal className="mt-8 px-4 pb-16 md:px-[128px]">
            <div className="flex h-[240px] items-center justify-center rounded-[24px] border border-[#E6E9EC] bg-[#ECEFF1] px-6 text-center shadow-[0_8px_24px_rgba(46,52,55,0.08)] md:h-[420px]">
              <p className="text-[22px] font-semibold tracking-[0.06em] text-[#6A7378] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[28px]">
                Coming Soon...
              </p>
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </div>
  )
}
