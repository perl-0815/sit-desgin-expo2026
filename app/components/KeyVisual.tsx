export default function KeyVisual() {
  const layers = [
    { src: "/key-visual/hoka.svg", w: 1280, h: 720, x: 640, y: 360, scale: 1, rotate: 0, z: -30, opacity: 1 },
    { src: "/key-visual/setu.svg", w: 509, h: 519, x: -49, y: 158.971, scale: 1, rotate: 0, z: -20, opacity: 1 },
    { src: "/key-visual/ten.svg", w: 521, h: 549, x: 535, y: 360, scale: 1, rotate: 0, z: -10, opacity: 1 },
  ] as const

  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      {layers.map((l) => (
        <img
          key={l.src}
          src={l.src}
          alt=""
          aria-hidden="true"
          width={l.w}
          height={l.h}
          decoding="async"
          loading="eager"
          fetchPriority="high"
          draggable={false}
          className="absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 select-none"
          style={{
            transform: `translate(-50%, -50%) translate(${l.x}px, ${l.y}px) scale(${l.scale}) rotate(${l.rotate}deg)`,
            zIndex: l.z,
            opacity: l.opacity,
          }}
        />
      ))}
    </section>
  )
}
