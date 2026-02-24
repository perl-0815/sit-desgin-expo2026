export default function Head() {
  return (
    <>
      {/* 変更理由: 初回表示のブロッキングを減らすため、KVのpreloadは初期表示に必須な背景/中央要素のみへ限定します。 */}
      <link
        rel="preload"
        as="image"
        href="/key-visual/back-horizontal.webp"
        type="image/webp"
        media="(min-aspect-ratio: 4/3)"
      />
      <link
        rel="preload"
        as="image"
        href="/key-visual/back-vertical.webp"
        type="image/webp"
        media="(max-aspect-ratio: 4/3)"
      />
      <link rel="preload" as="image" href="/key-visual/center-text.svg" type="image/svg+xml" />
      <link rel="preload" as="image" href="/key-visual/center-circle.svg" type="image/svg+xml" />
      <link rel="preload" as="image" href="/key-visual/center-mobile.webp" type="image/webp" />
    </>
  )
}
