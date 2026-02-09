"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

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
  previewItems: PreviewItem[]
}

type PreviewItem = {
  id: string
  title: string
  author: string
  imageUrl: string
  href: string
  kind: "research" | "works"
}

// SIT MAPの画像は公開フォルダ内の最新版を参照します。
const sitMapImageUrl = "/image/sit_map.png"
// 「卒業・修了研究展とは」セクションの装飾はFigma指定のアセットを使用します。
const exhibitionDesktopFloatingCircleUrl =
  "https://www.figma.com/api/mcp/asset/5cb11781-8222-482b-885f-1590f7b0e682"
const exhibitionDesktopDashedCircleUrl =
  "https://www.figma.com/api/mcp/asset/3d2a296b-6bd0-45bc-904b-908d04046c98"
const exhibitionDesktopTriangleOutlineUrl =
  "https://www.figma.com/api/mcp/asset/a17c98b1-b93f-430d-9768-18bb2fa215d2"
const exhibitionDesktopDotUrl =
  "https://www.figma.com/api/mcp/asset/ba77d3d7-9d9e-45b9-9939-85b21b65f6d4"
const exhibitionDesktopConcentric1Url =
  "https://www.figma.com/api/mcp/asset/68cf0756-7148-4971-a5ff-2f9adbb52f24"
const exhibitionDesktopConcentric2Url =
  "https://www.figma.com/api/mcp/asset/9875ef01-7e71-48f9-816f-d2438d80df17"
const exhibitionDesktopConcentric3Url =
  "https://www.figma.com/api/mcp/asset/75a9b5b9-7602-45e3-993f-74551e9b3a57"
const exhibitionDesktopConcentric4Url =
  "https://www.figma.com/api/mcp/asset/03569b2f-fca7-473d-8909-9779b6871ebe"
const exhibitionDesktopConcentric5Url =
  "https://www.figma.com/api/mcp/asset/e9cae7cd-9863-4bad-8ae0-94468515cd37"
const exhibitionDesktopConcentric6Url =
  "https://www.figma.com/api/mcp/asset/1218c970-0105-47f4-ac29-0258418a5bf2"
const exhibitionDesktopSquare1Url =
  "https://www.figma.com/api/mcp/asset/608fb585-7bec-406c-8176-8d0d0f2e6f74"
const exhibitionDesktopSquare2Url =
  "https://www.figma.com/api/mcp/asset/8d438c30-6e79-47bd-87a1-1b967ca505e0"
const exhibitionDesktopSquare3Url =
  "https://www.figma.com/api/mcp/asset/71c2b560-ac2f-4393-947b-0c2629cdf915"
const exhibitionDesktopSquare4Url =
  "https://www.figma.com/api/mcp/asset/0656f9db-1bae-486c-b503-20951d418697"
const exhibitionDesktopCrossVUrl =
  "https://www.figma.com/api/mcp/asset/cd29f787-e90b-4441-8164-cdc0b3e026e6"
const exhibitionDesktopCrossHUrl =
  "https://www.figma.com/api/mcp/asset/b8eb908c-7c2e-46ed-806e-06c7eb0e95a8"
const exhibitionMobileFloatingCircleUrl =
  "https://www.figma.com/api/mcp/asset/65bfb434-f87a-4c84-b1da-c8d6602970a0"
const exhibitionMobileDashedCircleUrl =
  "https://www.figma.com/api/mcp/asset/ec108a7f-ecec-40dd-b4f0-fa414ae09c88"
const exhibitionMobileTriangleOutlineUrl =
  "https://www.figma.com/api/mcp/asset/45f97d34-fa0b-444c-88ce-5a14f8c339bf"
const exhibitionMobileDotUrl =
  "https://www.figma.com/api/mcp/asset/79c2e06e-3fbc-4420-9fb2-41e3361bd460"
// コンセプト背景はデスクトップ/モバイルでアセットが異なるため分けて管理します。
const conceptDesktopBackgroundUrl =
  "https://www.figma.com/api/mcp/asset/032915e2-f3f2-43b2-97ce-6ae6dd659ba8"
const conceptDesktopOverlayUrl =
  "https://www.figma.com/api/mcp/asset/fbf9e653-c3fe-4d35-a0a0-140557528eca"
const conceptMobileBackgroundUrl =
  "https://www.figma.com/api/mcp/asset/5b74b343-f504-4efa-9983-084b8777426b"
const conceptMobileOverlayUrl =
  "https://www.figma.com/api/mcp/asset/94b923bc-a36d-4dcf-aea7-ff6f4d81de3b"

export default function TopPageClient({
  careerStats,
  previewItems,
}: TopPageClientProps) {
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
  // データ未登録時でもレイアウトが崩れないよう、フォールバック用の表示データを準備します。
  const fallbackPreviewItems: PreviewItem[] = Array.from({ length: 3 }).map(
    (_, index) => ({
      id: `preview-${index}`,
      title:
        "研究または作品タイトルが入ります。研究または作品タイトルが入ります。",
      author: "苗字 名前",
      imageUrl: "/image/preview.png",
      href: "/research",
      kind: "research",
    }),
  )
  const visiblePreviewItems =
    previewItems.length > 0 ? previewItems : fallbackPreviewItems
  // モバイルのスライドは1枚ずつ切り替えるため、現在表示するカードのインデックスを持ちます。
  const [mobilePreviewIndex, setMobilePreviewIndex] = useState(0)
  // アニメーションを毎回発火させるため、切り替えごとにキーを更新します。
  const [mobilePreviewKey, setMobilePreviewKey] = useState(0)
  // モバイル表示は一定間隔でランダムにカードを切り替えます。
  useEffect(() => {
    if (visiblePreviewItems.length <= 1) {
      return
    }
    const intervalId = window.setInterval(() => {
      setMobilePreviewIndex((prevIndex) => {
        if (visiblePreviewItems.length <= 1) {
          return 0
        }
        let nextIndex = prevIndex
        // 直前と同じカードが続かないようにランダム選択します。
        while (nextIndex === prevIndex) {
          nextIndex = Math.floor(
            Math.random() * visiblePreviewItems.length,
          )
        }
        return nextIndex
      })
      setMobilePreviewKey((prevKey) => prevKey + 1)
    }, 3800)
    return () => window.clearInterval(intervalId)
  }, [visiblePreviewItems.length])
  const mobilePreviewItem =
    visiblePreviewItems[mobilePreviewIndex] ?? visiblePreviewItems[0]

  return (
    // 画面が短いときでもフッターが下端に揃うよう、最小高さを確保します。
    <div className="mx-auto flex min-h-screen w-full max-w-[393px] flex-col bg-[#F9F9F9] md:max-w-[1280px]">
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
      <section className="relative h-[698px] w-full overflow-hidden md:h-[720px]">
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
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center md:px-[128px]">
          <p className="text-[12px] font-medium tracking-[0.3em] text-[#6A7378] [font-family:var(--font-roboto)] md:text-[14px] md:tracking-[0.35em]">
            SIT DESIGN EXPO 2026
          </p>
          <h1 className="mt-4 text-[32px] font-extrabold tracking-[0.08em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:mt-6 md:text-[40px] md:tracking-[0.1em]">
            卒業・修了研究展
          </h1>
          <p className="mt-3 text-[13px] text-[#6A7378] md:text-[15px]">
            芝浦工業大学 デザイン工学部
          </p>
        </div>

        {/* メニューボタンはスクロール中も右上に追従させ、コンテンツの右端に揃えます。 */}
        <div className="fixed inset-x-0 top-0 z-40 flex justify-center pointer-events-none">
          <div className="flex w-full max-w-[393px] justify-end px-4 pt-6 pointer-events-auto md:max-w-[1280px] md:px-[128px]">
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
      <section className="px-4 pb-6 pt-6 md:px-[128px] md:pb-[96px] md:pt-[96px]">
        <div className="mx-auto rounded-[24px] bg-[#F9F9F9] p-6 shadow-[0_0_8px_rgba(106,115,120,0.15)] md:max-w-[1024px] md:p-9">
          <div className="border-b border-[#FB9678] pb-1">
            <p className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px] md:tracking-[0.04em]">
              開催情報
            </p>
          </div>
          <div className="mt-4 flex flex-col items-center gap-4 text-center md:mt-8 md:gap-6">
            <div className="flex flex-col items-center gap-4">
              <p className="text-[24px] font-extrabold text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[32px]">
              3.07
              <span className="text-[16px] text-[#2C68D3]">(土)</span>
              <span className="mx-1 text-[24px] text-[#A3ADB2]">-</span>
              3.17
              <span className="text-[16px] text-[#6A7378]">(火)</span>
              </p>
              <p className="text-[13px] font-medium text-[#6A7378] md:text-[15px]">
                芝浦工業大学 豊洲キャンパス
              </p>
            </div>
            <div className="flex items-center gap-4 text-center">
              <div className="w-[124px]">
                <p className="text-[10px] text-[#9BA3A7] md:text-[12px]">
                  開催時間
                </p>
                <p className="text-[16px] font-extrabold text-[#4B5459] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[20px]">
                  10:00 - 19:00
                </p>
              </div>
              <div className="h-[31.5px] w-px bg-[#DDE1E4]" />
              <div className="w-[124px]">
                <p className="text-[10px] text-[#9BA3A7] md:text-[12px]">
                  入場料
                </p>
                <p className="text-[16px] font-extrabold text-[#4B5459] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[20px]">
                  無料
                </p>
              </div>
            </div>
            <div className="w-full rounded-full bg-gradient-to-r from-[#FB9678] to-[#E5A967] px-8 py-2 text-center text-[#F9F9F9] md:w-[280px] md:px-[56px] md:py-[12px]">
              <span className="text-[13px] md:text-[15px]">
                開催まであと{" "}
              </span>
              <span className="text-[24px] font-extrabold [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                {daysUntilEvent}
              </span>
              <span className="text-[13px] font-bold md:text-[15px]">日</span>
            </div>
          </div>
        </div>
      </section>

      {/* 卒業・修了研究展セクションはFigmaの装飾と本文の改行を忠実に再現します。 */}
      <section className="relative overflow-hidden bg-[#EBEEF0] px-4 py-12 md:px-[128px] md:py-[96px]">
        {/* デスクトップの左上装飾はFigmaの配置値に合わせ、背景として配置します。 */}
        <div className="pointer-events-none absolute left-0 top-0 hidden h-[260px] w-[550px] overflow-hidden md:block">
          <div className="absolute left-[-60px] top-[-50px] h-[300px] w-[300px]">
            <div className="relative h-full w-full">
              <img
                alt=""
                src={exhibitionDesktopConcentric1Url}
                className="absolute inset-[41.78%] block h-full w-full"
              />
              <img
                alt=""
                src={exhibitionDesktopConcentric2Url}
                className="absolute inset-[33.56%] block h-full w-full"
              />
              <img
                alt=""
                src={exhibitionDesktopConcentric3Url}
                className="absolute inset-[25.33%] block h-full w-full"
              />
              <img
                alt=""
                src={exhibitionDesktopConcentric4Url}
                className="absolute inset-[17.11%] block h-full w-full"
              />
              <img
                alt=""
                src={exhibitionDesktopConcentric5Url}
                className="absolute inset-[8.89%] block h-full w-full"
              />
              <img
                alt=""
                src={exhibitionDesktopConcentric6Url}
                className="absolute inset-[0.67%] block h-full w-full"
              />
            </div>
          </div>
          <div className="absolute left-[22.72px] top-[59.77px] flex h-[270px] w-[270px] items-center justify-center">
            <div className="rotate-[15deg]">
              <div className="relative h-[220.454px] w-[220.454px]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rotate-[15deg]">
                    <div className="relative h-[245.885px] w-[245.885px]">
                      <img
                        alt=""
                        src={exhibitionDesktopSquare1Url}
                        className="absolute inset-[37.78%] block h-full w-full"
                      />
                      <img
                        alt=""
                        src={exhibitionDesktopSquare2Url}
                        className="absolute inset-[25.56%] block h-full w-full"
                      />
                      <img
                        alt=""
                        src={exhibitionDesktopSquare3Url}
                        className="absolute inset-[13.33%] block h-full w-full"
                      />
                      <img
                        alt=""
                        src={exhibitionDesktopSquare4Url}
                        className="absolute inset-[1.11%] block h-full w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute left-[260px] top-[50px] h-[100px] w-[100px]">
            <div className="flex h-[169.466px] items-center justify-center">
              <div className="rotate-[22deg]">
                <div className="relative h-[130.179px] w-[130.179px]">
                  <img
                    alt=""
                    src={exhibitionDesktopCrossVUrl}
                    className="absolute inset-y-0 left-1/2 right-1/2 block h-full w-full"
                  />
                  <img
                    alt=""
                    src={exhibitionDesktopCrossHUrl}
                    className="absolute inset-x-0 bottom-1/2 top-1/2 block h-full w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* デスクトップの右側装飾は文章領域を避け、右側に配置します。 */}
        <div className="pointer-events-none absolute right-0 top-[169px] hidden h-[471px] w-[450px] overflow-hidden md:block">
          <div className="absolute left-[-441.72px] top-[-180.72px] flex h-[394.675px] w-[394.675px] items-center justify-center">
            <div className="rotate-[170.8deg]">
              <div className="h-[344.097px] w-[344.097px]">
                <img
                  alt=""
                  src={exhibitionDesktopFloatingCircleUrl}
                  className="block h-full w-full"
                />
              </div>
            </div>
          </div>
          <div className="absolute left-[86.53px] top-[16.37px] flex h-[255.166px] w-[255.166px] items-center justify-center">
            <div className="rotate-[-85.4deg]">
              <div className="h-[236.932px] w-[236.932px]">
                <img
                  alt=""
                  src={exhibitionDesktopDashedCircleUrl}
                  className="block h-full w-full"
                />
              </div>
            </div>
          </div>
          <div className="absolute left-[222.32px] top-[211.12px] flex h-[99.409px] w-[111.091px] items-center justify-center">
            <div className="rotate-[-3.68deg]">
              <div className="h-[92.84px] w-[105.351px]">
                <img
                  alt=""
                  src={exhibitionDesktopTriangleOutlineUrl}
                  className="block h-full w-full"
                />
              </div>
            </div>
          </div>
          <div className="absolute left-[15px] top-[381px] h-[100px] w-[100px]">
            <div className="relative h-full w-full">
              {Array.from({ length: 25 }).map((_, index) => {
                const row = Math.floor(index / 5)
                const col = index % 5
                return (
                  <img
                    // ドットは5x5の規則配置なので、インデックスから位置を計算します。
                    key={`desktop-dot-${row}-${col}`}
                    alt=""
                    src={exhibitionDesktopDotUrl}
                    className="absolute block h-[6px] w-[6px]"
                    style={{
                      left: `${7 + col * 20}%`,
                      top: `${7 + row * 20}%`,
                    }}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* モバイルは右上装飾のみ表示し、本文の読みやすさを優先します。 */}
        <div className="pointer-events-none absolute left-[-57px] top-[79.33px] h-[471px] w-[450px] overflow-hidden md:hidden">
          <div className="absolute left-[-441.72px] top-[-180.72px] flex h-[394.675px] w-[394.675px] items-center justify-center">
            <div className="rotate-[170.8deg]">
              <div className="h-[344.097px] w-[344.097px]">
                <img
                  alt=""
                  src={exhibitionMobileFloatingCircleUrl}
                  className="block h-full w-full"
                />
              </div>
            </div>
          </div>
          <div className="absolute left-[86.53px] top-[16.37px] flex h-[255.166px] w-[255.166px] items-center justify-center">
            <div className="rotate-[-85.4deg]">
              <div className="h-[236.932px] w-[236.932px]">
                <img
                  alt=""
                  src={exhibitionMobileDashedCircleUrl}
                  className="block h-full w-full"
                />
              </div>
            </div>
          </div>
          <div className="absolute left-[222.32px] top-[211.12px] flex h-[99.409px] w-[111.091px] items-center justify-center">
            <div className="rotate-[-3.68deg]">
              <div className="h-[92.84px] w-[105.351px]">
                <img
                  alt=""
                  src={exhibitionMobileTriangleOutlineUrl}
                  className="block h-full w-full"
                />
              </div>
            </div>
          </div>
          <div className="absolute left-[15px] top-[381px] h-[100px] w-[100px]">
            <div className="relative h-full w-full">
              {Array.from({ length: 25 }).map((_, index) => {
                const row = Math.floor(index / 5)
                const col = index % 5
                return (
                  <img
                    // モバイルのドットも5x5で配置し、Figmaの余白感を再現します。
                    key={`mobile-dot-${row}-${col}`}
                    alt=""
                    src={exhibitionMobileDotUrl}
                    className="absolute block h-[6px] w-[6px]"
                    style={{
                      left: `${7 + col * 20}%`,
                      top: `${7 + row * 20}%`,
                    }}
                  />
                )
              })}
            </div>
          </div>
        </div>

        <div className="relative mx-auto md:max-w-[1024px]">
          <div className="flex items-center justify-center px-4 py-1 md:px-4">
            <p className="text-[24px] font-extrabold leading-[1.5] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
              卒業・修了研究展とは
            </p>
          </div>

          {/* デスクトップ本文は改行位置と文言をFigmaに合わせています。 */}
          <div className="hidden px-4 pt-4 md:flex md:justify-center">
            <div className="max-w-[768px] text-center text-[15px] leading-[2.2] tracking-[0.6px] text-[#4B5459] [font-family:'Noto_Sans_JP',sans-serif]">
              <p className="mb-0">
                芝浦工業大学デザイン工学部の学生・大学院生による、
              </p>
              <p className="mb-0">それぞれの研究を公に展示する場です。</p>
              <p className="mb-0 text-[15px]">&nbsp;</p>
              <p className="mb-0">
                ここには、プロダクト・システム・UXなど、デザイン工学という広い領域における多様な研究が集まります。
              </p>
              <p className="mb-0 text-[15px]">&nbsp;</p>
              <p>
                具体的な物として展示されるものもあれば、形のないシステムやアプリの提案、あるいは思考や概念などさまざまな研究があります。学生一人ひとりが積み上げてきた探求の軌跡を、ありのままに展示する空間です。
              </p>
            </div>
          </div>

          {/* モバイル本文はFigmaの改行と文言をそのまま反映します。 */}
          <div className="px-4 pt-4 md:hidden">
            <div className="text-[15px] leading-[2.2] tracking-[0.6px] text-[#4B5459] [font-family:'Noto_Sans_JP',sans-serif]">
              <p className="mb-0">
                芝浦工業大学デザイン工学部の学生による、
              </p>
              <p className="mb-0">それぞれの研究を公に発表する場です。</p>
              <p className="mb-0 text-[15px]">&nbsp;</p>
              <p className="mb-0">
                ここには、プロダクト、システム、UX、感性、理論の探求など、デザイン工学という広い領域における多様な研究が集まります。
              </p>
              <p className="mb-0 text-[15px]">&nbsp;</p>
              <p>
                具体的な物として展示されるものもあれば、形のないシステムやアプリの提案、あるいは思考や概念などさまざまな研究があります。学生一人ひとりが積み上げてきた探求の軌跡を、ありのままに提示する空間です。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* コンセプトは背景のレイヤーと改行位置をFigma通りに合わせます。 */}
      <section className="relative mt-0 overflow-hidden px-4 py-12 md:mt-0 md:px-[128px] md:py-[96px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          {/* デスクトップ背景 */}
          <img
            alt=""
            src={conceptDesktopBackgroundUrl}
            className="absolute hidden h-full w-full object-cover md:block"
          />
          <img
            alt=""
            src={conceptDesktopOverlayUrl}
            className="absolute hidden h-full w-full object-cover md:block"
          />
          {/* モバイル背景 */}
          <img
            alt=""
            src={conceptMobileBackgroundUrl}
            className="absolute h-full w-full object-cover md:hidden"
          />
          <img
            alt=""
            src={conceptMobileOverlayUrl}
            className="absolute h-full w-full object-cover md:hidden"
          />
        </div>
        <div className="relative flex flex-col items-center gap-4 md:gap-6">
          <div className="flex w-full flex-col items-center py-1 md:py-2">
            <p className="text-[16px] font-extrabold leading-[1.5] text-[#EBEEF0] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[20px]">
              CONCEPT
            </p>
            <p className="text-[48px] font-extrabold leading-[1.5] tracking-[0.96px] text-[#F9F9F9] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[56px] md:tracking-[1.12px]">
              接点
            </p>
          </div>

          {/* デスクトップ本文 */}
          <div className="hidden w-full px-[128px] text-center md:block">
            <div className="text-[18px] leading-[2.2] tracking-[0.72px] text-[#F9F9F9] [font-family:'Noto_Sans_JP',sans-serif]">
              <p className="mb-0">
                卒展は、来場者と研究の接点となるだけでなく、
              </p>
              <p className="mb-0 text-[18px]">&nbsp;</p>
              <p className="mb-0">研究と社会の仕組み、</p>
              <p className="mb-0">研究と過去の経験、</p>
              <p className="mb-0">研究と新たに生まれる可能性、</p>
              <p className="mb-0 text-[18px]">&nbsp;</p>
              <p className="mb-0">
                など接点を持ちうる様々な要素に囲まれている。
              </p>
              <p className="mb-0">
                客観的に見た卒展は、そういった外部の接点を多様に持ち、 様々な接点の上で成り立っている。
              </p>
              <p className="mb-0 text-[18px]">&nbsp;</p>
              <p>
                そんな卒展を覗くと、たくさんのアイデアにあふれていて、 来場者も自分なりに研究との接点を見つけられる空間が広がっている。
              </p>
            </div>
          </div>

          {/* モバイル本文 */}
          <div className="w-full text-center md:hidden">
            <div className="text-[15px] leading-[2.2] tracking-[0.6px] text-[#F9F9F9] [font-family:'Noto_Sans_JP',sans-serif]">
              <p className="mb-0">
                卒展は、来場者と研究の接点となるだけでなく、
              </p>
              <p className="mb-0 text-[15px]">&nbsp;</p>
              <p className="mb-0">研究と社会の仕組み、</p>
              <p className="mb-0">研究と過去の経験、</p>
              <p className="mb-0">研究と新たに生まれる可能性、</p>
              <p className="mb-0 text-[15px]">&nbsp;</p>
              <p className="mb-0">
                など接点を持ちうる様々な要素に囲まれている。
              </p>
              <p className="mb-0">
                客観的に見た卒展は、そういった外部の接点を多様に持ち、 様々な接点の上で成り立っている。
              </p>
              <p className="mb-0 text-[15px]">&nbsp;</p>
              <p>
                そんな卒展を覗くと、たくさんのアイデアにあふれていて、 来場者も自分なりに研究との接点を見つけられる空間が広がっている。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 学生の成果セクションは背景色を白に揃えて落ち着いた印象にします。 */}
      <section className="bg-[#F9F9F9] px-4 pb-12 pt-12 md:px-[128px] md:py-[96px]">
        <div className="relative mx-auto md:max-w-[1024px]">
          <div className="border-b border-[#FB9678] pb-1 md:flex md:justify-center">
            <p className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px] md:tracking-[0.04em]">
              研究・作品紹介
            </p>
          </div>
          <p className="mt-4 text-[13px] leading-[1.9] text-[#4B5459] md:text-center md:text-[15px] md:leading-[2.2] md:tracking-[0.04em]">
            研究の概要をまとめて閲覧することができます。
            <br className="hidden md:block" />
            また、大学でどのような作品を作ってきたのかも見ることができます。
          </p>
          {/* モバイルは1枚ずつフェードで切り替える形式にします。 */}
          <div className="mt-6 md:hidden">
            {mobilePreviewItem ? (
              <Link
                key={mobilePreviewKey}
                href={mobilePreviewItem.href}
                className="flex flex-col gap-2 animate-[top-page-fade_800ms_ease]"
              >
                <div className="aspect-video w-full overflow-hidden rounded-[4px]">
                  <img
                    src={mobilePreviewItem.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-[12px] font-medium leading-[1.5] text-[#4B5459]">
                  {mobilePreviewItem.title}
                </p>
                <p className="text-[12px] text-[#6A7378]">
                  {mobilePreviewItem.author}
                </p>
              </Link>
            ) : null}
          </div>
          <div className="mt-8 hidden grid-cols-3 gap-8 md:grid">
            {/* 研究/作品ページへの導線を統合し、カード全体をクリックできるようにします。 */}
            {visiblePreviewItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex flex-col gap-2 text-center"
              >
                <div className="aspect-video w-full overflow-hidden rounded-[4px]">
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-left text-[12px] font-medium leading-[1.5] text-[#4B5459]">
                  {item.title}
                </p>
                <p className="text-[12px] text-[#6A7378]">{item.author}</p>
              </Link>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <Link
              href="/research"
              className="flex items-center gap-2 rounded-full bg-[#D3793D] px-8 py-4 text-[13px] font-medium text-[#F9F9F9] shadow-[0_0_8px_rgba(106,115,120,0.15)] md:px-[56px] md:py-[20px]"
            >
              学生の成果を見る
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <style jsx global>{`
          /* モバイル用の切り替えはフェードアニメーションで表示します。 */
          @keyframes top-page-fade {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
        `}</style>
      </section>

      {/* イベント紹介は上下余白を設け、指定画像を背景に使い雰囲気を合わせます。 */}
      {/* イベント背景はFigmaの淡いグレーをベースにし、背景画像で質感を足します。 */}
      <section
        className="bg-[#EBEEF0] px-4 py-12 md:px-[128px] md:py-[96px]"
        style={{
          backgroundImage: "url('/image/event_background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto md:max-w-[1024px]">
          <div className="border-b border-[#FB9678] pb-1 md:flex md:justify-center">
            <p className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px] md:tracking-[0.04em]">
              土日限定のイベント
            </p>
          </div>
          <p className="mt-4 text-[13px] leading-[1.9] text-[#4B5459] md:text-center md:text-[15px] md:leading-[2.2] md:tracking-[0.04em]">
            卒業生と直接コミュニケーションをとることができる座談会や、体験展示イベントを予定しています。
          </p>
          <div className="mt-6 hidden gap-6 md:grid md:grid-cols-2">
            <div className="h-[364px] rounded-[4px] bg-[#D9D9D9]" />
            <div className="h-[364px] rounded-[4px] bg-[#D9D9D9]" />
          </div>
          <div className="mt-6 flex justify-center">
            <Link
              href="/events"
              className="flex items-center gap-2 rounded-full bg-[#D3793D] px-8 py-4 text-[13px] font-medium text-[#F9F9F9] shadow-[0_0_8px_rgba(106,115,120,0.15)] md:px-[56px] md:py-[20px]"
            >
              イベントを見る
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 進路情報はイベントの後に配置し、図表を中央に配置します。 */}
      <section className="px-4 py-12 md:px-[128px] md:py-[96px]">
        <div className="mx-auto md:max-w-[1024px]">
          <div className="border-b border-[#FB9678] pb-1">
            <p className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px] md:tracking-[0.04em]">
              卒業生の進路
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-8 md:mt-8 md:grid md:grid-cols-[480px_480px] md:items-center md:gap-[64px]">
            <div>
              <p className="text-[13px] leading-[1.9] text-[#4B5459] md:text-[18px] md:leading-[2.2] md:tracking-[0.04em]">
                卒業生のほとんどは本学大学院への進学、もしくは就職をしています。就職をする学生は、多くがデザイナーやエンジニアとして活躍予定です。
              </p>
              <div className="mt-6 hidden justify-center md:flex md:justify-start">
                <Link
                  href="/career"
                  className="flex items-center gap-2 rounded-full bg-[#D3793D] px-8 py-4 text-[13px] font-medium text-[#F9F9F9] shadow-[0_0_8px_rgba(106,115,120,0.15)] md:px-[56px] md:py-[24px] md:text-[15px]"
                >
                  進路をもっと詳しく
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <CareerPieChart
                gradPercent={gradPercent}
                jobPercent={jobPercent}
                otherPercent={otherPercent}
                total={totalCareers}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-center md:hidden">
            <Link
              href="/career"
              className="flex items-center gap-2 rounded-full bg-[#D3793D] px-8 py-4 text-[13px] font-medium text-[#F9F9F9] shadow-[0_0_8px_rgba(106,115,120,0.15)]"
            >
              進路をもっと詳しく
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 開催場所は上下余白を設け、指定の背景色に合わせて読みやすく示します。 */}
      <section className="bg-[#EBEEF0] px-4 py-12 md:px-[128px] md:py-[96px]">
        <div className="mx-auto md:max-w-[1024px]">
          <div className="border-b border-[#FB9678] pb-1 md:flex md:justify-center">
            <p className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px] md:tracking-[0.04em]">
              開催場所
            </p>
          </div>
          <div className="mt-6 space-y-4 md:flex md:gap-6 md:space-y-0">
            <div className="rounded-lg bg-[#F9F9F9] p-3 md:w-[480px] md:p-4">
              <p className="text-[16px] font-medium text-[#D3793D] md:text-center">
                平日
              </p>
              <p className="mt-1 text-[13px] leading-[1.9] tracking-[0.02em] text-[#4B5459] md:text-[13px] md:tracking-[0.02em]">
                有元史郎記念校友会館交流プラザにて研究の展示をします。展示されている研究の一覧は
                <Link href="/research" className="text-[#D3793D] underline">
                  こちら
                </Link>
                から。
              </p>
            </div>
            <div className="rounded-lg bg-[#F9F9F9] p-3 md:w-[480px] md:p-4">
              <p className="text-[16px] font-medium text-[#D3793D] md:text-center">
                土日
              </p>
              <p className="mt-1 text-[13px] leading-[1.9] tracking-[0.02em] text-[#4B5459] md:text-[13px] md:tracking-[0.02em]">
                平日の研究展示に加え、本部棟5階オープンラボにて体験展示を開催します。体験展示の詳細は
                <Link href="/events" className="text-[#D3793D] underline">
                  こちら
                </Link>
                から
              </p>
            </div>
          </div>
          {/* デスクトップではSIT MAPを追加して学内の位置関係を伝えます。 */}
          <div className="mt-6 hidden md:block">
            <div className="rounded-2xl bg-[#F9F9F9] px-4 py-6">
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-[#DDE1E4]" />
                <p className="text-[16px] font-medium tracking-[0.15em] text-[#D3793D] [font-family:var(--font-roboto)]">
                  SIT MAP
                </p>
                <span className="h-px flex-1 bg-[#DDE1E4]" />
              </div>
              <p className="mt-2 text-center text-[15px] leading-[2.2] tracking-[0.04em] text-[#4B5459]">
                開催場所の大学内の位置はこのようになっています。
              </p>
              <div className="mt-4 overflow-hidden rounded-2xl">
                <img
                  src={sitMapImageUrl}
                  alt="豊洲キャンパス構内の配置図"
                  className="w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* アクセス情報は地図と動画導線を同じカードにまとめます。 */}
      <section className="px-4 pt-12 md:px-[128px] md:py-[96px]">
        <div className="mx-auto md:max-w-[1024px]">
          <div className="border-b border-[#FB9678] pb-1">
            <p className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px] md:tracking-[0.04em]">
              アクセス
            </p>
          </div>
          {/* デスクトップではテキストと地図を2カラムで並べ、Figmaのレイアウトに合わせます。 */}
          <div className="mt-4 flex flex-col gap-6 md:mt-8 md:grid md:grid-cols-[480px_480px] md:gap-[64px]">
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-[13px] leading-[1.9] text-[#4B5459] md:text-[16px] md:tracking-[0.04em]">
                  〒135-8548 東京都江東区豊洲3-7-5
                </p>
                <p className="mt-2 text-[13px] leading-[1.9] text-[#4B5459] md:text-[16px] md:tracking-[0.04em]">
                  東京メトロ有楽町線「豊洲駅」１cまたは３番出口から徒歩７分
                  <br />
                  ゆりかもめ「豊洲駅」から徒歩９分
                  <br />
                  JR京葉線「越中島駅」２番出口から徒歩15分
                </p>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl">
              {/* 指定されたGoogle Mapsの埋め込みコードをそのまま使用し、表示領域をレスポンシブに調整します。 */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.6646539508483!2d139.79262397577705!3d35.6606329725939!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x601889a0774db467%3A0x341667956857f1f8!2z44CSMTM1LTg1NDgg5p2x5Lqs6YO95rGf5p2x5Yy66LGK5rSy77yT5LiB55uu77yX4oiS77yVIOiKnea1puW3pealreWkp-WtpiDosYrmtLLjgq3jg6Pjg7Pjg5Hjgrk!5e0!3m2!1sja!2sjp!4v1770220456567!5m2!1sja!2sjp"
                width="600"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[209px] w-full md:h-[278px]"
                title="芝浦工業大学 豊洲キャンパスの地図"
              />
            </div>
          </div>
          {/* ガイド動画導線は2段目で中央配置に整えます。 */}
          <div className="mt-6 md:mt-8">
            <div className="mx-auto max-w-[768px]">
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-[#DDE1E4]" />
                <p className="text-[12px] font-medium tracking-[0.15em] text-[#D3793D] [font-family:var(--font-roboto)] md:text-[16px] md:tracking-[0.2em]">
                  GUIDE VIDEOS
                </p>
                <span className="h-px flex-1 bg-[#DDE1E4]" />
              </div>
              <p className="mt-2 text-center text-[15px] leading-[2.2] tracking-[0.04em] text-[#4B5459] md:text-[18px]">
                大学への行き方動画はこちらから
              </p>
              <div className="mt-4 flex items-center gap-4 md:justify-center md:gap-[64px]">
                <Link
                  href="/about"
                  className="flex flex-1 items-center justify-center rounded-full border border-[#FB9678] bg-[#F9F9F9] px-6 py-4 text-[13px] font-medium text-[#4B5459] shadow-[0_0_8px_rgba(106,115,120,0.15)] md:max-w-[352px] md:px-[56px] md:py-[24px] md:text-[15px]"
                >
                  豊洲駅から
                </Link>
                <Link
                  href="/about"
                  className="flex flex-1 items-center justify-center rounded-full border border-[#FB9678] bg-[#F9F9F9] px-6 py-4 text-[13px] font-medium text-[#4B5459] shadow-[0_0_8px_rgba(106,115,120,0.15)] md:max-w-[352px] md:px-[56px] md:py-[24px] md:text-[15px]"
                >
                  越中島駅から
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* フッターは既存コンポーネントを使用し、SNS導線をまとめます。 */}
      <div className="px-4 pt-12 md:px-0 md:pt-[48px]">
        <div className="mx-auto w-full md:max-w-[1280px]">
          <Footer className="w-full" />
        </div>
      </div>
    </div>
  )
}
