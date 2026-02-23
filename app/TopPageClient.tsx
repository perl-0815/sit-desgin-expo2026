"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import CareerPieChart from "./components/CareerPieChart";
import Footer from "./components/Footer";
import GlobalHeader from "./components/GlobalHeader";
import useSectionReveal from "./components/useSectionReveal";

// トップページの構成要素をまとめて管理し、Figmaの階層と同じ順番で描画します。
type CareerStats = {
  total: number;
  gradCount: number;
  jobCount: number;
  otherCount: number;
};

type TopPageClientProps = {
  careerStats: CareerStats;
  previewItems: PreviewItem[];
};

type PreviewItem = {
  id: string;
  title: string;
  author: string;
  imageUrl: string;
  href: string;
  kind: "research" | "works";
};

type WeekendLimitedEvent = {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  href?: string;
  ariaLabel?: string;
};

// SIT MAPの画像は公開フォルダ内の最新版を参照します。
const sitMapImageUrl = "/image/sit_map.png";
// 装飾画像は `/public/image/decoration` に集約し、用途別に管理しやすくします。
// トップページの装飾SVGも同ディレクトリ配下へ参照先を統一します。
const exhibitionDecorationLeftUrl = "/image/decoration/top-decoration1.svg";
const exhibitionDecorationRightUrl = "/image/decoration/top-decoration2.svg";
// 研究・作品紹介セクションで使う装飾も同様に `decoration` 配下へ移動済みです。
const worksDecorationPrimaryUrl = "/image/decoration/top-decoration4.svg";
const worksDecorationSecondaryUrl = "/image/decoration/top-decoration3.svg";
const exhibitionInfoDecorationRightUrl = "/image/decoration/top-decoration5.svg";
// チケット画像は開催ステータス（開催前/開催中/開催終了）ごとに切り替えます。
// 画像差し替えだけで見た目を更新できるよう、パスを状態別にまとめます。
// 命名規則は `to-ticket-<status>-<device>.svg` に統一して管理します。
const topTicketImageUrls = {
  before: {
    pc: "/image/ticket/to-ticket-before-pc.svg",
    sp: "/image/ticket/to-ticket-before-sp.svg",
  },
  during: {
    pc: "/image/ticket/to-ticket-during-pc.svg",
    sp: "/image/ticket/to-ticket-during-sp.svg",
  },
  ended: {
    pc: "/image/ticket/to-ticket-ended-pc.svg",
    sp: "/image/ticket/to-ticket-ended-sp.svg",
  },
} as const;
// ラベル文言は画像に埋め込まずコード側で管理し、文言変更時に差し替えやすくします。
const daysUntilTicketLabel = "開催まであと...";
// コンセプト背景は `public/image/background` に移動したため参照先を合わせます。
// Next.js の公開パスは `public` を除いた `/image/...` になるため、`background` ディレクトリ名のみ追加します。
const conceptBackgroundUrl = "/image/background/concept.png";
// イベント背景も同様に `public/image/background` 配下へ移動済みのため、404回避のため参照先を統一します。
const eventBackgroundUrl = "/image/background/event_background.png";
// 土日限定イベントのカード情報はイベントページと揃え、トップ側も同じ内容をカード表示します。
const weekendLimitedEvents: WeekendLimitedEvent[] = [
  {
    id: "osekkai",
    title: "【高校生向け】 デザイン工学部なんでも相談会-OSEKKAI-",
    description:
      "現役生によるデザイン工学部なんでも相談会です！学部4年生以上が参加しますのでこの機会にたくさん質問してください。",
    imageSrc: "/image/osekkai.png",
    imageAlt: "OSEKKAIのイベントバナー",
    href: "/events/farewell-lecture",
    ariaLabel: "デザイン工学部なんでも相談会-OSEKKAI-ページへ",
  },
  {
    id: "farewell-lecture",
    title: "退職される先生の最終講義と懇親会",
    description:
      "2025年度をもって芝浦工業大学を退職される、島田明先生・吉武良治先生の最終講義および懇親会を実施します。",
    imageSrc: "/image/event-image.png",
    imageAlt: "退職される先生の最終講義と懇親会",
  },
];

export default function TopPageClient({
  careerStats,
  previewItems,
}: TopPageClientProps) {
  const [kvComplete, setKvComplete] = useState(false);
  useEffect(() => {
    if (document.body.dataset.keyvisualComplete === "1") {
      setKvComplete(true);
      return;
    }
    const handler = () => setKvComplete(true);
    window.addEventListener("keyvisual:complete", handler);
    return () => window.removeEventListener("keyvisual:complete", handler);
  }, []);

  const [isGuideVideoModalOpen, setIsGuideVideoModalOpen] = useState(false);
  // 進路データはサーバー側で集計済みの値を受け取り、表示用に割合へ変換します。
  const totalCareers = careerStats.total;
  const gradPercent =
    totalCareers === 0 ? 0 : (careerStats.gradCount / totalCareers) * 100;
  const jobPercent =
    totalCareers === 0 ? 0 : (careerStats.jobCount / totalCareers) * 100;
  const otherPercent =
    totalCareers === 0 ? 0 : (careerStats.otherCount / totalCareers) * 100;

  // 開催期間は 2026/03/07 から 2026/03/17 まで（両日含む）として判定します。
  // 0時基準で日付だけを比較し、時刻差による表示ぶれを防ぎます。
  const eventStartDate = new Date(2026, 2, 7);
  const eventEndDate = new Date(2026, 2, 17);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventStartDate.setHours(0, 0, 0, 0);
  eventEndDate.setHours(0, 0, 0, 0);
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilEvent = Math.max(
    0,
    Math.ceil((eventStartDate.getTime() - today.getTime()) / msPerDay),
  );
  // 開催前/開催中/開催終了の3状態に正規化し、画像とテキスト表示を切り替えます。
  const eventTicketStatus: "before" | "during" | "ended" =
    today < eventStartDate
      ? "before"
      : today > eventEndDate
        ? "ended"
        : "during";

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
  );
  const visiblePreviewItems =
    previewItems.length > 0 ? previewItems : fallbackPreviewItems;
  // 変更理由: 要望に合わせてスライド対象データを常に6件へ正規化し、件数不足時でも同じ周期で循環できるようにします。
  // 6件を超える場合は先頭6件のみを採用し、スライド総数を固定して表示テンポを安定させます。
  const slidePreviewItems =
    visiblePreviewItems.length >= 6
      ? visiblePreviewItems.slice(0, 6)
      : Array.from({ length: 6 }).map(
          (_, index) => visiblePreviewItems[index % visiblePreviewItems.length],
        );
  // 変更理由: 「2000ms間隔で2000msスライド」の挙動を制御するため、現在の中央カード位置とアニメーション状態を分離して持ちます。
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);
  const [isPreviewSliding, setIsPreviewSliding] = useState(false);
  // 変更理由: 要望に合わせて、カードの移動アニメーション時間を3000msに固定します。
  // この値は切り替えタイマーにも利用し、表示周期と移動時間を一致させます。
  const previewSlideDurationMs = 3000;
  // 変更理由: カード寸法を指定値（SP:304x254 / PC:304x273）へ統一し、実装側で明示管理します。
  // スライド移動量もこの幅を基準に計算して、カードサイズ変更時のズレを防ぎます。
  const previewCardWidthPx = 304;
  const previewCardHeightMobilePx = 254;
  const previewCardHeightDesktopPx = 273;
  const previewCardGapPx = 24;
  const previewSlideStepPx = previewCardWidthPx + previewCardGapPx;
  // 変更理由: 固定pxオフセットだと端末幅ごとに中央位置がずれるため、モバイルは「表示窓の50%」基準で中央カードを配置します。
  // これにより、ウィンドウ幅が変わっても中央カードが常にセンターへ収まり、左右カードの見え方が安定します。
  const previewMobileCenteredTranslatePx =
    previewCardWidthPx * 1.5 + previewCardGapPx;
  // 変更理由: スライド中は1ステップ分だけ左へ送る必要があるため、中央基準オフセットに移動量を加算して使います。
  const previewMobileSlidingTranslatePx =
    previewMobileCenteredTranslatePx + previewSlideStepPx;
  // 変更理由: デスクトップもウィンドウ幅に依存せず中央配置を維持するため、
  // モバイルと同様に「表示窓の50%」を基準に中央カード位置を計算します。
  const previewDesktopCenteredTranslatePx =
    previewCardWidthPx * 1.5 + previewCardGapPx;
  // 変更理由: スライド中は1ステップ分だけ左へ移動させるため、中央基準値へ移動量を加えます。
  const previewDesktopSlidingTranslatePx =
    previewDesktopCenteredTranslatePx + previewSlideStepPx;
  // 変更理由: 右→左へ1枚ずつ送るため、常に「前・中央・次」の3枚をトラック上に配置します。
  const previewTrackItems = [
    slidePreviewItems[
      (previewSlideIndex - 1 + slidePreviewItems.length) %
        slidePreviewItems.length
    ],
    slidePreviewItems[previewSlideIndex],
    slidePreviewItems[(previewSlideIndex + 1) % slidePreviewItems.length],
  ];
  // 変更理由: アニメーション開始時に右カード画像の読み込み待ちが見えないよう、
  // 次に表示される候補（+2, +3枚先）の画像URLを先読み対象として事前取得します。
  // 同じ画像URLが重複するケースを考慮して一意化し、不要な再取得を避けます。
  const previewMobilePreloadImageUrls = Array.from(
    new Set(
      [2, 3].map(
        (offset) =>
          slidePreviewItems[
            (previewSlideIndex + offset) % slidePreviewItems.length
          ]?.imageUrl,
      ),
    ),
  ).filter((imageUrl): imageUrl is string => Boolean(imageUrl));
  // 変更理由: デスクトップを中央基準で表示するため、先頭に「前カード」を1枚置いた8枚トラックへ変更します。
  // 前後カードを両側に持たせることで、幅が変わっても中央カードを維持しつつシームレスに循環させます。
  const previewDesktopTrackItems = Array.from({ length: 8 }).map(
    (_, index) =>
      slidePreviewItems[
        (previewSlideIndex - 1 + index + slidePreviewItems.length) %
          slidePreviewItems.length
      ],
  );
  // 変更理由: setInterval と setTimeout の多重制御だと周回境界でイージングが途切れるため、
  // 「1周ごとにスライド完了→インデックス更新→次周開始」の直列ループへ変更して滑らかさを維持します。
  useEffect(() => {
    setIsPreviewSliding(true);
    const timeoutId = window.setTimeout(() => {
      setIsPreviewSliding(false);
      setPreviewSlideIndex(
        (prevIndex) => (prevIndex + 1) % slidePreviewItems.length,
      );
    }, previewSlideDurationMs);
    return () => window.clearTimeout(timeoutId);
  }, [previewSlideIndex, previewSlideDurationMs, slidePreviewItems.length]);
  // トップページの各セクションにスクロール時のスライドインを付与します。
  useSectionReveal();

  // 駅導線ボタンを押したときは外部遷移せず、準備中案内をモーダルで表示します。
  const handleGuideVideoClick = () => {
    setIsGuideVideoModalOpen(true);
  };

  // モーダルを閉じる処理を共通化し、背景クリック・閉じるボタンの両方で再利用します。
  const handleCloseGuideVideoModal = () => {
    setIsGuideVideoModalOpen(false);
  };

  return (
    // 画面が短いときでもフッターが下端に揃うよう、最小高さを確保します。
    // モバイルは横幅いっぱいに広げるため、最大幅の制限はmd以上に限定します。
    <div className="mx-auto flex min-h-screen w-full flex-col bg-[#F9F9F9]">
      {/* デスクトップは横幅のみ広げ、シングルカラムの構成は維持します。 */}
      {/* 全ページ共通のヘッダーを配置し、スクロール中も固定表示します。 */}
      <GlobalHeader activeId="top" hidden={!kvComplete} />

      {/* 開催情報カードはFigmaの角丸・影・配色をそのまま移植します。 */}
      <section
        data-reveal
        className="relative px-4 py-12 md:px-8 lg:px-[128px] md:py-[128px]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 bg-linear-to-b from-[#F9F9F9] to-[#FAFAFA]"
        />
        <div className="pointer-events-none absolute -right-50 top-0 -z-1 hidden h-[527px] w-[677px] overflow-hidden md:block">
          <img
              alt=""
              src={exhibitionInfoDecorationRightUrl}
              className="block h-full w-full"
            />
        </div>
        <div className="relative mx-auto overflow-hidden rounded-[24px] bg-[#F9F9F9] p-6 shadow-[0_0_8px_rgba(106,115,120,0.1)] md:max-w-[1024px] md:p-9">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-white/80"
          />
          <div className="relative z-10">
          {/* モバイル・デスクトップともに見出しを中央寄せにして視線が散らないようにします。 */}
          <div className="border-b border-[#FB9678] pb-1 text-center">
            <p className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px] md:tracking-[0.04em]">
              開催情報
            </p>
          </div>
          <div className="mt-4 flex flex-col items-center gap-4 text-center md:mt-8 md:gap-6">
            <div className="flex flex-col items-center gap-4">
              <p className="text-[20px] font-extrabold text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[32px]">
                3.07
                <span className="text-[16px] text-[#2C68D3]">(土)</span>
                <span className="mx-1 text-[24px] text-[#A3ADB2]">-</span>
                3.17
                <span className="text-[16px] text-[#6A7378]">(火)</span>
              </p>
              <p className="text-[13px] font-medium text-[#404040] md:text-[15px]">
                芝浦工業大学 豊洲キャンパス 交流プラザ
              </p>
            </div>
            <div className="flex items-center gap-4 text-center">
              <div className="w-[160px]">
                <p className="text-[10px] text-[#737373] md:text-[13px]">
                  開催時間
                </p>
                <p className="text-[20px] font-extrabold text-[#4B5459] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px]">
                  10:00 - 17:00
                </p>
              </div>
              <div className="h-[31.5px] w-px bg-[#DDE1E4]" />
              <div className="w-[150px]">
                <p className="text-[10px] text-[#737373] md:text-[13px]">
                  入場料
                </p>
                <p className="text-[16px] font-extrabold text-[#4B5459] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[20px]">
                  無料
                </p>
              </div>
            </div>
            {/* FigmaのチケットUIに合わせ、開催まで表示を画像背景＋文字レイヤーに置き換えます。 */}
            {/* SPとPCでチケット幅が異なるため、背景画像と余白をブレークポイントで分けます。 */}
            <div className="relative aspect-[303/134] w-full max-w-[303px] md:hidden">
              <img
                src={topTicketImageUrls[eventTicketStatus].sp}
                alt=""
                // 背景画像を常に背面に固定し、開催までテキストが描画順で隠れないようにします。
                className="pointer-events-none absolute inset-0 z-0 h-full w-full object-contain"
              />
              {/* 開催前チケットのみ、残り日数のテキストをコード側で重ねて表示します。 */}
              {eventTicketStatus === "before" ? (
                // 左のミシン目エリアを空けることで、文字が背景の意匠と重なって読みにくくなるのを防ぎます。
                // モバイル幅で縮小しても比率が崩れないよう、余白は固定値ではなく割合で確保します。
                <div className="relative z-10 flex h-full flex-col items-center justify-center pl-[21.8%] text-[#F9F9F9]">
                  <p className="[font-family:'Noto_Sans_JP',sans-serif] text-[13px] font-medium leading-[1.5]">
                    {daysUntilTicketLabel}
                  </p>
                  {/* 数字はFigma同様にわずかに傾け、視覚的な勢いを出します。 */}
                  <p className="-skew-x-[8deg] text-center leading-[1.5] text-shadow-[0_0_8px_rgba(106,115,120,0.1)]">
                    <span className="text-[48px] font-extrabold tracking-[0.96px] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                      {daysUntilEvent}
                    </span>
                    <span className="text-[24px] font-bold [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                      日
                    </span>
                  </p>
                </div>
              ) : null}
            </div>
            <div className="relative hidden h-[134px] w-[380px] overflow-hidden md:block">
              <img
                src={topTicketImageUrls[eventTicketStatus].pc}
                alt=""
                // 背景画像を常に背面に固定し、開催までテキストが描画順で隠れないようにします。
                className="pointer-events-none absolute inset-0 z-0 h-full w-full object-contain"
              />
              {/* 開催前チケットのみ、残り日数のテキストをコード側で重ねて表示します。 */}
              {eventTicketStatus === "before" ? (
                // PC版はFigmaの左側スペース(93px)に合わせ、テキストエリア開始位置を固定します。
                <div className="relative z-10 ml-[93px] flex h-full flex-col items-center justify-center text-[#F9F9F9]">
                  <p className="[font-family:'Noto_Sans_JP',sans-serif] text-[18px] font-medium leading-[1.5]">
                    {daysUntilTicketLabel}
                  </p>
                  <p className="-skew-x-[8deg] text-center leading-[1.5] text-shadow-[0_0_8px_rgba(106,115,120,0.1)]">
                    <span className="text-[56px] font-extrabold tracking-[1.12px] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                      {daysUntilEvent}
                    </span>
                    <span className="text-[24px] font-bold [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                      日
                    </span>
                  </p>
                </div>
              ) : null}
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* 卒業・修了研究展セクションはFigmaの文言・改行・タイポグラフィをデバイス別に一致させます。 */}
      {/* モバイルで各セクションの下余白を広げて読みやすさを確保します（下方向のみ増やす）。 */}
      <section
        data-reveal
        className="relative px-4 pb-20 pt-12 md:px-8 lg:px-[128px] md:py-[96px]"
      >
        {/* 背景色はセクション幅ではなくビューポート幅いっぱいに広げ、Figmaのフルブリード背景を再現します。 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 bg-linear-to-b from-[#fafafa] to-[#f5f5f5]"
        />
        {/* 左上装飾は一枚SVGに置き換え、Figmaの配置と見た目を固定化します。 */}
        <div className="pointer-events-none absolute left-0 top-0 hidden h-[389px] w-[550px] overflow-hidden md:block">
          <img
            alt=""
            src={exhibitionDecorationLeftUrl}
            className="block h-full w-full"
          />
        </div>

        {/* 右側装飾も一枚SVGに置き換え、本文領域と干渉しない位置に固定します。 */}
        <div className="pointer-events-none absolute right-0 top-[169px] hidden h-[471px] w-[450px] overflow-hidden md:block">
          <img
            alt=""
            src={exhibitionDecorationRightUrl}
            className="block h-full w-full"
          />
        </div>

        {/* モバイルは右上装飾のみ表示し、視線の主導権を本文に戻します。 */}
        <div className="pointer-events-none absolute left-[-57px] top-[79.33px] h-[471px] w-[450px] overflow-hidden md:hidden">
          <img
            alt=""
            src={exhibitionDecorationRightUrl}
            className="block h-full w-full"
          />
        </div>

        <div className="relative mx-auto md:max-w-[1024px]">
          <div className="flex items-center justify-center px-4 py-1 md:px-4">
            <p className="text-[24px] font-extrabold leading-[1.5] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[32px]">
              卒業・修了研究展とは
            </p>
          </div>

          {/* 変更理由: PC本文はBody/XL(24px, tracking 0.96px, color #6A7378)に合わせ、句読点位置までFigmaに揃えます。 */}
          <div className="hidden px-4 pt-4 md:flex md:justify-center">
            <div className="max-w-[768px] text-center text-[24px] font-medium leading-[2.2] tracking-[0.96px] text-[#6A7378] [font-family:'Noto_Sans_JP',sans-serif]">
              <p className="mb-0">芝浦工業大学デザイン工学部の学生による、</p>
              <p className="mb-0">それぞれの研究を展示する場です。</p>
              <p className="mb-0 text-[24px]">&nbsp;</p>
              <p className="mb-0">
                ここには、プロダクト・システム・UXなど、
              </p>
              <p className="mb-0">
                デザイン工学という広い領域における多様な研究が集まります。
              </p>
              <p className="mb-0 text-[24px]">&nbsp;</p>
              <p className="mb-0">具体的な物として展示されるものもあれば、</p>
              <p className="mb-0">形のないシステムやアプリの提案、</p>
              <p className="mb-0">
                あるいは思考や概念など、さまざまな研究があります。
              </p>
              <p className="mb-0 text-[24px]">&nbsp;</p>
              <p className="mb-0">学生一人ひとりが積み上げてきた</p>
              <p>
                探求の軌跡を、ありのままに展示する空間です。
              </p>
            </div>
          </div>

          {/* 変更理由: SP本文はBody/XL(16px)の改行構成に合わせ、PCと異なる行分割を維持します。 */}
          <div className="px-4 pt-4 md:hidden">
            <div className="text-center text-[16px] font-medium leading-[2.2] tracking-[0.64px] text-[#6A7378] [font-family:'Noto_Sans_JP',sans-serif]">
              <p className="mb-0">芝浦工業大学デザイン工学部の学生による、</p>
              <p className="mb-0">それぞれの研究を展示する場です。</p>
              <p className="mb-0 text-[16px]">&nbsp;</p>
              <p className="mb-0">ここには、プロダクト・システム・UXなど、</p>
              <p className="mb-0">
                デザイン工学という広い領域における
              </p>
              <p className="mb-0">多様な研究が集まります。</p>
              <p className="mb-0 text-[16px]">&nbsp;</p>
              <p className="mb-0">具体的な物として展示されるものもあれば、</p>
              <p className="mb-0">形のないシステムやアプリの提案、</p>
              <p className="mb-0">あるいは思考や概念など、</p>
              <p className="mb-0">さまざまな研究があります。</p>
              <p className="mb-0 text-[16px]">&nbsp;</p>
              <p className="mb-0">学生一人ひとりが積み上げてきた</p>
              <p className="mb-0">探求の軌跡を、</p>
              <p>
                ありのままに展示する空間です。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* コンセプトは背景のレイヤーと改行位置をFigma通りに合わせます。 */}
      {/* モバイルの下余白を少し広げ、次セクションとの間隔を確保します。 */}
      <section
        data-reveal
        // Figmaノード(PC:1228:14205=923px / SP:1228:14602=638px)に合わせてCONCEPTセクション高を固定します。
        className="relative isolate mt-0 h-[638px] px-4 py-12 md:mt-0 md:h-[923px] md:px-8 lg:px-[128px] md:py-[128px]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2"
        >
          {/* 背景画像はウィンドウ幅いっぱいへ広げ、中央トリミングでFigmaの見え方を維持します。 */}
          <img
            alt=""
            src={conceptBackgroundUrl}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative flex flex-col items-center gap-4 md:gap-6">
          <div className="flex w-full flex-col items-center py-1 md:py-2">
            <p className="text-[16px] font-extrabold leading-[1.5] text-[#EBEEF0] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[20px]">
              CONCEPT
            </p>
            <p className="text-[48px] font-extrabold leading-[1.5] tracking-[0.96px] text-[#F9F9F9] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[56px] md:tracking-[1.12px]">
              「接点」
            </p>
          </div>

          {/* 変更理由: コンセプト本文はFigma文言へ差し替え、PCではBody/XL 24px・白80%・強調語のフォント差を再現します。 */}
          <div className="hidden w-full px-[128px] text-center md:block">
            <div className="text-[24px] font-medium leading-[2.2] tracking-[0.96px] text-[rgba(255,255,255,0.8)] [font-family:'Noto_Sans_JP',sans-serif]">
              <p className="mb-0">
                学びを深め、社会と向き合い、
              </p>
              <p className="mb-0">
                <span>自分なりの</span>
                <span className="[font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] font-bold leading-[1.5]">
                  “カタチ”
                </span>
                <span>を積み重ねてきた僕ら。</span>
              </p>
              <p className="mb-0 text-[24px]">&nbsp;</p>
              <p className="mb-0">あらゆるものが交わるこの場所で、</p>
              <p className="mb-0">
                <span>あなたはどんな</span>
                <span className="[font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] font-bold leading-[1.5]">
                  “カタチ”
                </span>
                <span>を見つけられるだろうか。</span>
              </p>
              <p className="mb-0 text-[24px]">&nbsp;</p>
              <p>
                <span className="text-[16px] tracking-[0.64px]">あなたにとっての </span>
                <span className="[font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] text-[32px] font-bold leading-[1.5]">
                  「接点」
                </span>
                <span className="text-[16px] tracking-[0.64px]"> が、きっとここにある。</span>
              </p>
            </div>
          </div>

          {/* 変更理由: SP本文は16pxベースにしつつ、“カタチ”と「接点」をDisplay/Mへ切り替えます。 */}
          <div className="w-full text-center md:hidden">
            <div className="text-[16px] font-medium leading-[2.2] tracking-[0.64px] text-[rgba(255,255,255,0.8)] [font-family:'Noto_Sans_JP',sans-serif]">
              <p className="mb-0">
                学びを深め、社会と向き合い、
              </p>
              <p className="mb-0">
                <span>自分なりの</span>
                <span className="[font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] text-[24px] font-bold leading-[1.5]">
                  “カタチ”
                </span>
                <span>を</span>
              </p>
              <p className="mb-0">
                積み重ねてきた僕ら。
              </p>
              <p className="mb-0 text-[16px]">&nbsp;</p>
              <p className="mb-0">あらゆるものが交わるこの場所で、</p>
              <p className="mb-0">
                <span>あなたはどんな</span>
                <span className="[font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] text-[24px] font-bold leading-[1.5]">
                  “カタチ”
                </span>
                <span>を</span>
              </p>
              <p className="mb-0">見つけられるだろうか。</p>
              <p className="mb-0 text-[16px]">&nbsp;</p>
              <p className="mb-0">
                <span>あなたにとっての </span>
                <span className="[font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] text-[24px] font-bold leading-[1.5]">
                  「接点」
                </span>
                <span> が、</span>
              </p>
              <p>
                きっとここにある。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 学生の成果セクションは背景色を白に揃えて落ち着いた印象にします。 */}
      {/* モバイルの下余白のみ増やして、セクション終端の詰まり感を解消します。 */}
      <section
        data-reveal
        className="relative bg-[#F9F9F9] px-4 py-12 md:px-8 lg:px-[128px] md:py-[128px]"
      >
        {/* 背景装飾はFigma指定のtop-decoration3/4を使用します。 */}
        <div className="pointer-events-none absolute right-0 top-0 hidden md:block">
          <img
            src={worksDecorationPrimaryUrl}
            alt=""
            className="h-[565px] w-[389px]"
          />
        </div>
        <div className="pointer-events-none absolute left-0 top-[320px] hidden md:block">
          <img
            src={worksDecorationSecondaryUrl}
            alt=""
            className="h-[260px] w-[550px]"
          />
        </div>
        {/* モバイル装飾はtop-decoration4に統一します。 */}
        <div className="pointer-events-none absolute right-0 top-[120px] md:hidden">
          <img
            src={worksDecorationSecondaryUrl}
            alt=""
            className="h-[260px] w-[260px]"
          />
        </div>

        <div className="relative mx-auto md:max-w-[1024px]">
          <div className="border-b border-[#FB9678] pb-1 md:flex md:justify-center">
            <p className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px] md:tracking-[0.04em]">
              研究・作品紹介
            </p>
          </div>
          {/* タイトル下の本文はBodyLに合わせ、サイズと行間を一段上げます。 */}
          <p className="mt-4 text-[15px] leading-[2.2] text-[#4B5459] md:text-center md:text-[16px] md:leading-[2.2] md:tracking-[0.04em]">
            研究や作品をコース・研究室ごとに閲覧できます。
          </p>
          {/* 変更理由: 中央1枚だけ見せ、左右カードはフェードマスクで隠しながら右→左に1枚ずつ送る仕様へ変更します。 */}
          <div className="mt-6 flex justify-center md:mt-8">
            {/* モバイルはカード幅304px・高さ254pxの固定仕様に合わせます。 */}
            {/* 変更理由: モバイル表示窓の最大幅を少し広げ、左右カードの覗き込み量を確保します。 */}
            <div className="relative w-screen max-w-[420px] md:hidden">
              {/* 変更理由: 次周に右側から入る画像を非表示で先読みし、切り替え開始時のロード遅延を抑えます。 */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
              >
                {previewMobilePreloadImageUrls.map((imageUrl) => (
                  <img
                    key={`mobile-preload-${imageUrl}`}
                    src={imageUrl}
                    alt=""
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                ))}
              </div>
              <div className="overflow-hidden">
                <div
                  // 変更理由: モバイルカード間の指定マージンを24pxに統一し、PCと同じ基準の余白で見せ方を揃えます。
                  className="flex gap-6"
                  style={{
                    transform: isPreviewSliding
                      ? `translateX(calc(50% - ${previewMobileSlidingTranslatePx}px))`
                      : `translateX(calc(50% - ${previewMobileCenteredTranslatePx}px))`,
                    transition: isPreviewSliding
                      ? `transform ${previewSlideDurationMs}ms cubic-bezier(0.22, 1, 0.36, 1)`
                      : "none",
                  }}
                >
                  {previewTrackItems.map((item, index) => (
                    <Link
                      key={`${item.id}-sp-track-${previewSlideIndex}-${index}`}
                      href={item.href}
                      className="group block w-[304px] shrink-0 rounded-[4px] bg-[#F9F9F9] shadow-[0_0_8px_0_rgba(106,115,120,0.10)]"
                      style={{ height: `${previewCardHeightMobilePx}px` }}
                    >
                      <div className="h-[171px] w-full overflow-hidden rounded-[4px]">
                        <img
                          src={item.imageUrl}
                          alt=""
                          // 変更理由: 右カード（次に中央へ来るカード）は取得優先度を上げ、開始直後の表示欠けを防ぎます。
                          fetchPriority={index === 2 ? "high" : "auto"}
                          loading="eager"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex h-[83px] flex-col gap-1 px-2 py-3">
                        <p className="line-clamp-2 text-[12px] font-medium leading-[1.5] text-[#4B5459] transition-colors duration-200 group-hover:text-[#D3793D] group-active:text-[#D3793D]">
                          {item.title}
                        </p>
                        <p className="text-[12px] leading-[1.6] tracking-[0.02em] text-[#6A7378]">
                          {item.author}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  // 変更理由: SPは中央カードの可視性を優先し、透明領域を広げてテキストが隠れないようにします。
                  background:
                    "linear-gradient(90deg,#F9F9F9 0%,rgba(249,249,249,0) 8%,rgba(249,249,249,0) 92%,#F9F9F9 100%)",
                }}
              />
            </div>
            {/* 変更理由: 画面縮小時にマスク位置と表示領域がずれないよう、PCは可変幅 + 最大幅制御にします。 */}
            <div className="relative hidden w-full max-w-[984px] md:block">
              <div className="overflow-hidden">
                <div
                  className="flex gap-6"
                  style={{
                    transform: isPreviewSliding
                      ? `translateX(calc(50% - ${previewDesktopSlidingTranslatePx}px))`
                      : `translateX(calc(50% - ${previewDesktopCenteredTranslatePx}px))`,
                    transition: isPreviewSliding
                      ? `transform ${previewSlideDurationMs}ms cubic-bezier(0.22, 1, 0.36, 1)`
                      : "none",
                  }}
                >
                  {previewDesktopTrackItems.map((item, index) => (
                    <Link
                      key={`${item.id}-pc-track-${previewSlideIndex}-${index}`}
                      href={item.href}
                      className="group block w-[304px] shrink-0 rounded-[8px] bg-[#F9F9F9] shadow-[0_0_8px_0_rgba(106,115,120,0.10)]"
                      style={{ height: `${previewCardHeightDesktopPx}px` }}
                    >
                      <div className="h-[171px] w-full overflow-hidden rounded-[4px]">
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex h-[102px] flex-col gap-2 px-3 py-5">
                        <p className="line-clamp-2 text-[16px] font-medium leading-[1.5] text-[#4B5459] transition-colors duration-200 group-hover:text-[#D3793D] group-active:text-[#D3793D]">
                          {item.title}
                        </p>
                        <p className="text-[16px] leading-[1.6] tracking-[0.02em] text-[#6A7378]">
                          {item.author}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg,#F9F9F9 5%,rgba(249,249,249,0) 25%,rgba(249,249,249,0) 75%,#F9F9F9 95%)",
                }}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Link
              href="/research"
              // 有色ボタンはFigmaのホバー仕様に合わせ、白グラデーションを重ねて300msで明るく見せます。
              className="flex items-center gap-2 rounded-full bg-[#D3793D] px-8 py-4 text-[13px] font-medium text-[#F9F9F9] shadow-[0_0_8px_rgba(106,115,120,0.1)] transition-[background,box-shadow] duration-300 ease-in-out hover:[background:linear-gradient(108.58deg,rgba(255,255,255,0.20)_0.58%,rgba(255,255,255,0.15)_47.57%,rgba(255,255,255,0.10)_94.56%),#D3793D] hover:[background-blend-mode:plus-lighter] md:px-[56px] md:py-[20px]"
            >
              学生の成果を見る
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* イベント紹介は上下余白を設け、指定画像を背景に使い雰囲気を合わせます。 */}
      {/* イベント背景はFigmaの淡いグレーをベースにし、背景画像で質感を足します。 */}
      <section
        data-reveal
        // Figmaノード(PC:1228:14268=1040px / SP:1228:14631=1098.125px)に合わせてイベントセクション高を固定します。
        className="relative isolate h-[1098.125px] px-4 py-12 md:h-[1040px] md:px-8 lg:px-[128px] md:py-[128px]"
      >
        {/* 土日限定イベントの背景もフルブリードにし、左右の余白で画像が途切れないようにします。 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 bg-[#EBEEF0]"
          style={{
            backgroundImage: `url('${eventBackgroundUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="mx-auto md:max-w-[1024px]">
          <div className="border-b border-[#FB9678] pb-1 md:flex md:justify-center">
            <p className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px] md:tracking-[0.04em]">
              土日限定のイベント
            </p>
          </div>
          {/* タイトル下の本文はBodyLに合わせ、サイズと行間を一段上げます。 */}
          <p className="mt-4 text-[15px] leading-[2.2] text-[#4B5459] md:text-center md:text-[16px] md:leading-[2.2] md:tracking-[0.04em]">
            卒業生と直接コミュニケーションをとることができる座談会や、体験展示イベントを予定しています。
          </p>
          {/* 土日限定イベントはイベントページと同じカード構成に揃え、トップでも概要を確認できるようにします。 */}
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {weekendLimitedEvents.map((event) => (
              <TopWeekendLimitedEventCard key={event.id} event={event} />
            ))}
          </div>
          {/* モバイルはボタン下の余白を少し足します。 */}
          <div className="mt-6 flex justify-center pb-4 md:pb-0">
            <Link
              href="/events"
              // 有色ボタンはFigmaのホバー仕様に合わせ、白グラデーションを重ねて300msで明るく見せます。
              className="flex items-center gap-2 rounded-full bg-[#D3793D] px-8 py-4 text-[13px] font-medium text-[#F9F9F9] shadow-[0_0_8px_rgba(106,115,120,0.1)] transition-[background,box-shadow] duration-300 ease-in-out hover:[background:linear-gradient(108.58deg,rgba(255,255,255,0.20)_0.58%,rgba(255,255,255,0.15)_47.57%,rgba(255,255,255,0.10)_94.56%),#D3793D] hover:[background-blend-mode:plus-lighter] md:px-[56px] md:py-[20px]"
            >
              イベントを見る
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 進路情報はイベントの後に配置し、Figmaの2カラム構成を再現します。 */}
      <section
        data-reveal
        className="relative bg-[#F9F9F9] px-4 py-12 md:px-8 lg:px-[128px] md:py-[128px]"
      >
        {/* 装飾画像の配置ルールに合わせ、dotgridはdecorationフォルダから参照します。 */}
        <div className="pointer-events-none absolute right-6 top-6 hidden md:block md:right-[128px] md:top-[48px]">
          <img
            src="/image/decoration/dotgrid.svg"
            alt=""
            className="h-[144px] w-[192px]"
          />
        </div>
        {/* PC表示のみの円装飾も、他装飾と同じdecorationフォルダ配下から読み込みます。 */}
        <div className="pointer-events-none absolute left-70 top-110 hidden -translate-x-1/3 -translate-y-1/2 md:block">
          <img
            src="/image/decoration/circle.svg"
            alt=""
            className="h-[320px] w-[320px]"
          />
        </div>

        <div className="mx-auto md:max-w-[1024px]">
          <div className="mt-4 flex flex-col gap-8 md:mt-0 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start md:gap-[64px] lg:grid-cols-[480px_480px]">
            <div className="flex w-full flex-col md:min-h-[463px]">
              {/* タイトル直下の本文は上詰めに固定し、下段の余白は別コンテナで扱います。 */}
              <div>
                {/* 見出し下の線は左カラム幅に合わせ、右側にグラフが来る構成にします。 */}
                <div className="border-b-2 border-[#FB9678] pb-1">
                  <p className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                    卒業生の進路
                  </p>
                </div>
                {/* タイトル下の本文はBodyLに合わせ、サイズと行間を一段上げます。 */}
                <p className="mt-4 text-[15px] leading-[2.2] text-[#4B5459] md:text-[16px] md:leading-[2.2] md:tracking-[0.04em]">
                  卒業生のほとんどは本学大学院への進学、もしくは就職をしています。就職をする学生は、多くがデザイナーやエンジニアとして活躍予定です。
                </p>
                {/* Figma指定に合わせ、PCのみ本文下へ12px注釈を配置して進路データの母集団差分を明示します。 */}
                <p className="mt-4 hidden text-[12px] leading-[1.6] tracking-[0.02em] text-[#6A7378] md:block">
                  ※卒業・修了研究展に出展する学生の進路の割合です。デザイン工学部全体の進路の割合とは異なる可能性があります。
                </p>
              </div>
              {/* PCのみ、残り高さの中央にボタンを配置してFigmaのバランスに合わせます。 */}
              <div className="mt-6 hidden md:flex md:flex-1 md:items-center md:justify-center">
                <Link
                  href="/career"
                  // 有色ボタンはFigmaのホバー仕様に合わせ、白グラデーションを重ねて300msで明るく見せます。
                  className="flex items-center gap-2 rounded-full bg-[#D3793D] px-8 py-4 text-[13px] font-medium text-[#F9F9F9] shadow-[0_0_8px_rgba(106,115,120,0.1)] transition-[background,box-shadow] duration-300 ease-in-out hover:[background:linear-gradient(108.58deg,rgba(255,255,255,0.20)_0.58%,rgba(255,255,255,0.15)_47.57%,rgba(255,255,255,0.10)_94.56%),#D3793D] hover:[background-blend-mode:plus-lighter]"
                >
                  進路をもっと詳しく
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
            {/* 中間幅のデスクトップでは右カラムが縮むため、要素がはみ出さないよう幅を可変にします。 */}
            <div className="flex w-full justify-center md:justify-end">
              <CareerPieChart
                gradPercent={gradPercent}
                jobPercent={jobPercent}
                otherPercent={otherPercent}
                total={totalCareers}
              />
            </div>
          </div>
          {/* FigmaのSP版は注釈がグラフ下にあるため、モバイルのみ同文言を同タイポグラフィで表示します。 */}
          <p className="mt-4 text-[12px] leading-[1.6] tracking-[0.02em] text-[#6A7378] md:hidden">
            ※卒業・修了研究展に出展する学生の進路の割合です。デザイン工学部全体の進路の割合とは異なる可能性があります。
          </p>
          <div className="mt-6 flex justify-center md:hidden">
            <Link
              href="/career"
              // 有色ボタンはFigmaのホバー仕様に合わせ、白グラデーションを重ねて300msで明るく見せます。
              className="flex items-center gap-2 rounded-full bg-[#D3793D] px-8 py-4 text-[13px] font-medium text-[#F9F9F9] shadow-[0_0_8px_rgba(106,115,120,0.1)] transition-[background,box-shadow] duration-300 ease-in-out hover:[background:linear-gradient(108.58deg,rgba(255,255,255,0.20)_0.58%,rgba(255,255,255,0.15)_47.57%,rgba(255,255,255,0.10)_94.56%),#D3793D] hover:[background-blend-mode:plus-lighter]"
            >
              進路をもっと詳しく
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 開催場所はFigma更新に合わせ、ガイド動画を同セクション内へ統合します。 */}
      <section
        data-reveal
        className="bg-[#F9F9F9] px-4 py-12 md:px-8 lg:px-[128px] md:py-[128px]"
      >
        <div className="mx-auto flex flex-col gap-4 md:max-w-[1024px]">
          {/* 見出しは白背景+下線の構成に揃え、サイズはFigmaの20pxで固定します。 */}
          <div className="w-full border-b-2 border-[#FB9678] py-1">
            {/* デスクトップのみ、開催場所の見出しテキストを中央揃えにします。 */}
            <p className="text-[20px] font-extrabold leading-[1.5] tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-center">
              開催場所
            </p>
          </div>

          {/* 平日・土日の説明カードは、Figmaの共通コンポーネント（白80%背景＋薄枠＋角丸）に揃えます。 */}
          <div className="flex flex-col gap-3 md:flex-row md:gap-6">
            <div className="rounded-[12px] border border-[#EBEEF0] bg-[rgba(255,255,255,0.8)] p-3 text-left md:flex-1 md:items-center md:text-center">
              <p className="text-[16px] font-medium leading-[1.5] text-[#D3793D] md:text-center">
                平日
              </p>
              {/* 要望に合わせて「有元史郎記念校友会館」の文言を削除し、交流プラザ表記へ統一します。 */}
              <p className="mt-1 text-[13px] leading-[1.9] tracking-[0.02em] text-[#4B5459] md:text-center">
                交流プラザにて研究の展示をします。
                <br className="hidden md:block" />
                展示されている研究の一覧は
                <Link href="/research" className="text-[#D3793D] underline">
                  こちら
                </Link>
                から。
              </p>
            </div>
            <div className="rounded-[12px] border border-[#EBEEF0] bg-[rgba(255,255,255,0.8)] p-3 text-left md:flex-1 md:items-center md:text-center">
              <p className="text-[16px] font-medium leading-[1.5] text-[#D3793D] md:text-center">
                土日
              </p>
              <p className="mt-1 text-[13px] leading-[1.9] tracking-[0.02em] text-[#4B5459] md:text-center">
                平日の研究展示に加え、本部棟5階オープンラボにて体験展示を開催します。
                <br className="hidden md:block" />
                体験展示の詳細は
                <Link href="/events" className="text-[#D3793D] underline">
                  こちら
                </Link>
                から。
              </p>
            </div>
          </div>

          {/* ガイド動画は開催場所セクション内へ移動し、FigmaのBody/Mに合わせてSP/PCとも説明文を13pxで統一します。 */}
          <div className="w-full py-6">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-[#DDE1E4]" />
              <p className="text-[16px] font-medium tracking-[0.15em] text-[#D3793D] [font-family:var(--font-roboto)]">
                GUIDE VIDEOS
              </p>
              <span className="h-px flex-1 bg-[#DDE1E4]" />
            </div>
            <p className="mt-2 text-center text-[13px] leading-[1.9] tracking-[0.02em] text-[#4B5459]">
              大学への行き方動画はこちらから！
              <br />
              （Youtubeに遷移します。）
            </p>
            {/* SP/PCともに2ボタンを横並びにし、Figmaの線ボタン見た目を維持します。 */}
            <div className="mt-4 flex items-center gap-4 md:justify-center md:gap-6 md:px-12">
              <button
                type="button"
                onClick={handleGuideVideoClick}
                // 枠線ボタンはFigma仕様に合わせ、300msのイースイン・イースアウトで塗りと文字色を反転します。
                className="group flex flex-1 items-center justify-center gap-2 rounded-full border border-[#FB9678] bg-[#F9F9F9] px-6 py-4 text-[13px] font-medium text-[#4B5459] shadow-[0_0_8px_rgba(106,115,120,0.1)] transition-[background-color,color,border-color] duration-300 ease-in-out hover:bg-[#D3793D] hover:text-[#F9F9F9] md:max-w-[352px]"
              >
                豊洲駅から
                <img
                  src="/icon/link.svg"
                  alt=""
                  className="h-4 w-4 transition-[filter] duration-300 ease-in-out group-hover:brightness-0 group-hover:invert"
                />
              </button>
              <button
                type="button"
                onClick={handleGuideVideoClick}
                // 枠線ボタンはFigma仕様に合わせ、300msのイースイン・イースアウトで塗りと文字色を反転します。
                className="group flex flex-1 items-center justify-center gap-2 rounded-full border border-[#FB9678] bg-[#F9F9F9] px-6 py-4 text-[13px] font-medium text-[#4B5459] shadow-[0_0_8px_rgba(106,115,120,0.1)] transition-[background-color,color,border-color] duration-300 ease-in-out hover:bg-[#D3793D] hover:text-[#F9F9F9] md:max-w-[352px]"
              >
                越中島駅から
                <img
                  src="/icon/link.svg"
                  alt=""
                  className="h-4 w-4 transition-[filter] duration-300 ease-in-out group-hover:brightness-0 group-hover:invert"
                />
              </button>
            </div>
          </div>

          {/* SIT MAPは背景カードを廃止し、見出し線＋説明＋地図のみの構成へ変更します。 */}
          <div className="w-full py-6">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-[#DDE1E4]" />
              <p className="text-[16px] font-medium tracking-[0.15em] text-[#D3793D] [font-family:var(--font-roboto)]">
                SIT MAP
              </p>
              <span className="h-px flex-1 bg-[#DDE1E4]" />
            </div>
            {/* 参照ノード(1622:5254/1622:5255)のBody/M仕様に合わせ、SIT MAP下もSP/PCとも13pxを維持します。 */}
            <p className="mt-2 text-center text-[13px] leading-[1.9] tracking-[0.02em] text-[#4B5459]">
              開催場所の交流プラザの位置はこちらです。
            </p>
            <div className="mt-4 overflow-hidden">
              <img
                src={sitMapImageUrl}
                alt="豊洲キャンパス構内の配置図"
                className="w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* アクセスはFigma通り、上部が白系・下部がグレー系へ落ちる縦グラデ背景に変更します。 */}
      <section
        data-reveal
        className="bg-[#F9F9F9] px-4 py-12 md:px-8 lg:px-[128px] md:py-[128px]"
      >
        <div className="mx-auto md:max-w-[1024px]">
          {/* デスクトップは「卒業生の進路」と同様に、見出し線を中間幅で止めて右に地図を配置します。 */}
          <div className="mt-4 flex flex-col gap-6 md:mt-0 lg:grid lg:grid-cols-[480px_480px] lg:items-start lg:gap-[64px]">
            <div>
              {/* 見出し下の線は下のテキストボックス幅に揃えるため、固定幅ではなく左カラム全幅に合わせます。 */}
              <div className="w-full border-b-2 border-[#FB9678] pb-1">
                <p className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px] md:tracking-[0.04em]">
                  アクセス
                </p>
              </div>
              <div className="mt-4">
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
            <div className="overflow-hidden lg:mt-0">
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
        </div>
      </section>

      {/* フッターは既存コンポーネントを使用し、SNS導線をまとめます。 */}
      <div className="px-4 pt-12 md:px-0 md:pt-[48px]">
        <div className="mx-auto w-full md:max-w-[1280px]">
          <Footer className="w-full" />
        </div>
      </div>

      {/* 駅ガイド動画が未完成のため、クリック時はページ遷移ではなく準備中モーダルを表示します。 */}
      {isGuideVideoModalOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2E3437]/55 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guide-video-modal-title"
          onClick={handleCloseGuideVideoModal}
        >
          <div
            className="w-full max-w-[420px] rounded-2xl bg-[#F9F9F9] p-6 text-center shadow-[0_0_16px_rgba(46,52,55,0.2)] md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <p
              id="guide-video-modal-title"
              className="text-[24px] font-extrabold tracking-[0.04em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]"
            >
              現在準備中
            </p>
            <p className="mt-3 text-[14px] leading-[1.9] text-[#4B5459] md:text-[15px]">
              駅から大学までの行き方動画は現在準備中です。
              <br />
              公開まで今しばらくお待ちください。
            </p>
            <button
              type="button"
              onClick={handleCloseGuideVideoModal}
              // 作品ページの「閉じる」ボタン表現（淡いグレーの丸ピル＋マイナス）に揃えてUIの一貫性を保ちます。
              className="mt-6 inline-flex min-w-[140px] items-center justify-center gap-2 rounded-full border border-[#A3ADB2] bg-[#F9F9F9] px-8 py-3 text-[14px] font-medium text-[#4B5459] shadow-[0_0_8px_rgba(106,115,120,0.1)] transition-[background-color,color,border-color] duration-300 ease-in-out hover:bg-[#4B5459] hover:text-[#F9F9F9] md:text-[15px]"
            >
              閉じる
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M6 12H18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TopWeekendLimitedEventCard({ event }: { event: WeekendLimitedEvent }) {
  const cardContent = (
    <article className="flex h-full flex-col gap-3 rounded-[12px] border border-[#EBEEF0] bg-white/80 p-4 shadow-[0_0_8px_rgba(106,115,120,0.1)] md:gap-5 md:rounded-[20px] md:p-6">
      <img
        src={event.imageSrc}
        alt={event.imageAlt}
        className="aspect-[1920/1080] w-full rounded-[8px] object-cover md:rounded-[12px]"
      />
      <div className="flex flex-col gap-1 md:gap-2">
        <h2 className="text-[20px] font-extrabold leading-[1.5] tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px]">
          {event.title}
        </h2>
        {/* 本文は2行で打ち切り、カード間の高さ差を抑えて整列を維持します。 */}
        <p
          className="text-[15px] leading-[2] tracking-[0.04em] text-[#6A7378] md:text-[18px]"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {event.description}
        </p>
      </div>
      <div className="mt-auto flex justify-end">
        <span className="inline-flex items-center gap-1 px-1 text-[13px] font-medium leading-[1.5] text-[#D3793D] md:gap-2 md:px-2 md:text-[15px]">
          <span>詳しく見る</span>
          <TopEventChevronRightIcon />
        </span>
      </div>
    </article>
  );

  if (!event.href) {
    return cardContent;
  }

  return (
    <Link
      href={event.href}
      aria-label={event.ariaLabel}
      className="block rounded-[12px] outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-[#FB9678] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EBEEF0] md:rounded-[20px]"
    >
      {cardContent}
    </Link>
  );
}

function TopEventChevronRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-hidden="true"
    >
      <path
        d="M10 7L15 12L10 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
