"use client"

import { useMemo, useState, useEffect } from "react"

const courseOrder = [
  { key: "社会情報コース", label: "社会情報システムコース", accent: "bg-emerald-500" },
  { key: "UXコース", label: "UXコース", accent: "bg-blue-500" },
  { key: "プロダクトコース", label: "プロダクトコース", accent: "bg-pink-500" },
  { key: "その他", label: "その他", accent: "bg-zinc-400" },
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
  student?: Student | null
}

type Portfolio = {
  id: string
  student_id: string
  title1?: string | null
  summary1?: string | null
  title2?: string | null
  summary2?: string | null
  student?: Student | null
}

type WorkItem = {
  id: string
  title: string
  summary: string
  studentName: string
  courseKey: string
}

type ResearchItem = {
  id: string
  title: string
  summary: string
  studentName: string
  courseKey: string
}

const PLACEHOLDER_SUMMARY =
  "研究または作品の概要が入ります。詳細は個別ページでご紹介します。"

const getCourseKey = (course?: string | null) => {
  if (!course) return "その他"
  return course
}

const sliceKeywords = (keywords?: string | null) => {
  if (!keywords) return []
  return keywords
    .split(/[,、]/)
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .slice(0, 3)
}

export default function ResearchWorksClient() {
  const [activeTab, setActiveTab] = useState<"research" | "works">("research")
  const [labs, setLabs] = useState<Lab[]>([])
  const [research, setResearch] = useState<Research[]>([])
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>(
    {},
  )

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
      const lab = student?.lab_id ? labById.get(student.lab_id) : undefined
      const courseKey = getCourseKey(lab?.course)
      return {
        id: item.id,
        title: item.title ?? "研究タイトル",
        summary: item.summary ?? PLACEHOLDER_SUMMARY,
        studentName: student?.name ?? "苗字 名前",
        courseKey,
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
        })
      }

      if (portfolio.title2) {
        items.push({
          id: `${portfolio.id}-2`,
          title: portfolio.title2,
          summary: portfolio.summary2 ?? PLACEHOLDER_SUMMARY,
          studentName,
          courseKey,
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
    return courseOrder.filter((course) => {
      if (activeTab === "research") {
        return (researchByCourse.get(course.key)?.length ?? 0) > 0
      }
      return (worksByCourse.get(course.key)?.length ?? 0) > 0
    })
  }, [activeTab, researchByCourse, worksByCourse])

  const toggleExpanded = (courseKey: string) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseKey]: !prev[courseKey],
    }))
  }

  return (
    <div className="mt-10 flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-6 w-2 rounded-full bg-orange-400" />
          <h1 className="text-2xl font-semibold tracking-tight">
            研究・作品紹介
          </h1>
        </div>
        <button
          className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 text-zinc-600"
          type="button"
          aria-label="メニュー"
        >
          ☰
        </button>
      </div>

      <div className="rounded-[77px] border border-[#14BDB1] bg-[#F9F9F9] p-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === "research"
                ? "bg-white text-zinc-900 shadow"
                : "text-zinc-500"
            }`}
            onClick={() => setActiveTab("research")}
          >
            研究
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === "works"
                ? "bg-white text-zinc-900 shadow"
                : "text-zinc-500"
            }`}
            onClick={() => setActiveTab("works")}
          >
            作品
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 p-10 text-center text-sm text-zinc-500">
          研究・作品データを読み込み中...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          {error}
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {visibleCourses.map((course) => {
            const items =
              activeTab === "research"
                ? researchByCourse.get(course.key) ?? []
                : worksByCourse.get(course.key) ?? []

            const showAll = expandedCourses[`${activeTab}-${course.key}`]
            const visibleItems = showAll ? items : items.slice(0, 4)

            return (
              <section key={`${activeTab}-${course.key}`} className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className={`h-1 w-10 rounded-full ${course.accent}`} />
                  <h2 className="text-xl font-semibold">{course.label}</h2>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {visibleItems.map((item) => (
                    <article
                      key={item.id}
                      className="flex flex-col gap-3"
                    >
                      <div className="relative aspect-video w-full rounded-2xl bg-zinc-100 text-center text-sm font-semibold text-zinc-400">
                        <div className="absolute inset-0 grid place-items-center">
                          No Image
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-zinc-900">
                          {item.title}
                        </h3>
                        <p className="text-sm text-zinc-500">
                          {item.summary}
                        </p>
                      </div>
                      <p className="text-xs text-zinc-500">
                        {item.studentName}
                      </p>
                    </article>
                  ))}
                </div>

                {items.length > 4 ? (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      className={`flex items-center gap-2 rounded-full px-6 py-2 text-sm font-semibold text-white ${course.accent}`}
                      onClick={() =>
                        toggleExpanded(`${activeTab}-${course.key}`)
                      }
                    >
                      {showAll ? "閉じる" : "もっと見る"}
                      <span className="text-lg">+</span>
                    </button>
                  </div>
                ) : null}

                {activeTab === "research" ? (
                  <div className="space-y-4 border-t border-zinc-100 pt-6">
                    <p className="text-sm font-semibold text-zinc-700">
                      研究室一覧
                    </p>
                    <div className="space-y-4">
                      {(labsByCourse.get(course.key) ?? []).map((lab) => (
                        <div
                          key={lab.id}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-100 px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-zinc-900">
                              {lab.official_name ?? lab.name ?? "研究室"}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {sliceKeywords(lab.keywords).map((keyword) => (
                                <span
                                  key={`${lab.id}-${keyword}`}
                                  className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-500"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-zinc-300">+</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
