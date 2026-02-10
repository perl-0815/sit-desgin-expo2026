"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

import Footer from "../components/Footer"
import GlobalHeader from "../components/GlobalHeader"
import { SkeletonLoader } from "../components/SkeletonLoader"
import useSectionReveal from "../components/useSectionReveal"

type CourseMeta = {
  key: string
  label: string
  lineColor: string
  buttonColor: string
}

const courseOrder: CourseMeta[] = [
  {
    key: "社会情報コース",
    label: "社会情報システムコース",
    lineColor: "#14BDB1",
    buttonColor: "#0A948A",
  },
  {
    key: "UXコース",
    label: "UXコース",
    lineColor: "#3575E8",
    buttonColor: "#2C68D3",
  },
  {
    key: "プロダクトコース",
    label: "プロダクトコース",
    lineColor: "#DB4981",
    buttonColor: "#D1346F",
  },
  {
    key: "その他",
    label: "その他",
    lineColor: "#A3ADB2",
    buttonColor: "#6A7378",
  },
]

type Lab = {
  id: string
  name?: string | null
  official_name?: string | null
  instructor?: string | null
  course?: string | null
  tagline?: string | null
  keywords?: string | null
  description?: string | null
}

type Student = {
  id: string
  name?: string | null
  name_kana?: string | null
  lab_id?: string | null
}

type Research = {
  id: string
  student_id: string
  title?: string | null
  summary?: string | null
  keywords?: string | null
  image_url?: string | null
  image_thumb_url?: string | null
  student?: Student | null
}

type Portfolio = {
  id: string
  student_id: string
  title1?: string | null
  summary1?: string | null
  title2?: string | null
  summary2?: string | null
  image1_url?: string | null
  image1_thumb_url?: string | null
  image2_url?: string | null
  image2_thumb_url?: string | null
  student?: Student | null
}

type WorkItem = {
  id: string
  title: string
  summary: string
  studentName: string
  courseKey: string
  imageUrl?: string | null
  imageOriginalUrl?: string | null
}

type ResearchItem = {
  id: string
  title: string
  summary: string
  studentName: string
  courseKey: string
  labId?: string | null
  imageUrl?: string | null
  imageOriginalUrl?: string | null
}

type SkeletonBlockProps = {
  className?: string
}

type LabKeywordsProps = {
  keywords: string[]
  isExpanded: boolean
  labId: string
}

const SkeletonBlock = ({ className = "" }: SkeletonBlockProps) => {
  // ローディング時のプレースホルダーを統一するための簡易スケルトンです。
  return (
    <div className={`relative overflow-hidden bg-[#f0f2f3] ${className}`}>
      <div className="absolute inset-0 skeleton-shimmer bg-linear-to-r from-transparent via-white/30 to-transparent" />
    </div>
  )
}

const LabKeywords = ({ keywords, isExpanded, labId }: LabKeywordsProps) => {
  // モバイルの畳み状態では1行分だけ表示し、折り返し分は見切れるようにします。
  // 展開時とデスクトップは制限せず全件表示します。
  const containerClassName = isExpanded
    ? "flex flex-wrap gap-2"
    : "flex max-h-[24px] flex-wrap gap-2 overflow-hidden md:max-h-none md:overflow-visible"

  return (
    <div className={containerClassName}>
      {keywords.map((keyword, index) => (
        <span
          key={`${labId}-${keyword}`}
          className={`rounded-full bg-[#EBEEF0] px-3 py-1 text-[10px] text-[#4B5459] md:text-[12px] ${
            // モバイル/デスクトップともに未展開時は3件まで表示します。
            // これに加えてコンテナ側の高さ制限で改行分は見切れるようにします。
            !isExpanded && index >= 3 ? "hidden" : ""
          }`}
        >
          {keyword}
        </span>
      ))}
    </div>
  )
}

const PLACEHOLDER_SUMMARY =
  "研究または作品の概要が入ります。詳細は個別ページでご紹介します。"

const getCourseKey = (course?: string | null) => {
  if (!course) return "その他"
  return course
}

const getCourseMeta = (courseKey: string) => {
  return courseOrder.find((course) => course.key === courseKey) ?? courseOrder[3]
}

const splitKeywords = (keywords?: string | null) => {
  if (!keywords) return []
  // CSVの記入ゆれに対応するため、#, 空白, スラッシュでも区切る。
  return keywords
    .split(/[,、，#＃/\uFF0F\s\u3000]+/)
    .map((keyword) => keyword.trim())
    .filter(Boolean)
}

const isAbsoluteUrl = (value?: string | null) => {
  return !!value && /^https?:\/\//i.test(value)
}

const normalizeImageUrl = (value?: string | null) => {
  if (!value) return null
  const trimmed = String(value).trim()
  return trimmed === "" ? null : trimmed
}

const pickThumbnailImage = (thumb?: string | null, original?: string | null) => {
  // サムネイル表示が優先だが、相対パスのみの場合は絶対URLを優先して404を防ぐ
  if (isAbsoluteUrl(thumb)) return thumb
  if (isAbsoluteUrl(original)) return original
  return thumb || original || null
}

const handleImageError =
  (fallbackUrl?: string | null) =>
  (event: React.SyntheticEvent<HTMLImageElement>) => {
    // サムネイルが存在しない場合は元画像に切り替える（無限ループを防止）
    const img = event.currentTarget
    if (!fallbackUrl) return
    if (img.dataset.fallbackApplied === "true") return
    img.dataset.fallbackApplied = "true"
    img.src = fallbackUrl
  }

export default function ResearchWorksClient() {
  // URLのタブ指定（?tab=works）に対応するため、ルーター情報を取得します。
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState<"research" | "works">("research")
  const searchParams = useSearchParams()
  // トグル更新直後のURL反映待ちで表示が揺れないよう、直近の手動切り替えを記録します。
  const pendingTabRef = useRef<"research" | "works" | null>(null)
  const [labs, setLabs] = useState<Lab[]>([])
  const [research, setResearch] = useState<Research[]>([])
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>(
    {},
  )
  const [expandedLabs, setExpandedLabs] = useState<Record<string, boolean>>({})
  const restoredFocusRef = useRef(false)
  const searchStateRef = useRef<{
    focusId?: string
    focusLabId?: string
    focusCourseKey?: string
  }>({})

  // 読み込み完了やタブ切り替えでDOMが差し替わるため、その都度セクションの表示状態を更新します。
  useSectionReveal([loading, activeTab])

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const [labsRes, researchRes, portfoliosRes] = await Promise.all([
          fetch("/api/labs"),
          fetch("/api/research?include=student"),
          fetch("/api/portfolios?include=student"),
        ])

        if (!labsRes.ok || !researchRes.ok || !portfoliosRes.ok) {
          throw new Error("Failed to fetch data.")
        }

        const [labsData, researchData, portfolioData] = await Promise.all([
          labsRes.json(),
          researchRes.json(),
          portfoliosRes.json(),
        ])

        if (!active) return

        setLabs(labsData)
        setResearch(researchData)
        setPortfolios(portfolioData)
      } catch (fetchError) {
        if (!active) return
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to fetch data."
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

  // URLのクエリに応じてタブとフォーカス情報を同期します。
  useEffect(() => {
    const tab = searchParams.get("tab")
    const nextTab = tab === "works" ? "works" : "research"
    // 直近の手動切り替えと一致するまでは状態を戻さないようにします。
    if (pendingTabRef.current && pendingTabRef.current !== nextTab) {
      return
    }
    if (pendingTabRef.current === nextTab) {
      pendingTabRef.current = null
    }
    setActiveTab((prev) => (prev === nextTab ? prev : nextTab))
    searchStateRef.current = {
      focusId: searchParams.get("focus") ?? undefined,
      focusLabId: searchParams.get("lab") ?? undefined,
      focusCourseKey: searchParams.get("course") ?? undefined,
    }
  }, [searchParams])

  // 詳細ページから戻ってきた場合、対象コース/研究室を展開し、位置までスクロールします。
  useEffect(() => {
    if (loading || restoredFocusRef.current) return

    const { focusId, focusLabId, focusCourseKey } = searchStateRef.current

    if (!focusId) return

    if (activeTab === "research" && focusLabId) {
      setExpandedLabs((prev) => ({ ...prev, [focusLabId]: true }))
    }
    if (activeTab === "works" && focusCourseKey) {
      setExpandedCourses((prev) => ({ ...prev, [focusCourseKey]: true }))
    }

    restoredFocusRef.current = true

    // 展開が反映された後にスクロールするため、次フレームで実行します。
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = document.getElementById(focusId)
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      })
    })
  }, [activeTab, loading, setExpandedCourses, setExpandedLabs])

  const labById = useMemo(() => {
    return new Map(labs.map((lab) => [lab.id, lab]))
  }, [labs])

  const labsByCourse = useMemo(() => {
    const map = new Map<string, Lab[]>()
    labs.forEach((lab) => {
      const courseKey = getCourseKey(lab.course)
      const list = map.get(courseKey) ?? []
      list.push(lab)
      map.set(courseKey, list)
    })
    return map
  }, [labs])

  const researchItems = useMemo<ResearchItem[]>(() => {
    return research.map((item) => {
      const student = item.student
      const labId = student?.lab_id
      const lab = labId ? labById.get(labId) : undefined
      const courseKey = getCourseKey(lab?.course)
      return {
        id: item.id,
        title: item.title ?? "研究タイトル",
        summary: item.summary ?? PLACEHOLDER_SUMMARY,
        studentName: student?.name ?? "苗字 名前",
        courseKey,
        labId,
        imageUrl: pickThumbnailImage(
          normalizeImageUrl(item.image_thumb_url),
          normalizeImageUrl(item.image_url),
        ),
        imageOriginalUrl: normalizeImageUrl(item.image_url),
      }
    })
  }, [research, labById])

  const worksItems = useMemo<WorkItem[]>(() => {
    const items: WorkItem[] = []

    portfolios.forEach((portfolio) => {
      const student = portfolio.student
      const lab = student?.lab_id ? labById.get(student.lab_id) : undefined
      const courseKey = getCourseKey(lab?.course)
      const studentName = student?.name ?? "苗字 名前"

      if (portfolio.title1) {
        items.push({
          id: `${portfolio.id}-1`,
          title: portfolio.title1,
          summary: portfolio.summary1 ?? PLACEHOLDER_SUMMARY,
          studentName,
          courseKey,
          imageUrl: pickThumbnailImage(
            normalizeImageUrl(portfolio.image1_thumb_url),
            normalizeImageUrl(portfolio.image1_url),
          ),
          imageOriginalUrl: normalizeImageUrl(portfolio.image1_url),
        })
      }

      if (portfolio.title2) {
        items.push({
          id: `${portfolio.id}-2`,
          title: portfolio.title2,
          summary: portfolio.summary2 ?? PLACEHOLDER_SUMMARY,
          studentName,
          courseKey,
          imageUrl: pickThumbnailImage(
            normalizeImageUrl(portfolio.image2_thumb_url),
            normalizeImageUrl(portfolio.image2_url),
          ),
          imageOriginalUrl: normalizeImageUrl(portfolio.image2_url),
        })
      }
    })

    return items
  }, [portfolios, labById])

  const researchByCourse = useMemo(() => {
    const map = new Map<string, ResearchItem[]>()
    researchItems.forEach((item) => {
      const list = map.get(item.courseKey) ?? []
      list.push(item)
      map.set(item.courseKey, list)
    })
    return map
  }, [researchItems])

  const researchByLab = useMemo(() => {
    const map = new Map<string, ResearchItem[]>()
    researchItems.forEach((item) => {
      if (!item.labId) return
      const list = map.get(item.labId) ?? []
      list.push(item)
      map.set(item.labId, list)
    })
    return map
  }, [researchItems])

  const worksByCourse = useMemo(() => {
    const map = new Map<string, WorkItem[]>()
    worksItems.forEach((item) => {
      const list = map.get(item.courseKey) ?? []
      list.push(item)
      map.set(item.courseKey, list)
    })
    return map
  }, [worksItems])

  const visibleCourses = useMemo(() => {
    if (loading) {
      // 読み込み中は全コースを表示し、スケルトンで骨組みを見せます。
      return courseOrder
    }
    if (activeTab === "research") {
      return courseOrder.filter((course) => {
        return (labsByCourse.get(course.key)?.length ?? 0) > 0
      })
    }
    return courseOrder.filter((course) => {
      return (worksByCourse.get(course.key)?.length ?? 0) > 0
    })
  }, [activeTab, labsByCourse, worksByCourse])

  const toggleExpandedCourse = (courseKey: string) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseKey]: !prev[courseKey],
    }))
  }

  const toggleExpandedLab = (labId: string) => {
    setExpandedLabs((prev) => ({
      ...prev,
      [labId]: !prev[labId],
    }))
  }

  const activeMenuId = activeTab === "works" ? "works" : "research"

  const updateTab = (tab: "research" | "works") => {
    pendingTabRef.current = tab
    setActiveTab(tab)
    // タブ状態をURLに反映して、メニューからの遷移でも状態が揃うようにします。
    if (tab === "works") {
      router.replace(`${pathname}?tab=works`, { scroll: false })
    } else {
      router.replace(pathname, { scroll: false })
    }
  }

  const buildDetailHref = (
    base: string,
    params: Record<string, string | null | undefined>,
  ) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (!value) return
      query.set(key, value)
    })
    const suffix = query.toString()
    return suffix ? `${base}?${suffix}` : base
  }

  return (
    // 余白でフッターが浮かないように、最小高さを確保します。
    //モバイルは画面幅いっぱいに広げるため、最大幅の制限はmd以上に限定します。
    <div className="mx-auto flex min-h-screen w-full flex-col bg-[#F9F9F9] md:max-w-[1280px]">
      {/* デスクトップは横幅のみ広げ、シングルカラムの構成は維持します。 */}
      {/* 全ページ共通のヘッダーを配置し、スクロール中も固定表示します。 */}
      <GlobalHeader activeId={activeMenuId} />
      {/* ヘッダーが固定表示になったため、本文の開始位置をヘッダー高分だけ下げて重なりを防ぎます。 */}
      {/* 既存の見出し余白は維持し、Figmaの見た目に近づくよう差分のみ補正します。 */}
      <div className="pt-[84px] md:pt-[96px]">
        {/* このブロックは画面上部の見出しとメニューボタンの並びを定義し、Figmaの余白・配置に合わせています。 */}
        {/* デスクトップは左右128pxのガイド余白で揃え、見出しの高さをFigmaに合わせます。 */}
        <div className="flex items-center justify-between px-4 pt-6 md:px-[128px] md:pb-[24px] md:pt-[36px]">
          <div className="flex items-center gap-3">
            <span className="h-6 w-2 rounded-[4px] bg-gradient-to-b from-[#FB9678] to-[#E5A967]" />
            <h1 className="text-[24px] font-extrabold tracking-[0.04em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[28px] md:tracking-[0.06em]">
              研究・作品紹介
            </h1>
          </div>
          {/* メニューボタンは共通ヘッダー側で固定表示しています。 */}
        </div>

        {/* 研究/作品の切り替えタブ。丸み・背景色・押下時の枠線はFigmaの配色に合わせています。 */}
        {/* 切り替えタブはデスクトップで横幅を広げ、中央寄せのピル形状に揃えます。 */}
        <div className="px-4 pt-6 md:px-[128px] md:pt-0">
          {/* タブの高さは44px相当、内側余白は上下12pxで、タップしやすさと見た目の均整を両立します。 */}
          {/* Figmaの切り替えボタンに合わせて、外側は8pxパディング、内側は半透明白のピルにします。 */}
          <div className="rounded-full bg-[#EBEEF0] p-2 md:rounded-[9999px]">
            {/* 白いピルが左右にスライドするよう、親をrelativeにしてインジケーターを重ねます。 */}
            <div className="relative grid grid-cols-2 gap-0">
              {/* 透明度のある白い背景を左右にスライドさせるための要素です。 */}
              <div
                className="pointer-events-none absolute inset-y-0 left-0 w-1/2 rounded-full border border-[#F9F9F9] bg-white/80 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                  transform:
                    activeTab === "works" ? "translateX(100%)" : "translateX(0%)",
                }}
                aria-hidden="true"
              />
              <button
                type="button"
                // タブ切り替え時に一瞬見えるブラウザ既定のフォーカス枠（黒い枠）を出さないようにします。
                className={`relative z-10 w-full rounded-full px-1 py-3 text-[13px] font-medium transition outline-none focus:outline-none focus-visible:outline-none ${
                  activeTab === "research" ? "text-[#2E3437]" : "text-[#6A7378]"
                }`}
                aria-pressed={activeTab === "research"}
                onClick={() => updateTab("research")}
              >
                研究
              </button>
              <button
                type="button"
                // タブ切り替え時に一瞬見えるブラウザ既定のフォーカス枠（黒い枠）を出さないようにします。
                className={`relative z-10 w-full rounded-full px-1 py-3 text-[13px] font-medium transition outline-none focus:outline-none focus-visible:outline-none ${
                  activeTab === "works" ? "text-[#2E3437]" : "text-[#6A7378]"
                }`}
                aria-pressed={activeTab === "works"}
                onClick={() => updateTab("works")}
              >
                作品
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="px-4 pt-12">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
              {error}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-12 pt-12 md:pt-12">
            {visibleCourses.map((course) => {
              const courseMeta = getCourseMeta(course.key)

            if (loading) {
              return (
                <section
                  key={`loading-${course.key}`}
                  data-reveal
                  className="px-4 md:px-[128px] md:pb-[96px]"
                >
                  <div
                    className="border-b pb-2"
                    style={{ borderColor: courseMeta.lineColor }}
                  >
                    <SkeletonBlock className="h-6 w-40 rounded-md" />
                  </div>
                  {activeTab === "research" ? (
                    <div className="divide-y divide-[#EBEEF0]">
                      {[0, 1].map((index) => (
                        <div
                          key={`lab-skel-${course.key}-${index}`}
                          className="py-4 md:py-6"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex flex-col gap-2">
                              <SkeletonBlock className="h-4 w-32 rounded-md" />
                              <div className="flex flex-wrap gap-2">
                                <SkeletonBlock className="h-5 w-16 rounded-full" />
                                <SkeletonBlock className="h-5 w-12 rounded-full" />
                                <SkeletonBlock className="h-5 w-14 rounded-full" />
                              </div>
                            </div>
                            <SkeletonBlock className="mt-1 h-6 w-6 rounded-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4 md:gap-x-14 md:gap-y-6">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div
                          key={`work-skel-${course.key}-${index}`}
                          className="flex flex-col gap-2"
                        >
                          <SkeletonBlock className="aspect-video w-full rounded-[4px]" />
                          <div className="space-y-2">
                            <SkeletonBlock className="h-4 w-11/12 rounded-md" />
                            {/* 氏名が左寄せになったので、スケルトンも左寄せで揃えます。 */}
                            <SkeletonBlock className="h-4 w-1/2 rounded-md" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )
            }

            if (activeTab === "research") {
              const courseLabs = labsByCourse.get(course.key) ?? []

              return (
                <section
                  key={`research-${course.key}`}
                  data-reveal
                  className="px-4 md:px-[128px] md:pb-[96px]"
                >
                  <div
                    className="border-b pb-2"
                    style={{ borderColor: courseMeta.lineColor }}
                  >
                    <h2 className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                      {course.label}
                    </h2>
                  </div>

                  <div className="divide-y divide-[#EBEEF0]">
                    {courseLabs.map((lab) => {
                      const labName =
                        lab.official_name ?? lab.name ?? "研究室"
                      const labResearch = researchByLab.get(lab.id) ?? []
                      const isExpanded = !!expandedLabs[lab.id]
                      const labKeywords = splitKeywords(lab.keywords)

                      return (
                        <div key={lab.id} className="py-4 md:py-6">
                          {/* 研究室カードは見出しクリックで詳細を開閉する仕様です。開閉状態に応じてアイコンと色が変わります。 */}
                          <button
                            type="button"
                            className="flex w-full items-start justify-between gap-4 text-left"
                            onClick={() => toggleExpandedLab(lab.id)}
                            aria-expanded={isExpanded}
                          >
                            <div className="flex flex-col gap-2">
                              {/* 展開中は見出し色を強調色に切り替え、どの研究室が開いているかを視覚的に示します。 */}
                              <p
                                className={`text-[16px] font-medium md:text-[20px] ${
                                  isExpanded ? "" : "text-[#4B5459]"
                                }`}
                                style={
                                  // 展開中の研究室名はコースごとの指定色に合わせます。
                                  isExpanded
                                    ? { color: courseMeta.buttonColor }
                                    : undefined
                                }
                              >
                                {labName}
                              </p>
                              {/* キーワードはモバイルの1行目のみ表示し、折返し分は展開時に表示します。 */}
                              <LabKeywords
                                keywords={labKeywords}
                                isExpanded={isExpanded}
                                labId={lab.id}
                              />
                            </div>
                          {/* 開閉アイコンは24px固定枠に収め、縦位置の揺れを抑えます。 */}
                          <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center md:h-7 md:w-7">
                            {isExpanded ? (
                              <svg
                                aria-hidden="true"
                                className="h-6 w-6 md:h-7 md:w-7"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M6 12H18"
                                  stroke="#A3ADB2"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            ) : (
                              <svg
                                aria-hidden="true"
                                className="h-6 w-6 md:h-7 md:w-7"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M12 6V18M6 12H18"
                                  stroke="#A3ADB2"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            )}
                          </span>
                          </button>

                          {/* 展開/収納時に上下方向へ引き出す・巻き取る動きを出すため、常にDOMを保持してアニメーションします。 */}
                          <div
                            className={`mt-4 grid overflow-hidden transition-[grid-template-rows,opacity,transform] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:mt-6 ${
                              isExpanded
                                ? "grid-rows-[1fr] opacity-100 translate-y-0"
                                : "grid-rows-[0fr] opacity-0 -translate-y-2 pointer-events-none"
                            }`}
                            aria-hidden={!isExpanded}
                          >
                            {/* 高さアニメーションを滑らかにするため、内側にmin-h-0のラッパーを挟みます。 */}
                            <div className="min-h-0">
                              {/* 研究室の説明文は本文13px・行間1.9で読みやすさを確保し、Figmaのタイポグラフィに合わせています。 */}
                              <div className="text-[13px] leading-[1.9] tracking-[0.02em] text-[#6A7378] md:text-[16px]">
                              <p>{lab.description ?? ""}</p>
                              {lab.instructor ? (
                                // 指導教員名は右寄せで視線の流れを整えます。
                                <p className="pt-2 text-right text-[14px] text-[#4B5459] md:text-[14px]">
                                  指導教員：{lab.instructor}
                                </p>
                              ) : null}
                              </div>

                              {labResearch.length > 0 ? (
                                <>
                                  <p className="mt-4 text-[12px] font-medium text-[#6A7378] md:text-[15px]">
                                    研究一覧
                                  </p>
                                  {/* 研究一覧はデスクトップで4列・横56pxの間隔に拡張します。 */}
                                  <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4 md:gap-x-14 md:gap-y-6">
                                    {labResearch.map((item) => (
                                      <Link
                                        key={item.id}
                                        href={buildDetailHref(
                                          `/research/${item.id}`,
                                          {
                                            returnTab: "research",
                                            lab: item.labId ?? null,
                                            focus: `research-${item.id}`,
                                          },
                                        )}
                                        id={`research-${item.id}`}
                                        className="flex flex-col gap-2 scroll-mt-[120px] md:scroll-mt-[140px]"
                                      >
                                        <div className="relative aspect-video w-full overflow-hidden rounded-[4px] bg-[#EBEEF0]">
                                          {item.imageUrl ? (
                                            <SkeletonLoader
                                              src={item.imageUrl}
                                              alt=""
                                              onError={handleImageError(
                                                item.imageOriginalUrl,
                                              )}
                                              // 既存のカードサイズに合わせてフルサイズで表示します。
                                              className="h-full w-full"
                                              // フォールバックも失敗した場合の表示を統一します。
                                              fallback={
                                                <div className="absolute inset-0 grid place-items-center text-[10px] text-[#A3ADB2]">
                                                  No Image
                                                </div>
                                              }
                                            />
                                          ) : (
                                            <div className="absolute inset-0 grid place-items-center text-[10px] text-[#A3ADB2]">
                                              No Image
                                            </div>
                                          )}
                                        </div>
                                        {/* 研究カードは「タイトル」と「氏名」のみ表示し、一覧性を優先します。 */}
                                        <div className="space-y-1 text-[12px] md:text-[16px]">
                                          {/* タイトルが3行以上になる場合は2行で省略します。 */}
                                          <p
                                            className="font-medium leading-[1.5] text-[#4B5459] md:text-[16px]"
                                            style={{
                                              display: "-webkit-box",
                                              WebkitBoxOrient: "vertical",
                                              WebkitLineClamp: 2,
                                              overflow: "hidden",
                                            }}
                                          >
                                            {item.title}
                                          </p>
                                          {/* 氏名はFigma通り左寄せに統一し、カード内の視線の流れを揃えます。 */}
                                          <p className="text-left text-[12px] leading-[1.6] tracking-[0.02em] text-[#6A7378] md:text-[14px]">
                                            {item.studentName}
                                          </p>
                                        </div>
                                      </Link>
                                    ))}
                                  </div>
                                </>
                              ) : (
                                <>
                                  {/* 研究がない研究室には、Figma指定の告知ボックスを表示します。 */}
                                  <div className="mt-4 rounded-[4px] bg-[#EBEEF0] py-4 md:py-6">
                                    <p className="text-center text-[13px] leading-[1.9] tracking-[0.02em] text-[#6A7378] md:text-[16px]">
                                      出展している研究はありません
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            }

            const items = worksByCourse.get(course.key) ?? []
            const showAll = expandedCourses[course.key]
            // 「もっと見る」時のロールアニメーション用に、表示分と追加分を分けます。
            const visibleItems = items.slice(0, 4)
            const extraItems = items.slice(4)

            return (
              <section
                key={`works-${course.key}`}
                data-reveal
                className="px-4 md:px-[128px] md:pb-[96px]"
              >
                <div
                  className="border-b pb-2"
                  style={{ borderColor: courseMeta.lineColor }}
                >
                  <h2 className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                    {course.label}
                  </h2>
                </div>

                {/* 作品一覧はデスクトップで4列にし、Figmaの16:9カード配置に合わせます。 */}
                <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4 md:gap-x-14 md:gap-y-6">
                  {visibleItems.map((item) => (
                    <Link
                      key={item.id}
                      href={buildDetailHref(`/works/${item.id}`, {
                        returnTab: "works",
                        course: item.courseKey,
                        focus: `works-${item.id}`,
                      })}
                      id={`works-${item.id}`}
                      className="flex flex-col gap-2 scroll-mt-[120px] md:scroll-mt-[140px]"
                    >
                      <div className="relative aspect-video w-full overflow-hidden rounded-[4px] bg-[#EBEEF0]">
                        {item.imageUrl ? (
                          <SkeletonLoader
                            src={item.imageUrl}
                            alt=""
                            onError={handleImageError(item.imageOriginalUrl)}
                            // 既存のカードサイズに合わせてフルサイズで表示します。
                            className="h-full w-full"
                            // フォールバックも失敗した場合の表示を統一します。
                            fallback={
                              <div className="absolute inset-0 grid place-items-center text-[10px] text-[#A3ADB2]">
                                No Image
                              </div>
                            }
                          />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center text-[10px] text-[#A3ADB2]">
                            No Image
                          </div>
                        )}
                      </div>
                      {/* 作品カードも「タイトル」と「氏名」のみ表示し、情報量を抑えて視認性を上げます。 */}
                      <div className="space-y-1 text-[12px] md:text-[16px]">
                        {/* タイトルが3行以上になる場合は2行で省略します。 */}
                        <p
                          className="font-medium leading-[1.5] text-[#4B5459] md:text-[16px]"
                          style={{
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 2,
                            overflow: "hidden",
                          }}
                        >
                          {item.title}
                        </p>
                        {/* 氏名はFigma通り左寄せに統一し、カード内の視線の流れを揃えます。 */}
                        <p className="text-left text-[12px] leading-[1.6] tracking-[0.02em] text-[#6A7378] md:text-[14px]">
                          {item.studentName}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* 「もっと見る」時のロールアニメーション用に、追加分を可変高さで開閉します。 */}
                {extraItems.length > 0 ? (
                  <div
                    className={`grid overflow-hidden transition-[grid-template-rows,opacity,transform] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      showAll
                        ? "mt-6 grid-rows-[1fr] opacity-100 translate-y-0"
                        : "mt-0 grid-rows-[0fr] opacity-0 -translate-y-2 pointer-events-none"
                    } md:mt-6 md:grid-rows-[1fr] md:opacity-100 md:translate-y-0 md:pointer-events-auto`}
                    aria-hidden={!showAll}
                  >
                    <div className="min-h-0">
                      <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4 md:gap-x-14 md:gap-y-6">
                        {extraItems.map((item) => (
                          <Link
                            key={item.id}
                            href={buildDetailHref(`/works/${item.id}`, {
                              returnTab: "works",
                              course: item.courseKey,
                              focus: `works-${item.id}`,
                            })}
                            id={`works-${item.id}`}
                            className="flex flex-col gap-2 scroll-mt-[120px] md:scroll-mt-[140px]"
                          >
                            <div className="relative aspect-video w-full overflow-hidden rounded-[4px] bg-[#EBEEF0]">
                              {item.imageUrl ? (
                                <SkeletonLoader
                                  src={item.imageUrl}
                                  alt=""
                                  onError={handleImageError(item.imageOriginalUrl)}
                                  // 既存のカードサイズに合わせてフルサイズで表示します。
                                  className="h-full w-full"
                                  // フォールバックも失敗した場合の表示を統一します。
                                  fallback={
                                    <div className="absolute inset-0 grid place-items-center text-[10px] text-[#A3ADB2]">
                                      No Image
                                    </div>
                                  }
                                />
                              ) : (
                                <div className="absolute inset-0 grid place-items-center text-[10px] text-[#A3ADB2]">
                                  No Image
                                </div>
                              )}
                            </div>
                            {/* 作品カードも「タイトル」と「氏名」のみ表示し、情報量を抑えて視認性を上げます。 */}
                            <div className="space-y-1 text-[12px] md:text-[16px]">
                              {/* タイトルが3行以上になる場合は2行で省略します。 */}
                              <p
                                className="font-medium leading-[1.5] text-[#4B5459] md:text-[16px]"
                                style={{
                                  display: "-webkit-box",
                                  WebkitBoxOrient: "vertical",
                                  WebkitLineClamp: 2,
                                  overflow: "hidden",
                                }}
                              >
                                {item.title}
                              </p>
                              {/* 氏名はFigma通り左寄せに統一し、カード内の視線の流れを揃えます。 */}
                              <p className="text-left text-[12px] leading-[1.6] tracking-[0.02em] text-[#6A7378] md:text-[14px]">
                                {item.studentName}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                {items.length > 4 ? (
                  <div className="mt-6 flex justify-center md:hidden">
                    {/* 「もっと見る」ボタンのアイコンはSVGで描画し、フォント依存を避けます。 */}
                    <button
                      type="button"
                      // 「閉じる」表示時はFigmaの共通ボタン（淡いグレー・丸ピル）に統一します。
                      className={`flex items-center gap-2 rounded-full px-8 py-4 text-[13px] font-medium shadow-[0_0_8px_rgba(106,115,120,0.15)] ${
                        showAll
                          ? "border border-[#A3ADB2] bg-[#F9F9F9] text-[#4B5459]"
                          : "text-white"
                      }`}
                      style={
                        showAll
                          ? undefined
                          : { backgroundColor: courseMeta.buttonColor }
                      }
                      onClick={() => toggleExpandedCourse(course.key)}
                    >
                      {showAll ? "閉じる" : "もっと見る"}
                      {showAll ? (
                        // 「閉じる」時はマイナス表現で統一します。
                        <svg
                          aria-hidden="true"
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M6 12H18"
                            stroke="#4B5459"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          aria-hidden="true"
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 6V18M6 12H18"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                ) : null}
              </section>
            )
          })}
        </div>
      )}

      {/* フッターは他ページでも使えるよう共通コンポーネントとして読み込みます。 */}
      {/* フッターはデスクトップで横幅1280pxに揃えて中央配置します。 */}
      <div className="mt-16 px-4 md:mt-[48px] md:px-0">
        <div className="mx-auto w-full md:max-w-[1280px]">
          <Footer className="w-full" />
        </div>
      </div>
      </div>
    </div>
  )
}
