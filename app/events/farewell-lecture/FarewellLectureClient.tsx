"use client"

import { useRouter } from "next/navigation"

import Footer from "../../components/Footer"
import GlobalHeader from "../../components/GlobalHeader"
import useSectionReveal from "../../components/useSectionReveal"

// Figma指定の詳細ページで使っている外部導線を定数化し、文言修正時の変更点を局所化します。
const detailPageUrl =
  "https://www.shibaura-it.ac.jp/headline/detail_event/20260114-7070-001.html"

// 懇親会ページの申し込み導線は、最新のGoogleフォームURLへ統一します。
const formUrl = "https://forms.gle/Eq3TJZzU2asjfCwT9"

export default function FarewellLectureClient() {
  const router = useRouter()

  // イベント一覧ページと同じ表示アニメーションを適用して遷移後の体験を揃えます。
  useSectionReveal()

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* 既存ページと同じ中央寄せの幅制御を使い、ヘッダー/フッターとの整合性を維持します。 */}
      <div className="relative mx-auto flex min-h-screen w-full flex-col bg-[#F9F9F9] md:max-w-[1280px]">
        <GlobalHeader activeId="events" />

        {/* 固定ヘッダー分の余白を確保し、本文の先頭が隠れないようにします。 */}
        <div className="pt-[84px] md:pt-[96px]">
          {/* FigmaのBack導線に合わせ、戻る操作が使えない場合はイベント一覧へフォールバックします。 */}
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  router.back()
                  return
                }
                router.push("/events")
              }}
              className="inline-flex h-[80px] items-center gap-1.5 px-4 text-[13px] font-medium leading-none text-[#6A7378] md:px-[128px] md:text-[15px]"
            >
              <span aria-hidden="true" className="inline-flex h-5 w-5 items-center justify-center translate-y-[1px] md:h-6 md:w-6">
                <BackChevronIcon />
              </span>
              <span className="leading-none">戻る</span>
            </button>

          <section data-reveal className="px-4 pb-8 md:px-[128px] md:pb-9 md:pt-9">
            <h1 className="text-[20px] font-extrabold leading-[1.5] tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px]">
              退職される先生の最終講義と懇親会
            </h1>

            <div className="mt-3 space-y-2 text-[13px] leading-[1.9] tracking-[0.02em] text-[#4B5459] md:mt-5 md:text-[16px]">
              <p className="flex items-center gap-2">
                <span className="shrink-0 text-[#E5A967]" aria-hidden="true">
                  <CalendarIcon />
                </span>
                <span>3/14(土) 14:00~</span>
              </p>
              <p className="flex items-center gap-2">
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

            <p className="mt-4 text-[15px] leading-[2.2] tracking-[0.04em] text-[#4B5459] md:mt-5 md:text-[18px]">
              2025年度をもって芝浦工業大学を退職される、島田明先生・吉武良治先生の最終講義および懇親会を実施します。
            </p>
          </section>

          <section data-reveal className="px-4 pb-12 md:px-[128px] md:pb-24 md:pt-9">
            <div className="w-full">
              {/* 下線をセクション横幅いっぱいに伸ばし、色も他ページで使う#FB9678へ統一します。 */}
              <h2 className="w-full border-b-2 border-[#FB9678] pb-2 text-[20px] font-extrabold leading-[1.5] tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px]">
                参加予約・スケジュール
              </h2>

              <div className="mt-3 space-y-6 text-[15px] leading-[2.2] tracking-[0.04em] text-[#4B5459] md:mt-4 md:space-y-7 md:text-[18px]">
                <div className="space-y-0.5">
                  <p>14:00〜 開会</p>
                  <p>14:05〜 島田明先生 最終講義(オンライン配信あり)</p>
                  <p>15:05〜 吉武良治先生 最終講義</p>
                  <p>16:00〜 閉会</p>
                  <p>16:30〜 懇親会（会費制）</p>
                  <p>
                    ※詳細は
                    <a
                      href={detailPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#D3793D] underline"
                    >
                      こちら
                    </a>
                    からご確認をお願いします。
                  </p>
                </div>

                <div className="space-y-0.5">
                  <p>参加を希望される場合は以下の申し込みフォームから必要事項を記入してください。</p>
                  <p>※申込期日：2026年2月25日(水)</p>
                  <p>※いずれかの先生の最終講義のみの参加、懇親会のみの参加、途中入退室も可能です。</p>
                </div>
              </div>

              <div className="flex justify-center pt-6 md:pt-10">
                {/* ボタンはFigmaの丸型アウトラインを再現しつつ、外部リンクであることをアイコンで明示します。 */}
                <a
                  href={formUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#FB9678] bg-[#F9F9F9] px-8 py-4 text-[13px] font-medium text-[#4B5459] shadow-[0_0_8px_rgba(106,115,120,0.15)] md:px-14 md:py-6 md:text-[15px]"
                >
                  申し込みフォーム
                  <ExternalLinkIcon />
                </a>
              </div>
            </div>
          </section>
        </div>

        <Footer className="md:px-[128px]" />
      </div>
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" role="img">
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 9H20" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3.5V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 3.5V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" role="img">
      <path
        d="M12 21C12 21 18.5 14.9 18.5 10.2C18.5 6.52 15.59 4 12 4C8.41 4 5.5 6.52 5.5 10.2C5.5 14.9 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="10.2" r="2.4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" role="img">
      <path
        d="M9.3 2.7H13.3V6.7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.1 2.9L7.6 8.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="2.7" y="4.7" width="8.6" height="8.6" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function BackChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" role="img">
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
