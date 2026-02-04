"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"

import Footer from "../../components/Footer"
import NavigationMenu from "../../components/NavigationMenu"

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

const PLACEHOLDER_BODY =
  "これはダミー文章です。研究内容の背景・狙い・検証結果などをここに記載します。"

const menuItems = [
  { id: "top", label: "TOP", href: "/" },
  { id: "research", label: "研究紹介", href: "/research" },
  { id: "works", label: "作品紹介", href: "/research?tab=works" },
  { id: "career", label: "卒業生の進路", href: "/career" },
  { id: "events", label: "イベント", href: "/events" },
  { id: "contact", label: "お問い合わせ", href: "/contact" },
]

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

const pickOriginalImage = (original?: string | null, thumb?: string | null) => {
  // 詳細ページは元画像を優先し、相対パスしかない場合は絶対URLを選ぶ
  if (isAbsoluteUrl(original)) return original
  if (isAbsoluteUrl(thumb)) return thumb
  return original || thumb || null
}

export default function ResearchDetailClient({
  id,
}: ResearchDetailClientProps) {
  // 右上メニューの開閉状態を管理します。
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [labs, setLabs] = useState<Lab[]>([])
  const [researchList, setResearchList] = useState<Research[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
  const lab = student?.lab_id ? labById.get(student.lab_id) : undefined
  const keywords = sliceKeywords(research?.keywords ?? lab?.keywords)
  const imageUrl = pickOriginalImage(research?.image_url, research?.image_thumb_url)

  // 詳細ページでは進路情報を扱わないため、キャリアデータの取得は行いません。

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
    return items
  }, [research])

  return (
    // トップページの見た目に揃えるため、詳細ページの背景を白に統一します。
    <div className="mx-auto flex w-full max-w-[393px] flex-col bg-white pb-16">
      {/* 右上メニューは画面全体に重ねて表示します。 */}
      {isMenuOpen ? (
        // メニュー展開時の背面も白背景にしてトーンを合わせます。
        <div className="fixed inset-0 z-50 flex justify-center bg-white">
          <NavigationMenu
            items={menuItems}
            activeId="research"
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

      {/* 戻るボタンは一覧への導線として常に表示します。 */}
      <Link
        href="/research"
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
            研究詳細を読み込み中...
          </div>
        </div>
      ) : error ? (
        <div className="px-4 pb-12">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
            {error}
          </div>
        </div>
      ) : !research ? (
        <div className="px-4 pb-12">
          <div className="rounded-2xl border border-[#EBEEF0] bg-white p-10 text-center text-sm text-[#6A7378]">
            対象の研究が見つかりませんでした。
          </div>
        </div>
      ) : (
        <>
          <section className="px-4 pb-12">
            <div className="flex flex-col gap-4">
              {keywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full bg-[#0A948A] px-3 py-1 text-[12px] tracking-[0.02em] text-white"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="space-y-1">
                {/* Figmaのタイトルタイポ（24px・字間0.02em）に合わせる */}
                <h2 className="text-[24px] font-extrabold leading-[1.5] tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                  {research.title ?? "研究タイトル"}
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
                {research.summary ?? PLACEHOLDER_BODY}
              </p>

              {/* 研究画像は16:9の高さ204px想定 */}
              <div className="relative h-[204px] w-full overflow-hidden rounded-[4px] bg-[#EBEEF0]">
                {imageUrl ? (
                  <img
                    alt=""
                    src={imageUrl}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-[12px] text-[#A3ADB2]">
                    No Image
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 詳細ページでは進路情報を一律で非表示にする方針のため、セクション自体を描画しません。 */}

          <section className="px-4 pb-12">
            <div className="border-b border-[#14BDB1] pb-2">
              <h3 className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                Q&amp;A
              </h3>
            </div>
            <div className="divide-y divide-[#EBEEF0]">
              {(qaItems.length > 0
                ? qaItems
                : [
                    {
                      question: "この研究をしようと思ったきっかけは？",
                      answer: PLACEHOLDER_BODY,
                    },
                  ]
              ).map((item, index) => (
                <div key={`${item.question}-${index}`} className="py-4">
                  <p className="text-[16px] font-medium text-[#0A948A]">
                    {item.question}
                  </p>
                  <p className="mt-2 text-[13px] leading-[1.9] tracking-[0.02em] text-[#4B5459]">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-center px-4 pb-12">
            <Link
              href="/research"
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

      <Footer className="mt-8 w-full px-4" />
    </div>
  )
}
