"use client"

import Link from "next/link"
import { useState } from "react"

import NavigationMenu from "./NavigationMenu"

type GlobalHeaderProps = {
  activeId?: string
  className?: string
}

type NavigationItem = {
  id: string
  label: string
  href: string
}

// 共通メニューは全ページで同じ順序・文言に統一します。
const globalMenuItems: NavigationItem[] = [
  { id: "top", label: "TOP", href: "/" },
  { id: "research", label: "研究紹介", href: "/research" },
  { id: "works", label: "作品紹介", href: "/research?tab=works" },
  { id: "events", label: "イベント", href: "/events" },
  { id: "career", label: "卒業生の進路", href: "/career" },
  { id: "contact", label: "お問い合せ", href: "/contact" },
]

// ヘッダーのロゴは共通の画像に差し替えやすいよう定数化します。
const headerLogoUrl = "/icon/header_icon.png"

export default function GlobalHeader({
  activeId,
  className,
}: GlobalHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const contactItem = globalMenuItems.find((item) => item.id === "contact")
  // デスクトップ版は左のロゴがTOP導線のため、TOPを除外して表示します。
  const desktopMenuItems = globalMenuItems.filter(
    (item) => item.id !== "contact" && item.id !== "top"
  )

  return (
    <>
      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 flex justify-center bg-[#F9F9F9]">
          <NavigationMenu
            items={globalMenuItems}
            activeId={activeId}
            onClose={() => setIsMenuOpen(false)}
          />
        </div>
      ) : null}

      {/* Figmaのヘッダーは画面上部に固定し、背景の透過と影を再現します。 */}
      <div
        className={`fixed inset-x-0 top-0 z-40 flex justify-center pointer-events-none ${
          className ?? ""
        }`.trim()}
      >
        {/* モバイルは画面幅いっぱいに広げるため、最大幅の制限はmd以上に限定します。 */}
        <div className="w-full px-4 pt-2 pointer-events-auto md:max-w-[1280px] md:px-[128px] md:pt-[24px]">
          <div className="flex items-center justify-between rounded-[12px] border border-[#F9F9F9] bg-white/80 px-3 py-1.5 shadow-[0_0_8px_rgba(106,115,120,0.15)] backdrop-blur-[4px] md:px-5 md:py-3">
            <Link
              href="/"
              className="flex h-[48px] items-center md:h-[56px]"
              aria-label="トップページへ"
            >
              <img
                src={headerLogoUrl}
                alt="SIT DESIGN EXPO 2026"
                className="h-full w-auto object-contain"
              />
            </Link>
            {/* デスクトップ版はFigma通りの横並びメニューを表示し、ハンバーガーはモバイルのみ残します。 */}
            <div className="hidden items-center gap-6 md:flex">
              <nav className="flex items-center">
                {desktopMenuItems.map((item, index) => {
                  const isActive = item.id === activeId
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 text-[16px] font-medium leading-[1.5] ${
                        index !== desktopMenuItems.length - 1
                          ? "border-r border-[#EBEEF0] pr-6"
                          : ""
                      } ${isActive ? "text-[#2E3437]" : "text-[#6A7378]"}`}
                    >
                      {/* アクティブ時のみ丸印を表示し、非アクティブ時は非表示にします。 */}
                      {isActive ? (
                        <span
                          className="h-2.5 w-2.5 rounded-full bg-[#FB9678]"
                          aria-hidden="true"
                        />
                      ) : null}
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
              {/* お問い合わせは独立した丸みのあるボタンとして強調します。 */}
              {contactItem ? (
                <Link
                  href={contactItem.href}
                  className="rounded-full bg-[#4B5459] px-6 py-2 text-[16px] font-medium leading-[1.5] text-[#F9F9F9]"
                >
                  {contactItem.label}
                </Link>
              ) : null}
            </div>
            {/* 既存のハンバーガーメニューはモバイル専用として維持します。 */}
            <button
              className="grid h-10 w-10 place-items-center rounded-full md:hidden"
              type="button"
              aria-label="メニュー"
              onClick={() => setIsMenuOpen(true)}
            >
              <svg
                aria-hidden="true"
                className="h-6 w-6"
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
    </>
  )
}
