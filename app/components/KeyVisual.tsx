"use client";

import { useEffect, useRef, useState } from "react";
import CircularLensEffect from "./CircularLensEffect";
const SCROLL_PAGES = 5.0;
const horizontalBase = { w: 1280, h: 720 } as const;
const verticalBase = { w: 1080, h: 1920 } as const;
const COLOR_FADE_DURATION_MS = 800;
const TE_FADE_DURATION_MS = 700;
const FINAL_TO_ZOOM_THRESHOLD = 0.2;


export default function KeyVisual() {
  const [scale, setScale] = useState(1);
  const [layout, setLayout] = useState<"horizontal" | "vertical">("horizontal");
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [colorShownProgress, setColorShownProgress] = useState<number | null>(null);
  const [colorFadeCompleted, setColorFadeCompleted] = useState(false);
  const [teShownProgress, setTeShownProgress] = useState<number | null>(null);
  const [teFadeCompleted, setTeFadeCompleted] = useState(false);
  const [finalShownProgress, setFinalShownProgress] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isVertical = vw / vh <= 4 / 3;
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

  const colorRevealThreshold = 0.15;
  const teRevealThreshold = 0.15;
  const finalRevealThreshold = 0.15;
  const colorRevealed = progress > colorRevealThreshold;
  const teReadyByScroll =
    colorShownProgress !== null && progress > colorShownProgress + teRevealThreshold;
  const teRevealed = colorFadeCompleted && teReadyByScroll;
  const finalReadyByScroll =
    teShownProgress !== null && progress > teShownProgress + finalRevealThreshold;
  const finalRevealed = teFadeCompleted && finalReadyByScroll;
  const zoomReadyByScroll =
    finalShownProgress !== null &&
    progress > finalShownProgress + FINAL_TO_ZOOM_THRESHOLD;
  const zoomStartProgress =
    finalShownProgress !== null
      ? finalShownProgress + FINAL_TO_ZOOM_THRESHOLD
      : 1;
  const zoomProgress =
    finalRevealed && zoomReadyByScroll
      ? Math.min(
          Math.max((progress - zoomStartProgress) / (1 - zoomStartProgress), 0),
          1,
        )
      : 0;

  useEffect(() => {
    if (progress <= colorRevealThreshold && colorShownProgress !== null) {
      setColorShownProgress(null);
      return;
    }
    if (colorShownProgress === null && colorRevealed) {
      setColorShownProgress(progress);
    }
  }, [progress, colorRevealed, colorShownProgress]);

  useEffect(() => {
    if (!colorRevealed) {
      setColorFadeCompleted(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setColorFadeCompleted(true);
    }, COLOR_FADE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [colorRevealed]);

  useEffect(() => {
    if (!teRevealed) {
      setTeShownProgress(null);
      setTeFadeCompleted(false);
      return;
    }
    if (teShownProgress === null) {
      setTeShownProgress(progress);
    }
    const timer = window.setTimeout(() => {
      setTeFadeCompleted(true);
    }, TE_FADE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [teRevealed, teShownProgress, progress]);

  useEffect(() => {
    if (!finalRevealed) {
      setFinalShownProgress(null);
      return;
    }
    if (finalShownProgress === null) {
      setFinalShownProgress(progress);
    }
  }, [finalRevealed, finalShownProgress, progress]);

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
      src: "/key-visual/center-circle.svg",
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
    {
      src: "/key-visual/te.png",
      w: 942,
      h: 964,
      x: 550,
      y: 721,
      scale: 0.25,
      rotate: 0,
      z: 20,
      opacity: teRevealed ? 1 : 0,
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
      src: "/key-visual/center-circle.svg",
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
    {
      src: "/key-visual/te.png",
      w: 942,
      h: 964,
      x: 700,
      y: 1090,
      scale: 0.75,
      rotate: 0,
      z: 20,
      opacity: teRevealed ? 1 : 0,
      animate: true,
    },
  ];

  const layers = layout === "vertical" ? verticalLayers : horizontalLayers;
  const sceneZoomTarget = layout === "vertical" ? 2.1 : 3.2;
  const sceneZoom = 1 + (sceneZoomTarget - 1) * zoomProgress;
  const whiteFadeOpacity = Math.min(zoomProgress * 1.2, 1);
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
            transform: `translate(-50%, -50%) scale(${scale * sceneZoom})`,
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
            const isTe = l.src === "/key-visual/te.png";
            const teFollowStrength = layout === "vertical" ? 0.42 : 0.5;
            const layerY = isTe ? Math.min(Math.max(l.y * (1 - teFollowStrength * zoomProgress), l.y - 100), l.y + 100) : l.y;
            const common = {
              transform: `translate(-50%, -50%) translate(${l.x}px, ${layerY}px) scale(${l.scale}) rotate(${l.rotate}deg)`,
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
                      radius: Math.min(l.w / 2, l.h / 2) * 1.085,
                      refraction: 0.3,
                      depth: 1.8,
                      dispersion: 0.35,
                      frost: 40,
                      spread: 10,
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
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 40,
            opacity: finalRevealed ? 0.8 * (1 - whiteFadeOpacity) : 0,
            transition: "opacity 0.8s ease-in",
            background:
              "radial-gradient(circle at center, rgba(255, 255, 255, 0.00) 0%, rgba(255, 255, 255, 0.80) 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-white"
          style={{
            zIndex: 41,
            opacity: whiteFadeOpacity,
            transition: "opacity 0.2s linear",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[48px] left-[40px] inline-flex flex-col items-start gap-2"
          style={{
            zIndex: 42,
            opacity: finalRevealed ? 1 - whiteFadeOpacity : 0,
            transition: "opacity 0.8s ease-in",
            color: "#3C3C3C",
            textShadow: "0 2px 20px rgba(0,0,0,0.25)",
          }}
        >
          <div className="flex gap-2 flex-col flex-start">
            <p className="text-[17px] font-bold leading-none [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif]">令和7年</p>
            <div className="flex flex-col gap-1 flex-start self-stretch">
              <p className="text-[36px] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] font-bold leading-none">芝浦工業大学</p>
              <p className="text-[36px] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] font-bold leading-none">卒業・修了研究展</p>
            </div>
            <p className="text-[17px] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] font-bold leading-none">デザイン工学部 / 大学院理工学研究科</p>
          </div>
          <p className="text-[16px] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] font-bold leading-none">2026年3月7日（土）~ 3月17日（火）</p>
        </div>
      </section>
    </div>
  );
}
