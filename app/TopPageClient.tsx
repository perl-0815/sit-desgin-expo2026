"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
// 変更理由: チケット画像をWebPではなくSVGで管理し、拡大縮小時の品質劣化を防ぎます。
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
const conceptBackgroundUrl = "/image/background/concept.webp";

// 変更理由: 初回描画時のJS実行と画像取得を軽くするため、下層セクションを分離して遅延ロードします。
const TopPageLowerSections = dynamic(
  () => import("./components/TopPageLowerSections"),
);

export default function TopPageClient({
  careerStats,
  previewItems,
}: TopPageClientProps) {
  const [kvRendered, setKvRendered] = useState(false);
  const [showKvLoadingOverlay, setShowKvLoadingOverlay] = useState(true);
  const [isKvLoadingOverlayFading, setIsKvLoadingOverlayFading] =
    useState(false);
  const [kvComplete, setKvComplete] = useState(false);
  useEffect(() => {
    // 変更理由: 再訪時も前回セッションの保存値で即解除せず、
    // その表示サイクルでの `keyvisual:rendered` 発火を待つため、sessionStorage は参照しません。
    if (document.body.dataset.keyvisualRendered === "1") {
      setKvRendered(true);
    } else {
      const onRendered = () => setKvRendered(true);
      window.addEventListener("keyvisual:rendered", onRendered);
      return () => window.removeEventListener("keyvisual:rendered", onRendered);
    }
  }, []);

  useEffect(() => {
    if (document.body.dataset.keyvisualComplete === "1") {
      setKvComplete(true);
      return;
    }
    const handler = () => setKvComplete(true);
    window.addEventListener("keyvisual:complete", handler);
    return () => window.removeEventListener("keyvisual:complete", handler);
  }, []);

  useEffect(() => {
    // 変更理由: keyvisual:loaded 時点では画像デコードと描画が完了していないケースがあり、
    // ローダーを先に外すとKVパーツが段階的に見えてちらつくため、
    // keyvisual:rendered（描画完了）を待ってから解除します。
    if (!kvRendered) {
      setShowKvLoadingOverlay(true);
      setIsKvLoadingOverlayFading(false);
      return;
    }
    setIsKvLoadingOverlayFading(true);
    const hideTimeoutId = window.setTimeout(() => {
      setShowKvLoadingOverlay(false);
    }, 220);
    return () => window.clearTimeout(hideTimeoutId);
  }, [kvRendered]);

  // 変更理由: 下層セクションは初回ロードで即時マウントせず、スクロール接近時に読み込んで初回負荷を抑えます。
  const [shouldRenderLowerSections, setShouldRenderLowerSections] =
    useState(false);
  const lowerSectionSentinelRef = useRef<HTMLDivElement | null>(null);

  // 開催期間は日本時間で 2026/03/07 00:00 開始、2026/03/18 00:00 到達で終了扱いにします。
  // 変更理由: `new Date(2026, 2, 17)` のようなローカル日付比較だと、
  // サーバーや実行環境のタイムゾーンが日本時間でない場合に 3/18 JST でも「開催中」のままになるためです。
  // `+09:00` を付けた絶対時刻として保持し、SSR/CSR のどちらでも同じ判定結果になるようにします。
  const eventStartDate = new Date("2026-03-07T00:00:00+09:00");
  const eventEndDate = new Date("2026-03-18T00:00:00+09:00");
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilEvent = Math.max(
    0,
    Math.ceil((eventStartDate.getTime() - now.getTime()) / msPerDay),
  );
  // 開催前/開催中/開催終了の3状態に正規化し、画像とテキスト表示を切り替えます。
  const eventTicketStatus: "before" | "during" | "ended" =
    now < eventStartDate
      ? "before"
      : now >= eventEndDate
        ? "ended"
        : "during";

  // データ未登録時でもレイアウトが崩れないよう、フォールバック用の表示データを準備します。
  const fallbackPreviewItems: PreviewItem[] = Array.from({ length: 3 }).map(
    (_, index) => ({
      id: `preview-${index}`,
      title:
        "研究または作品タイトルが入ります。研究または作品タイトルが入ります。",
      author: "苗字 名前",
      imageUrl: "/image/preview.webp",
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
  useEffect(() => {
    if (shouldRenderLowerSections) {
      return;
    }

    // 変更理由: 下層セクションが近づいた時点でだけ動的読込を開始し、初回表示のJS評価量を抑えます。
    const sentinelElement = lowerSectionSentinelRef.current;
    if (!sentinelElement) {
      const immediateTimeoutId = window.setTimeout(() => {
        setShouldRenderLowerSections(true);
      }, 0);
      return () => window.clearTimeout(immediateTimeoutId);
    }

    const revealLowerSections = () => {
      setShouldRenderLowerSections(true);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some((entry) => entry.isIntersecting);
        if (!isIntersecting) {
          return;
        }
        revealLowerSections();
      },
      {
        root: null,
        rootMargin: "1200px 0px",
        threshold: 0,
      },
    );
    observer.observe(sentinelElement);

    // 変更理由: IntersectionObserver が発火しない特殊環境でも表示が欠けないよう、保険でタイムアウト解除を入れます。
    const fallbackTimeoutId = window.setTimeout(revealLowerSections, 3500);
    return () => {
      observer.disconnect();
      window.clearTimeout(fallbackTimeoutId);
    };
  }, [shouldRenderLowerSections]);
  // トップページの各セクションにスクロール時のスライドインを付与します。
  useSectionReveal([shouldRenderLowerSections]);

  return (
    // 画面が短いときでもフッターが下端に揃うよう、最小高さを確保します。
    // モバイルは横幅いっぱいに広げるため、最大幅の制限はmd以上に限定します。
    <div className="mx-auto flex min-h-screen w-full flex-col bg-[#F9F9F9]">
      {showKvLoadingOverlay && (
        <div
          aria-hidden="true"
          // 変更理由: 個別要素のプレースホルダではなく、ロード完了まで画面全体にスケルトンの波を流す要望に合わせます。
          // 単一の全画面レイヤーにすることで、端末サイズに依存せず同じ視覚効果を安定して表示できます。
          className={`fixed inset-0 z-[200] overflow-hidden bg-[#ECEFF1] transition-opacity duration-200 ease-out ${
            isKvLoadingOverlayFading ? "opacity-0" : "opacity-100"
          }`}
        >
          <div
            // 変更理由: 横方向へ移動するハイライト帯を全画面へ敷き、KVロード中であることを直感的に示します。
            className="absolute inset-0 bg-[linear-gradient(110deg,#E5E7EB_12%,#F3F4F6_34%,#E5E7EB_56%)] bg-[length:220%_100%] animate-[kv-skeleton-wave_1800ms_ease-in-out_infinite]"
          />
          <div
            // 変更理由: フラットな1枚色に見えないよう、淡い面光源を重ねて波アニメーションの視認性を補強します。
            className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0)_45%),radial-gradient(circle_at_82%_76%,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0)_48%)]"
          />
        </div>
      )}
      <style>{`
        @keyframes kv-skeleton-wave {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -20% 0;
          }
        }
      `}</style>
      {/* デスクトップは横幅のみ広げ、シングルカラムの構成は維持します。 */}
      {/* 全ページ共通のヘッダーを配置し、スクロール中も固定表示します。 */}
      <GlobalHeader activeId="top" hidden={!kvComplete} />

      {/* 開催情報カードはFigmaの角丸・影・配色をそのまま移植します。 */}
      <section
        data-reveal
        // 変更理由: 右側の装飾を意図的に親外へ配置しているため、横方向だけはセクション内でクリップし、
        // ルート要素の `overflow-x: hidden` に依存せず横スクロール発生を防ぎます。
        className="relative overflow-x-clip px-4 py-12 md:px-8 lg:px-[128px] md:py-[128px]"
      >
        <div
          aria-hidden="true"
          // 変更理由: `100vw` はスクロールバー幅を含んで横はみ出しの原因になるため、
          // 動的ビューポート幅基準の `100dvw` を使ってデスクトップの横スクロール発生を抑制します。
          className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-[100dvw] max-w-[100dvw] -translate-x-1/2 bg-linear-to-b from-[#F9F9F9] to-[#FAFAFA]"
        />
        <div className="pointer-events-none absolute -right-50 top-0 -z-1 hidden h-[527px] w-[677px] overflow-hidden md:block">
          <img
              alt=""
              src={exhibitionInfoDecorationRightUrl}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className="block h-full w-full"
            />
        </div>
        <div className="relative mx-auto overflow-hidden rounded-[24px] bg-[#F9F9F9] p-6 shadow-[0_0_8px_rgba(106,115,120,0.1)] md:max-w-[1024px] md:p-9">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-white/80"
          />
          <div className="relative z-10">
          {/* 変更理由: Figma(1228:14130 / 1228:14545)では見出しがPC/SPとも20px固定のため、ブレークポイント差分をなくして一致させます。 */}
          <div className="border-b border-[#FB9678] pb-1 text-center">
            <p className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
              開催情報
            </p>
          </div>
          <div className="mt-4 flex flex-col items-center gap-4 text-center md:mt-8 md:gap-6">
            {/* 変更理由: 追加要望に合わせ、モバイルはgap-1でさらに詰め、md以上は前回調整のgap-2を維持して視認性を保ちます。 */}
            <div className="flex flex-col items-center gap-1 md:gap-2">
              {/* 変更理由: 日付行はFigmaでPC/SPとも本文24px・曜日16pxのため、可変サイズを廃止して固定します。 */}
              <p className="text-[24px] font-extrabold text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
                3.07
                <span className="text-[16px] text-[#2C68D3]">(土)</span>
                <span className="mx-1 text-[24px] text-[#A3ADB2]">-</span>
                3.17
                <span className="text-[16px] text-[#6A7378]">(火)</span>
              </p>
              {/* 変更理由: 会場テキストはLabel/M(13px) + natural/500(#6A7378)指定のため、色とサイズを統一します。 */}
              <p className="text-[13px] font-medium text-[#6A7378]">
                芝浦工業大学 豊洲キャンパス 交流プラザ
              </p>
            </div>
            {/* 変更理由: モバイルの狭い端末では固定幅(160px+150px+gap)が親幅を超えやすく、 */}
            {/* 「開催時間」の数値が潰れて見切れるため、SPは可変2カラム・PCは従来固定幅にします。 */}
            <div className="flex w-full max-w-[360px] items-center gap-2 text-center md:gap-4">
              {/* 変更理由: 「開催時間」は文字量が多く中央線へ干渉しやすいため、SPでは左カラムを広めに配分します。 */}
              <div className="min-w-0 basis-[58%] px-1 md:w-[160px] md:basis-auto md:flex-none md:px-0">
                {/* 変更理由: ラベルはFigmaでPC/SPとも13px・#6A7378のため、モバイルのみ小さくなる指定を削除します。 */}
                <p className="text-[13px] text-[#6A7378]">
                  開催時間
                </p>
                {/* 変更理由: 端末幅が狭いときだけ自動で縮小し、埋もれを防ぎつつ通常端末では24px表示を維持します。 */}
                {/* 変更理由: 中央線にぶつかりそうな端末では最小14pxまで縮小し、線との重なりを防ぎます。 */}
                <p className="whitespace-nowrap text-[clamp(14px,6.4vw,24px)] font-extrabold text-[#4B5459] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px]">
                  10:00 - 17:00
                </p>
              </div>
              <div className="h-[31.5px] w-px shrink-0 bg-[#DDE1E4]" />
              <div className="min-w-0 basis-[42%] px-1 md:w-[150px] md:basis-auto md:flex-none md:px-0">
                <p className="text-[13px] text-[#6A7378]">
                  入場料
                </p>
                <p className="whitespace-nowrap text-[clamp(16px,6vw,24px)] font-extrabold text-[#4B5459] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px]">
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
                loading="lazy"
                decoding="async"
                fetchPriority="low"
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
                loading="lazy"
                decoding="async"
                fetchPriority="low"
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
        className="relative overflow-x-clip px-4 pb-20 pt-12 md:px-8 lg:px-[128px] md:py-[96px]"
      >
        {/* 背景色はセクション幅ではなくビューポート幅いっぱいに広げ、Figmaのフルブリード背景を再現します。 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-[100dvw] max-w-[100dvw] -translate-x-1/2 bg-linear-to-b from-[#fafafa] to-[#f5f5f5]"
        />
        {/* 左上装飾は一枚SVGに置き換え、Figmaの配置と見た目を固定化します。 */}
        <div className="pointer-events-none absolute left-0 top-0 hidden h-[389px] w-[550px] overflow-hidden md:block">
          <img
            alt=""
            src={exhibitionDecorationLeftUrl}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="block h-full w-full"
          />
        </div>

        {/* 右側装飾も一枚SVGに置き換え、本文領域と干渉しない位置に固定します。 */}
        <div className="pointer-events-none absolute right-0 top-[169px] hidden h-[471px] w-[450px] overflow-hidden md:block">
          <img
            alt=""
            src={exhibitionDecorationRightUrl}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="block h-full w-full"
          />
        </div>

        {/* モバイルは右上装飾のみ表示し、視線の主導権を本文に戻します。 */}
        <div className="pointer-events-none absolute left-[-57px] top-[79.33px] h-[471px] w-[450px] overflow-hidden md:hidden">
          <img
            alt=""
            src={exhibitionDecorationRightUrl}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
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
          <div className="pt-4 md:hidden">
            {/* 変更理由: セクション側の余白に加えて本文にも横余白を入れると有効幅が狭くなり、端末によって意図しない折り返しが発生するため、 */}
            {/* 本文ボックスは中央寄せ+十分な幅にして、デザイン指定の改行位置を維持しやすくします。 */}
            <div className="mx-auto w-full max-w-[360px] text-center text-[16px] font-medium leading-[2.2] tracking-[0.64px] text-[#6A7378] [font-family:'Noto_Sans_JP',sans-serif]">
              <p className="mb-0 whitespace-nowrap">芝浦工業大学デザイン工学部の学生による、</p>
              <p className="mb-0 whitespace-nowrap">それぞれの研究を展示する場です。</p>
              <p className="mb-0 text-[16px]">&nbsp;</p>
              <p className="mb-0 whitespace-nowrap">ここには、プロダクト・システム・UXなど、</p>
              <p className="mb-0 whitespace-nowrap">
                デザイン工学という広い領域における
              </p>
              <p className="mb-0 whitespace-nowrap">多様な研究が集まります。</p>
              <p className="mb-0 text-[16px]">&nbsp;</p>
              <p className="mb-0 whitespace-nowrap">具体的な物として展示されるものもあれば、</p>
              <p className="mb-0 whitespace-nowrap">形のないシステムやアプリの提案、</p>
              <p className="mb-0 whitespace-nowrap">あるいは思考や概念など、</p>
              <p className="mb-0 whitespace-nowrap">さまざまな研究があります。</p>
              <p className="mb-0 text-[16px]">&nbsp;</p>
              <p className="mb-0 whitespace-nowrap">学生一人ひとりが積み上げてきた</p>
              <p className="mb-0 whitespace-nowrap">探求の軌跡を、</p>
              <p className="whitespace-nowrap">
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
        className="relative isolate mt-0 h-[638px] overflow-x-clip px-4 py-12 md:mt-0 md:h-[923px] md:px-8 lg:px-[128px] md:py-[128px]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-[100dvw] max-w-[100dvw] -translate-x-1/2"
        >
          {/* 背景画像はウィンドウ幅いっぱいへ広げ、中央トリミングでFigmaの見え方を維持します。 */}
          <img
            alt=""
            src={conceptBackgroundUrl}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
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
            <div className="text-[24px] font-normal leading-[2.2] tracking-[0.96px] text-[rgba(255,255,255,0.8)] [font-family:'Noto_Sans_JP',sans-serif]">
              <p className="mb-0">
                学びを深め、社会と向き合い、
              </p>
              <p className="mb-0">
                <span>自分なりの</span>
                <span className="text-[28px] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] font-semibold leading-[1.5]">
                  “カタチ”
                </span>
                <span>を積み重ねてきた僕ら。</span>
              </p>
              <p className="mb-0 text-[24px]">&nbsp;</p>
              <p className="mb-0">あらゆるものが交わるこの場所で、</p>
              <p className="mb-0">
                <span>あなたはどんな</span>
                <span className="text-[28px] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] font-semibold leading-[1.5]">
                  “カタチ”
                </span>
                <span>を見つけられるだろうか。</span>
              </p>
              <p className="mb-0 text-[24px]">&nbsp;</p>
              <p className="mb-0 text-[24px] text-center">
                <span className="tracking-[0.64px]">あなたにとっての </span>
                <span className="text-[28px] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] font-semibold leading-[1.5]">
                  「接点」
                </span>
                <span className="tracking-[0.64px]"> が、きっとここにある。</span>
              </p>
            </div>
          </div>

          {/* 変更理由: SP本文は16pxベースにしつつ、“カタチ”と「接点」をDisplay/Mへ切り替えます。 */}
          <div className="w-full text-center md:hidden">
            {/* 変更理由: 端末幅差で意図しない位置に折り返さないよう、本文表示幅を中央寄せのmax幅に固定し、行内折り返しを抑制します。 */}
            <div className="mx-auto w-full max-w-[360px] text-[16px] font-medium leading-[2.2] tracking-[0.64px] text-[rgba(255,255,255,0.8)] [font-family:'Noto_Sans_JP',sans-serif]">
              <p className="mb-0 whitespace-nowrap">
                学びを深め、社会と向き合い、
              </p>
              <p className="mb-0 whitespace-nowrap">
                <span>自分なりの</span>
                <span className="[font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] text-[24px] font-bold leading-[1.5]">
                  “カタチ”
                </span>
                <span>を</span>
              </p>
              <p className="mb-0 whitespace-nowrap">
                積み重ねてきた僕ら。
              </p>
              <p className="mb-0 text-[16px]">&nbsp;</p>
              <p className="mb-0 whitespace-nowrap">あらゆるものが交わるこの場所で、</p>
              <p className="mb-0 whitespace-nowrap">
                <span>あなたはどんな</span>
                <span className="[font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] text-[24px] font-bold leading-[1.5]">
                  “カタチ”
                </span>
                <span>を</span>
              </p>
              <p className="mb-0 whitespace-nowrap">見つけられるだろうか。</p>
              <p className="mb-0 text-[16px]">&nbsp;</p>
              <p className="mb-0 whitespace-nowrap">
                <span>あなたにとっての </span>
                <span className="[font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] text-[24px] font-bold leading-[1.5]">
                  「接点」
                </span>
                <span> が、</span>
              </p>
              <p className="whitespace-nowrap">
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
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="h-[565px] w-[389px]"
          />
        </div>
        <div className="pointer-events-none absolute left-0 top-[320px] hidden md:block">
          <img
            src={worksDecorationSecondaryUrl}
            alt=""
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="h-[260px] w-[550px]"
          />
        </div>
        {/* モバイル装飾はtop-decoration4に統一します。 */}
        <div className="pointer-events-none absolute right-0 top-[120px] md:hidden">
          <img
            src={worksDecorationSecondaryUrl}
            alt=""
            loading="lazy"
            decoding="async"
            fetchPriority="low"
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
          <p className="mt-4 text-[15px] leading-[2] text-[#4B5459] md:text-center md:text-[16px] md:leading-[2] md:tracking-[0.04em]">
            研究や作品をコース・研究室ごとに閲覧できます。
          </p>
          {/* 変更理由: 中央1枚だけ見せ、左右カードはフェードマスクで隠しながら右→左に1枚ずつ送る仕様へ変更します。 */}
          <div className="mt-6 flex justify-center md:mt-8">
            {/* モバイルはカード幅304px・高さ254pxの固定仕様に合わせます。 */}
            {/* 変更理由: モバイル表示窓の最大幅を少し広げ、左右カードの覗き込み量を確保します。 */}
            <div className="relative w-[100dvw] max-w-[420px] md:hidden">
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
                    // 変更理由: 非表示の先読み画像を eager/high で取得すると初回のKV・主要画像と帯域競合するため、
                    // 先読みは lazy/auto に落として初回表示を優先します。
                    loading="lazy"
                    decoding="async"
                  />
                ))}
              </div>
              {/* 研究作品カードの下側シャドウが表示窓で切れないよう、表示窓に下余白を追加して描画領域を確保します。 */}
              <div className="overflow-hidden pb-2">
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
                          // 変更理由: 初回は中央カードの視認性を最優先し、中央のみ eager/high を維持します。
                          // それ以外は lazy/auto にして同時フェッチを抑え、初回表示の体感を改善します。
                          fetchPriority={index === 1 ? "high" : "auto"}
                          loading={index === 1 ? "eager" : "lazy"}
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
              {/* PC側も同様に、カード下シャドウの見切れを防ぐため表示窓の下余白を確保します。 */}
              <div className="overflow-hidden pb-2">
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
                          // 変更理由: PC側もSPと同じ方針で中央カード以外は遅延読み込みにし、
                          // 初回描画時の不要な同時ダウンロードを削減します。
                          fetchPriority={index === 1 ? "high" : "auto"}
                          loading={index === 1 ? "eager" : "lazy"}
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      {/* 変更理由: PCカード本文エリアは固定高102pxに対して上下余白が大きく、 */}
                      {/* タイトル2行分の高さを確保できず1行で切れるため、余白と行間ギャップを詰めて2行表示を維持します。 */}
                      <div className="flex h-[102px] flex-col gap-1 px-3 py-3">
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

      <div
        ref={lowerSectionSentinelRef}
        aria-hidden="true"
        className="h-px w-full"
      />
      {shouldRenderLowerSections ? (
        <TopPageLowerSections careerStats={careerStats} />
      ) : null}
    </div>
  );
}
