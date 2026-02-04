"use client"

import { useState } from "react"

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

const menuItems = [
  { id: "top", label: "TOP", href: "/" },
  { id: "research", label: "研究紹介", href: "/research" },
  { id: "works", label: "作品紹介", href: "/research?tab=works" },
  { id: "career", label: "卒業生の進路", href: "/career" },
  { id: "events", label: "イベント", href: "/events" },
  { id: "contact", label: "お問い合わせ", href: "/contact" },
]

const jobCategories: JobCategory[] = [
  {
    title: "デザイン・企画系",
    percentage: 38.3,
    items: [
      "株式会社Sun Asterisk(UIUXデザイナー職)",
      "ナカバヤシ株式会社(商品企画)",
      "KDDIアジャイル開発センター株式会社(サービスデザイナー)",
      "クリナップ株式会社(企画開発)",
      "株式会社オリバー(デザイン職)",
      "GMOインターネット株式会社(UIデザイナー)",
      "株式会社MIXI(デザイナー)",
      "TANAX株式会社(デザイナー)",
      "株式会社コクヨ(デザイナー総合職)",
      "株式会社バンダイ(総合職１（企画・プロモーションなど）)",
      "株式会社ジャストシステム(UXデザイナー)",
      "ソニー株式会社(UIUXデザイナー)",
      "株式会社コナミアーケードゲームス(デザイナー)",
      "Visional（株式会社ビズリーチ）(UIUXデザイナー)",
      "株式会社ビズリーチ(プロダクト職)",
      "アチーブメント株式会社(企画職(サービス企画・UXデザイナー))",
    ],
  },
  {
    title: "IT・エンジニア系",
    percentage: 46.8,
    items: [
      "富士通株式会社(システムエンジニア)",
      "日本電気株式会社(システムエンジニア)",
      "株式会社NTTデータ(システムエンジニア)",
      "三菱電機株式会社(ソフトウェア開発)",
      "日立製作所(システムエンジニア)",
      "株式会社日立ソリューションズ(システムエンジニア)",
      "TIS株式会社(システムエンジニア)",
      "株式会社サイバーエージェント(エンジニア)",
      "DeNA株式会社(エンジニア)",
      "株式会社サイバーコム(システムエンジニア)",
      "サイボウズ株式会社(エンジニア)",
      "ヤフー株式会社(システムエンジニア)",
      "株式会社ドワンゴ(エンジニア)",
      "株式会社オリコン(エンジニア)",
      "(機械・通信系エンジニア)",
      "Astemo株式会社(設計開発職)",
      "株式会社オカムラ(技術職)",
      "富士フイルムビジネスイノベーション株式会社(技術職)",
      "本田技研工業株式会社(四輪完成車研究開発)",
      "株式会LIXIL(システムエンジニア)",
      "株式会社ジェーエムエーシステムズ(システムエンジニア)",
    ],
  },
  {
    title: "その他",
    percentage: 14.9,
    items: [
      "千葉市役所(事務)",
      "キャップジェミニ株式会社(デジタルコンサルタント)",
      "チームラボ株式会社(ソリューションカタリスト)",
      "株式会社 小田急エージェンシー(総合職)",
      "株式会社NTTドコモ(営業)",
    ],
  },
]

const jobDecisionReasons: ReasonCard[] = [
  {
    text: "企業より公務員に向いていると思ったから",
    labels: ["職種名", "業界名"],
  },
  {
    text: "大きな規模でサービス提案をしたかったから",
    labels: ["職種名", "業界名"],
  },
  {
    text: "チームでの開発が好きだったから",
    labels: ["職種名", "業界名"],
  },
  {
    text: "クライアントワークで多様な業界の案件に携われることと、職種を越えてチームで開発できる環境に惹かれて選びました！",
    labels: ["職種名", "業界名"],
  },
  {
    text: "安定",
    labels: ["職種名", "業界名"],
  },
]

const gradReasons: GradReasonCard[] = [
  { text: "もっとデザイン勉強したい", course: "〇〇コース" },
  { text: "まだまだ学び残したことがいっぱいあるから", course: "〇〇コース" },
  { text: "学科推薦で行きたい研究室にそのまま行けるから", course: "〇〇コース" },
  { text: "研究したいテーマがあったから。", course: "〇〇コース" },
  { text: "まだ、やるべきこと/やりたいことが残っているから。", course: "〇〇コース" },
]

export default function CareerClient() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

      {/* リード文はFigmaの行間と字間を再現して読みやすく整えます。 */}
      <div className="px-4 pt-6">
        <p className="text-[15px] leading-[2.2] tracking-[0.04em] text-[#4B5459]">
          卒業生のほとんどは本学大学院への進学、もしくは就職をしています。就職をする学生は、多くがデザイナーやエンジニアとして活躍予定です。
        </p>
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
            <CareerPieChart gradPercent={23.9} jobPercent={67.4} otherPercent={8.8} total={90} />
            {/* Figma上の「その他」ラベルは補足表示として軽く重ねます。 */}
            <div className="pointer-events-none absolute left-[18%] top-[12%] -translate-x-1/2 -translate-y-1/2 text-center text-[#F9F9F9]">
              <p className="text-[16px] font-bold leading-[1.5] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                その他
              </p>
              <p className="text-[16px] font-bold leading-[1.5] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                8.8<span className="text-[13px]">%</span>
              </p>
            </div>
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
          <div className="flex items-center gap-2 text-[13px] font-medium text-[#2E3437]">
            <span className="inline-flex h-6 w-6 items-center justify-center">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
              >
                <path
                  d="M5 12L10 17L19 7"
                  stroke="#2E3437"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            ラベル
          </div>
        </div>
        <p className="mt-2 text-[13px] leading-[1.9] tracking-[0.02em] text-[#4B5459]">
          就職する人の多くが、デザイナーもしくはエンジニアになっています。
        </p>

        {jobCategories.map((category) => (
          <div key={category.title} className="mt-6">
            {/* 見出し行は数値を強調し、Figmaのタイポグラフィを踏襲します。 */}
            <p className="text-[16px] font-medium text-[#2E3437]">
              <span className="leading-[1.5]">{category.title}　</span>
              <span className="text-[24px] font-bold text-[#D3793D] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                {category.percentage}
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
        ))}
      </section>

      {/* 就職先の決め手はカード形式で複数項目を並べ、読みやすさを優先します。 */}
      <section className="px-4 py-12">
        <div className="border-b border-[#FB9678] pb-1">
          <h2 className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            就職先の決めて
          </h2>
        </div>
        <div className="mt-4 space-y-4">
          {jobDecisionReasons.map((reason) => (
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
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-[#14BDB1] bg-[#F9F9F9] px-8 py-4 text-[13px] font-medium text-[#4B5459] shadow-[0_0_8px_rgba(106,115,120,0.15)]"
          >
            もっと見る
            <span className="text-[16px]">+</span>
          </button>
        </div>
      </section>

      {/* 大学院進学の理由は別セクションとしてまとめ、同じカードUIを使い回します。 */}
      <section className="px-4 py-12">
        <div className="border-b border-[#FB9678] pb-1">
          <h2 className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            本学大学院進学の理由
          </h2>
        </div>
        <div className="mt-4 space-y-4">
          {gradReasons.map((reason) => (
            <div
              key={reason.text}
              className="rounded-[12px] border border-[#EBEEF0] bg-[#EBEEF0] px-3 py-3 text-[13px] leading-[1.9] tracking-[0.02em] text-[#2E3437]"
            >
              <p>{reason.text}</p>
              <div className="mt-2 flex justify-end text-[13px] font-medium text-[#4B5459]">
                <span>{reason.course}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-[#14BDB1] bg-[#F9F9F9] px-8 py-4 text-[13px] font-medium text-[#4B5459] shadow-[0_0_8px_rgba(106,115,120,0.15)]"
          >
            もっと見る
            <span className="text-[16px]">+</span>
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
