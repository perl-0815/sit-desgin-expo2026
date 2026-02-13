"use client"

import Footer from "../components/Footer"
import GlobalHeader from "../components/GlobalHeader"
import useSectionReveal from "../components/useSectionReveal"

// 卒業生の進路ページは先行公開版として、イベントページと同様の準備中レイアウトに統一します。
export default function CareerClient() {
  // 各セクションのスクロール時アニメーションは他ページと同じフックを利用します。
  useSectionReveal()

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* 研究・作品紹介/イベントページと同じ中央寄せの固定幅レイアウトに合わせます。 */}
      <div className="relative mx-auto flex min-h-screen w-full flex-col bg-[#F9F9F9] md:max-w-[1280px]">
        <GlobalHeader activeId="career" />

        {/* 固定ヘッダーと本文が重ならないよう、先頭に上余白を入れます。 */}
        <div className="pt-[84px] md:pt-[96px]">
          <section data-reveal className="px-4 pt-6 md:px-[128px] md:pt-[36px]">
            <div className="flex items-center gap-3">
              <span className="h-[32px] w-2 rounded-[4px] bg-gradient-to-b from-[#FB9678] to-[#E5A967]" />
              <h1 className="text-[24px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                卒業生の進路
              </h1>
            </div>
            <p className="mt-6 text-[15px] leading-[2.2] text-[#4B5459] md:text-[16px]">
              このページは準備中です。
            </p>
          </section>

          {/* イベントページと揃えた Coming Soon カードで公開前状態を明確にします。 */}
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
