"use client";

import { useEffect, useRef, useState } from "react";
import CircularLensEffect from "./CircularLensEffect";
const SCROLL_PAGES = 2.0;
const horizontalBase = { w: 1280, h: 720 } as const;
const verticalBase = { w: 1080, h: 1920 } as const;

export default function KeyVisual() {
  const [scale, setScale] = useState(1);
  const [layout, setLayout] = useState<"horizontal" | "vertical">("horizontal");
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isVertical = vw / vh <= 3 / 4;
      const base = isVertical ? verticalBase : horizontalBase;
      setLayout(isVertical ? "vertical" : "horizontal");
      setScale(
        isVertical
          ? Math.min(vw / base.w, vh / base.h)
          : Math.max(vw / base.w, vh / base.h),
      );
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const el = containerRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const scrollable = el.offsetHeight - window.innerHeight;
          if (scrollable > 0) {
            setProgress(Math.min(Math.max(-rect.top / scrollable, 0), 1));
          }
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const colorRevealed = progress > 0.05;

  const horizontalLayers = [
    {
      src: "/key-visual/horizontal/hoka.svg",
      w: 1280,
      h: 720,
      x: 618,
      y: 360,
      scale: 1,
      rotate: 0,
      z: -30,
      opacity: 1,
      animate: false,
    },
    {
      src: "/key-visual/horizontal/setu.svg",
      w: 509,
      h: 519,
      x: -71,
      y: 158.971,
      scale: 1,
      rotate: 0,
      z: -20,
      opacity: 1,
      animate: false,
    },
    {
      src: "/key-visual/horizontal/setu-color.svg",
      w: 509,
      h: 519,
      x: -71,
      y: 159.071,
      scale: 1,
      rotate: 0,
      z: -21,
      opacity: colorRevealed ? 1 : 0,
      animate: true,
    },
    {
      src: "/key-visual/center-text.svg",
      w: 179,
      h: 179,
      x: 89.5,
      y: 89.5,
      scale: 1,
      rotate: 0,
      z: -5,
      opacity: 1,
      animate: false,
    },
    {
      src: "/key-visual/horizontal/ten.svg",
      w: 521,
      h: 549,
      x: 513,
      y: 360,
      scale: 1,
      rotate: 0,
      z: -9,
      opacity: 1,
      animate: false,
    },
    {
      src: "/key-visual/horizontal/ten-color.svg",
      w: 521,
      h: 549,
      x: 513,
      y: 368,
      scale: 1.03,
      rotate: 0,
      z: -10,
      opacity: colorRevealed ? 1 : 0,
      animate: true,
    },
  ];

  const verticalLayers = [
    {
      src: "/key-visual/vertical/hoka.svg",
      w: 1080,
      h: 1920,
      x: 540,
      y: 960,
      scale: 1,
      rotate: 0,
      z: -30,
      opacity: 1,
      animate: false,
    },
    {
      src: "/key-visual/vertical/setu.svg",
      w: 649,
      h: 648,
      x: 203,
      y: -119,
      scale: 0.98,
      rotate: 0,
      z: -20,
      opacity: 1,
      animate: false,
    },
    {
      src: "/key-visual/vertical/setu-color.svg",
      w: 649,
      h: 648,
      x: 203,
      y: -126,
      scale: 1,
      rotate: 0,
      z: -21,
      opacity: colorRevealed ? 1 : 0,
      animate: true,
    },
    {
      src: "/key-visual/center-text.svg",
      w: 179,
      h: 179,
      x: 89.5,
      y: 89.5,
      scale: 1.69,
      rotate: 0,
      z: -5,
      opacity: 1,
      animate: false,
    },
    {
      src: "/key-visual/vertical/ten.svg",
      w: 600,
      h: 651,
      x: 439,
      y: 775,
      scale: 1,
      rotate: 0,
      z: -9,
      opacity: 1,
      animate: false,
    },
    {
      src: "/key-visual/vertical/ten-color.svg",
      w: 600,
      h: 651,
      x: 439,
      y: 794,
      scale: 1,
      rotate: 0,
      z: -10,
      opacity: colorRevealed ? 1 : 0,
      animate: true,
    },
  ];

  const layers = layout === "vertical" ? verticalLayers : horizontalLayers;
  const base = layout === "vertical" ? verticalBase : horizontalBase;
  const backgroundSrc =
    layout === "vertical"
      ? "/key-visual/back-vertical.png"
      : "/key-visual/back-horizontal.png";
  return (
    <div ref={containerRef} style={{ height: `${SCROLL_PAGES * 100}vh` }}>
      <section className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        <div
          className={`absolute left-1/2 top-1/2 origin-center transition-opacity duration-1000 ease-in ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
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
            className="absolute inset-0 h-full w-full bg-repeat"
            style={{ zIndex: -100 }}
          />
          {layers.map((l) => {
            const isColor = l.src.includes("-color");
            const isCenterText = l.src === "/key-visual/center-text.svg";
            const common = {
              transform: `translate(-50%, -50%) translate(${l.x}px, ${l.y}px) scale(${l.scale}) rotate(${l.rotate}deg)`,
              zIndex: l.z,
              opacity: l.opacity,
              transition: l.animate ? "opacity 0.8s ease-in" : undefined,
            } as const;

            if (isCenterText) {
              return (
                <div
                  key={l.src}
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
                  style={{ ...common, width: l.w, height: l.h }}
                >
                  <CircularLensEffect
                    width={l.w}
                    height={l.h}
                    textureSrc={l.src}
                    lens={{
                      x: l.w / 2,
                      y: l.h / 2,
                      radius: Math.min(l.w / 2, l.h / 2) * 0.905,
                      refraction: 1,
                      depth: 30,
                      dispersion: 0.6,
                      frost: 1,
                      spread: 4,
                    }}
                    className="absolute inset-0"
                  />
                </div>
              );
            }

            if (isColor) {
              return (
                <div
                  key={l.src}
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
                  style={{
                    ...common,
                    width: l.w,
                    height: l.h,
                    isolation: "isolate",
                  }}
                >
                  <img
                    src={l.src}
                    alt=""
                    aria-hidden="true"
                    width={l.w}
                    height={l.h}
                    decoding="async"
                    loading="eager"
                    fetchPriority="high"
                    draggable={false}
                    className="block h-full w-full"
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      mixBlendMode: "screen",
                      backgroundImage: `url(${backgroundSrc})`,
                      backgroundSize: `${base.w / l.scale}px ${base.h / l.scale}px`,
                      backgroundPosition: `${(l.w - l.x - base.w / 2) / l.scale}px ${(l.h - l.y - base.h / 2) / l.scale}px`,
                      backgroundColor: "white",
                      backgroundRepeat: "no-repeat",
                      filter: " invert(1) brightness(3.4) contrast(1.0)",
                      WebkitMaskImage: `url(${l.src})`,
                      maskImage: `url(${l.src})`,
                      WebkitMaskSize: "100% 100%",
                      maskSize: "100% 100%",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat" as const,
                    }}
                  />
                </div>
              );
            }

            return (
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
                style={common}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
