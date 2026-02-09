"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import Footer from "../../components/Footer"
import GlobalHeader from "../../components/GlobalHeader"
import { SkeletonLoader } from "../../components/SkeletonLoader"
import useSectionReveal from "../../components/useSectionReveal"

type ResearchDetailClientProps = {
  id: string
}

type Lab = {
  id: string
  name?: string | null
  official_name?: string | null
  keywords?: string | null
  course?: string | null
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

type Research = {
  id: string
  student_id: string
  title?: string | null
  summary?: string | null
  image_url?: string | null
  image_thumb_url?: string | null
  motivation?: string | null
  fun_in_research?: string | null
  hard_episode?: string | null
  want_to_continue?: string | null
  keywords?: string | null
  student?: Student | null
}

type SkeletonBlockProps = {
  className?: string
}

type CourseMeta = {
  key: string
  buttonColor: string
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
  "これはダミー文章です。研究内容の背景・狙い・検証結果などをここに記載します。"

const courseOrder: CourseMeta[] = [
  { key: "社会情報コース", buttonColor: "#0A948A" },
  { key: "UXコース", buttonColor: "#2C68D3" },
  { key: "プロダクトコース", buttonColor: "#D1346F" },
  { key: "その他", buttonColor: "#6A7378" },
]

const sliceKeywords = (keywords?: string | null) => {
  if (!keywords) return []
  // CSVの記入ゆれ（#, 空白, スラッシュなど）で区切られている場合も分割できるようにする。
  // 例: "#サービスデザイン#カスタマージャーニ＃共創デザイン", "情報デザイン  認知特性  多変量解析"
  return keywords
    .split(/[,、，#＃/\uFF0F\s\u3000]+/)
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .slice(0, 3)
}

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

const getCourseKey = (course?: string | null) => {
  if (!course) return "その他"
  return course
}

const getCourseMeta = (courseKey: string) => {
  return courseOrder.find((course) => course.key === courseKey) ?? courseOrder[3]
}

export default function ResearchDetailClient({
  id,
}: ResearchDetailClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [labs, setLabs] = useState<Lab[]>([])
  const [researchList, setResearchList] = useState<Research[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studentCareers, setStudentCareers] = useState<Career[]>([])
  // 進路セクションの見出しを先に出すため、初期値はローディング中にします。
  const [careerLoading, setCareerLoading] = useState(true)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const [labsRes, researchRes] = await Promise.all([
          fetch("/api/labs"),
          fetch("/api/research?include=student"),
        ])

        if (!labsRes.ok || !researchRes.ok) {
          throw new Error("Failed to fetch detail data.")
        }

        const [labsData, researchData] = await Promise.all([
          labsRes.json(),
          researchRes.json(),
        ])

        if (!active) return

        setLabs(labsData)
        setResearchList(researchData)
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

  const research = useMemo(() => {
    // CSV由来のIDに空白が混入している場合でも一致するように正規化する
    const normalizedId = id.trim()
    return (
      researchList.find((item) => (item.id ?? "").trim() === normalizedId) ??
      null
    )
  }, [researchList, id])

  const student = research?.student
  // 進路情報取得/表示の判定に使うため、学生IDを1箇所で確定させます。
  // CSV由来のIDに空白が混入するケースがあるため trim して正規化します。
  // 研究データに student_id があるケースと、student オブジェクトに id があるケースの両方を吸収します。
  const studentId = normalizeText(research?.student_id ?? student?.id) || null
  const lab = student?.lab_id ? labById.get(student.lab_id) : undefined
  const keywords = sliceKeywords(research?.keywords ?? lab?.keywords)
  const imageUrl = pickOriginalImage(research?.image_url, research?.image_thumb_url)
  // キーワードの背景色はコースカラーに合わせるため、ここでコース情報を確定します。
  const courseKey = getCourseKey(lab?.course)
  const courseMeta = getCourseMeta(courseKey)

  const qaItems = useMemo(() => {
    const items: { question: string; answer: string }[] = []
    if (research?.motivation) {
      items.push({
        question: "この研究をしようと思ったきっかけは？",
        answer: research.motivation,
      })
    }
    if (research?.fun_in_research) {
      items.push({
        question: "この研究をしていて楽しかったことは？",
        answer: research.fun_in_research,
      })
    }
    if (research?.hard_episode) {
      items.push({
        question: "この研究をしていて大変だったことは？",
        answer: research.hard_episode,
      })
    }
    if (research?.want_to_continue) {
      items.push({
        question: "今後この研究を続けるなら？",
        answer: research.want_to_continue,
      })
    }
    // 入力があるものだけ返して、空表示を避けます。
    return items.filter((item) => normalizeText(item.answer))
  }, [research])

  // 研究詳細ページの各セクションにスライドインを適用します。
  // 進路セクションは研究データ取得後に描画されるため、依存に含めて再観測します。
  useSectionReveal([studentId, careerLoading])

  useEffect(() => {
    if (!studentId) {
      // 研究データ取得中は studentId が未確定なため、ローディングは維持します。
      if (loading) return
      // 学生情報が無い場合は進路情報も取得できないためリセットします。
      setStudentCareers([])
      setCareerLoading(false)
      return
    }

    let active = true

    const loadStudent = async () => {
      try {
        setCareerLoading(true)
        // 進路情報を確実に取得し、公開ページでは非公開データを除外します。
        const res = await fetch(
          `/api/students/${encodeURIComponent(
            studentId,
          )}?include=careers&visibility=public`,
        )
        if (!res.ok) {
          throw new Error("Failed to fetch student data.")
        }
        const data = (await res.json()) as StudentDetail
        if (!active) return
        const careers = data.careers ?? []
        if (careers.length > 0) {
          setStudentCareers(careers)
          return
        }
        // 進路が空の場合は、student_id との紐付け不整合に備えてフォールバック取得します。
        // 既存データがある環境でのみ追加取得し、公開フィルタは維持します。
        const fallbackRes = await fetch("/api/careers?visibility=public")
        if (!fallbackRes.ok) {
          setStudentCareers([])
          return
        }
        const fallbackCareers = (await fallbackRes.json()) as Career[]
        if (!active) return
        const matchedCareers = fallbackCareers.filter(
          (career) => normalizeText(career.student_id) === studentId,
        )
        setStudentCareers(matchedCareers)
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
  }, [studentId, loading])

  const primaryCareer = studentCareers[0]
  const careerCompany = normalizeText(primaryCareer?.detail)
  const careerRole = normalizeText(primaryCareer?.job_type)
  const careerIndustry =
    normalizeText(primaryCareer?.industry) ||
    normalizeText(primaryCareer?.category_type)
  const careerCategory = normalizeText(primaryCareer?.category)
  const careerDescription =
    normalizeText(primaryCareer?.decision_reason) ||
    normalizeText(primaryCareer?.extra_notes)
  // 進路の取得中は見出し+スケルトンを表示し、取得後に進路が無ければセクションを消します。
  const shouldShowCareerSection = careerLoading || studentCareers.length > 0
  // 表示に使える値があるかどうかで内容の有無を判断します。
  const hasCareerContent =
    careerCompany ||
    careerRole ||
    careerIndustry ||
    careerCategory ||
    careerDescription

  const returnUrl = useMemo(() => {
    const params = new URLSearchParams()
    const returnTab = searchParams.get("returnTab")
    const focus = searchParams.get("focus")
    const lab = searchParams.get("lab")
    const course = searchParams.get("course")

    if (returnTab === "works") {
      params.set("tab", "works")
    }
    if (focus) params.set("focus", focus)
    if (lab) params.set("lab", lab)
    if (course) params.set("course", course)

    const suffix = params.toString()
    return suffix ? `/research?${suffix}` : "/research"
  }, [searchParams])

  return (
    <>
      {/* JSXコメントはフラグメント内に配置してパースエラーを防ぎます。 */}
      {/* トップページの見た目に揃えるため、詳細ページの背景を白に統一します。 */}
      {/* フッターが下端に揃うよう、コンテナに最小高さを追加します。 */}
      {/* モバイルは画面幅いっぱいに広げるため、最大幅の制限はmd以上に限定します。 */}
      <div className="mx-auto flex min-h-screen w-full flex-col bg-white md:max-w-[1200px] lg:max-w-[1280px]">
        {/* デスクトップは横幅のみ広げ、シングルカラムの構成は維持します。 */}
        {/* 全ページ共通のヘッダーを配置し、スクロール中も固定表示します。 */}
        <GlobalHeader activeId="research" />
        {/* 固定ヘッダーと内容が重ならないよう、詳細ページ全体の上余白を確保します。 */}
        <div className="pt-[84px] md:pt-[96px]">

      {/* モバイル版は見出しを非表示にし、デスクトップのみ表示します（依頼対応）。 */}
      <div className="hidden items-center justify-between px-4 pt-6 md:flex">
        <div className="flex items-center gap-3">
          <span className="h-6 w-2 rounded-[4px] bg-gradient-to-b from-[#FB9678] to-[#E5A967]" />
          <h1 className="text-[24px] font-extrabold tracking-[0.04em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            研究・作品紹介
          </h1>
        </div>
      </div>

      {/* メニューボタンは共通ヘッダー側で固定表示しています。 */}

      {/* 戻るボタンは一覧への導線として常に表示します。 */}
      <div className="px-4 md:px-[128px]">
        <button
          type="button"
          // 履歴がない場合に備えて一覧へフォールバックします。
          onClick={() => {
            if (searchParams.get("focus")) {
              router.push(returnUrl)
              return
            }
            if (window.history.length > 1) {
              router.back()
              return
            }
            router.push("/research")
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
      ) : !research && !loading ? (
        <div className="px-4 pb-12">
          <div className="rounded-2xl border border-[#EBEEF0] bg-white p-10 text-center text-sm text-[#6A7378]">
            対象の研究が見つかりませんでした。
          </div>
        </div>
      ) : (
        <>
          <section
            data-reveal
            className="px-4 pb-12 md:px-[128px] md:pb-[96px]"
          >
            <div className="flex flex-col gap-4 md:gap-5">
              {loading ? (
                <div className="flex flex-wrap gap-2">
                  <SkeletonBlock className="h-6 w-16 rounded-full" />
                  <SkeletonBlock className="h-6 w-20 rounded-full" />
                  <SkeletonBlock className="h-6 w-14 rounded-full" />
                </div>
              ) : keywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword) => (
                    <span
                      key={keyword}
                      // コース別カラーを反映して、研究一覧と同じ見た目に揃えます。
                      style={{ backgroundColor: courseMeta.buttonColor }}
                      className="rounded-full px-3 py-1 text-[12px] tracking-[0.02em] text-white"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              ) : null}

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
                    {/* research が null の可能性があるため、描画時は optional chaining で安全に参照する */}
                    <h2 className="text-[24px] font-extrabold leading-[1.5] tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[28px] md:tracking-[0.02em]">
                      {research?.title ?? "研究タイトル"}
                    </h2>
                    {/* 研究室名 + 氏名の行はFigma準拠の13px/Medium */}
                    {/* 研究室名と氏名は詳細ページでも左寄せに揃えます。 */}
                    <div className="flex flex-wrap justify-start gap-2 text-[13px] font-medium leading-[1.5] md:text-[15px]">
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
                  {research?.summary ?? PLACEHOLDER_BODY}
                </p>
              )}

              {/* 研究画像は画像の縦幅に合わせて表示します。 */}
              <div className="relative min-h-[160px] w-full overflow-hidden rounded-[4px] bg-[#EBEEF0]">
                {loading ? (
                  <SkeletonBlock className="absolute inset-0" />
                ) : imageUrl ? (
                  <SkeletonLoader
                    src={imageUrl}
                    alt=""
                    // 画像の縦幅に合わせて表示し、トリミングを避けます。
                    className="w-full"
                    imgClassName="h-auto w-full object-contain"
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
            </div>
          </section>

          {shouldShowCareerSection ? (
            <section data-reveal className="px-4 md:px-[128px]">
              <div className="bg-white px-6 py-12 md:px-[24px] md:py-[96px]">
                <div className="border-b border-[#14BDB1] pb-2">
                  <h3 className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                    進路
                  </h3>
                </div>
                <div className="py-6">
                  {careerLoading ? (
                    <div className="space-y-3">
                      {/* Q&A セクションのローディング様式に揃えます。 */}
                      <SkeletonBlock className="h-5 w-3/4 rounded-md" />
                      <div className="mt-3 space-y-2">
                        <SkeletonBlock className="h-4 w-full rounded-md" />
                        <SkeletonBlock className="h-4 w-11/12 rounded-md" />
                      </div>
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
                      {careerCategory ? (
                        <p className="mt-1 text-[13px] font-medium text-[#6A7378] md:text-[15px]">
                          {careerCategory}
                        </p>
                      ) : null}
                      {careerDescription ? (
                        <p className="mt-4 text-[15px] leading-[2.2] tracking-[0.04em] text-[#4B5459] md:text-[18px] md:tracking-[0.04em]">
                          {careerDescription}
                        </p>
                      ) : null}
                      {!hasCareerContent ? (
                        <p className="mt-4 text-[13px] leading-[1.9] tracking-[0.02em] text-[#6A7378] md:text-[15px]">
                          進路情報は準備中です。
                        </p>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </section>
          ) : null}

          {loading || qaItems.length > 0 ? (
            <section data-reveal className="px-4 md:px-[128px]">
              <div className="bg-white px-6 py-12 md:px-[24px] md:py-[96px]">
                <div className="border-b border-[#14BDB1] pb-2">
                  <h3 className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                    Q&amp;A
                  </h3>
                </div>
                <div className="divide-y divide-[#EBEEF0]">
                  {loading ? (
                    [0, 1].map((index) => (
                      <div key={`qa-skel-${index}`} className="py-4">
                        <SkeletonBlock className="h-5 w-3/4 rounded-md" />
                        <div className="mt-3 space-y-2">
                          <SkeletonBlock className="h-4 w-full rounded-md" />
                          <SkeletonBlock className="h-4 w-11/12 rounded-md" />
                        </div>
                      </div>
                    ))
                  ) : (
                    qaItems.map((item, index) => (
                      <div key={`${item.question}-${index}`} className="py-4">
                        <p className="text-[16px] font-medium text-[#0A948A] md:text-[20px]">
                          {item.question}
                        </p>
                        <p className="mt-2 text-[13px] leading-[1.9] tracking-[0.02em] text-[#4B5459] md:text-[16px]">
                          {item.answer}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          ) : null}

          <div className="flex justify-center px-4 py-12 md:px-[16px] md:py-[96px]">
            <button
              type="button"
              // 一覧へ戻る導線も、直前のページへ戻れる場合は優先します。
              onClick={() => {
                if (searchParams.get("focus")) {
                  router.push(returnUrl)
                  return
                }
                if (window.history.length > 1) {
                  router.back()
                  return
                }
                router.push("/research")
              }}
              className="flex items-center gap-2 rounded-full border border-[#A3ADB2] px-8 py-4 text-[13px] font-medium text-[#4B5459] shadow-[0_0_8px_rgba(106,115,120,0.15)]"
            >
              一覧へ戻る
              {/* Figma指定のアイコンに差し替えます。 */}
              <img
                src="/icon/signal_cellular_alt.svg"
                alt=""
                className="h-3 w-3"
              />
            </button>
          </div>
        </>
      )}

        {/* デスクトップのフッターは左右128pxの余白に合わせます。 */}
        {/* フッターはモバイルで全幅表示にするため、左右余白はmd以上に限定します。 */}
        <Footer className="w-full md:px-[128px]" />
        </div>
      </div>
    </>
  )
}
