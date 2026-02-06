"use client"

import { useState } from "react"

import Footer from "../components/Footer"
import NavigationMenu from "../components/NavigationMenu"

const contactEmail = "cy22000@shibaura-it.ac.jp"
// お問い合わせフォームのURLが確定していないため、後から差し替えできるよう定数化します。
const contactFormUrl = "#"

export default function ContactClient() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // 共通メニューは他ページと同じ順序で統一し、導線の迷いを防ぎます。
  const menuItems = [
    { id: "top", label: "TOP", href: "/" },
    { id: "research", label: "研究紹介", href: "/research" },
    { id: "works", label: "作品紹介", href: "/research?tab=works" },
    { id: "career", label: "卒業生の進路", href: "/career" },
    { id: "events", label: "イベント", href: "/events" },
    { id: "contact", label: "お問い合わせ", href: "/contact" },
  ]

  const handleCopyEmail = async () => {
    // クリップボードAPIに対応していない環境もあるため、フォールバックも用意します。
    try {
      if (navigator?.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(contactEmail)
        return
      }
      throw new Error("Clipboard API is not available.")
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = contactEmail
      // iOS Safari などでのコピー失敗を避けるため、フォーカス可能にして画面外へ退避します。
      textarea.setAttribute("readonly", "")
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      textarea.style.left = "-9999px"
      textarea.style.top = "0"
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
    }
  }

  return (
    // フッターが下端に揃うように、ページ全体の最小高さを確保します。
    <div className="mx-auto flex min-h-screen w-full max-w-[393px] flex-col bg-white md:max-w-[1200px] lg:max-w-[1280px]">
      {/* デスクトップは横幅のみ広げ、シングルカラムの構成は維持します。 */}
      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 flex justify-center bg-[#F9F9F9]">
          <NavigationMenu
            items={menuItems}
            activeId="contact"
            onClose={() => setIsMenuOpen(false)}
          />
        </div>
      ) : null}

      {/* 見出し行は左のグラデーションバーと右上メニューでFigma構成を再現します。 */}
      <div className="flex items-center justify-between px-4 pt-6">
        <div className="flex items-center gap-3">
          <span className="h-6 w-2 rounded-[4px] bg-gradient-to-b from-[#FB9678] to-[#E5A967]" />
          <h1 className="text-[24px] font-extrabold tracking-[0.04em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            お問い合せ
          </h1>
        </div>
        {/* メニューボタンはスクロール中も右上に追従させ、コンテンツの右端に揃えます。 */}
        <div className="fixed inset-x-0 top-0 z-40 flex justify-center pointer-events-none">
          <div className="flex w-full max-w-[393px] justify-end px-4 pt-6 pointer-events-auto md:max-w-[1200px] lg:max-w-[1280px]">
            <button
              className="grid h-12 w-12 place-items-center rounded-full bg-[#F9F9F9] shadow-[0_0_8px_rgba(106,115,120,0.15)]"
              type="button"
              aria-label="メニュー"
              onClick={() => setIsMenuOpen(true)}
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
        </div>
      </div>

      {/* リード文はFigma通りに左寄せし、行間を広めに設定します。 */}
      <div className="px-4 pt-6">
        <p className="text-[15px] leading-[2.2] tracking-[0.04em] text-[#4B5459]">
          卒展に関するご質問などがありましたら、こちらからご連絡をお願いします。
        </p>
      </div>

      {/* メールお問い合わせブロック */}
      <section className="px-4 py-12">
        {/* 見出し下のラインカラーはFigma指定のソーシャルカラーに合わせます。 */}
        <div className="border-b border-[#14BDB1] pb-1">
          <h2 className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            メールでのお問い合せ
          </h2>
        </div>
        <p className="mt-2 text-[12px] leading-[1.6] tracking-[0.02em] text-[#4B5459]">
          以下のメールアドレスまで直接ご連絡ください。
        </p>
        <div className="mt-3">
          <button
            type="button"
            onClick={handleCopyEmail}
            className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#EBEEF0] px-3 py-2"
            aria-label={`${contactEmail} をコピー`}
          >
            <span className="text-center text-[15px] leading-[2.2] tracking-[0.04em] text-[#4B5459]">
              {contactEmail}
            </span>
            <svg
              aria-hidden="true"
              className="h-4 w-4 text-[#6A7378]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M16 4H8C6.89543 4 6 4.89543 6 6V16M8 8H16C17.1046 8 18 8.89543 18 10V18C18 19.1046 17.1046 20 16 20H8C6.89543 20 6 19.1046 6 18V10C6 8.89543 6.89543 8 8 8Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </section>

      {/* その他方法のお問い合わせブロック */}
      <section className="px-4 py-12">
        <div className="border-b border-[#14BDB1] pb-1">
          <h2 className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            その他方法のお問い合せ
          </h2>
        </div>
        <p className="mt-2 text-[12px] leading-[1.6] tracking-[0.02em] text-[#4B5459]">
          メール以外でのお問い合わせはこちらから行うことができます。
          <br />
          （Google Formsに遷移します。）
        </p>
        <div className="mt-3 flex justify-center">
          <a
            href={contactFormUrl}
            className="inline-flex items-center gap-2 rounded-full border border-[#FB9678] bg-[#F9F9F9] px-8 py-4 text-[13px] font-medium text-[#4B5459] shadow-[0_0_8px_rgba(106,115,120,0.15)]"
          >
            お問い合せフォーム
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M14 5H19V10"
                stroke="#4B5459"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 14L19 5"
                stroke="#4B5459"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 7V19H17"
                stroke="#4B5459"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}
