"use client"

import Link from "next/link"
import { useState } from "react"

import CareerPieChart from "./components/CareerPieChart"
import Footer from "./components/Footer"
import NavigationMenu from "./components/NavigationMenu"

// トップページの構成要素をまとめて管理し、Figmaの階層と同じ順番で描画します。
type CareerStats = {
  total: number
  gradCount: number
  jobCount: number
  otherCount: number
}

type TopPageClientProps = {
  careerStats: CareerStats
}

export default function TopPageClient({ careerStats }: TopPageClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // 進路データはサーバー側で集計済みの値を受け取り、表示用に割合へ変換します。
  const totalCareers = careerStats.total
  const gradPercent =
    totalCareers === 0 ? 0 : (careerStats.gradCount / totalCareers) * 100
  const jobPercent =
    totalCareers === 0 ? 0 : (careerStats.jobCount / totalCareers) * 100
  const otherPercent =
    totalCareers === 0 ? 0 : (careerStats.otherCount / totalCareers) * 100

  // 開催開始日（2026年3月7日）までの残り日数を、ローカル日付の0時基準で計算します。
  const eventStartDate = new Date(2026, 2, 7)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  eventStartDate.setHours(0, 0, 0, 0)
  const msPerDay = 1000 * 60 * 60 * 24
  const daysUntilEvent = Math.max(
    0,
    Math.ceil((eventStartDate.getTime() - today.getTime()) / msPerDay),
  )

  // 共通メニューは研究ページと同じ導線に揃え、ユーザーの移動体験を統一します。
  const menuItems = [
    { id: "top", label: "TOP", href: "/" },
    { id: "research", label: "研究紹介", href: "/research" },
    { id: "works", label: "作品紹介", href: "/research?tab=works" },
    { id: "career", label: "卒業生の進路", href: "/career" },
    { id: "events", label: "イベント", href: "/events" },
    { id: "contact", label: "お問い合わせ", href: "/contact" },
  ]

  return (
    <div className="mx-auto flex w-full max-w-[393px] flex-col bg-[#F9F9F9] pb-16 md:max-w-[1200px] lg:max-w-[1280px]">
      {/* デスクトップは横幅のみ広げ、シングルカラムの構成は維持します。 */}
      {/* 右上メニューは画面全体に重ねて表示し、背景色もFigmaのグレーに合わせます。 */}
      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 flex justify-center bg-[#F9F9F9]">
          <NavigationMenu
            items={menuItems}
            activeId="top"
            onClose={() => setIsMenuOpen(false)}
          />
        </div>
      ) : null}

      {/* ヒーロー領域はFigmaの紙吹雪背景を再現するため、複数のグラデーションとノイズを重ねます。 */}
      <section className="relative h-[698px] w-full overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            // 背景色とパターンの重ね順を固定し、白地の紙質感を作ります。
            backgroundImage:
              "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.9) 0 46px, transparent 48px), radial-gradient(circle at 72% 32%, rgba(255,255,255,0.9) 0 58px, transparent 60px), radial-gradient(circle at 30% 70%, rgba(255,255,255,0.9) 0 42px, transparent 44px), radial-gradient(circle at 78% 78%, rgba(255,255,255,0.9) 0 64px, transparent 66px), linear-gradient(180deg, rgba(251,150,120,0.08) 0%, rgba(229,169,103,0.06) 55%, rgba(249,249,249,0.95) 100%)",
            backgroundSize: "240px 240px, 260px 260px, 220px 220px, 280px 280px, 100% 100%",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-70 mix-blend-soft-light"
          style={{
            // 既存のテクスチャを全面に敷いて、Figmaの粒状感に近づけます。
            backgroundImage: "url('/texture/texture_noise.png')",
            backgroundSize: "160px 160px",
            backgroundRepeat: "repeat",
          }}
        />

        {/* ヒーロー内テキストは中央に寄せ、展示の正式名称を目立たせます。 */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="text-[12px] font-medium tracking-[0.3em] text-[#6A7378] [font-family:var(--font-roboto)]">
            SIT DESIGN EXPO 2026
          </p>
          <h1 className="mt-4 text-[32px] font-extrabold tracking-[0.08em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            卒業・修了研究展
          </h1>
          <p className="mt-3 text-[13px] text-[#6A7378]">
            芝浦工業大学 デザイン工学部
          </p>
        </div>

        {/* メニューボタンはスクロール中も右上に追従させ、コンテンツの右端に揃えます。 */}
        <div className="fixed inset-x-0 top-0 z-40 flex justify-center pointer-events-none">
          <div className="flex w-full max-w-[393px] justify-end px-4 pt-6 pointer-events-auto md:max-w-[1200px] md:px-8 lg:max-w-[1280px]">
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
      </section>

      {/* 開催情報カードはFigmaの角丸・影・配色をそのまま移植します。 */}
      <section className="px-4 pt-6">
        <div className="rounded-[24px] bg-[#F9F9F9] p-6 shadow-[0_0_8px_rgba(106,115,120,0.15)]">
          <div className="border-b border-[#FB9678] pb-1">
            <p className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
              開催情報
            </p>
          </div>
          <div className="mt-4 flex flex-col items-center gap-4 text-center">
            <p className="text-[24px] font-extrabold text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
              3.07
              <span className="text-[16px] text-[#2C68D3]">(土)</span>
              <span className="mx-1 text-[24px] text-[#A3ADB2]">-</span>
              3.17
              <span className="text-[16px] text-[#6A7378]">(火)</span>
            </p>
            <p className="text-[13px] font-medium text-[#6A7378]">
              芝浦工業大学 豊洲キャンパス
            </p>
            <div className="flex items-center gap-4 text-center">
              <div className="w-[124px]">
                <p className="text-[10px] text-[#9BA3A7]">開催時間</p>
                <p className="text-[16px] font-extrabold text-[#4B5459] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                  10:00 - 19:00
                </p>
              </div>
              <div className="h-[31.5px] w-px bg-[#DDE1E4]" />
              <div className="w-[124px]">
                <p className="text-[10px] text-[#9BA3A7]">入場料</p>
                <p className="text-[16px] font-extrabold text-[#4B5459] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                  無料
                </p>
              </div>
            </div>
            <div className="w-full rounded-full bg-gradient-to-r from-[#FB9678] to-[#E5A967] px-8 py-2 text-center text-[#F9F9F9]">
              <span className="text-[13px]">開催まであと </span>
              <span className="text-[24px] font-extrabold [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                {daysUntilEvent}
              </span>
              <span className="text-[13px] font-bold">日</span>
            </div>
          </div>
        </div>
      </section>

      {/* 卒業・修了研究展の説明文は段落間を詰め、読みやすい行間に設定します。 */}
      <section className="px-4 pt-12">
        <div className="border-b border-[#FB9678] pb-1">
          <p className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            卒業・修了研究展とは
          </p>
        </div>
        <p className="mt-4 text-[13px] leading-[1.9] text-[#4B5459]">
          芝浦工業大学デザイン工学部の学生・大学院生による、それぞれの研究を公に発表する場です。
          ここには、プロダクト、システム、UX、感性、理論の探求など、デザイン工学という広い領域における多様な研究が集まります。
          具体的な物として展示されるものもあれば、形のないシステムやアプリの提案、あるいは思考や概念などさまざまな研究があります。学生一人ひとりが積み上げてきた探求の軌跡を、ありのままに提示する空間です。
        </p>
      </section>

      {/* コンセプトの背景は指定画像に差し替え、元デザインの雰囲気を再現します。 */}
      <section
        className="mt-12 px-4 py-12"
        style={{
          backgroundImage: "url('/image/concept.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex flex-col items-center">
          <p className="text-[16px] font-extrabold text-[#EBEEF0] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            CONCEPT
          </p>
          <p className="text-[48px] font-extrabold tracking-[0.02em] text-[#F9F9F9] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            接点
          </p>
        </div>
        <p className="mt-6 text-[13px] leading-[1.9] text-[#F9F9F9]">
          卒展は、来場者と研究の接点となるだけでなく、研究と社会の仕組み、研究と過去の経験、研究と新たに生まれる可能性、など接点を持ちうる様々な要素に囲まれている。
          客観的に見た卒展は、そういった外部の接点を多様に持ち、様々な接点の上で成り立っている。そんな卒展を覗くと、たくさんのアイデアにあふれていて、来場者も自分なりに研究との接点を見つけられる空間が広がっている。
        </p>
      </section>

      {/* 学生の成果セクションはボタンを中央に配置して導線を明確にします。 */}
      <section className="px-4 pt-12">
        <div className="border-b border-[#FB9678] pb-1">
          <p className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            学生の成果
          </p>
        </div>
        <p className="mt-4 text-[13px] leading-[1.9] text-[#4B5459]">
          研究の概要をまとめて閲覧することができます。また、大学でどのような作品を作ってきたのかも見ることができます。
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/research"
            className="flex items-center gap-2 rounded-full border border-[#FB9678] bg-[#F9F9F9] px-8 py-4 text-[13px] font-medium text-[#4B5459] shadow-[0_0_8px_rgba(106,115,120,0.15)]"
          >
            学生の成果を見る
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* 進路情報は上下余白を確保し、図表を中央に配置します。 */}
      <section className="px-4 py-12">
        <div className="border-b border-[#FB9678] pb-1">
          <p className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            卒業生の進路
          </p>
        </div>
        <p className="mt-4 text-[13px] leading-[1.9] text-[#4B5459]">
          卒業生のほとんどは本学大学院への進学、もしくは就職をしています。就職をする学生は、多くがデザイナーやエンジニアとして活躍予定です。
        </p>
        <div className="mt-8 flex justify-center">
          <CareerPieChart
            gradPercent={gradPercent}
            jobPercent={jobPercent}
            otherPercent={otherPercent}
            total={totalCareers}
          />
        </div>
        <div className="mt-6 flex justify-center">
          <Link
            href="/career"
            className="flex items-center gap-2 rounded-full bg-[#D3793D] px-8 py-4 text-[13px] font-medium text-[#F9F9F9] shadow-[0_0_8px_rgba(106,115,120,0.15)]"
          >
            進路をもっと詳しく
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* イベント紹介は上下余白を設け、指定画像を背景に使い雰囲気を合わせます。 */}
      <section
        className="px-4 py-12"
        style={{
          backgroundImage: "url('/image/event_background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="border-b border-[#FB9678] pb-1">
          <p className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            イベント
          </p>
        </div>
        <p className="mt-4 text-[13px] leading-[1.9] text-[#4B5459]">
          卒業生と直接コミュニケーションをとることができる座談会や、休日でしかみられない体験展示など、さまざまなイベントを予定しています。
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/events"
            className="flex items-center gap-2 rounded-full border border-[#FB9678] bg-[#F9F9F9] px-8 py-4 text-[13px] font-medium text-[#4B5459] shadow-[0_0_8px_rgba(106,115,120,0.15)]"
          >
            イベントを見る
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* 開催場所は上下余白を設け、指定の背景色に合わせて読みやすく示します。 */}
      <section className="bg-[#EBEEF0] px-4 py-12">
        <div className="border-b border-[#FB9678] pb-1">
          <p className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            開催場所
          </p>
        </div>
        <div className="mt-6 space-y-4">
          <div className="rounded-lg bg-[#F9F9F9] p-3">
            <p className="text-[16px] font-medium text-[#D3793D]">平日</p>
            <p className="mt-1 text-[13px] leading-[1.9] tracking-[0.02em] text-[#4B5459]">
              有元史郎記念校友会館交流プラザにて研究の展示をします。展示されている研究の一覧は
              <Link href="/research" className="text-[#D3793D] underline">
                こちら
              </Link>
              から。
            </p>
          </div>
          <div className="rounded-lg bg-[#F9F9F9] p-3">
            <p className="text-[16px] font-medium text-[#D3793D]">土日</p>
            <p className="mt-1 text-[13px] leading-[1.9] tracking-[0.02em] text-[#4B5459]">
              平日の研究展示に加え、本部棟5階オープンラボにて体験展示を開催します。体験展示の詳細は
              <Link href="/events" className="text-[#D3793D] underline">
                こちら
              </Link>
              から
            </p>
          </div>
        </div>
      </section>

      {/* アクセス情報は地図と動画導線を同じカードにまとめます。 */}
      <section className="px-4 pt-12">
        <div className="border-b border-[#FB9678] pb-1">
          <p className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
            アクセス
          </p>
        </div>
        <p className="mt-4 text-[13px] leading-[1.9] text-[#4B5459]">
          〒135-8548 東京都江東区豊洲3-7-5
        </p>
        <p className="mt-2 text-[13px] leading-[1.9] text-[#4B5459]">
          東京メトロ有楽町線「豊洲駅」１cまたは３番出口から徒歩７分
          <br />
          ゆりかもめ「豊洲駅」から徒歩９分
          <br />
          JR京葉線「越中島駅」２番出口から徒歩15分
        </p>
        <div className="mt-6 overflow-hidden rounded-2xl">
          {/* 指定されたGoogle Mapsの埋め込みコードをそのまま使用し、表示領域をレスポンシブに調整します。 */}
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.6646539508483!2d139.79262397577705!3d35.6606329725939!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x601889a0774db467%3A0x341667956857f1f8!2z44CSMTM1LTg1NDgg5p2x5Lqs6YO95rGf5p2x5Yy66LGK5rSy77yT5LiB55uu77yX4oiS77yVIOiKnea1puW3pealreWkp-WtpiDosYrmtLLjgq3jg6Pjg7Pjg5Hjgrk!5e0!3m2!1sja!2sjp!4v1770220456567!5m2!1sja!2sjp"
            width="600"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[209px] w-full"
            title="芝浦工業大学 豊洲キャンパスの地図"
          />
        </div>
        <div className="mt-6">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-[#DDE1E4]" />
            <p className="text-[12px] font-medium tracking-[0.15em] text-[#D3793D] [font-family:var(--font-roboto)]">
              GUIDE VIDEOS
            </p>
            <span className="h-px flex-1 bg-[#DDE1E4]" />
          </div>
          <p className="mt-2 text-center text-[15px] leading-[2.2] tracking-[0.04em] text-[#4B5459]">
            大学への行き方動画はこちらから
          </p>
          <div className="mt-4 flex items-center gap-4">
            <Link
              href="/about"
              className="flex flex-1 items-center justify-center rounded-full border border-[#FB9678] bg-[#F9F9F9] px-6 py-4 text-[13px] font-medium text-[#4B5459] shadow-[0_0_8px_rgba(106,115,120,0.15)]"
            >
              豊洲駅から
            </Link>
            <Link
              href="/about"
              className="flex flex-1 items-center justify-center rounded-full border border-[#FB9678] bg-[#F9F9F9] px-6 py-4 text-[13px] font-medium text-[#4B5459] shadow-[0_0_8px_rgba(106,115,120,0.15)]"
            >
              越中島駅から
            </Link>
          </div>
        </div>
      </section>

      {/* フッターは既存コンポーネントを使用し、SNS導線をまとめます。 */}
      <div className="px-4 pt-12">
        <Footer />
      </div>
    </div>
  )
}
