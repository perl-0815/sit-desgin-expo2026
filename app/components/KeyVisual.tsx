"use client"

import { useEffect, useState } from "react"

export default function KeyVisual() {
  const [scale, setScale] = useState(1)
  const [layout, setLayout] = useState<"horizontal" | "vertical">("horizontal")
  const horizontalBase = { w: 1280, h: 720 } as const
  const verticalBase = { w: 1080, h: 1920 } as const

  useEffect(() => {
    const updateScale = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const isVertical = vw / vh <= 3 / 4
      const base = isVertical ? verticalBase : horizontalBase
      setLayout(isVertical ? "vertical" : "horizontal")
      setScale(isVertical ? Math.min(vw / base.w, vh / base.h) : Math.max(vw / base.w, vh / base.h))
    }
    updateScale()
    window.addEventListener("resize", updateScale)
    return () => {
      window.removeEventListener("resize", updateScale)
    }
  }, [horizontalBase.w, horizontalBase.h, verticalBase.w, verticalBase.h])
  const horizontalLayers = [
    { src: "/key-visual/horizontal/hoka.svg", w: 1280, h: 720, x: 640, y: 360, scale: 1, rotate: 0, z: -30, opacity: 1 },
    { src: "/key-visual/horizontal/setu.svg", w: 509, h: 519, x: -49, y: 158.971, scale: 1, rotate: 0, z: -20, opacity: 1 },
    { src: "/key-visual/horizontal/ten.svg", w: 521, h: 549, x: 535, y: 360, scale: 1, rotate: 0, z: -10, opacity: 1 },
  ] as const
  const verticalLayers = [
    { src: "/key-visual/vertical/hoka.svg", w: 1080, h: 1920, x: 540, y: 960, scale: 1, rotate: 0, z: -30, opacity: 1 },
    { src: "/key-visual/vertical/setu.svg", w: 649, h: 648, x: 203, y: -119, scale: 0.98, rotate: 0, z: -20, opacity: 1 },
    { src: "/key-visual/vertical/ten.svg", w: 600, h: 651, x: 439, y: 775, scale: 1, rotate: 0, z: -10, opacity: 1 },
  ] as const
  const layers = layout === "vertical" ? verticalLayers : horizontalLayers
  const base = layout === "vertical" ? verticalBase : horizontalBase
  const backgroundSrc = layout === "vertical" ? "/key-visual/back-vertical.png" : "/key-visual/back-horizontal.png"

  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 origin-center"
        style={{
          transform: `translate(-50%, -50%) scale(${scale})`,
          width: base.w,
          height: base.h,
        }}
      >
        <img
          src={backgroundSrc}
          alt=""
          aria-hidden="true"
          width={base.w}
          height={base.h}
          className="absolute inset-0 h-full w-full"
          style={{ zIndex: -100 }}
        />
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
      </div>
    </section>
  )
}
