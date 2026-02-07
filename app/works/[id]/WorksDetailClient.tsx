"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import Footer from "../../components/Footer"
import NavigationMenu from "../../components/NavigationMenu"
import { SkeletonLoader } from "../../components/SkeletonLoader"

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

type Career = {
  id: string
  student_id: string
  category?: string | null
  category_type?: string | null
  detail?: string | null
  job_type?: string | null
  industry?: string | null
  decision_reason?: string | null
  extra_notes?: string | null
}

type StudentDetail = {
  id: string
  careers?: Career[] | null
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

const normalizeText = (value?: string | null) => value?.trim() ?? ""

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
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [labs, setLabs] = useState<Lab[]>([])
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studentCareers, setStudentCareers] = useState<Career[]>([])
  const [careerLoading, setCareerLoading] = useState(false)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const [labsRes, portfoliosRes] = await Promise.all([
          fetch("/api/labs"),
          fetch("/api/portfolios?include=student"),
        ])

        if (!labsRes.ok || !portfoliosRes.ok) {
          throw new Error("Failed to fetch detail data.")
        }

        const [labsData, portfoliosData] = await Promise.all([
          labsRes.json(),
          portfoliosRes.json(),
        ])

        if (!active) return

        setLabs(labsData)
        setPortfolios(portfoliosData)
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
  // 作品の詳細リンクは作品ごとのURL（appeal_url_1 / appeal_url_2）を参照します。
  const workLink =
    index === 2 ? portfolio?.appeal_url_2 : portfolio?.appeal_url_1

  useEffect(() => {
    const studentId = portfolio?.student_id ?? student?.id
    if (!studentId) {
      // 学生情報が無い場合は進路情報も取得できないためリセットします。
      setStudentCareers([])
      return
    }

    let active = true

    const loadStudent = async () => {
      try {
        setCareerLoading(true)
        const res = await fetch(`/api/students/${studentId}`)
        if (!res.ok) {
          throw new Error("Failed to fetch student data.")
        }
        const data = (await res.json()) as StudentDetail
        if (!active) return
        setStudentCareers(data.careers ?? [])
      } catch {
        if (!active) return
        setStudentCareers([])
      } finally {
        if (active) setCareerLoading(false)
      }
    }

    loadStudent()

    return () => {
      active = false
    }
  }, [portfolio?.student_id, student?.id])

  const primaryCareer = studentCareers[0]
  const careerCompany = normalizeText(primaryCareer?.detail)
  const careerRole = normalizeText(primaryCareer?.job_type)
  const careerIndustry =
    normalizeText(primaryCareer?.industry) ||
    normalizeText(primaryCareer?.category_type)
  const careerDescription =
    normalizeText(primaryCareer?.decision_reason) ||
    normalizeText(primaryCareer?.extra_notes)
  const hasCareerContent =
    careerCompany || careerRole || careerIndustry || careerDescription

  return (
    // 他ページと合わせるため、詳細ページの背景を白に統一します。
    // フッターが下端に張り付くよう、コンテナに最小高さを設定します。
    <div className="mx-auto flex min-h-screen w-full max-w-[393px] flex-col bg-white md:max-w-[1200px] lg:max-w-[1280px]">
      {/* デスクトップは横幅のみ広げ、シングルカラムの構成は維持します。 */}
      {/* 右上メニューは画面全体に重ねて表示します。 */}
      {isMenuOpen ? (
        // メニュー展開時の背面も白背景にしてトーンを合わせます。
        <div className="fixed inset-0 z-50 flex justify-center bg-white">
          <NavigationMenu
            items={menuItems}
            activeId="works"
            onClose={() => setIsMenuOpen(false)}
          />
        </div>
      ) : null}

      {/* モバイル版の見出しは残し、デスクトップではFigma通り非表示にします。 */}
      <div className="flex items-center justify-between px-4 pt-6 md:hidden">
        <div className="flex items-center gap-3">
          <span className="h-6 w-2 rounded-[4px] bg-gradient-to-b from-[#FB9678] to-[#E5A967]" />
          <h1 className="text-[24px] font-extrabold tracking-[0.04em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            研究・作品紹介
          </h1>
        </div>
      </div>

      {/* メニューボタンはスクロール中も右上に追従させ、コンテンツの右端に揃えます。 */}
      <div className="fixed inset-x-0 top-0 z-40 flex justify-center pointer-events-none">
        <div className="flex w-full max-w-[393px] justify-end px-4 pt-6 pointer-events-auto md:max-w-[1280px] md:px-[128px] md:pt-[24px]">
          <button
            // トップページと同様に白背景のアイコンボタンにします。
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

      {/* 戻るボタンは作品一覧へ戻る導線として表示します。 */}
      <div className="px-4 md:px-[128px]">
        <button
          type="button"
          // 履歴がない場合に備えて一覧へフォールバックします。
          onClick={() => {
            if (window.history.length > 1) {
              router.back()
            } else {
              router.push("/research?tab=works")
            }
          }}
          className="flex h-20 items-center gap-2 text-[13px] font-medium text-[#6A7378]"
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
        </button>
      </div>

      {error ? (
        <div className="px-4 pb-12">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
            {error}
          </div>
        </div>
      ) : !portfolio && !loading ? (
        <div className="px-4 pb-12">
          <div className="rounded-2xl border border-[#EBEEF0] bg-white p-10 text-center text-sm text-[#6A7378]">
            対象の作品が見つかりませんでした。
          </div>
        </div>
      ) : (
        <>
          <section className="px-4 pb-12 md:px-[128px] md:pb-[96px]">
            <div className="flex flex-col gap-4 md:gap-5">
              <div className="space-y-1">
                {/* Figmaのタイトルタイポ（24px・字間0.02em）に合わせる */}
                {loading ? (
                  <>
                    <SkeletonBlock className="h-7 w-4/5 rounded-md" />
                    <div className="flex justify-end gap-2">
                      <SkeletonBlock className="h-4 w-24 rounded-md" />
                      <SkeletonBlock className="h-4 w-20 rounded-md" />
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-[24px] font-extrabold leading-[1.5] tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[28px] md:tracking-[0.02em]">
                      {workTitle ?? "作品タイトル"}
                    </h2>
                    {/* 研究室名 + 氏名の行はFigma準拠の13px/Medium */}
                    <div className="flex flex-wrap justify-end gap-2 text-[13px] font-medium leading-[1.5] md:text-[15px]">
                      <span className="text-[#6A7378]">
                        {lab?.official_name ?? lab?.name ?? "研究室名"}
                      </span>
                      <span className="text-[#4B5459]">
                        {student?.name ?? "苗字 名前"}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* 本文は15px/行間2.2/字間0.04emに揃える */}
              {loading ? (
                <div className="space-y-2">
                  <SkeletonBlock className="h-4 w-full rounded-md" />
                  <SkeletonBlock className="h-4 w-11/12 rounded-md" />
                  <SkeletonBlock className="h-4 w-10/12 rounded-md" />
                </div>
              ) : (
                <p className="text-[15px] leading-[2.2] tracking-[0.04em] text-[#4B5459] md:text-[18px] md:tracking-[0.04em]">
                  {workSummary ?? PLACEHOLDER_BODY}
                </p>
              )}

              {/* 作品画像は16:9の高さ204px想定 */}
              <div className="relative h-[204px] w-full overflow-hidden rounded-[4px] bg-[#EBEEF0] md:h-auto md:aspect-[16/9]">
                {loading ? (
                  <SkeletonBlock className="absolute inset-0" />
                ) : workImage ? (
                  <SkeletonLoader
                    src={workImage}
                    alt=""
                    // 詳細ページの画像サイズに合わせてフルサイズで表示します。
                    className="h-full w-full"
                    // 読み込み失敗時はプレースホルダーを表示します。
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

              <div className="flex flex-col items-center gap-3 py-3 md:py-5">
                {loading ? (
                  <>
                    <SkeletonBlock className="h-12 w-44 rounded-full" />
                    <SkeletonBlock className="h-4 w-36 rounded-md" />
                  </>
                ) : workLink ? (
                  <a
                    href={workLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full bg-[#0A948A] px-8 py-4 text-[13px] font-medium leading-[1.5] text-white shadow-[0_0_8px_rgba(106,115,120,0.15)] md:px-[56px] md:py-[24px]"
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
                {/* 他の作品も見るリンクはポートフォリオ全体のURL（overall_portfolio_url）を参照します。 */}
                {!loading && portfolio?.overall_portfolio_url ? (
                  <a
                    href={portfolio.overall_portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-medium text-[#6A7378] underline"
                  >
                    その他の作品はこちらから
                  </a>
                ) : null}
              </div>
            </div>
          </section>

          {careerLoading || hasCareerContent ? (
            <section className="px-4 md:px-[128px]">
              <div className="bg-white px-6 py-12 md:px-[24px] md:py-[96px]">
                <div className="border-b border-[#14BDB1] pb-2">
                  <h3 className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                    進路
                  </h3>
                </div>
                <div className="py-6">
                  {careerLoading ? (
                    <div className="space-y-3">
                      <SkeletonBlock className="h-5 w-3/4 rounded-md" />
                      <SkeletonBlock className="h-4 w-1/2 rounded-md" />
                      <SkeletonBlock className="h-4 w-full rounded-md" />
                    </div>
                  ) : (
                    <>
                      {(careerCompany || careerRole) && (
                        <div className="flex flex-wrap items-center gap-2 text-[18px] font-bold leading-[1.5] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[20px]">
                          {careerCompany ? <span>{careerCompany}</span> : null}
                          {careerRole ? (
                            // 企業名がない場合は役職のみを括弧なしで表示します。
                            <span>{careerCompany ? `(${careerRole})` : careerRole}</span>
                          ) : null}
                        </div>
                      )}
                      {careerIndustry ? (
                        <p className="mt-1 text-[13px] font-medium text-[#6A7378] md:text-[15px]">
                          {careerIndustry}
                        </p>
                      ) : null}
                      {careerDescription ? (
                        <p className="mt-4 text-[15px] leading-[2.2] tracking-[0.04em] text-[#4B5459] md:text-[18px] md:tracking-[0.04em]">
                          {careerDescription}
                        </p>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </section>
          ) : null}

          <div className="flex justify-center px-4 py-12 md:px-[16px] md:py-[96px]">
            <Link
              href="/research?tab=works"
              className="flex items-center gap-2 rounded-full border border-[#A3ADB2] px-8 py-4 text-[13px] font-medium text-[#4B5459] shadow-[0_0_8px_rgba(106,115,120,0.15)]"
            >
              一覧へ戻る
              {/* Figma指定のアイコンに差し替えます。 */}
              <img
                src="/icon/signal_cellular_alt.svg"
                alt=""
                className="h-3 w-3"
              />
            </Link>
          </div>
        </>
      )}

      {/* デスクトップのフッターは左右128pxの余白に合わせます。 */}
      <Footer className="w-full px-4 md:px-[128px]" />
    </div>
  )
}
