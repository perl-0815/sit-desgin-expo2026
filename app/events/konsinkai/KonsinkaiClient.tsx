"use client"

import { useRouter } from "next/navigation"

import Footer from "../../components/Footer"
import GlobalHeader from "../../components/GlobalHeader"
import useSectionReveal from "../../components/useSectionReveal"

const formUrl = "https://forms.gle/Eq3TJZzU2asjfCwT9"
const detailUrl = "https://www.shibaura-it.ac.jp/headline/detail_event/20260114-7070-001.html"

export default function KonsinkaiClient() {
  const router = useRouter()
  useSectionReveal()

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <GlobalHeader activeId="events" />

      <main className="pb-12 pt-[92px] md:pb-[48px] md:pt-[124px]">
        <div className="mx-auto w-full px-4 md:max-w-[1280px] md:px-[128px]">
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
            <img
              src="/icon/chevron-left.svg"
              alt=""
              aria-hidden="true"
              className="h-4 w-4"
            />
            <span>戻る</span>
          </button>
        </div>

        <section data-reveal className="mx-auto w-full px-4 pb-8 md:max-w-[1280px] md:px-[128px] md:pb-14">
          <h1 className="text-[20px] font-extrabold leading-normal tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px]">
            退職される先生の最終講義と懇親会
          </h1>

          <div className="mt-3 flex items-center gap-2 md:mt-4">
            <img
              src="/icon/locaticon.svg"
              alt=""
              aria-hidden="true"
              className="h-6 w-auto shrink-0 md:h-7"
            />
            <div className="flex flex-col gap-1 text-[15px] leading-normal text-[#4B5459] md:text-[18px]">
              <span>最終講義: 交流棟6階大講義室</span>
              <span>懇親会: 本部棟6階</span>
            </div>
          </div>

          <p className="mt-4 text-[15px] leading-loose tracking-[0.04em] text-[#4B5459] md:mt-5 md:text-[18px]">
            2025年度をもって芝浦工業大学を退職される、島田明先生・吉武良治先生の最終講義および懇親会を実施します。
          </p>
        </section>

        <section data-reveal className="mx-auto w-full px-4 pb-8 md:max-w-[1280px] md:px-[128px] md:pb-[48px]">
          <div className="border-b border-[#D3793D] pb-2 md:pb-2">
            <h2 className="text-[20px] font-extrabold leading-normal tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px]">
              参加予約・スケジュール
            </h2>
          </div>

          <ul className="mt-4 space-y-2 text-[15px] leading-loose tracking-[0.04em] text-[#4B5459] md:mt-6 md:text-[18px]">
            <li>14:00～ 開会</li>
            <li>14:05～ 島田明先生 最終講義（オンライン配信あり）</li>
            <li>15:05～ 吉武良治先生 最終講義</li>
            <li>16:00～ 閉会</li>
            <li>16:30～ 懇親会（会費制）</li>
          </ul>

          <p className="mt-4 text-[15px] leading-loose tracking-[0.04em] text-[#4B5459] md:mt-6 md:text-[18px]">
            ※詳細は
            <a
              href={detailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D3793D] underline"
            >
              こちら
            </a>
            からご確認をお願いします。
          </p>

          <p className="mt-6 text-[15px] leading-loose tracking-[0.04em] text-[#4B5459] md:mt-8 md:text-[18px]">
            参加を希望される場合は以下の申し込みフォームから必要事項を記入してください。（Google Formsに遷移します。）
          </p>

          <p className="mt-2 text-[13px] leading-normal text-[#6A7378] md:text-[15px]">
            ※申込期日：2026年2月25日(水)
          </p>

          <p className="mt-2 text-[13px] leading-normal text-[#6A7378] md:text-[15px]">
            ※いずれかの先生の最終講義のみの参加、懇親会のみの参加、途中入退室も可能です。
          </p>

          <div className="mt-6 flex justify-center md:mt-8">
            <a
              href={formUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full border border-[#FB9678] bg-[#F9F9F9] px-8 py-4 text-[13px] font-medium text-[#4B5459] shadow-[0_0_8px_rgba(106,115,120,0.1)] transition-[background-color,color,border-color] duration-300 ease-in-out hover:bg-[#D3793D] hover:text-[#F9F9F9] md:px-[56px] md:py-[20px]"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-white/80"
              />
              <span className="relative z-10">申し込みフォーム</span>
              <img
                src="/icon/link.svg"
                alt=""
                aria-hidden="true"
                className="relative z-10 h-4 w-4 transition-[filter] duration-300 ease-in-out group-hover:brightness-0 group-hover:invert"
              />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
