type FooterProps = {
  className?: string
}

// Figmaのフッターを複数ページで再利用できるように共通コンポーネント化しています。
// フッターのノイズはローカルの共通テクスチャに統一します。
const footerTextureA = "/texture/texture_noise.png"
const footerTextureB = "/texture/texture_noise.png"
// public/icon のSVGを参照してSNSアイコンを統一しています。
const snsXIcon = "/icon/snsXIcon.svg"
const snsInstagramIcon = "/icon/snsInstagramIcon.svg"
const snsTiktokIcon = "/icon/snsTiktokIcon.svg"
const snsYoutubeIcon = "/icon/snsYoutubeIcon.svg"

export default function Footer({ className }: FooterProps) {
  return (
    // フッターを常に下端に寄せるため、親がflex-colの場合に効くmt-autoを付与します。
    <footer className={`${className ?? ""} mt-auto`.trim()}>
      {/* トップページの指示に合わせ、フッターの角丸は外してフラットな形状にします。 */}
      {/* どのページのコンテナ内でもウィンドウ幅いっぱいに広がるよう調整します。 */}
      <div className="relative left-1/2 right-1/2 w-screen -mx-[50vw] overflow-hidden bg-gradient-to-br from-[#FB9678] to-[#E5A967] px-0 py-12 text-center text-white md:px-4">
        {/* 背景グラデーションの上にテクスチャ画像を重ね、Figmaの質感を再現します。 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.8] mix-blend-soft-light"
          style={{
            // Figmaの「ソフトライト」合成に近づけるためブレンドモードとリピートを明示します。
            backgroundImage: `url('${footerTextureA}'), url('${footerTextureB}')`,
            backgroundSize: "120px 120px, 120px 120px",
            backgroundPosition: "top left",
            backgroundRepeat: "repeat, repeat",
            backgroundBlendMode: "soft-light, soft-light",
          }}
        />
        <div>
          {/* 変更理由: Figma（node: 1228:14389 / 1228:14541）では英字見出しが12px・line-height 1.5・中ウェイト指定のため、実値を固定してズレを防ぎます。 */}
          <p className="text-[12px] font-medium leading-[1.5] tracking-[0.15em] [font-family:var(--font-roboto)]">
            CONTACT
          </p>
          {/* 変更理由: 連絡先本文は12px・line-height 1.6・字間0.02em（Body/S）に合わせ、環境差で詰まりすぎる見え方を防止します。 */}
          <div className="space-y-1 text-[12px] leading-[1.6] tracking-[0.02em] [font-family:var(--font-noto-sans-jp)]">
            <p>shibadesign2026sotsuten@gmail.com</p>
            {/* お問い合せフォームへのリンクは最新のフォームURLに差し替えます。 */}
            <a
              href="https://forms.gle/9pBuxBWgC9YuFo8j8"
              className="underline"
            >
              お問い合せフォームはこちらから
            </a>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {/* 変更理由: CONTACT見出しと同一の英字ラベル仕様に統一し、フッター内でのサイズブレをなくします。 */}
          <p className="text-[12px] font-medium leading-[1.5] tracking-[0.15em] [font-family:var(--font-roboto)]">
            OFFICIAL SNS
          </p>
          {/* SNSアイコンはSVG画像で表示し、実際の公式リンクに遷移します。 */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-1">
            <a
              // X公式アカウントが変更されたため、フッターの遷移先を新URLへ更新します。
              href="https://x.com/sitdezasotsu_26?s=21"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="flex h-[30px] w-[30px] items-center justify-center"
            >
              <img src={snsXIcon} alt="X" className="h-full w-full" />
            </a>
            <a
              href="https://www.instagram.com/shibasotsu_2026_/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-[32px] w-[32px] items-center justify-center"
            >
              <img
                src={snsInstagramIcon}
                alt="Instagram"
                className="h-full w-full"
              />
            </a>
            <a
              href="https://www.tiktok.com/@shibadezasotu_26"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="flex h-[32px] w-[28px] items-center justify-center"
            >
              <img src={snsTiktokIcon} alt="TikTok" className="h-full w-full" />
            </a>
            <a
              href="https://www.youtube.com/@芝浦デザ工卒展2026"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="flex h-[30px] w-[43px] items-center justify-center"
            >
              <img src={snsYoutubeIcon} alt="YouTube" className="h-full w-full" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
