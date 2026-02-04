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
    <footer className={className ?? ""}>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FB9678] to-[#E5A967] px-4 py-12 text-center text-white">
        {/* 背景グラデーションの上にテクスチャ画像を重ね、Figmaの質感を再現します。 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-100 mix-blend-soft-light"
          style={{
            // Figmaの「ソフトライト」合成に近づけるためブレンドモードとリピートを明示します。
            backgroundImage: `url('${footerTextureA}'), url('${footerTextureB}')`,
            backgroundSize: "120px 120px, 120px 120px",
            backgroundPosition: "top left",
            backgroundRepeat: "repeat, repeat",
            backgroundBlendMode: "soft-light, soft-light",
          }}
        />
        <div className="mx-auto w-full max-w-[320px] space-y-2 rounded-2xl bg-transparent px-4 py-3 text-[12px] tracking-[0.15em] shadow-[0_0_8px_rgba(106,115,120,0.15)]">
          <p className="font-medium [font-family:var(--font-roboto)]">CONTACT</p>
          <div className="space-y-1 text-[12px] tracking-normal">
            <p>cy22000@shibaura-it.ac.jp</p>
            <p className="underline">お問い合せフォームはこちらから</p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <p className="text-[12px] tracking-[0.15em] [font-family:var(--font-roboto)]">
            OFFICIAL SNS
          </p>
          {/* SNSアイコンはSVG画像で表示し、実際の公式リンクに遷移します。 */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-1">
            <a
              href="https://x.com/b7xWHVd7ak81271"
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
