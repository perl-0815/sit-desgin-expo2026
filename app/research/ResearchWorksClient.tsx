"use client"

import { useMemo, useState, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

import Footer from "../components/Footer"
import NavigationMenu from "../components/NavigationMenu"
import { SkeletonLoader } from "../components/SkeletonLoader"

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

const SkeletonBlock = ({ className = "" }: SkeletonBlockProps) => {
  // ローディング時のプレースホルダーを統一するための簡易スケルトンです。
  return (
    <div className={`relative overflow-hidden bg-[#f0f2f3] ${className}`}>
      <div className="absolute inset-0 skeleton-shimmer bg-linear-to-r from-transparent via-white/30 to-transparent" />
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

const sliceKeywords = (keywords?: string | null) => {
  if (!keywords) return []
  return keywords
    .split(/[,、]/)
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .slice(0, 3)
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
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<"research" | "works">("research")
  // 右上メニューの開閉状態を管理します。
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [labs, setLabs] = useState<Lab[]>([])
  const [research, setResearch] = useState<Research[]>([])
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>(
    {},
  )
  const [expandedLabs, setExpandedLabs] = useState<Record<string, boolean>>({})

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

  // URLのクエリに応じて初期タブを切り替えます。
  useEffect(() => {
    const tab = searchParams.get("tab")
    const nextTab = tab === "works" ? "works" : "research"
    if (nextTab !== activeTab) {
      setActiveTab(nextTab)
    }
  }, [searchParams, activeTab])

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

  // メニューに表示する導線を一箇所にまとめ、ページ構成の変更に備えます。
  const menuItems = [
    { id: "top", label: "TOP", href: "/" },
    { id: "research", label: "研究紹介", href: "/research" },
    { id: "works", label: "作品紹介", href: "/research?tab=works" },
    { id: "career", label: "卒業生の進路", href: "/career" },
    { id: "events", label: "イベント", href: "/events" },
    { id: "contact", label: "お問い合わせ", href: "/contact" },
  ]

  const activeMenuId = activeTab === "works" ? "works" : "research"

  const updateTab = (tab: "research" | "works") => {
    setActiveTab(tab)
    // タブ状態をURLに反映して、メニューからの遷移でも状態が揃うようにします。
    if (tab === "works") {
      router.replace(`${pathname}?tab=works`, { scroll: false })
    } else {
      router.replace(pathname, { scroll: false })
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[393px] flex-col bg-[#F9F9F9] pb-16">
      {/* 右上メニューは画面全体に重ねて表示します。 */}
      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 flex justify-center bg-[#F9F9F9]">
          <NavigationMenu
            items={menuItems}
            activeId={activeMenuId}
            onClose={() => setIsMenuOpen(false)}
          />
        </div>
      ) : null}
      {/* このブロックは画面上部の見出しとメニューボタンの並びを定義し、Figmaの余白・配置に合わせています。 */}
      <div className="flex items-center justify-between px-4 pt-6">
        <div className="flex items-center gap-3">
          <span className="h-6 w-2 rounded-[4px] bg-gradient-to-b from-[#FB9678] to-[#E5A967]" />
          <h1 className="text-[24px] font-extrabold tracking-[0.04em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            研究・作品紹介
          </h1>
        </div>
        {/* メニューボタンはスクロール中も右上に追従させ、コンテンツの右端に揃えます。 */}
        <div className="fixed inset-x-0 top-0 z-40 flex justify-center pointer-events-none">
          <div className="flex w-full max-w-[393px] justify-end px-4 pt-6 pointer-events-auto">
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

      {/* 研究/作品の切り替えタブ。丸み・背景色・押下時の枠線はFigmaの配色に合わせています。 */}
      <div className="px-4 pt-6">
        {/* タブの高さは44px相当、内側余白は上下12pxで、タップしやすさと見た目の均整を両立します。 */}
        <div className="rounded-full bg-[#EBEEF0] p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              className={`min-h-[44px] rounded-full px-4 py-3 text-[13px] font-medium transition ${
                activeTab === "research"
                  ? "border border-[#FB9678] bg-white text-[#2E3437]"
                  : "text-[#6A7378]"
              }`}
              aria-pressed={activeTab === "research"}
              onClick={() => updateTab("research")}
            >
              研究
            </button>
            <button
              type="button"
              className={`min-h-[44px] rounded-full px-4 py-3 text-[13px] font-medium transition ${
                activeTab === "works"
                  ? "border border-[#FB9678] bg-white text-[#2E3437]"
                  : "text-[#6A7378]"
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
        <div className="flex flex-col gap-12 pt-6">
          {visibleCourses.map((course) => {
            const courseMeta = getCourseMeta(course.key)

            if (loading) {
              return (
                <section key={`loading-${course.key}`} className="px-4">
                  <div
                    className="border-b pb-2"
                    style={{ borderColor: courseMeta.lineColor }}
                  >
                    <SkeletonBlock className="h-6 w-40 rounded-md" />
                  </div>
                  {activeTab === "research" ? (
                    <div className="divide-y divide-[#EBEEF0]">
                      {[0, 1].map((index) => (
                        <div key={`lab-skel-${course.key}-${index}`} className="py-4">
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
                    <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-6">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div
                          key={`work-skel-${course.key}-${index}`}
                          className="flex flex-col gap-2"
                        >
                          <SkeletonBlock className="aspect-video w-full rounded-[4px]" />
                          <div className="space-y-2">
                            <SkeletonBlock className="h-4 w-11/12 rounded-md" />
                            <SkeletonBlock className="h-4 w-1/2 rounded-md ml-auto" />
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
                <section key={`research-${course.key}`} className="px-4">
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

                      return (
                        <div key={lab.id} className="py-4">
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
                                className={`text-[16px] font-medium ${
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
                              <div className="flex flex-wrap gap-2">
                                {sliceKeywords(lab.keywords).map((keyword) => (
                                  <span
                                    key={`${lab.id}-${keyword}`}
                                    className="rounded-full bg-[#EBEEF0] px-3 py-1 text-[10px] text-[#4B5459]"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            </div>
                          {/* 開閉アイコンは24px固定枠に収め、縦位置の揺れを抑えます。 */}
                          <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center">
                            {isExpanded ? (
                              <svg
                                aria-hidden="true"
                                className="h-6 w-6"
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
                                className="h-6 w-6"
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

                          {isExpanded ? (
                            <div className="mt-4 space-y-4">
                              {/* 研究室の説明文は本文13px・行間1.9で読みやすさを確保し、Figmaのタイポグラフィに合わせています。 */}
                              <div className="text-[13px] leading-[1.9] tracking-[0.02em] text-[#6A7378]">
                                <p>{lab.description ?? ""}</p>
                                {lab.instructor ? (
                                  <p className="pt-2">指導教員：{lab.instructor}</p>
                                ) : null}
                              </div>

                              {labResearch.length > 0 ? (
                                <>
                                  <p className="text-[12px] font-medium text-[#6A7378]">
                                    研究一覧
                                  </p>
                                  {/* 研究一覧のカード間隔は縦24px・横32pxのグリッドで、Figmaの余白設計を再現します。 */}
                                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                    {labResearch.map((item) => (
                                    <Link
                                      key={item.id}
                                      href={`/research/${item.id}`}
                                      className="flex flex-col gap-2"
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
                                      <div className="space-y-1 text-[12px]">
                                        <p className="font-medium leading-[1.5] text-[#4B5459]">
                                          {item.title}
                                        </p>
                                        <p className="text-right text-[12px] leading-[1.6] tracking-[0.02em] text-[#6A7378]">
                                          {item.studentName}
                                        </p>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </>
                            ) : null}
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            }

            const items = worksByCourse.get(course.key) ?? []
            const showAll = expandedCourses[course.key]
            const visibleItems = showAll ? items : items.slice(0, 4)

            return (
              <section key={`works-${course.key}`} className="px-4">
                <div
                  className="border-b pb-2"
                  style={{ borderColor: courseMeta.lineColor }}
                >
                  <h2 className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                    {course.label}
                  </h2>
                </div>

                {/* 作品一覧のカード間隔も縦24px・横32pxのグリッドで統一します。 */}
                <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-6">
                  {visibleItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/works/${item.id}`}
                      className="flex flex-col gap-2"
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
                      <div className="space-y-1 text-[12px]">
                        <p className="font-medium leading-[1.5] text-[#4B5459]">
                          {item.title}
                        </p>
                        <p className="text-right text-[12px] leading-[1.6] tracking-[0.02em] text-[#6A7378]">
                          {item.studentName}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                {items.length > 4 ? (
                  <div className="mt-6 flex justify-center">
                    {/* 「もっと見る」ボタンのアイコンはSVGで描画し、フォント依存を避けます。 */}
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-full px-8 py-4 text-[13px] font-medium text-white shadow-[0_0_8px_rgba(106,115,120,0.15)]"
                      style={{ backgroundColor: courseMeta.buttonColor }}
                      onClick={() => toggleExpandedCourse(course.key)}
                    >
                      {showAll ? "閉じる" : "もっと見る"}
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
                    </button>
                  </div>
                ) : null}
              </section>
            )
          })}
        </div>
      )}

      {/* フッターは他ページでも使えるよう共通コンポーネントとして読み込みます。 */}
      <Footer className="mt-16 w-full px-4" />
    </div>
  )
}
