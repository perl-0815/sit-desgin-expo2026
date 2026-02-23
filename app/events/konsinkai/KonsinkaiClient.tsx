"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import Footer from "../../components/Footer"
import GlobalHeader from "../../components/GlobalHeader"
import useSectionReveal from "../../components/useSectionReveal"

const formUrl = "https://forms.gle/Eq3TJZzU2asjfCwT9"
const contactEmail = "satogaeri@ow.shibaura-it.ac.jp"

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
            <BackChevronIcon />
            <span>戻る</span>
          </button>
        </div>

        <section data-reveal className="mx-auto w-full px-4 pb-8 md:max-w-[1280px] md:px-[128px] md:pb-14">
          <div className="space-y-3 md:space-y-5">
            <img
              src="/image/event-image.png"
              alt="退職される先生の最終講義と懇親会"
              className="aspect-[1920/1080] w-full rounded-[8px] object-cover md:rounded-[12px]"
            />

            <h1 className="text-[20px] font-extrabold leading-[1.5] tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px]">
              退職される先生の最終講義と懇親会
            </h1>

            <div className="space-y-2 text-[15px] leading-[2] tracking-[0.04em] text-[#4B5459] md:text-[18px]">
              <p>
                2025年度をもって芝浦工業大学を退職される、島田明先生・吉武良治先生の最終講義および懇親会を実施します。
              </p>
            </div>
          </div>
        </section>

        <section data-reveal className="mx-auto w-full px-4 pb-8 md:max-w-[1280px] md:px-[128px] md:pb-14">
          <div className="flex items-center gap-6">
            <span className="h-px flex-1 bg-[#EBEEF0]" />
            <h2 className="text-center text-[20px] font-extrabold leading-[1.5] tracking-[0.02em] text-[#4B5459] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px]">
              最終講義
            </h2>
            <span className="h-px flex-1 bg-[#EBEEF0]" />
          </div>

          <article className="mt-4 rounded-[12px] border border-[#EBEEF0] bg-white/80 p-4 md:mt-6 md:rounded-[20px] md:p-6">
            <dl className="grid grid-cols-1 gap-3 md:grid-cols-[auto_1fr] md:gap-x-8 md:gap-y-4">
              <dt className="text-[13px] font-medium text-[#6A7378] md:text-[15px]">日時</dt>
              <dd className="text-[15px] leading-[1.8] text-[#2E3437] md:text-[18px]">2026年3月14日(土) 14:00〜</dd>

              <dt className="text-[13px] font-medium text-[#6A7378] md:text-[15px]">場所</dt>
              <dd className="text-[15px] leading-[1.8] text-[#2E3437] md:text-[18px]">
                芝浦工業大学 豊洲キャンパス 交流棟6階大講義室
              </dd>

              <dt className="text-[13px] font-medium text-[#6A7378] md:text-[15px]">当日の流れ（予定）</dt>
              <dd className="space-y-2 text-[15px] leading-[1.8] text-[#2E3437] md:text-[18px]">
                <p>14:00〜 開会</p>
                <p>14:05〜 島田明先生 最終講義「制御工学・ロボティクスを介して歩んできた不器用な歩みと地道な努力が拓く未来」（オンライン配信あり）</p>
                <p>15:05〜 吉武良治先生 最終講義「人間工学・人間中心デザインとともに」</p>
                <p>16:00〜 閉会</p>
                <p>16:30〜 懇親会（会費制）</p>
              </dd>
            </dl>
          </article>
        </section>

        <section data-reveal className="mx-auto w-full px-4 pb-8 md:max-w-[1280px] md:px-[128px] md:pb-14">
          <div className="flex items-center gap-6">
            <span className="h-px flex-1 bg-[#EBEEF0]" />
            <h2 className="text-center text-[20px] font-extrabold leading-[1.5] tracking-[0.02em] text-[#4B5459] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px]">
              懇親会
            </h2>
            <span className="h-px flex-1 bg-[#EBEEF0]" />
          </div>

          <article className="mt-4 rounded-[12px] border border-[#EBEEF0] bg-white/80 p-4 md:mt-6 md:rounded-[20px] md:p-6">
            <dl className="grid grid-cols-1 gap-3 md:grid-cols-[auto_1fr] md:gap-x-8 md:gap-y-4">
              <dt className="text-[13px] font-medium text-[#6A7378] md:text-[15px]">日時</dt>
              <dd className="text-[15px] leading-[1.8] text-[#2E3437] md:text-[18px]">2026年3月14日(土) 16:30〜</dd>

              <dt className="text-[13px] font-medium text-[#6A7378] md:text-[15px]">場所</dt>
              <dd className="text-[15px] leading-[1.8] text-[#2E3437] md:text-[18px]">
                芝浦工業大学 豊洲キャンパス 本部棟6階デザイン工学部オープンラボ
              </dd>

              <dt className="text-[13px] font-medium text-[#6A7378] md:text-[15px]">会費</dt>
              <dd className="text-[15px] leading-[1.8] text-[#2E3437] md:text-[18px]">検討中</dd>
            </dl>
          </article>
        </section>

        <section data-reveal className="mx-auto w-full px-4 pb-8 md:max-w-[1280px] md:px-[128px] md:pb-[48px]">
          <div className="mt-6 border-b border-[#D3793D] pb-2 md:mt-8">
            <h2 className="text-[20px] font-extrabold leading-[1.5] tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px]">
              申し込み
            </h2>
          </div>

          <p className="mt-4 text-[15px] leading-[2] tracking-[0.04em] text-[#4B5459] md:mt-6 md:text-[18px]">
            下記の申し込みフォームから必要事項を入力してください。いずれかの先生の最終講義のみの参加、懇親会のみの参加、途中入退室も可能です。
          </p>

          <p className="mt-2 text-[13px] leading-[1.9] text-[#6A7378] md:text-[15px]">
            申込期日：2026年2月25日(水)
          </p>

          <a
            href={formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex h-[48px] w-full max-w-[400px] items-center justify-center gap-2 rounded-[8px] bg-[#D3793D] px-8 text-[13px] font-medium leading-[1.5] text-[#F9F9F9] shadow-[0_0_8px_rgba(106,115,120,0.1)] transition-[background,box-shadow] duration-300 ease-out hover:[background:linear-gradient(98deg,rgba(255,255,255,0.20)_0.58%,rgba(255,255,255,0.15)_47.57%,rgba(255,255,255,0.10)_94.56%),#D3793D] hover:[background-blend-mode:plus-lighter] md:mt-8 md:h-[56px] md:rounded-[12px] md:text-[15px]"
          >
            <span>申し込みフォームへ</span>
            <ExternalLinkIcon />
          </a>

          <article className="mt-8 rounded-[12px] border border-[#EBEEF0] bg-white/80 p-4 md:rounded-[20px] md:p-5">
            <div className="flex items-center gap-2">
              <InfoIcon />
              <p className="text-[13px] font-medium leading-[1.5] text-[#2E3437] md:text-[15px]">お問い合わせ</p>
            </div>
            <p className="mt-2 text-[13px] leading-[1.9] text-[#6A7378] md:text-[16px]">
              芝浦工業大学 デザイン工学部
              <br />
              〒135-8548 東京都江東区豊洲3-7-5
              <br />
              <Link
                href={`mailto:${contactEmail}`}
                className="text-[#D3793D] underline"
              >
                {contactEmail}
              </Link>
            </p>
          </article>
        </section>
      </main>

      <Footer />
    </div>
  )
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

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
