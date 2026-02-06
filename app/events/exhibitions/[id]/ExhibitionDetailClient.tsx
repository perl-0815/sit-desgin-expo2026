"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import Footer from "../../../components/Footer"
import NavigationMenu from "../../../components/NavigationMenu"
import { SkeletonLoader } from "../../../components/SkeletonLoader"

type ExhibitionDetailClientProps = {
  id?: string
}

type Exhibition = {
  id: string
  title?: string | null
  description?: string | null
  author?: string | null
  image_url?: string | null
  image_thumb_url?: string | null
}

type SkeletonBlockProps = {
  className?: string
}

const SkeletonBlock = ({ className = "" }: SkeletonBlockProps) => {
  // ローディング時のプレースホルダーを統一するための簡易スケルトンです。
  return (
    <div className={`relative overflow-hidden bg-[#f0f2f3] ${className}`}>
      <div className="absolute inset-0 skeleton-shimmer bg-linear-to-r from-transparent via-white/30 to-transparent" />
    </div>
  )
}

const PLACEHOLDER_BODY =
  "これはダミー文章です。体験展示の狙いや体験内容をここに記載します。"

const menuItems = [
  { id: "top", label: "TOP", href: "/" },
  { id: "research", label: "研究紹介", href: "/research" },
  { id: "works", label: "作品紹介", href: "/research?tab=works" },
  { id: "career", label: "卒業生の進路", href: "/career" },
  { id: "events", label: "イベント", href: "/events" },
  { id: "contact", label: "お問い合わせ", href: "/contact" },
]

const isAbsoluteUrl = (value?: string | null) => {
  return !!value && /^https?:\/\//i.test(value)
}

const pickOriginalImage = (original?: string | null, thumb?: string | null) => {
  // 詳細ページは元画像を優先し、相対パスしかない場合は絶対URLを選ぶ
  if (isAbsoluteUrl(original)) return original
  if (isAbsoluteUrl(thumb)) return thumb
  return original || thumb || null
}

export default function ExhibitionDetailClient({
  id,
}: ExhibitionDetailClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [exhibition, setExhibition] = useState<Exhibition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const normalizedId = (id ?? "").trim()

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!normalizedId) {
          setExhibition(null)
          return
        }

        const exhibitionRes = await fetch(
          `/api/events/exhibitions/${encodeURIComponent(normalizedId)}`,
        )

        if (!exhibitionRes.ok) {
          if (exhibitionRes.status === 404) {
            setExhibition(null)
            return
          }
          throw new Error("Failed to fetch exhibition detail data.")
        }

        const exhibitionData = (await exhibitionRes.json()) as Exhibition

        if (!active) return

        setExhibition(exhibitionData)
      } catch (fetchError) {
        if (!active) return
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to fetch exhibition detail data."
        setError(message)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [id])

  const exhibitionImage = pickOriginalImage(
    exhibition?.image_url,
    exhibition?.image_thumb_url,
  )

  return (
    // 詳細ページの背景は作品・研究と揃えて白に統一します。
    // フッター下の余白を防ぎ、短い場合も下端に揃えるため最小高さを付与します。
    <div className="mx-auto flex min-h-screen w-full max-w-[393px] flex-col bg-white md:max-w-[1200px] lg:max-w-[1280px]">
      {/* デスクトップは横幅のみ広げ、シングルカラムの構成は維持します。 */}
      {isMenuOpen ? (
        // メニュー展開時も白背景で統一し、トーンがぶれないようにします。
        <div className="fixed inset-0 z-50 flex justify-center bg-white">
          <NavigationMenu
            items={menuItems}
            activeId="events"
            onClose={() => setIsMenuOpen(false)}
          />
        </div>
      ) : null}

      <div className="flex items-center justify-between px-4 pt-6">
        <div className="flex items-center gap-3">
          <span className="h-6 w-2 rounded-[4px] bg-gradient-to-b from-[#FB9678] to-[#E5A967]" />
          <h1 className="text-[24px] font-extrabold tracking-[0.04em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            イベント
          </h1>
        </div>
        {/* メニューボタンはスクロール中も右上に追従させ、コンテンツの右端に揃えます。 */}
        <div className="fixed inset-x-0 top-0 z-40 flex justify-center pointer-events-none">
          <div className="flex w-full max-w-[393px] justify-end px-4 pt-6 pointer-events-auto md:max-w-[1200px] lg:max-w-[1280px]">
            <button
              className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-[0_0_8px_rgba(106,115,120,0.15)]"
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

      {/* 戻るボタンはイベント一覧に戻る導線として表示します。 */}
      <Link
        href="/events"
        className="flex h-20 items-center gap-2 px-4 text-[13px] font-medium text-[#6A7378]"
      >
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M15 6L9 12L15 18"
            stroke="#6A7378"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        戻る
      </Link>

      {error ? (
        <div className="px-4 pb-12">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
            {error}
          </div>
        </div>
      ) : !exhibition && !loading ? (
        <div className="px-4 pb-12">
          <div className="rounded-2xl border border-[#EBEEF0] bg-white p-10 text-center text-sm text-[#6A7378]">
            対象の体験展示が見つかりませんでした。
          </div>
        </div>
      ) : (
        <section className="px-4 pb-12">
          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              {loading ? (
                <>
                  <SkeletonBlock className="h-7 w-4/5 rounded-md" />
                  <div className="flex justify-end">
                    <SkeletonBlock className="h-4 w-24 rounded-md" />
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-[24px] font-extrabold leading-[1.5] tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                    {exhibition?.title ?? "体験展示タイトル"}
                  </h2>
                  <div className="flex justify-end text-[13px] font-medium leading-[1.5] text-[#4B5459]">
                    {exhibition?.author ?? "苗字 名前"}
                  </div>
                </>
              )}
            </div>

            {loading ? (
              <div className="space-y-2">
                <SkeletonBlock className="h-4 w-full rounded-md" />
                <SkeletonBlock className="h-4 w-11/12 rounded-md" />
                <SkeletonBlock className="h-4 w-10/12 rounded-md" />
              </div>
            ) : (
              <p className="text-[15px] leading-[2.2] tracking-[0.04em] text-[#4B5459]">
                {exhibition?.description ?? PLACEHOLDER_BODY}
              </p>
            )}

            <div className="relative h-[204px] w-full overflow-hidden rounded-[4px] bg-[#EBEEF0]">
              {loading ? (
                <SkeletonBlock className="absolute inset-0" />
              ) : exhibitionImage ? (
                <SkeletonLoader
                  src={exhibitionImage}
                  alt=""
                  className="h-full w-full"
                  fallback={
                    <div className="absolute inset-0 grid place-items-center text-[12px] text-[#A3ADB2]">
                      No Image
                    </div>
                  }
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-[12px] text-[#A3ADB2]">
                  No Image
                </div>
              )}
            </div>

            <div className="flex justify-center pt-4">
              <Link
                href="/events"
                className="flex items-center gap-2 rounded-full border border-[#A3ADB2] px-8 py-4 text-[13px] font-medium text-[#4B5459] shadow-[0_0_8px_rgba(106,115,120,0.15)]"
              >
                一覧へ戻る
                <img
                  src="/icon/signal_cellular_alt.svg"
                  alt=""
                  className="h-3 w-3"
                />
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer className="mt-8 w-full px-4" />
    </div>
  )
}
