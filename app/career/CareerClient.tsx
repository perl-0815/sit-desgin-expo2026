"use client"

import { useMemo, useEffect, useState } from "react"

import CareerPieChart from "../components/CareerPieChart"
import Footer from "../components/Footer"
import NavigationMenu from "../components/NavigationMenu"

type JobCategory = {
  title: string
  percentage: number
  items: string[]
}

type ReasonCard = {
  text: string
  labels?: string[]
}

type GradReasonCard = {
  text: string
  course: string
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
  visibility?: string | null
  student?: {
    student_no?: string | null
    lab?: {
      course?: string | null
    } | null
  } | null
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

const menuItems = [
  { id: "top", label: "TOP", href: "/" },
  { id: "research", label: "研究紹介", href: "/research" },
  { id: "works", label: "作品紹介", href: "/research?tab=works" },
  { id: "career", label: "卒業生の進路", href: "/career" },
  { id: "events", label: "イベント", href: "/events" },
  { id: "contact", label: "お問い合わせ", href: "/contact" },
]

const normalizeText = (value?: string | null) => value?.trim() ?? ""

const buildJobLabel = (career: Career) => {
  // 主な就職先は「企業名（detail）」がある場合のみ表示します。
  const company = normalizeText(career.detail)
  return company || ""
}

const resolveJobCategory = (career: Career) => {
  // 主な就職先の分類は category_type を優先し、未入力の場合のみ「その他」にまとめます。
  const raw = normalizeText(career.category_type)
  return raw || "その他"
}

const toUniqueList = (items: string[], limit = 5) => {
  const seen = new Set<string>()
  const results: string[] = []
  items.forEach((item) => {
    if (!item || seen.has(item)) return
    seen.add(item)
    results.push(item)
  })
  return results.slice(0, limit)
}

const buildJobLabels = (career: Career) => {
  // ラベルは「職種」「業界」の具体値を表示します。
  const jobType = normalizeText(career.job_type)
  // 業界ラベルは業種を優先し、未入力時のみカテゴリ分類にフォールバックします。
  const industry =
    normalizeText(career.industry) || normalizeText(career.category_type)
  return [
    jobType ? `${jobType}` : "",
    industry ? ` ${industry}` : "",
  ].filter(Boolean)
}

const buildCourseLabel = (career: Career) => {
  // 進学理由のコース表示は研究室のコースを優先し、なければカテゴリ種別を使います。
  return (
    normalizeText(career.student?.lab?.course) ||
    normalizeText(career.category_type)
  )
}

export default function CareerClient() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [careers, setCareers] = useState<Career[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // 主な就職先のフィルタ: 大学院生（cy20XXX）を含めるかどうかを切り替えます。
  const [includeGraduate, setIncludeGraduate] = useState(true)
  // 「もっと見る」制御: 就職先の決め手/大学院進学の理由で5件超えた場合に展開します。
  const [showAllJobReasons, setShowAllJobReasons] = useState(false)
  const [showAllGradReasons, setShowAllGradReasons] = useState(false)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        // 非公開データを除外するため、公開指定付きでキャリアAPIを取得します。
        const res = await fetch("/api/careers?visibility=public&include=student")
        if (!res.ok) {
          throw new Error("Failed to fetch career data.")
        }
        const data = (await res.json()) as Career[]
        if (!active) return
        setCareers(data)
      } catch (fetchError) {
        if (!active) return
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to fetch career data."
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

  const careerStats = useMemo(() => {
    // 非公開を除外したデータで進路別の割合を算出します。
    const total = careers.length
    let gradCount = 0
    let jobCount = 0
    let otherCount = 0

    careers.forEach((career) => {
      const category = normalizeText(career.category)
      if (category.includes("大学院")) {
        gradCount += 1
      } else if (category.includes("就職")) {
        jobCount += 1
      } else {
        otherCount += 1
      }
    })

    const toPercent = (count: number) =>
      total > 0 ? (count / total) * 100 : 0

    return {
      total,
      gradCount,
      jobCount,
      otherCount,
      gradPercent: toPercent(gradCount),
      jobPercent: toPercent(jobCount),
      otherPercent: toPercent(otherCount),
    }
  }, [careers])

  const jobCategories = useMemo((): JobCategory[] => {
    // 就職者のみを抽出し、カテゴリごとの割合と主要就職先をまとめます。
    const jobCareers = careers.filter((career) => {
      if (!normalizeText(career.category).includes("就職")) return false
      if (includeGraduate) return true
      // 学籍番号がcy20XXXの場合は大学院生扱いとして除外します。
      const studentNo = normalizeText(career.student?.student_no)
      return !studentNo.startsWith("cy20")
    })
    const total = jobCareers.length
    const grouped = new Map<string, { count: number; items: string[] }>()

    jobCareers.forEach((career) => {
      const label = resolveJobCategory(career)
      const item = buildJobLabel(career)
      if (!grouped.has(label)) {
        grouped.set(label, { count: 0, items: [] })
      }
      const group = grouped.get(label)
      if (!group) return
      group.count += 1
      if (item) {
        group.items.push(item)
      }
    })

    // 主な就職先は割合に関わらず、デザイン→エンジニア→その他の順で固定表示します。
    const order = ["デザイナー系", "エンジニア系", "その他"]
    const categories = Array.from(grouped.entries())
      .sort((a, b) => {
        const aIndex = order.indexOf(a[0])
        const bIndex = order.indexOf(b[0])
        if (aIndex === -1 && bIndex === -1) return a[0].localeCompare(b[0])
        if (aIndex === -1) return 1
        if (bIndex === -1) return -1
        return aIndex - bIndex
      })
      .map(([title, group]) => ({
        title,
        percentage: total > 0 ? (group.count / total) * 100 : 0,
        items: toUniqueList(group.items, 12),
      }))

    return categories
  }, [careers, includeGraduate])

  const jobDecisionReasons = useMemo((): ReasonCard[] => {
    // 就職者の「決め手」は decision_reason から取得し、対応する職種・業界ラベルを付与します。
    const reasons = careers
      .filter((career) => normalizeText(career.category).includes("就職"))
      .map((career) => ({
        text: normalizeText(career.decision_reason),
        labels: buildJobLabels(career),
      }))
      .filter((reason) => reason.text)

    const seen = new Set<string>()
    const results: ReasonCard[] = []
    reasons.forEach((reason) => {
      if (seen.has(reason.text)) return
      seen.add(reason.text)
      results.push({
        text: reason.text,
        labels: reason.labels.length > 0 ? reason.labels : undefined,
      })
    })

    return results
  }, [careers])

  const gradReasons = useMemo((): GradReasonCard[] => {
    // 大学院進学の理由は extra_notes を優先し、なければ decision_reason を補助に使います。
    const reasons = careers
      .filter((career) => normalizeText(career.category).includes("大学院"))
      .map((career) => ({
        text:
          normalizeText(career.extra_notes) ||
          normalizeText(career.decision_reason),
        course: buildCourseLabel(career),
      }))
      .filter((reason) => reason.text && reason.course)

    const seen = new Set<string>()
    const results: GradReasonCard[] = []
    reasons.forEach((reason) => {
      if (seen.has(reason.text)) return
      seen.add(reason.text)
      results.push({ text: reason.text, course: reason.course })
    })

    return results
  }, [careers])

  return (
    <div className="mx-auto flex w-full max-w-[393px] flex-col bg-[#F9F9F9] pb-16 text-[#2E3437]">
      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 flex justify-center bg-[#F9F9F9]">
          <NavigationMenu
            items={menuItems}
            activeId="career"
            onClose={() => setIsMenuOpen(false)}
          />
        </div>
      ) : null}

      {/* Figmaのヘッダー構成に合わせ、左のグラデーションバーとメニューボタンを配置します。 */}
      <div className="flex items-center justify-between px-4 pt-6">
        <div className="flex items-center gap-3">
          <span className="h-6 w-2 rounded-[4px] bg-gradient-to-b from-[#FB9678] to-[#E5A967]" />
          <h1 className="text-[24px] font-extrabold tracking-[0.04em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            卒業生の進路
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

      {/* リード文はFigmaの行間と字間を再現して読みやすく整えます。 */}
      <div className="px-4 pt-6">
        <p className="text-[15px] leading-[2.2] tracking-[0.04em] text-[#4B5459]">
          卒業生のほとんどは本学大学院への進学、もしくは就職をしています。就職をする学生は、多くがデザイナーやエンジニアとして活躍予定です。
        </p>
        {error ? (
          <p className="mt-3 text-[13px] text-[#D04C4C]">
            進路データの取得に失敗しました。
          </p>
        ) : null}
      </div>

      {/* 進路別の割合セクションは円グラフと注釈をまとめて表示します。 */}
      <section className="px-4 pb-12 pt-12">
        <div className="border-b border-[#FB9678] pb-1">
          <h2 className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            進路別の割合
          </h2>
        </div>
        <div className="mt-8 flex justify-center">
          <div className="relative">
            {/* 円グラフ本体は既存コンポーネントを流用して統一します。 */}
            {loading ? (
              <SkeletonBlock className="h-40 w-40 rounded-full" />
            ) : (
              <CareerPieChart
                gradPercent={careerStats.gradPercent}
                jobPercent={careerStats.jobPercent}
                otherPercent={careerStats.otherPercent}
                total={careerStats.total}
              />
            )}
          </div>
        </div>
        <p className="mt-4 text-[12px] leading-[1.6] tracking-[0.02em] text-[#6A7378]">
          ※卒業・修了研究展に出展する学生の進路の割合です。デザイン工学部全体の進路の割合とは異なる可能性があります。
        </p>
      </section>

      {/* 就職先一覧はカテゴリごとにまとめ、Figmaのカード構成に合わせます。 */}
      <section className="px-4 py-12">
        <div className="flex items-center justify-between border-b border-[#FB9678] pb-1">
          <h2 className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            主な就職先
          </h2>
          {/* Figmaのチェックボックスに合わせ、アイコン+ラベルの余白とサイズを固定します。 */}
          <button
            type="button"
            className="flex items-center gap-[6px]"
            aria-pressed={includeGraduate}
            onClick={() => setIncludeGraduate((prev) => !prev)}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center">
              {includeGraduate ? (
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-[6px] bg-gradient-to-br from-[#FB9678] to-[#E5A967]">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-[18px] w-[18px]"
                    fill="none"
                  >
                    <path
                      d="M6 12.5L10 16.5L18 8.5"
                      stroke="#F9F9F9"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              ) : (
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#EBEEF0] p-[2px]">
                  <span className="h-full w-full rounded-[4px] bg-[#F9F9F9]" />
                </span>
              )}
            </span>
            <span className="text-[13px] font-medium leading-[1.5] text-[#2E3437]">
              大学院生を含める
            </span>
          </button>
        </div>
        <p className="mt-2 text-[13px] leading-[1.9] tracking-[0.02em] text-[#4B5459]">
          就職する人の多くが、デザイナーもしくはエンジニアになっています。
        </p>

        {loading ? (
          <>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`job-skel-${index}`} className="mt-6">
                <SkeletonBlock className="h-6 w-48 rounded-md" />
                <SkeletonBlock className="mt-3 h-28 w-full rounded-[12px]" />
              </div>
            ))}
          </>
        ) : jobCategories.length > 0 ? (
          jobCategories.map((category) => (
            <div key={category.title} className="mt-6">
              {/* 見出し行は数値を強調し、Figmaのタイポグラフィを踏襲します。 */}
              <p className="text-[16px] font-medium text-[#2E3437]">
                <span className="leading-[1.5]">{category.title}　</span>
                <span className="text-[24px] font-bold text-[#D3793D] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                  {category.percentage.toFixed(1)}
                </span>
                <span className="text-[16px] font-bold text-[#D3793D] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                  %
                </span>
              </p>
              <div className="mt-2 rounded-[12px] border border-[#EBEEF0] bg-[#EBEEF0] px-3 py-3 text-[15px] leading-[2.2] tracking-[0.04em] text-[#4B5459]">
                <ul className="list-disc pl-6">
                  {category.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-2 text-right text-[13px] leading-[1.9] tracking-[0.02em] text-[#4B5459]">
                  など
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="mt-6 text-[13px] leading-[1.9] text-[#6A7378]">
            公開対象の就職先データがまだありません。
          </p>
        )}
      </section>

      {/* 就職先の決め手はカード形式で複数項目を並べ、読みやすさを優先します。 */}
      <section className="px-4 py-12">
        <div className="border-b border-[#FB9678] pb-1">
          <h2 className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            就職先の決めて
          </h2>
        </div>
        <div className="mt-4 space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`job-reason-skel-${index}`}
                className="rounded-[12px] border border-[#EBEEF0] bg-[#EBEEF0] px-3 py-3"
              >
                <div className="space-y-2">
                  <SkeletonBlock className="h-4 w-full rounded-md" />
                  <SkeletonBlock className="h-4 w-10/12 rounded-md" />
                </div>
                <div className="mt-3 flex justify-end gap-3">
                  <SkeletonBlock className="h-4 w-20 rounded-md" />
                  <SkeletonBlock className="h-4 w-16 rounded-md" />
                </div>
              </div>
            ))
          ) : jobDecisionReasons.length > 0 ? (
            // 表示件数を5件に制限し、ボタン操作で全件表示に切り替えます。
            (showAllJobReasons
              ? jobDecisionReasons
              : jobDecisionReasons.slice(0, 5)
            ).map((reason) => (
              <div
                key={reason.text}
                className="rounded-[12px] border border-[#EBEEF0] bg-[#EBEEF0] px-3 py-3 text-[13px] leading-[1.9] tracking-[0.02em] text-[#2E3437]"
              >
                <p>{reason.text}</p>
                {reason.labels ? (
                  <div className="mt-2 flex justify-end gap-3 text-[13px] font-medium text-[#4B5459]">
                    {reason.labels.map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div
              className="rounded-[12px] border border-[#EBEEF0] bg-[#EBEEF0] px-3 py-3 text-[13px] leading-[1.9] tracking-[0.02em] text-[#2E3437]"
            >
              公開対象の決め手データがまだありません。
            </div>
          )}
        </div>
        {!loading && jobDecisionReasons.length > 5 ? (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-[#FB9678] bg-[#F9F9F9] px-8 py-4 text-[13px] font-medium text-[#4B5459] shadow-[0_0_8px_rgba(106,115,120,0.15)]"
              onClick={() => setShowAllJobReasons((prev) => !prev)}
            >
              {showAllJobReasons ? "閉じる" : "もっと見る"}
              <span className="text-[16px] leading-none">
                {showAllJobReasons ? "×" : "+"}
              </span>
            </button>
          </div>
        ) : null}
      </section>

      {/* 大学院進学の理由は別セクションとしてまとめ、同じカードUIを使い回します。 */}
      <section className="px-4 py-12">
        <div className="border-b border-[#FB9678] pb-1">
          <h2 className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            本学大学院進学の理由
          </h2>
        </div>
        <div className="mt-4 space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`grad-reason-skel-${index}`}
                className="rounded-[12px] border border-[#EBEEF0] bg-[#EBEEF0] px-3 py-3"
              >
                <div className="space-y-2">
                  <SkeletonBlock className="h-4 w-full rounded-md" />
                  <SkeletonBlock className="h-4 w-10/12 rounded-md" />
                </div>
                <div className="mt-3 flex justify-end">
                  <SkeletonBlock className="h-4 w-24 rounded-md" />
                </div>
              </div>
            ))
          ) : gradReasons.length > 0 ? (
            // 表示件数を5件に制限し、ボタン操作で全件表示に切り替えます。
            (showAllGradReasons ? gradReasons : gradReasons.slice(0, 5)).map(
              (reason) => (
              <div
                key={reason.text}
                className="rounded-[12px] border border-[#EBEEF0] bg-[#EBEEF0] px-3 py-3 text-[13px] leading-[1.9] tracking-[0.02em] text-[#2E3437]"
              >
                <p>{reason.text}</p>
                <div className="mt-2 flex justify-end text-[13px] font-medium text-[#4B5459]">
                  <span>{reason.course}</span>
                </div>
              </div>
              ),
            )
          ) : (
            <div
              className="rounded-[12px] border border-[#EBEEF0] bg-[#EBEEF0] px-3 py-3 text-[13px] leading-[1.9] tracking-[0.02em] text-[#2E3437]"
            >
              公開対象の進学理由データがまだありません。
            </div>
          )}
        </div>
        {!loading && gradReasons.length > 5 ? (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-[#FB9678] bg-[#F9F9F9] px-8 py-4 text-[13px] font-medium text-[#4B5459] shadow-[0_0_8px_rgba(106,115,120,0.15)]"
              onClick={() => setShowAllGradReasons((prev) => !prev)}
            >
              {showAllGradReasons ? "閉じる" : "もっと見る"}
              <span className="text-[16px] leading-none">
                {showAllGradReasons ? "×" : "+"}
              </span>
            </button>
          </div>
        ) : null}
      </section>

      <Footer />
    </div>
  )
}
