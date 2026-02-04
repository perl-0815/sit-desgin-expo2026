"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"

import Footer from "../../components/Footer"
import NavigationMenu from "../../components/NavigationMenu"

type WorksDetailClientProps = {
  id: string
}

type Lab = {
  id: string
  name?: string | null
  official_name?: string | null
}

type Student = {
  id: string
  name?: string | null
  lab_id?: string | null
}

type Portfolio = {
  id: string
  student_id: string
  title1?: string | null
  summary1?: string | null
  image1_url?: string | null
  image1_thumb_url?: string | null
  appeal_url_1?: string | null
  title2?: string | null
  summary2?: string | null
  image2_url?: string | null
  image2_thumb_url?: string | null
  appeal_url_2?: string | null
  overall_portfolio_url?: string | null
  student?: Student | null
}

type Career = {
  id: string
  student_id: string
  category?: string | null
  category_type?: string | null
  job_type?: string | null
  detail?: string | null
}

const PLACEHOLDER_BODY =
  "これはダミー文章です。作品の狙いや体験価値、制作プロセスなどをここに記載します。"

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

const parseWorkId = (value?: string | null) => {
  // 余計な空白を除去してから解析する（未定義にも耐える）
  const normalized = (value ?? "").trim()
  const match = normalized.match(/^(.*)-(1|2)$/)
  if (!match) {
    return { portfolioId: normalized, index: 1 as const }
  }
  return {
    portfolioId: match[1].trim(),
    index: match[2] === "2" ? (2 as const) : (1 as const),
  }
}

export default function WorksDetailClient({ id }: WorksDetailClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [labs, setLabs] = useState<Lab[]>([])
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [careers, setCareers] = useState<Career[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const [labsRes, portfoliosRes, careersRes] = await Promise.all([
          fetch("/api/labs"),
          fetch("/api/portfolios?include=student"),
          fetch("/api/careers?include=student"),
        ])

        if (!labsRes.ok || !portfoliosRes.ok || !careersRes.ok) {
          throw new Error("Failed to fetch detail data.")
        }

        const [labsData, portfoliosData, careersData] = await Promise.all([
          labsRes.json(),
          portfoliosRes.json(),
          careersRes.json(),
        ])

        if (!active) return

        setLabs(labsData)
        setPortfolios(portfoliosData)
        setCareers(careersData)
      } catch (fetchError) {
        if (!active) return
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to fetch detail data."
        setError(message)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  const labById = useMemo(() => {
    return new Map(labs.map((lab) => [lab.id, lab]))
  }, [labs])

  const { portfolioId, index } = useMemo(() => parseWorkId(id), [id])

  const portfolio = useMemo(() => {
    // CSV由来のIDに空白が混入している場合でも一致するように正規化する
    const normalizedId = portfolioId.trim()
    return (
      portfolios.find((item) => (item.id ?? "").trim() === normalizedId) ??
      null
    )
  }, [portfolios, portfolioId])

  const student = portfolio?.student
  const lab = student?.lab_id ? labById.get(student.lab_id) : undefined

  const workTitle = index === 2 ? portfolio?.title2 : portfolio?.title1
  const workSummary = index === 2 ? portfolio?.summary2 : portfolio?.summary1
  const workImage = index === 2
    ? pickOriginalImage(portfolio?.image2_url, portfolio?.image2_thumb_url)
    : pickOriginalImage(portfolio?.image1_url, portfolio?.image1_thumb_url)
  const workLink =
    index === 2 ? portfolio?.appeal_url_2 : portfolio?.appeal_url_1

  const career = useMemo(() => {
    if (!student?.id) return null
    return careers.find((item) => item.student_id === student.id) ?? null
  }, [careers, student?.id])

  return (
    <div className="mx-auto flex w-full max-w-[393px] flex-col bg-[#F9F9F9] pb-16">
      {/* 右上メニューは画面全体に重ねて表示します。 */}
      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 flex justify-center bg-[#F9F9F9]">
          <NavigationMenu
            items={menuItems}
            activeId="works"
            onClose={() => setIsMenuOpen(false)}
          />
        </div>
      ) : null}

      <div className="flex items-center justify-between px-4 pt-6">
        <div className="flex items-center gap-3">
          <span className="h-6 w-2 rounded-[4px] bg-gradient-to-b from-[#FB9678] to-[#E5A967]" />
          <h1 className="text-[24px] font-extrabold tracking-[0.04em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            研究・作品紹介
          </h1>
        </div>
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

      {/* 戻るボタンは作品一覧へ戻る導線として表示します。 */}
      <Link
        href="/research?tab=works"
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

      {loading ? (
        <div className="px-4 pb-12">
          <div className="rounded-2xl border border-dashed border-[#EBEEF0] bg-white p-10 text-center text-sm text-[#6A7378]">
            作品詳細を読み込み中...
          </div>
        </div>
      ) : error ? (
        <div className="px-4 pb-12">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
            {error}
          </div>
        </div>
      ) : !portfolio ? (
        <div className="px-4 pb-12">
          <div className="rounded-2xl border border-[#EBEEF0] bg-white p-10 text-center text-sm text-[#6A7378]">
            対象の作品が見つかりませんでした。
          </div>
        </div>
      ) : (
        <>
          <section className="px-4 pb-12">
            <div className="flex flex-col gap-4">
              <div className="space-y-1">
                {/* Figmaのタイトルタイポ（24px・字間0.02em）に合わせる */}
                <h2 className="text-[24px] font-extrabold leading-[1.5] tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                  {workTitle ?? "作品タイトル"}
                </h2>
                {/* 研究室名 + 氏名の行はFigma準拠の13px/Medium */}
                <div className="flex flex-wrap justify-end gap-2 text-[13px] font-medium leading-[1.5]">
                  <span className="text-[#6A7378]">
                    {lab?.official_name ?? lab?.name ?? "研究室名"}
                  </span>
                  <span className="text-[#4B5459]">
                    {student?.name ?? "苗字 名前"}
                  </span>
                </div>
              </div>

              {/* 本文は15px/行間2.2/字間0.04emに揃える */}
              <p className="text-[15px] leading-[2.2] tracking-[0.04em] text-[#4B5459]">
                {workSummary ?? PLACEHOLDER_BODY}
              </p>

              {/* 作品画像は16:9の高さ204px想定 */}
              <div className="relative h-[204px] w-full overflow-hidden rounded-[4px] bg-[#EBEEF0]">
                {workImage ? (
                  <img
                    alt=""
                    src={workImage}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-[12px] text-[#A3ADB2]">
                    No Image
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-3 py-3">
                {workLink ? (
                  <a
                    href={workLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full bg-[#0A948A] px-8 py-4 text-[13px] font-medium leading-[1.5] text-white shadow-[0_0_8px_rgba(106,115,120,0.15)]"
                  >
                    この作品の詳細へ
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M7 17L17 7M9 7H17V15"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                ) : null}
                {portfolio?.overall_portfolio_url ? (
                  <a
                    href={portfolio.overall_portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-medium text-[#6A7378] underline"
                  >
                    その他作品はこちらから
                  </a>
                ) : null}
              </div>
            </div>
          </section>

          <section className="px-4 pb-12">
            <div className="border-b border-[#14BDB1] pb-2">
              <h3 className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                進路
              </h3>
            </div>
            <div className="py-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-[16px] font-semibold text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                  <span>{career?.category ?? "進路先未登録"}</span>
                  {career?.job_type ? <span>({career.job_type})</span> : null}
                </div>
                {career?.category_type ? (
                  <p className="text-[13px] font-medium text-[#6A7378]">
                    {career.category_type}
                  </p>
                ) : null}
              </div>
              {career?.detail ? (
                <p className="mt-3 text-[15px] leading-[2.2] tracking-[0.04em] text-[#4B5459]">
                  {career.detail}
                </p>
              ) : null}
            </div>
          </section>

          <div className="flex justify-center px-4 pb-12">
            <Link
              href="/research?tab=works"
              className="flex items-center gap-2 rounded-full border border-[#A3ADB2] px-8 py-4 text-[13px] font-medium text-[#4B5459] shadow-[0_0_8px_rgba(106,115,120,0.15)]"
            >
              一覧へ戻る
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 5V3M7 6L5 4M6 12H3M7 18L5 20M12 19V21M17 18L19 20M18 12H21M17 6L19 4M12 8A4 4 0 1 0 12 16A4 4 0 0 0 12 8Z"
                  stroke="#4B5459"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </>
      )}

      <Footer className="mt-8 w-full px-4" />
    </div>
  )
}
