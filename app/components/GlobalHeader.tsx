"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import NavigationMenu from "./NavigationMenu";

type GlobalHeaderProps = {
  activeId?: string;
  className?: string;
  hidden?: boolean;
};

type NavigationItem = {
  id: string;
  label: string;
  href: string;
};

// 共通メニューは全ページで同じ順序・文言に統一します。
const globalMenuItems: NavigationItem[] = [
  // Figmaの文言に合わせ、先頭メニューは「ホーム」表記を採用します。
  { id: "top", label: "ホーム", href: "/" },
  { id: "research", label: "研究紹介", href: "/research" },
  { id: "works", label: "作品紹介", href: "/research?tab=works" },
  { id: "events", label: "イベント", href: "/events" },
  { id: "career", label: "卒業生の進路", href: "/career" },
  { id: "contact", label: "お問い合せ", href: "/contact" },
];

// ヘッダーのロゴは共通の画像に差し替えやすいよう定数化します。
const headerLogoUrl = "/icon/header_icon.png"
const MOBILE_MENU_ANIMATION_MS = 300

export default function GlobalHeader({
  activeId,
  className,
  hidden = false,
}: GlobalHeaderProps) {
  // モバイルメニューの開閉アニメーションを正確に制御するため、
  // 表示有無だけでなく opening/open/closing/closed の4状態で管理します。
  const [mobileMenuPhase, setMobileMenuPhase] = useState<
    "closed" | "opening" | "open" | "closing"
  >("closed")

  const isMobileMenuMounted = mobileMenuPhase !== "closed"
  // 開始フレームでは閉じた見た目を保持し、次フレームでopenへ遷移させて確実にトランジションを発火させます。
  const isMobileMenuVisible = mobileMenuPhase === "open"

  const openMobileMenu = () => {
    if (mobileMenuPhase === "closed") {
      setMobileMenuPhase("opening")
    }
  }

  const closeMobileMenu = () => {
    if (mobileMenuPhase === "opening" || mobileMenuPhase === "open") {
      setMobileMenuPhase("closing")
    }
  }

  useEffect(() => {
    if (mobileMenuPhase !== "opening") return
    const frameId = window.requestAnimationFrame(() => {
      setMobileMenuPhase("open")
    })
    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [mobileMenuPhase])

  useEffect(() => {
    if (mobileMenuPhase !== "closing") return
    const timeoutId = window.setTimeout(() => {
      setMobileMenuPhase("closed")
    }, MOBILE_MENU_ANIMATION_MS)
    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [mobileMenuPhase])

  const contactItem = globalMenuItems.find((item) => item.id === "contact")
  // デスクトップ版はFigma指定に合わせ、ホームを含むナビを表示します（お問い合せは右側ボタンで別表示）。
  const desktopMenuItems = globalMenuItems.filter(
    (item) => item.id !== "contact"
  )

  return (
    <>
      {isMobileMenuMounted ? (
        <div
          className={`fixed inset-0 z-50 bg-[#2E3437]/10 px-4 pt-2 transition-opacity duration-300 ease-in-out lg:hidden ${
            isMobileMenuVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={closeMobileMenu}
          aria-hidden="true"
        >
          <NavigationMenu
            items={globalMenuItems}
            activeId={activeId}
            isVisible={isMobileMenuVisible}
            onClose={closeMobileMenu}
          />
        </div>
      ) : null}

      {/* Figmaのヘッダーは画面上部に固定し、背景の透過と影を再現します。 */}
      <div
        className={`fixed inset-x-0 top-0 z-40 flex justify-center pointer-events-none transition-opacity duration-500 ${
          hidden ? "opacity-0" : "opacity-100"
        } ${className ?? ""}`.trim()}
      >
        <div className={`w-full px-4 pt-2 lg:max-w-[1280px] lg:px-4 lg:pt-[24px] ${hidden ? "pointer-events-none" : "pointer-events-auto"}`}>
          <div className="flex items-center justify-between rounded-[12px] border border-[#F9F9F9] bg-white/80 px-3 py-1.5 shadow-[0_0_8px_rgba(106,115,120,0.1)] backdrop-blur-[4px] lg:px-5 lg:py-3">
            <Link
              href="/"
              className="flex h-[48px] items-center lg:h-[56px]"
              aria-label="トップページへ"
            >
              <img
                src={headerLogoUrl}
                alt="SIT DESIGN EXPO 2026"
                className="h-full w-auto object-contain"
              />
            </Link>
            {/* デスクトップ版はFigma通りの横並びメニューを表示し、ハンバーガーはモバイルのみ残します。 */}
            <div className="hidden items-center gap-6 lg:flex">
              <nav className="flex items-center">
                {desktopMenuItems.map((item, index) => {
                  const isActive = item.id === activeId;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`group flex items-center gap-2 px-3 py-2 text-[16px] font-medium leading-[1.5] transition-colors duration-300 ease-in-out ${
                        index !== desktopMenuItems.length - 1
                          ? "border-r border-[#EBEEF0] pr-6"
                          : ""
                      }`}
                    >
                      {/* 
                        Figma準拠で active / inactive / mouseover を再現するため、
                        ドットは visibility ではなく opacity で制御し、300msイージングで滑らかに遷移させます。
                        (inactive: 非表示, mouseover: 表示, active: 常時表示)
                      */}
                      <span
                        className={`h-2.5 w-2.5 rounded-full transition-opacity duration-300 ease-in-out ${
                          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`}
                        style={{
                          // 指定SVGの円と同じ見た目になるよう、左上→右下の線形グラデーションを直接指定します。
                          background:
                            "linear-gradient(135deg, #FB9678 0%, #E5A967 100%)",
                        }}
                        aria-hidden="true"
                      />
                      <span
                        className={`transition-colors duration-300 ease-in-out ${
                          isActive ? "text-[#D3793D]" : "text-[#6A7378]"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
              {/* 
                お問い合せは独立した丸みのあるボタンとして強調し、高さは48pxに固定します。
                視覚的に中央寄せになるよう、文字位置をわずかに上げています。
              */}
              {contactItem ? (
                <Link
                  href={contactItem.href}
                  // 変更理由: Figma(1309:4849)準拠で、モノクロPrimaryボタンは
                  // ホバー時に白グラデーションをplus-lighterで重ね、300msでグレー化して見せます。
                  className="flex h-12 items-center justify-center rounded-full bg-[#4B5459] px-6 text-[16px] font-medium leading-none text-[#F9F9F9] transition-[background,box-shadow] duration-300 ease-in-out hover:[background:linear-gradient(108.58deg,rgba(255,255,255,0.20)_0.58%,rgba(255,255,255,0.15)_47.57%,rgba(255,255,255,0.10)_94.56%),#4B5459] hover:[background-blend-mode:plus-lighter]"
                >
                  <span className="relative top-[-1px]">
                    {contactItem.label}
                  </span>
                </Link>
              ) : null}
            </div>
            {/* 既存のハンバーガーメニューはモバイル専用として維持します。 */}
            <button
              className="grid h-12 w-12 place-items-center rounded-[24px] p-2 lg:hidden"
              type="button"
              aria-label="メニュー"
              onClick={openMobileMenu}
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
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
