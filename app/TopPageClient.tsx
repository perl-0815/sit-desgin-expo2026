"use client"

import Link from "next/link"

import Footer from "./components/Footer"
import GlobalHeader from "./components/GlobalHeader"
import useSectionReveal from "./components/useSectionReveal"

// SIT MAPの画像は公開フォルダ内の最新版を参照します。
const sitMapImageUrl = "/image/sit_map.png"
// 「卒業・修了研究展とは」セクションの装飾は、公開フォルダのSVGに集約して読み込みます。
// 以前のFigmaアセット分割をやめて1枚絵にまとめることで、配置調整と管理コストを下げます。
const exhibitionDecorationLeftUrl = "/image/top-decoration1.svg"
const exhibitionDecorationRightUrl = "/image/top-decoration2.svg"

export default function TopPageClient() {
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

  // トップページの各セクションにスクロール時のスライドインを付与します。
  useSectionReveal()

  return (
    // 画面が短いときでもフッターが下端に揃うよう、最小高さを確保します。
    // モバイルは横幅いっぱいに広げるため、最大幅の制限はmd以上に限定します。
    <div className="mx-auto flex min-h-screen w-full flex-col bg-[#F9F9F9] md:max-w-[1280px]">
      {/* デスクトップは横幅のみ広げ、シングルカラムの構成は維持します。 */}
      {/* 全ページ共通のヘッダーを配置し、スクロール中も固定表示します。 */}
      <GlobalHeader activeId="top" />

      {/* ヒーロー領域は指定のKV画像に差し替えます。 */}
      <section
        data-reveal
        // SPはセクション高さをビューポート内に制限し、画像が画面外にはみ出さないようにします。
        // PCは従来どおり固定高さでヒーロー領域を構成します。
        className="relative h-[100svh] w-full overflow-hidden md:h-[720px]"
      >
        {/* デスクトップは従来どおり全面coverで表示します。 */}
        <img
          aria-hidden="true"
          alt=""
          src="/image/top_kv-pc.png"
          className="absolute inset-0 hidden h-full w-full object-cover md:block"
        />

        {/* SPは左右の余白をブラー背景で埋めるため、同一画像を背面に敷いて拡大表示します。 */}
        <img
          aria-hidden="true"
          alt=""
          src="/image/top-kv-sp.png"
          className="absolute inset-0 h-full w-full object-cover blur-[3px] md:hidden"
        />
        {/* SPの前面画像はcontainで全体表示し、はみ出しを防ぎます。 */}
        <img
          aria-hidden="true"
          alt=""
          src="/image/top-kv-sp.png"
          className="absolute inset-0 h-full w-full object-contain md:hidden"
        />

        {/* KV画像に文字情報を埋め込んだため重ね表示は削除し、見出し構造維持のために不可視h1のみ残します。 */}
        <h1 className="sr-only">SIT DESIGN EXPO 2026 卒業・修了研究展</h1>

        {/* FigmaのKV右下インジケーターに合わせ、SCROLLテキストと縦線アニメーションを重ねます。 */}
        <div className="pointer-events-none absolute bottom-3 right-10 flex w-[22px] flex-col items-center gap-2">
          <div className="flex h-[62px] w-[21px] items-center justify-center">
            {/* 文字は90度回転・字間2.1pxでFigma指定に合わせます。 */}
            <p className="rotate-90 text-center text-[14px] font-medium leading-[1.5] tracking-[2.1px] text-[#4B5459] [font-family:var(--font-roboto)] [text-shadow:0_0_8px_rgba(106,115,120,0.15)]">
              SCROLL
            </p>
          </div>
          <div className="relative h-[60px] w-[22px] overflow-hidden">
            {/* 下地ラインは60px固定で表示し、動くラインのみ別レイヤーで流します。 */}
            <span className="absolute left-1/2 top-0 h-[60px] w-px -translate-x-1/2 bg-[#B8C0C4]" />
            <span className="kv-scroll-indicator-line absolute left-1/2 top-0 h-[100px] w-px -translate-x-1/2 bg-[#4B5459]" />
          </div>
        </div>

        {/* メニューボタンは共通ヘッダー側で固定表示しています。 */}
      </section>

      {/* 開催情報カードはFigmaの角丸・影・配色をそのまま移植します。 */}
      <section
        data-reveal
        className="px-4 pb-6 pt-6 md:px-8 lg:px-[128px] md:pb-[96px] md:pt-[96px]"
      >
        <div className="mx-auto rounded-[24px] bg-[#F9F9F9] p-6 shadow-[0_0_8px_rgba(106,115,120,0.15)] md:max-w-[1024px] md:p-9">
        {/* モバイル・デスクトップともに見出しを中央寄せにして視線が散らないようにします。 */}
        <div className="border-b border-[#FB9678] pb-1 text-center">
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
      {/* モバイルで各セクションの下余白を広げて読みやすさを確保します（下方向のみ増やす）。 */}
      <section
        data-reveal
        className="relative overflow-hidden bg-[#EBEEF0] px-4 pb-20 pt-12 md:px-8 lg:px-[128px] md:py-[96px]"
      >
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
            <p className="text-[24px] font-extrabold leading-[1.5] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">
              卒業・修了研究展とは
            </p>
          </div>

          {/* デスクトップ本文は改行位置と文言をFigmaに合わせています。 */}
          <div className="hidden px-4 pt-4 md:flex md:justify-center">
            <div className="max-w-[768px] text-center text-[15px] leading-[2.2] tracking-[0.6px] text-[#4B5459] [font-family:'Noto_Sans_JP',sans-serif]">
              <p className="mb-0">
                芝浦工業大学デザイン工学部の学生による、
              </p>
              <p className="mb-0">それぞれの研究を展示する場です。</p>
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
              <p className="mb-0">それぞれの研究を展示する場です。</p>
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
        </div>
      </section>

      {/* 先行公開向けの簡易版では、CONCEPT/イベント/研究作品紹介/進路セクションを非表示にして導線を整理します。 */}

      {/* 開催場所はFigmaのレイアウトに合わせ、モバイルは地図を表示しません。 */}
      <section
        data-reveal
        className="bg-[#EBEEF0] px-4 py-12 md:px-8 lg:px-[128px] md:py-[96px]"
      >
        <div className="mx-auto flex flex-col gap-4 md:max-w-[1024px]">
          {/* 見出しは白背景+下線の構成に揃え、サイズはFigmaの20pxで固定します。 */}
          <div className="w-full border-b-2 border-[#FB9678] py-1">
            {/* デスクトップのみ、開催場所の見出しテキストを中央揃えにします。 */}
            <p className="text-[20px] font-extrabold leading-[1.5] tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-center">
              開催場所
            </p>
          </div>

          {/* 開催まとめはモバイルで縦並び、デスクトップで2カラムにします。 */}
          <div className="flex flex-col gap-3 md:flex-row md:gap-6">
            <div className="rounded-lg bg-[#F9F9F9] p-3 text-left md:flex-1 md:items-center md:text-center">
              <p className="text-[16px] font-medium leading-[1.5] text-[#D3793D] md:text-center">
                平日
              </p>
              <p className="mt-1 text-[13px] leading-[1.9] tracking-[0.02em] text-[#4B5459] md:text-center">
                有元史郎記念校友会館交流プラザにて研究の展示をします。展示されている研究の一覧は
                <Link href="/research" className="text-[#D3793D] underline">
                  こちら
                </Link>
                から。
              </p>
            </div>
            <div className="rounded-lg bg-[#F9F9F9] p-3 text-left md:flex-1 md:items-center md:text-center">
              <p className="text-[16px] font-medium leading-[1.5] text-[#D3793D] md:text-center">
                土日
              </p>
              <p className="mt-1 text-[13px] leading-[1.9] tracking-[0.02em] text-[#4B5459] md:text-center">
                平日の研究展示に加え、本部棟5階オープンラボにて体験展示を開催します。体験展示の詳細は
                <Link href="/events" className="text-[#D3793D] underline">
                  こちら
                </Link>
                から
              </p>
            </div>
          </div>

          {/* SIT MAPはデスクトップのみ表示し、カード内の罫線は均等に配置します。 */}
          <div className="hidden rounded-2xl bg-[#F9F9F9] px-4 py-6 md:block">
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
      </section>

      {/* 先行公開向けの簡易版では、準備中の動画導線を外してアクセス情報のみ掲載します。 */}
      <section
        data-reveal
        className="px-4 pt-12 md:px-8 lg:px-[128px] md:py-[96px]"
      >
        <div className="mx-auto md:max-w-[1024px]">
          {/* デスクトップは見出し線を中間幅で止めて右に地図を配置します。 */}
          <div className="mt-4 flex flex-col gap-6 md:mt-0 md:grid md:grid-cols-[480px_480px] md:items-start md:gap-[64px]">
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
            <div className="overflow-hidden md:mt-0">
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

    </div>
  )
}
