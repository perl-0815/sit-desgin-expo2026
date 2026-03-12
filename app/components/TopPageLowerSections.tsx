"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import CareerPieChart from "./CareerPieChart";
import Footer from "./Footer";

type CareerStats = {
  total: number;
  gradCount: number;
  jobCount: number;
  otherCount: number;
};

type TopPageLowerSectionsProps = {
  careerStats: CareerStats;
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
type RadioEpisode = {
  number: number;
  title: string;
  detail: string;
  cast: string;
  duration: string;
  href: string;
};

// 変更理由: フィグマ構成を踏襲するため、ラジオは固定データで行構造を先に再現し、
// 将来CMS/APIへ差し替える際に最小変更で移行できるよう配列で管理します。
const radioEpisodes: RadioEpisode[] = [
  {
    number: 1,
    title: "卒展誕生秘話を語る〜卒展委員TOP2対談〜",
    detail:
      "卒展立ち上げ期の判断や苦労、委員会の初期構想を中心に、全体をどう立ち上げたかを振り返る回です。",
    cast: "荒井×卒展委員会TOP2",
    duration: "06:32",
    href: "https://www.youtube.com/",
  },
  {
    number: 2,
    title: "「接点」の生みの主！？コンセプトに込められた想いとは──",
    detail:
      "卒展コンセプト「接点」がどのように形づくられたのか、キーワードの背景と狙いを深掘りする回です。",
    cast: "荒井×コンセプト班",
    duration: "06:32",
    href: "https://www.youtube.com/",
  },
  {
    number: 3,
    title:
      "\"楽しい\"を生み出す！来場者とデザ工に自然な「接点」を持ってもらうには？",
    detail:
      "会場体験の設計や見せ方の工夫を通して、来場者と学生が無理なくつながる仕掛けを話す回です。",
    cast: "荒井×Web班(〇〇)",
    duration: "06:32",
    href: "https://www.youtube.com/",
  },
  {
    number: 4,
    title:
      "マイクラで宣伝！？SNSで1人でも多くの人に卒展のことを伝えたい！",
    detail:
      "SNS発信の裏側や、少しでも多くの人へ卒展を届けるために試した広報施策を紹介する回です。",
    cast: "荒井×広報班",
    duration: "06:32",
    href: "https://www.youtube.com/",
  },
  {
    number: 5,
    title: "タイトル(ダミーのタイトルを作る)",
    detail:
      "仮置きのダミー詳細です。ここには番組内容の導入やゲスト情報など、タイトルを補足する説明が入ります。",
    cast: "荒井×〇〇班",
    duration: "06:32",
    href: "https://www.youtube.com/",
  },
  {
    number: 6,
    title: "タイトル",
    detail:
      "仮置きのダミー詳細です。公開時には、その回で扱うテーマや収録内容の要約に差し替える想定です。",
    cast: "荒井×ゲスト",
    duration: "06:32",
    href: "https://www.youtube.com/",
  },
  {
    number: 7,
    title: "タイトル",
    detail:
      "仮置きのダミー詳細です。最終回想定の紹介文や、聞きどころをここへ表示できるようにしています。",
    cast: "荒井×ゲスト",
    duration: "06:32",
    href: "https://www.youtube.com/",
  },
];
const radioLogoUrl = "/icon/setten_cast.png";
const radioLeftDecorationUrl = "/image/decoration/setten_cast_left.png";
const radioRightDecorationUrl = "/image/decoration/setten_cast_right.png";
const radioProgramDetailId = "top-radio-program-detail";
const radioModalThumbnailUrl = "https://img.youtube.com/vi/6qGc3EeimsI/hqdefault.jpg";

// 変更理由: 遅延マウント側へ切り出したセクションでのみ使う定数を分離し、
// 初回表示ブロックに不要な責務を持たせないため、下層コンポーネント側で定義します。
const sitMapImageUrl = "/image/sit_map.webp";
const eventBackgroundUrl = "/image/background/event_background.png";
// 変更理由: 「大学への行き方動画」導線は準備中表示から実リンク公開へ切り替わったため、
// ボタンごとに遷移先URLを定数化して参照漏れや誤差し替えを防ぎます。
const guideVideoUrls = {
  toyosu: "https://youtube.com/shorts/gd2FHjGx19o?feature=share",
  ecchujima: "https://youtube.com/shorts/8jDujKkfoxA?feature=share",
} as const;

// 土日限定イベントのカード情報はイベントページと揃え、トップ側も同じ内容をカード表示します。
const weekendLimitedEvents: WeekendLimitedEvent[] = [
  {
    id: "osekkai",
    title: "【高校生向け】 デザイン工学部なんでも相談会-OSEKKAI-",
    description:
      "現役生によるデザイン工学部なんでも相談会です！学部4年生以上が参加しますのでこの機会にたくさん質問してください。",
    imageSrc: "/image/osekkai.webp",
    imageAlt: "OSEKKAIのイベントバナー",
    // 変更理由: 実際の公開URL(/events/farewell-lecture)に導線を統一し、
    // トップカード遷移とSNS共有URLの不一致を防ぎます。
    href: "/events/farewell-lecture",
    ariaLabel: "デザイン工学部なんでも相談会-OSEKKAI-ページへ",
  },
  {
    id: "osekkai-ii",
    title: "【デザ工1,2年生向けイベント】デザイン工学部なんでも相談会-OSEKKAⅡ-",
    description:
      // 変更理由: OSEKKAⅡ詳細ページと同じ訴求文に揃え、トップカードから遷移した際の文言ギャップを防ぎます。
      "豊洲キャンパスに通うデザイン工学部の先輩達が、皆さんのお悩みにお答えする相談会です！学部4年生以上が参加しますのでこの機会にたくさん相談してください。",
    // 変更理由: トップページのイベントセクションにも OSEKKAII カードを追加し、
    // Figmaノード(1228:14268 / 1947:8072)の3カード構成と遷移導線を一致させるためです。
    imageSrc: "/image/osekkai2.webp",
    imageAlt: "【デザ工1,2年生向けイベント】デザイン工学部なんでも相談会 OSEKKAⅡ",
    href: "/events/osekkai-ii",
    ariaLabel:
      "【デザ工1,2年生向けイベント】デザイン工学部なんでも相談会-OSEKKAⅡ-ページへ",
  },
  {
    id: "farewell-lecture",
    title: "退職される先生の最終講義と懇親会",
    description:
      "2025年度をもって芝浦工業大学を退職される、島田明先生・吉武良治先生の最終講義および懇親会を実施します。",
    imageSrc: "/image/event-image.png",
    imageAlt: "退職される先生の最終講義と懇親会",
    // 変更理由: トップページの懇親会カードを押した際、イベント一覧ではなく懇親会詳細ページへ直接遷移させるためリンク先を明示します。
    href: "/events/konsinkai",
    ariaLabel: "退職される先生の最終講義と懇親会ページへ",
  },
];

export default function TopPageLowerSections({
  careerStats,
}: TopPageLowerSectionsProps) {
  // 変更理由: Figmaでは「番組詳細」がページ遷移ではなく同一カード内で展開されるため、
  // 開閉状態をトップページ下層セクション内で保持し、研究ページと同系統のロールアニメーションへ合わせます。
  const [isRadioProgramDetailExpanded, setIsRadioProgramDetailExpanded] =
    useState(false);
  // 変更理由: ラジオ一覧はタイトル押下で詳細を読む導線へ分離するため、
  // 選択中の回を state で保持し、簡易モーダルへ内容を流し込みます。
  const [selectedRadioEpisode, setSelectedRadioEpisode] =
    useState<RadioEpisode | null>(null);

  useEffect(() => {
    if (!selectedRadioEpisode) return;

    // 変更理由: モーダル表示中は背面スクロールを止め、閲覧位置が意図せず動くのを防ぎます。
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedRadioEpisode(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedRadioEpisode]);
  // 進路データはサーバー側で集計済みの値を受け取り、表示用に割合へ変換します。
  const totalCareers = careerStats.total;
  const gradPercent =
    totalCareers === 0 ? 0 : (careerStats.gradCount / totalCareers) * 100;
  const jobPercent =
    totalCareers === 0 ? 0 : (careerStats.jobCount / totalCareers) * 100;
  const otherPercent =
    totalCareers === 0 ? 0 : (careerStats.otherCount / totalCareers) * 100;

  return (
    <>
      {/* イベント紹介は上下余白を設け、指定画像を背景に使い雰囲気を合わせます。 */}
      {/* イベント背景はFigmaの淡いグレーをベースにし、背景画像で質感を足します。 */}
      <section
        data-reveal
        // 変更理由: OSEKKAIIカード追加でイベントカードが3枚構成になり、固定高さだと最下段カードとボタンが見切れるため、
        // セクション高は内容量に追従する可変に変更します。Figmaの高さは最小高さとして保持し、余白設計は維持します。
        className="relative isolate min-h-[1098.125px] overflow-x-clip px-4 py-12 md:min-h-[1040px] md:px-8 lg:px-[128px] md:py-[128px]"
      >
        {/* 土日限定イベントの背景もフルブリードにしつつ、デスクトップではラジオ装飾と同様に
        1920px の固定フレーム基準で扱って、超広幅ディスプレイでも背景位置が伸びないようにします。 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-[100dvw] max-w-[100dvw] -translate-x-1/2 bg-[#EBEEF0] md:w-[1920px] md:max-w-none"
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
          <p className="mt-4 text-[15px] leading-[2] text-[#4B5459] md:text-center md:text-[16px] md:leading-[2] md:tracking-[0.04em]">
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

      {/* ラジオセクションはFigmaの2レイアウト（デスクトップ/モバイル）を統合して再現します。 */}
      <section
        data-reveal
        className="relative overflow-x-clip bg-[#F9F9F9] px-4 py-12 md:px-8 md:py-[128px] lg:px-[128px]"
      >
        {/* 変更理由: モバイル版は Figma に合わせて左側装飾画像のみを使い、
        コンテンツを邪魔しないよう右下へ逃がして配置します。 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[56px] right-[-52px] opacity-20 md:hidden"
        >
          <img
            src={radioLeftDecorationUrl}
            alt=""
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="h-[640px] w-[480px] object-contain"
          />
        </div>
        {/* 変更理由: デスクトップ版では装飾がやや下寄りかつ大きく見えていたため、
        Figmaの印象に近づけるために少し上へ寄せつつ、左右画像を一段小さくして主役のカードを邪魔しないよう調整します。 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[88px] hidden w-[1920px] -translate-x-1/2 items-center justify-center gap-[605px] opacity-30 md:flex"
        >
          <img
            src={radioLeftDecorationUrl}
            alt=""
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="h-[640px] w-[479px] object-contain"
          />
          <img
            src={radioRightDecorationUrl}
            alt=""
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="h-[635px] w-[592px] object-contain"
          />
        </div>
        {/* 変更理由: モバイル時も「卒業生の進路」見出しと同じ本文幅基準に揃えるため、
        ラジオ用ラッパーの固定 max-width を外し、section の左右余白内いっぱいを使う構成へ戻します。 */}
        <div className="relative mx-auto flex w-full flex-col items-center md:max-w-[1024px]">
          <div className="flex w-full flex-col items-center gap-4">
            <div className="h-[82px] w-[175px] md:h-[134px] md:w-[284px]">
              <img
                src={radioLogoUrl}
                alt="SETTEN CAST"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="font-['Noto_Sans_JP:Regular',sans-serif] text-[15px] leading-[2] text-[#4B5459] tracking-[0.6px] text-center">
              <p className="mb-0">卒展会場限定で聞くことができるラジオが、</p>
              {/* 変更理由: スマホ幅では「Webからでも」だと改行位置が不安定になるため、
              Figma更新に合わせて短い文言へ揃え、中央揃えの見た目を安定させます。 */}
              <p className="mb-0">Webから聞くことができるようになりました！</p>
              <p>(Youtubeに遷移します。)</p>
            </div>
            {/* 変更理由: 番組詳細カードだけ固定幅だと下段のラジオ一覧より狭く見えるため、
            モバイル/PCとも一覧カードと同じ横幅基準で揃えてセクション内の左右端を一致させます。 */}
            <button
              type="button"
              className="flex w-full cursor-pointer flex-col gap-[4px] items-center justify-end rounded-[12px] border border-[#F9F9F9] bg-[rgba(255,255,255,0.8)] px-[12px] py-4 text-left transition-colors duration-200 hover:bg-[#FFFFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FB9678] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EBEEF0]"
              onClick={() =>
                setIsRadioProgramDetailExpanded((prev) => !prev)
              }
              aria-expanded={isRadioProgramDetailExpanded}
              aria-controls={radioProgramDetailId}
            >
              <div className="flex w-full items-center justify-between whitespace-nowrap">
                <div className="flex gap-2 items-center">
                  <span aria-hidden="true" className="inline-flex h-[16px] w-[16px]">
                    <img
                      src="/icon/radio_icon.svg"
                      alt=""
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      className="h-full w-full object-contain"
                    />
                  </span>
                  <p className="font-['Noto_Sans_JP:Medium',sans-serif] text-[13px] font-medium leading-[1.5] text-[#2E3437]">
                    番組詳細
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className={`inline-flex text-[16px] leading-none text-[#A3ADB2] transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isRadioProgramDetailExpanded ? "rotate-180" : "rotate-0"
                  }`}
                >
                  <TopRadioExpandIcon />
                </span>
              </div>
              {/* 変更理由: 本文コンテンツ自体を上下移動させると文字が震えて見えやすいため、
              高さと透明度の補間を中心にして、テキストはその場で自然に現れる見え方へ寄せます。 */}
              <div
                id={radioProgramDetailId}
                className={`mt-1 grid w-full overflow-hidden text-[#6A7378] transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isRadioProgramDetailExpanded
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0 pointer-events-none"
                }`}
                aria-hidden={!isRadioProgramDetailExpanded}
              >
                <div className="min-h-0">
                  {/* 変更理由: Figma指定の本文と役割表記をそのまま1カード内へ収め、
                  モバイル/PCとも13px・行間1.9ベースの読み味を維持します。 */}
                  <div className="text-[13px] leading-[1.9] tracking-[0.02em] text-[#6A7378]">
                    <p>
                      卒展の裏話や、展示づくりのこと、各班の活動などを司会とゲストのトーク形式でお届けします。
                    </p>
                    <p>交流プラザでは1時間に1回程度放送を行います。</p>
                    <div className="pt-4 text-[#4B5459]">
                      <p>
                        <span className="font-medium leading-[1.5]">司会</span>
                        ：荒井・山崎
                      </p>
                      <p>
                        <span className="font-medium leading-[1.5]">ゲスト</span>
                        ：各班から1〜2名程度
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* 変更理由: Figmaの一覧カードは外枠直下に16px/8pxの内側余白があるため、
          カード内へ余白を持たせて行と外枠の間に呼吸を作り、境界線色も Natural/50 に揃えます。 */}
          <div className="mt-4 w-full rounded-[16px] border border-[#F9F9F9] bg-[rgba(255,255,255,0.8)] px-4 py-2">
            <div>
              {radioEpisodes.map((episode, index) => (
                <TopRadioEpisodeItem
                  key={episode.number}
                  number={episode.number}
                  title={episode.title}
                  detail={episode.detail}
                  duration={episode.duration}
                  href={episode.href}
                  isLast={index === radioEpisodes.length - 1}
                  onOpenDetail={() => setSelectedRadioEpisode(episode)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {selectedRadioEpisode ? (
        <TopRadioEpisodeModal
          episode={selectedRadioEpisode}
          onClose={() => setSelectedRadioEpisode(null)}
        />
      ) : null}

      {/* 進路情報はイベントの後に配置し、Figmaの2カラム構成を再現します。 */}
      <section
        data-reveal
        className="relative bg-[#F9F9F9] px-4 py-12 md:px-8 lg:px-[128px] md:py-[128px]"
      >
        {/* 変更理由: 他セクションの装飾もラジオと同じく 1920px 固定フレーム上に載せ、
        超広幅時に viewport 比例で広がって見える挙動を避けます。 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-[1920px] -translate-x-1/2 md:block"
        >
          {/* 装飾画像の配置ルールに合わせ、dotgridは固定フレーム右上の所定位置へ配置します。 */}
          <div className="absolute right-[128px] top-[48px]">
            <img
              src="/image/decoration/dotgrid.svg"
              alt=""
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className="h-[144px] w-[192px]"
            />
          </div>
          {/* PC表示のみの円装飾も固定フレーム基準の座標へ移し、表示位置が画面幅でずれないようにします。 */}
          <div className="absolute left-[280px] top-[440px] -translate-x-1/3 -translate-y-1/2">
            <img
              src="/image/decoration/circle.svg"
              alt=""
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className="h-[320px] w-[320px]"
            />
          </div>
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
                <p className="mt-4 text-[15px] leading-[2] text-[#4B5459] md:text-[16px] md:leading-[2] md:tracking-[0.04em]">
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
                平日の研究展示に加え、各種イベントを実施します。
                <br className="hidden md:block" />
                実施するイベントの詳細は
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
            {/* 駅動画ボタンは白塗り(デフォルト)→オレンジ塗り(hover)を明確にするため、重ね白レイヤーを使わず背景色遷移のみで表現します。 */}
            <div className="mt-4 flex items-center gap-4 md:justify-center md:gap-6 md:px-12">
              <Link
                href={guideVideoUrls.toyosu}
                target="_blank"
                rel="noopener noreferrer"
                // 枠線ボタンはFigma仕様に合わせ、300msのイースイン・イースアウトで塗りと文字色を反転します。
                className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-full border border-[#FB9678] bg-[#FFFFFF] px-6 py-4 text-[13px] font-medium text-[#4B5459] shadow-[0_0_8px_rgba(106,115,120,0.1)] transition-[background-color,color,border-color] duration-300 ease-in-out hover:bg-[#D3793D] hover:text-[#F9F9F9] md:max-w-[352px]"
              >
                <span className="relative z-10">豊洲駅から</span>
                <img
                  src="/icon/link.svg"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="relative z-10 h-4 w-4 transition-[filter] duration-300 ease-in-out group-hover:brightness-0 group-hover:invert"
                />
              </Link>
              <Link
                href={guideVideoUrls.ecchujima}
                target="_blank"
                rel="noopener noreferrer"
                // 枠線ボタンはFigma仕様に合わせ、300msのイースイン・イースアウトで塗りと文字色を反転します。
                className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-full border border-[#FB9678] bg-[#FFFFFF] px-6 py-4 text-[13px] font-medium text-[#4B5459] shadow-[0_0_8px_rgba(106,115,120,0.1)] transition-[background-color,color,border-color] duration-300 ease-in-out hover:bg-[#D3793D] hover:text-[#F9F9F9] md:max-w-[352px]"
              >
                <span className="relative z-10">越中島駅から</span>
                <img
                  src="/icon/link.svg"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="relative z-10 h-4 w-4 transition-[filter] duration-300 ease-in-out group-hover:brightness-0 group-hover:invert"
                />
              </Link>
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
                loading="lazy"
                decoding="async"
                fetchPriority="low"
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
      {/* 変更理由: デスクトップで `md:max-w-[1280px]` が効くとフッター自体の横幅が制限されるため、 */}
      {/* ラッパーの最大幅制限を外して常に画面幅いっぱいへ広げます。 */}
      <div className="px-0 pt-12 md:px-0 md:pt-[48px]">
        <Footer className="w-full" />
      </div>

    </>
  );
}

function TopWeekendLimitedEventCard({ event }: { event: WeekendLimitedEvent }) {
  const cardContent = (
    <article className="group flex h-full flex-col gap-3 rounded-[12px] border border-[#EBEEF0] bg-white/80 p-4 shadow-[0_0_8px_rgba(106,115,120,0.1)] md:gap-5 md:rounded-[20px] md:p-6">
      <img
        src={event.imageSrc}
        alt={event.imageAlt}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        className="aspect-[1920/1080] w-full rounded-[8px] object-cover md:rounded-[12px]"
      />
      <div className="flex flex-col gap-1 md:gap-2">
        <h2 className="text-[20px] font-extrabold leading-[1.5] tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[24px] transition-colors duration-200 group-hover:text-[#D3793D] group-active:text-[#D3793D]">
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

function TopRadioEpisodeItem({
  number,
  title,
  detail,
  duration,
  href,
  isLast,
  onOpenDetail,
}: {
  number: number;
  title: string;
  detail: string;
  duration: string;
  href: string;
  isLast: boolean;
  onOpenDetail: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between px-[12px] py-[16px] relative ${
        isLast ? "" : "border-b border-[#F9F9F9]"
      } transition-colors duration-200 hover:bg-[#FDF8F4]`}
    >
      {/* 変更理由: タイトル文字だけでなく番号を含む左側ブロック全体を押下対象にして、
      行のどこを押しても詳細モーダルを開けるようにします。 */}
      <button
        type="button"
        className="flex min-h-px min-w-px flex-1 items-center gap-[8px] text-left font-['Noto_Sans_JP',sans-serif] text-[15px] font-normal leading-[2] tracking-[0.6px] outline-none transition-colors duration-200 hover:text-[#D3793D] focus-visible:text-[#D3793D]"
        onClick={onOpenDetail}
        aria-label={`第${number}回「${title}」の詳細を見る`}
      >
        <p className="shrink-0 text-[color:#A3ADB2]">#{number}</p>
        <span className="relative min-h-px min-w-px flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[color:#4B5459]">
          {title}
        </span>
      </button>
      {/* 変更理由: 再生チップが行全体の高さに引っ張られるとFigmaより縦長に見えるため、
      高さはテキスト行高と内側余白だけで決まるようにして、ラベル本体の縦寸を本文に揃えます。 */}
      <div className="ml-auto flex items-center">
        <div className="w-[24px] shrink-0" aria-hidden="true" />
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center justify-center rounded-full bg-[#EBEEF0] px-3 py-1 outline-none transition-colors duration-200 hover:bg-[#DDE1E4] focus-visible:ring-2 focus-visible:ring-[#FB9678] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EBEEF0]"
          aria-label={`第${number}回を再生ページへ`}
        >
          <p className="font-['Noto_Sans_JP:Regular',sans-serif] font-normal leading-[1.5] text-[10px] text-[color:#4B5459] whitespace-pre">
            {`▶  ${duration}`}
          </p>
        </Link>
      </div>
    </div>
  );
}

function TopRadioEpisodeModal({
  episode,
  onClose,
}: {
  episode: RadioEpisode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[120] overflow-y-auto bg-[#3D3E42]/60 px-4 py-4 md:py-8"
      role="presentation"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center">
        <div className="flex w-full max-w-[361px] flex-col items-center gap-2 md:w-[620px] md:max-w-none md:items-start md:gap-4">
        <button
          type="button"
          className="hidden md:flex md:h-[62px] md:w-[62px] md:items-center md:justify-center md:rounded-full md:border md:border-[#EBEEF0] md:bg-[linear-gradient(90deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.8)_100%),linear-gradient(90deg,#F9F9F9_0%,#F9F9F9_100%)] md:text-[#6A7378] md:outline-none md:transition-colors md:duration-200 md:hover:bg-[#FFFFFF] md:focus-visible:ring-2 md:focus-visible:ring-[#FB9678] md:focus-visible:ring-offset-2 md:focus-visible:ring-offset-transparent"
          onClick={onClose}
          aria-label="ラジオ詳細モーダルを閉じる"
        >
          <TopRadioModalCloseIcon />
        </button>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="top-radio-episode-modal-title"
          className="w-full rounded-[12px] border border-[#EBEEF0] p-4 shadow-[0_0_8px_rgba(106,115,120,0.1)] md:w-[620px] md:rounded-[20px] md:p-5"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.8) 100%), linear-gradient(90deg, #F9F9F9 0%, #F9F9F9 100%)",
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex flex-col gap-4 md:gap-5">
            <div className="flex flex-col gap-4 md:gap-5">
              <div className="flex flex-col gap-1 md:gap-2">
                {/* 変更理由: 比較の結果、モーダル内は埋め込み再生より静止サムネ表示の方が
                情報整理しやすいため、Figmaの表示枠を保ったままサムネ画像のみへ戻します。 */}
                <div className="relative h-[197.063px] w-full overflow-hidden bg-[#D9D9D9] md:h-[330px]">
                  <img
                    src={radioModalThumbnailUrl}
                    alt={`${episode.title} のYouTubeサムネイル`}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3
                  id="top-radio-episode-modal-title"
                  className="text-[16px] font-medium leading-[2.2] tracking-[0.04em] text-[#4B5459] md:text-[22px]"
                >
                  {episode.title}
                </h3>
              </div>
              <p className="text-[13px] tracking-[0.02em] text-[#4B5459] md:tracking-[0.02em]">
                <span className="font-medium leading-[1.5] text-[13px]">出演者</span>
                <span className="leading-[1.9] text-[#6A7378] md:text-[17px]">：{episode.cast}</span>
              </p>
            </div>
            <Link
              href={episode.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#D3793D] px-8 py-4 text-[13px] font-medium leading-[1.5] text-[#F9F9F9] shadow-[0_0_8px_rgba(106,115,120,0.1)] transition-[background,box-shadow] duration-300 ease-out hover:[background:linear-gradient(98deg,rgba(255,255,255,0.20)_0.58%,rgba(255,255,255,0.15)_47.57%,rgba(255,255,255,0.10)_94.56%),#D3793D] hover:[background-blend-mode:plus-lighter] md:gap-3 md:rounded-[12px] md:px-12 md:py-5 md:text-[17px]"
            >
              このラジオを聞く
              <span aria-hidden="true" className="text-[16px] leading-none md:text-[24px]">
                ↗
              </span>
            </Link>
          </div>
        </div>
        {/* 変更理由: 閉じるボタンはカード下に8px間隔で独立配置されているため、
        固定絶対配置ではなくフロー内へ戻してサイズも 48px 基準へ揃えます。 */}
        <button
          type="button"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-[#EBEEF0] bg-[linear-gradient(90deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.8)_100%),linear-gradient(90deg,#F9F9F9_0%,#F9F9F9_100%)] text-[#6A7378] outline-none transition-colors duration-200 hover:bg-[#FFFFFF] focus-visible:ring-2 focus-visible:ring-[#FB9678] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent md:hidden"
          onClick={onClose}
          aria-label="ラジオ詳細モーダルを閉じる"
        >
          <TopRadioModalCloseIcon />
        </button>
        </div>
      </div>
    </div>
  );
}

function TopRadioExpandIcon() {
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
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TopRadioModalCloseIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-hidden="true"
    >
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
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
