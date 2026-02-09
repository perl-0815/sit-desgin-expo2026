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
        <div className="w-full max-w-[393px] px-4 pt-3 pointer-events-auto md:max-w-[1280px] md:px-[128px] md:pt-[24px]">
          <div className="flex items-center justify-between rounded-[12px] border border-[#F9F9F9] bg-white/80 px-3 py-2 shadow-[0_0_8px_rgba(106,115,120,0.15)] backdrop-blur-[4px]">
            <Link
              href="/"
              className="flex h-[56px] items-center"
              aria-label="トップページへ"
            >
              <img
                src={headerLogoUrl}
                alt="SIT DESIGN EXPO 2026"
                className="h-full w-auto object-contain"
              />
            </Link>
            {/* 既存のハンバーガーメニューを流用し、見た目と操作感を揃えます。 */}
            <button
              className="grid h-12 w-12 place-items-center rounded-full"
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
    </>
  )
}
