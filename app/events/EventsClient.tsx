"use client"

import Footer from "../components/Footer"
import GlobalHeader from "../components/GlobalHeader"
import useSectionReveal from "../components/useSectionReveal"

// イベントページはスクリーンショットに合わせて簡潔な「準備中」レイアウトに置き換えます。
// 旧実装は下部にコメントアウトで残し、再利用できるように保持しています。
export default function EventsClient() {
  // イベントページの各セクションにスライドインを適用します。
  useSectionReveal()
  return (
    // ページ全体は淡いグレーを敷き、白背景のギャップを目立たせないようにします。
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* 研究・作品紹介ページに合わせて、外側の最大幅と中央寄せを統一します。 */}
      {/* モバイルは画面幅いっぱいに広げるため、最大幅の制限はmd以上に限定します。 */}
      <div className="relative mx-auto flex min-h-screen w-full flex-col bg-[#F9F9F9] md:max-w-[1280px]">
        {/* ヘッダーは既存コンポーネントを使い回します。 */}
        <GlobalHeader activeId="events" />
        {/* 固定ヘッダーと本文が重ならないよう、上部に余白を確保します。 */}
        <div className="pt-[84px] md:pt-[96px]">
          {/* 見出しはオレンジのバーと明朝系フォントで揃えます。 */}
          {/* デスクトップの左右ガイド余白は研究・作品紹介ページの128pxに揃えます。 */}
          {/* 他ページの見出しブロックと同じ余白に合わせます。 */}
          <section data-reveal className="px-4 pt-6 md:px-[128px] md:pt-[36px]">
            <div className="flex items-center gap-3">
              <span className="h-[32px] w-2 rounded-[4px] bg-gradient-to-b from-[#FB9678] to-[#E5A967]" />
              <h1 className="text-[24px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                イベント
              </h1>
            </div>
            {/* デスクトップ時は説明文の改行を抑えるため、最大幅を広げます。 */}
            <p className="mt-6 text-[15px] leading-[2.2] text-[#4B5459] md:text-[16px]">
              現在このページは準備中です。卒業生と直接コミュニケーションをとることができる座談会や、体験展示イベントを予定しています。
            </p>
          </section>

          {/* 「Coming Soon」エリアは角丸の大きなカードで、PC/モバイル共通の雰囲気を保ちます。 */}
          {/* コンテンツカードも同じガイド幅で揃えて全体の統一感を出します。 */}
          <section data-reveal className="mt-8 px-4 pb-16 md:px-[128px]">
            <div className="flex h-[240px] items-center justify-center rounded-[24px] border border-[#E6E9EC] bg-[#ECEFF1] px-6 text-center shadow-[0_8px_24px_rgba(46,52,55,0.08)] md:h-[420px]">
              <div className="space-y-3">
                <p className="text-[22px] font-semibold tracking-[0.06em] text-[#6A7378] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[28px]">
                  Coming Soon...
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* フッターも既存コンポーネントを使い回します。 */}
        <Footer />
      </div>
    </div>
  )
}

// ---------------------------------------------
// 旧実装（コメントアウト保持）
// Figma準拠の新レイアウトへ切り替えたため、以前の実装は以下に保存しています。
// ---------------------------------------------
// "use client"
// 
// import { useEffect, useMemo, useState } from "react"
// import Link from "next/link"
// 
// import Footer from "../components/Footer"
// import GlobalHeader from "../components/GlobalHeader"
// 
// type EventTab = "roundtable" | "exhibition"
// 
// type ScheduleSlot = {
//   id: string
//   time: string
//   remaining?: string
//   isFull?: boolean
// }
// 
// type ScheduleDay = {
//   id: string
//   label: string
//   isExpanded: boolean
//   slots: ScheduleSlot[]
// }
// 
// type ExhibitionCard = {
//   id: string
//   title: string
//   author: string
//   image: string
// }
// 
// type ApiRoundtableSession = {
//   id: string
//   start_at: string
//   end_at: string
//   capacity?: number | null
//   remaining?: number | null
//   is_full?: boolean | null
//   sort_order?: number | null
// }
// 
// type ApiRoundtable = {
//   id: string
//   title?: string | null
//   description?: string | null
//   location?: string | null
//   schedule_note?: string | null
//   sessions?: ApiRoundtableSession[]
// }
// 
// type ApiExhibition = {
//   id: string
//   title?: string | null
//   description?: string | null
//   author?: string | null
//   image_url?: string | null
//   image_thumb_url?: string | null
//   sort_order?: number | null
// }
// 
// type RoundtableContent = {
//   title: string
//   description: string
//   location: string
//   scheduleNote: string
//   sessions: ApiRoundtableSession[]
// }
// 
// type SkeletonBlockProps = {
//   className?: string
// }
// 
// const SkeletonBlock = ({ className = "" }: SkeletonBlockProps) => {
//   // ローディング時のプレースホルダーを統一するための簡易スケルトンです。
//   return (
//     <div className={`relative overflow-hidden bg-[#f0f2f3] ${className}`}>
//       <div className="absolute inset-0 skeleton-shimmer bg-linear-to-r from-transparent via-white/30 to-transparent" />
//     </div>
//   )
// }
// 
// const fallbackRoundtable: RoundtableContent = {
//   title: "卒業生との座談会",
//   description:
//     "これはダミー文章です。これから入学する大学がどんなところか知りたい高校生や、先輩がどんなことをしていたか知りたい在学生のための座談会です。",
//   location: "交流プラザ",
//   scheduleNote: "3/8(日),3/14(土),3/15(日)の午前・午後1回ずつ",
//   sessions: [],
// }
// 
// const fallbackExhibitions: ExhibitionCard[] = Array.from({ length: 6 }).map(
//   (_, index) => ({
//     id: `exhibition-${index + 1}`,
//     title: "体験展示のタイトルが入ります。体験展示のタイトルが入ります。",
//     author: "苗字 名前",
//     image: "/image/event_background.png",
//   }),
// )
// 
// // イベントページのタブ内容をまとめて管理し、Figmaの画面切り替えを再現します。
// export default function EventsClient() {
//   const [activeTab, setActiveTab] = useState<EventTab>("roundtable")
//   const [isLoading, setIsLoading] = useState(true)
//   const [loadError, setLoadError] = useState<string | null>(null)
//   const [roundtable, setRoundtable] = useState<RoundtableContent>(
//     fallbackRoundtable,
//   )
//   const [exhibitions, setExhibitions] =
//     useState<ExhibitionCard[]>(fallbackExhibitions)
//   const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({
//     "day-1": true,
//   })
// 
//   useEffect(() => {
//     let active = true
// 
//     const load = async () => {
//       try {
//         setIsLoading(true)
//         setLoadError(null)
// 
//         const [roundtableRes, exhibitionRes] = await Promise.all([
//           fetch("/api/events/roundtables"),
//           fetch("/api/events/exhibitions"),
//         ])
// 
//         if (!roundtableRes.ok || !exhibitionRes.ok) {
//           throw new Error("Failed to fetch event data.")
//         }
// 
//         const [roundtableData, exhibitionData] = await Promise.all([
//           roundtableRes.json(),
//           exhibitionRes.json(),
//         ])
// 
//         if (!active) return
// 
//         if (Array.isArray(roundtableData) && roundtableData.length > 0) {
//           const primary = roundtableData[0] as ApiRoundtable
//           setRoundtable({
//             title: primary.title?.trim() || fallbackRoundtable.title,
//             description:
//               primary.description?.trim() || fallbackRoundtable.description,
//             location: primary.location?.trim() || fallbackRoundtable.location,
//             scheduleNote:
//               primary.schedule_note?.trim() || fallbackRoundtable.scheduleNote,
//             sessions: Array.isArray(primary.sessions) ? primary.sessions : [],
//           })
//         } else {
//           setRoundtable(fallbackRoundtable)
//         }
// 
//         if (Array.isArray(exhibitionData) && exhibitionData.length > 0) {
//           const cards = exhibitionData.map((item: ApiExhibition) => ({
//             id: item.id,
//             title: item.title?.trim() || "体験展示のタイトルが入ります。",
//             author: item.author?.trim() || "苗字 名前",
//             image:
//               item.image_thumb_url?.trim() ||
//               item.image_url?.trim() ||
//               "/image/event_background.png",
//           }))
//           setExhibitions(cards)
//         } else {
//           setExhibitions(fallbackExhibitions)
//         }
//       } catch (error) {
//         if (!active) return
//         setLoadError("イベント情報の読み込みに失敗しました。")
//       } finally {
//         if (active) {
//           setIsLoading(false)
//         }
//       }
//     }
// 
//     load()
// 
//     return () => {
//       active = false
//     }
//   }, [])
// 
//   useEffect(() => {
//     if (roundtable.sessions.length === 0) return
// 
//     setExpandedDays((prev) => {
//       if (Object.keys(prev).length > 0) return prev
//       const firstKey = pickFirstDayKey(roundtable.sessions)
//       if (!firstKey) return prev
//       return { [firstKey]: true }
//     })
//   }, [roundtable.sessions])
// 
//   const scheduleDays: ScheduleDay[] = useMemo(() => {
//     if (roundtable.sessions.length === 0) return []
// 
//     const dayMap = new Map<
//       string,
//       { date: Date; slots: ScheduleSlot[] }
//     >()
// 
//     for (const session of roundtable.sessions) {
//       const startAt = new Date(session.start_at)
//       const endAt = new Date(session.end_at)
//       if (Number.isNaN(startAt.getTime())) continue
// 
//       const dayKey = buildDayKey(startAt)
//       const slot: ScheduleSlot = {
//         id: session.id,
//         time: formatTimeRange(startAt, endAt),
//         remaining: formatRemaining(session.remaining, session.is_full),
//         isFull: Boolean(session.is_full) || session.remaining === 0,
//       }
// 
//       const existing = dayMap.get(dayKey)
//       if (existing) {
//         existing.slots.push(slot)
//       } else {
//         dayMap.set(dayKey, { date: startAt, slots: [slot] })
//       }
//     }
// 
//     return Array.from(dayMap.entries())
//       .sort((a, b) => a[1].date.getTime() - b[1].date.getTime())
//       .map(([dayKey, value]) => ({
//         id: dayKey,
//         label: formatDateLabel(value.date),
//         isExpanded: expandedDays[dayKey] ?? false,
//         slots: value.slots.sort((a, b) => a.time.localeCompare(b.time)),
//       }))
//   }, [expandedDays, roundtable.sessions])
// 
//   const toggleDay = (dayId: string) => {
//     setExpandedDays((prev) => ({
//       ...prev,
//       [dayId]: !prev[dayId],
//     }))
//   }
// 
//   return (
//     // ページ外側の白背景を避けるため、イベントページ全体を薄いグレーで塗ります。
//     <div className="min-h-screen bg-[#F9F9F9]">
//       <div className="relative mx-auto flex min-h-screen w-full max-w-[393px] flex-col bg-[#F9F9F9] md:max-w-[1200px] lg:max-w-[1280px]">
//         {/* デスクトップは横幅のみ広げ、シングルカラムの構成は維持します。 */}
//         {/* 全ページ共通のヘッダーを配置し、スクロール中も固定表示します。 */}
//         <GlobalHeader activeId="events" />
//         {/* 固定ヘッダーと内容が重ならないよう、ページ全体の上余白を確保します。 */}
//         <div className="pt-[84px] md:pt-[96px]">
// 
//         {/* 見出しはFigmaのグラデーションバーと書体を再現します。 */}
//         <section className="px-4 pt-2">
//           <div className="flex items-center gap-3">
//             <span className="h-[32px] w-2 rounded-[4px] bg-gradient-to-b from-[#FB9678] to-[#E5A967]" />
//             <h1 className="text-[24px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
//               イベント
//             </h1>
//           </div>
//         </section>
// 
//         {/* 切り替えボタンはピル型の2分割で、選択状態の境界線を強調します。 */}
//         <section className="px-4 pt-6">
//           <div className="flex items-center rounded-full bg-[#EBEEF0] p-2">
//             <button
//               type="button"
//               onClick={() => setActiveTab("roundtable")}
//               className={`flex-1 rounded-full px-2 py-3 text-[13px] font-medium transition-colors ${
//                 activeTab === "roundtable"
//                   ? "border border-[#FB9678] bg-[#F9F9F9] text-[#2E3437]"
//                   : "text-[#6A7378]"
//               }`}
//             >
//               座談会(予約必須)
//             </button>
//             <button
//               type="button"
//               onClick={() => setActiveTab("exhibition")}
//               className={`flex-1 rounded-full px-2 py-3 text-[13px] font-medium transition-colors ${
//                 activeTab === "exhibition"
//                   ? "border border-[#FB9678] bg-[#F9F9F9] text-[#2E3437]"
//                   : "text-[#6A7378]"
//               }`}
//             >
//               体験展示
//             </button>
//           </div>
//         </section>
// 
//       {activeTab === "roundtable" ? (
//         <section className="px-4 pb-12 pt-10">
//           {isLoading ? (
//             <>
//               <SkeletonBlock className="h-6 w-40 rounded-md" />
//               <div className="mt-4 space-y-3">
//                 <div className="flex items-center gap-2">
//                   <GradientIcon type="calendar" />
//                   <SkeletonBlock className="h-4 w-40 rounded-md" />
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <GradientIcon type="location" />
//                   <SkeletonBlock className="h-4 w-28 rounded-md" />
//                 </div>
//               </div>
//               <div className="mt-4 space-y-2">
//                 <SkeletonBlock className="h-4 w-full rounded-md" />
//                 <SkeletonBlock className="h-4 w-11/12 rounded-md" />
//                 <SkeletonBlock className="h-4 w-10/12 rounded-md" />
//               </div>
//             </>
//           ) : (
//             <>
//               <h2 className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
//                 {roundtable.title}
//               </h2>
//               <div className="mt-4 space-y-2">
//                 <div className="flex items-center gap-2">
//                   <GradientIcon type="calendar" />
//                   <p className="text-[13px] leading-[1.9] text-[#4B5459]">
//                     {roundtable.scheduleNote}
//                   </p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <GradientIcon type="location" />
//                   <p className="text-[13px] leading-[1.9] text-[#4B5459]">
//                     {roundtable.location}
//                   </p>
//                 </div>
//               </div>
//               <p className="mt-4 text-[15px] leading-[2.2] text-[#4B5459]">
//                 {roundtable.description}
//               </p>
//             </>
//           )}
// 
//           <div className="mt-10 space-y-4">
//             <div className="border-b border-[#14BDB1] pb-1">
//               <p className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
//                 参加予約・スケジュール
//               </p>
//             </div>
//             <p className="text-[15px] leading-[2.2] text-[#4B5459]">
//               空いている日時を確認し予約フォームから申し込みをお願いします。
//             </p>
//           </div>
// 
//           {/* 予約枠はアコーディオン式で展開し、空き状況を強調します。 */}
//           <div className="mt-4 divide-y divide-[#EBEEF0]">
//             {isLoading ? (
//               [0, 1].map((index) => (
//                 <div key={`schedule-skel-${index}`} className="py-6">
//                   <div className="flex items-center justify-between">
//                     <SkeletonBlock className="h-5 w-28 rounded-md" />
//                     <SkeletonBlock className="h-6 w-6 rounded-full" />
//                   </div>
//                   <div className="mt-4 flex gap-4">
//                     {[0, 1].map((slotIndex) => (
//                       <div
//                         key={`slot-skel-${index}-${slotIndex}`}
//                         className="flex flex-1 flex-col items-center justify-center rounded-[12px] border border-[#EBEEF0] bg-[#EBEEF0] px-4 py-3"
//                       >
//                         <SkeletonBlock className="h-4 w-20 rounded-md" />
//                         <SkeletonBlock className="mt-2 h-3 w-14 rounded-md" />
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ))
//             ) : scheduleDays.length === 0 ? (
//               <p className="py-6 text-[13px] text-[#6A7378]">
//                 現在表示できる座談会日程がありません。
//               </p>
//             ) : (
//               scheduleDays.map((day) => (
//                 <div key={day.id} className="py-6">
//                   <button
//                     type="button"
//                     onClick={() => toggleDay(day.id)}
//                     className="flex w-full items-center justify-between"
//                   >
//                     <span
//                       className={`text-[16px] font-medium ${
//                         day.isExpanded ? "text-[#D3793D]" : "text-[#2E3437]"
//                       }`}
//                     >
//                       {day.label}
//                     </span>
//                     <span
//                       className={`text-[#A3ADB2] transition-transform ${
//                         day.isExpanded ? "rotate-180" : ""
//                       }`}
//                       aria-hidden="true"
//                     >
//                       <ChevronIcon />
//                     </span>
//                   </button>
//                   {day.isExpanded && day.slots.length > 0 ? (
//                     <div className="mt-4 flex gap-4">
//                       {day.slots.map((slot) => (
//                         <div
//                           key={slot.id}
//                           className={`flex flex-1 flex-col items-center justify-center rounded-[12px] border px-4 py-3 text-center shadow-[0_0_8px_rgba(106,115,120,0.15)] ${
//                             slot.isFull
//                               ? "border-[#EBEEF0] bg-[#EBEEF0] text-[#A3ADB2]"
//                               : "border-[#FB9678] bg-[#F9F9F9] text-[#4B5459]"
//                           }`}
//                         >
//                           <p className="text-[13px] font-medium">
//                             {slot.time}
//                           </p>
//                           <p className="text-[10px] text-[#6A7378]">
//                             {slot.remaining}
//                           </p>
//                         </div>
//                       ))}
//                     </div>
//                   ) : null}
//                 </div>
//               ))
//             )}
//           </div>
//           {loadError ? (
//             <p className="mt-4 text-[12px] text-[#D96E36]">{loadError}</p>
//           ) : null}
//         </section>
//       ) : (
//         <section className="px-4 pb-12 pt-10">
//           {/* 体験展示は2列グリッドで整列し、カードの高さを揃えます。 */}
//           <div className="grid grid-cols-2 gap-6">
//             {isLoading
//               ? Array.from({ length: 6 }).map((_, index) => (
//                   <article key={`exhibit-skel-${index}`} className="space-y-2">
//                     <SkeletonBlock className="aspect-video w-full rounded-[4px]" />
//                     <div className="space-y-2">
//                       <SkeletonBlock className="h-4 w-full rounded-md" />
//                       <SkeletonBlock className="h-4 w-1/2 rounded-md ml-auto" />
//                     </div>
//                   </article>
//                 ))
//               : exhibitions.map((card) => {
//                   const isFallback = card.id?.startsWith("exhibition-")
//                   const content = (
//                     <article>
//                       <div className="aspect-video overflow-hidden rounded-[4px]">
//                         <img
//                           src={card.image}
//                           alt=""
//                           className="h-full w-full object-cover"
//                         />
//                       </div>
//                       <div className="space-y-1 text-[12px]">
//                         {/* Tailwindのline-clamp依存を避け、2行省略はインラインで指定します。 */}
//                         <p
//                           className="h-[36px] overflow-hidden text-[#4B5459]"
//                           style={{
//                             display: "-webkit-box",
//                             WebkitLineClamp: 2,
//                             WebkitBoxOrient: "vertical",
//                           }}
//                         >
//                           {card.title}
//                         </p>
//                         <p className="text-right text-[#6A7378]">
//                           {card.author}
//                         </p>
//                       </div>
//                     </article>
//                   )
// 
//                   if (isFallback) {
//                     return (
//                       <div key={card.id} className="space-y-2">
//                         {content}
//                       </div>
//                     )
//                   }
// 
//                   return (
//                     <Link
//                       key={card.id}
//                       // 体験展示の詳細ページへ遷移し、カード全体をタップ可能にします。
//                       href={`/events/exhibitions/${card.id}`}
//                       className="block space-y-2"
//                     >
//                       {content}
//                     </Link>
//                   )
//                 })}
//           </div>
//           {loadError ? (
//             <p className="mt-4 text-[12px] text-[#D96E36]">{loadError}</p>
//           ) : null}
//         </section>
//       )}
// 
//       {/* フッターは既存コンポーネントをそのまま使い回します。 */}
//       <Footer />
//       </div>
//       </div>
//     </div>
//   )
// }
// 
// // Figmaのグラデーション付きアイコンを簡易的なSVGで再現します。
// function GradientIcon({ type }: { type: "calendar" | "location" }) {
//   return (
//     <svg
//       aria-hidden="true"
//       className="h-6 w-6"
//       viewBox="0 0 24 24"
//       fill="none"
//     >
//       <defs>
//         <linearGradient id={`${type}-gradient`} x1="0" y1="0" x2="1" y2="1">
//           <stop offset="0%" stopColor="#FB9678" />
//           <stop offset="100%" stopColor="#E5A967" />
//         </linearGradient>
//       </defs>
//       {type === "calendar" ? (
//         <path
//           d="M7 3V5M17 3V5M4 9H20M5 5H19C19.552 5 20 5.448 20 6V19C20 19.552 19.552 20 19 20H5C4.448 20 4 19.552 4 19V6C4 5.448 4.448 5 5 5Z"
//           stroke={`url(#${type}-gradient)`}
//           strokeWidth="1.5"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />
//       ) : (
//         <path
//           d="M12 3C8.686 3 6 5.686 6 9C6 13.5 12 21 12 21C12 21 18 13.5 18 9C18 5.686 15.314 3 12 3ZM12 11.5C10.619 11.5 9.5 10.381 9.5 9C9.5 7.619 10.619 6.5 12 6.5C13.381 6.5 14.5 7.619 14.5 9C14.5 10.381 13.381 11.5 12 11.5Z"
//           fill={`url(#${type}-gradient)`}
//         />
//       )}
//     </svg>
//   )
// }
// 
// function ChevronIcon() {
//   return (
//     <svg
//       aria-hidden="true"
//       className="h-6 w-6"
//       viewBox="0 0 24 24"
//       fill="none"
//     >
//       <path
//         d="M7 10L12 15L17 10"
//         stroke="#A3ADB2"
//         strokeWidth="2"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </svg>
//   )
// }
// 
// const buildDayKey = (date: Date) =>
//   `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
// 
// const formatDateLabel = (date: Date) => {
//   const weekday = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()]
//   return `${date.getMonth() + 1}月${date.getDate()}日(${weekday})`
// }
// 
// const formatTime = (date: Date) =>
//   `${String(date.getHours()).padStart(2, "0")}:${String(
//     date.getMinutes(),
//   ).padStart(2, "0")}`
// 
// const formatTimeRange = (startAt: Date, endAt: Date) => {
//   if (Number.isNaN(endAt.getTime())) {
//     return formatTime(startAt)
//   }
//   return `${formatTime(startAt)}~${formatTime(endAt)}`
// }
// 
// const formatNumber = (value: number) =>
//   // 予約人数などの数値は日本語表記で統一し、桁区切りも自然に見せる。
//   new Intl.NumberFormat("ja-JP").format(value)
// 
// const formatRemaining = (
//   remaining?: number | null,
//   isFull?: boolean | null,
// ) => {
//   if (isFull || remaining === 0) return "満員"
//   if (typeof remaining === "number") return `残り${formatNumber(remaining)}人`
//   return "受付中"
// }
// 
// const pickFirstDayKey = (sessions: ApiRoundtableSession[]) => {
//   const sorted = sessions
//     .map((session) => new Date(session.start_at))
//     .filter((date) => !Number.isNaN(date.getTime()))
//     .sort((a, b) => a.getTime() - b.getTime())
//   if (sorted.length === 0) return null
//   return buildDayKey(sorted[0])
// }
