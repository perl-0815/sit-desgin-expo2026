"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import CircularLensEffect from "./CircularLensEffect";
const horizontalBase = { w: 1280, h: 720 } as const;
const verticalBase = { w: 1080, h: 1920 } as const;
const COLOR_FADE_DURATION_MS = 800;
const TE_FADE_DURATION_MS = 300;
const FINAL_TO_ZOOM_THRESHOLD = 0.15;
const ZOOM_SCROLL_PAGES = 3.0;


export default function KeyVisual() {
  const [scale, setScale] = useState(1);
  const [coverScale, setCoverScale] = useState(1);
  const [layout, setLayout] = useState<"horizontal" | "vertical">("horizontal");
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [colorShownProgress, setColorShownProgress] = useState<number | null>(null);
  const [colorFadeCompleted, setColorFadeCompleted] = useState(false);
  const [teShownProgress, setTeShownProgress] = useState<number | null>(null);
  const [teFadeCompleted, setTeFadeCompleted] = useState(false);
  const [finalShownProgress, setFinalShownProgress] = useState<number | null>(null);
  const [kvEverCompleted, setKvEverCompleted] = useState(false);
  const [scrollIndicatorVisible, setScrollIndicatorVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasDispatchedCompleteRef = useRef(false);
  const scrollAdjustedRef = useRef(false);
  const savedContentOffsetRef = useRef(0);
  const scrollIndicatorTimerRef = useRef<number | null>(null);
  const maxAllowedProgressRef = useRef(1);

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
      setCoverScale(Math.max(vw / base.w, vh / base.h));
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
            const raw = Math.min(Math.max(-rect.top / scrollable, 0), 1);
            setProgress(Math.min(raw, maxAllowedProgressRef.current));
          }
          if (hasDispatchedCompleteRef.current && rect.bottom <= 0) {
            savedContentOffsetRef.current = Math.max(0, window.scrollY - el.offsetHeight);
            setKvEverCompleted(true);
          }
        }
        ticking = false;
      });
    };
    const clampScroll = () => {
      if (hasDispatchedCompleteRef.current) return;
      const el = containerRef.current;
      if (!el) return;
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const maxScroll = el.offsetTop + scrollable * maxAllowedProgressRef.current;
      if (window.scrollY > maxScroll) {
        window.scrollTo(0, maxScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", clampScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", clampScroll);
    };
  }, []);

  const colorRevealThreshold = 0.15;
  const teRevealThreshold = 0.15;
  const finalRevealThreshold = 0.15;
  const preZoomMinProgress =
    colorRevealThreshold + teRevealThreshold + finalRevealThreshold + FINAL_TO_ZOOM_THRESHOLD + 0.05;
  const scrollPages = Math.max(
    Math.ceil(ZOOM_SCROLL_PAGES / (1 - preZoomMinProgress)) + 1,
    6,
  );
  const zoomScrollRange = ZOOM_SCROLL_PAGES / (scrollPages - 1);
  const colorShownMax = 1 - teRevealThreshold - finalRevealThreshold - FINAL_TO_ZOOM_THRESHOLD - zoomScrollRange;
  const teShownMax = 1 - finalRevealThreshold - FINAL_TO_ZOOM_THRESHOLD - zoomScrollRange;
  const finalShownMax = 1 - FINAL_TO_ZOOM_THRESHOLD - zoomScrollRange;
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
          Math.max((progress - zoomStartProgress) / zoomScrollRange, 0),
          1,
        )
      : 0;

  const effectiveColorRevealed = kvEverCompleted || colorRevealed;
  const effectiveTeRevealed = kvEverCompleted || teRevealed;
  const effectiveFinalRevealed = kvEverCompleted || finalRevealed;
  const effectiveZoomProgress = kvEverCompleted ? 0 : zoomProgress;

  useEffect(() => {
    if (progress <= colorRevealThreshold && colorShownProgress !== null) {
      setColorShownProgress(null);
      return;
    }
    if (colorShownProgress === null && colorRevealed) {
      setColorShownProgress(Math.min(progress, colorShownMax));
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
      setTeShownProgress(Math.min(progress, teShownMax));
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
      setFinalShownProgress(Math.min(progress, finalShownMax));
    }
  }, [finalRevealed, finalShownProgress, progress]);

  useLayoutEffect(() => {
    if (!colorFadeCompleted) {
      maxAllowedProgressRef.current = teShownMax + 0.01;
    } else if (!teFadeCompleted) {
      maxAllowedProgressRef.current = finalShownMax + 0.01;
    } else {
      maxAllowedProgressRef.current = 1;
    }
  }, [colorFadeCompleted, teFadeCompleted, teShownMax, finalShownMax]);

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
      opacity: effectiveColorRevealed ? 1 : 0,
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
      opacity: effectiveColorRevealed ? 1 : 0,
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
      opacity: effectiveTeRevealed ? 1 : 0,
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
      opacity: effectiveColorRevealed ? 1 : 0,
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
      opacity: effectiveColorRevealed ? 1 : 0,
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
      opacity: effectiveTeRevealed ? 1 : 0,
      animate: true,
    },
  ];

  const layers = layout === "vertical" ? verticalLayers : horizontalLayers;
  const sceneZoomTarget = layout === "vertical" ? 4.1 : 3.2;
  const sceneZoom = 1 + (sceneZoomTarget - 1) * effectiveZoomProgress;
  const whiteFadeOpacity = Math.min(effectiveZoomProgress * 1.2, 1);
  const base = layout === "vertical" ? verticalBase : horizontalBase;
  const backgroundSrc =
    layout === "vertical"
      ? "/key-visual/back-vertical.png"
      : "/key-visual/back-horizontal.png";

  useEffect(() => {
    if (hasDispatchedCompleteRef.current) return;
    if (!finalRevealed || whiteFadeOpacity < 1) return;
    hasDispatchedCompleteRef.current = true;
    document.body.dataset.keyvisualComplete = "1";
    window.dispatchEvent(new Event("keyvisual:complete"));
  }, [finalRevealed, whiteFadeOpacity]);

  const kvComplete = kvEverCompleted || (finalRevealed && whiteFadeOpacity >= 1);

  useEffect(() => {
    const onScroll = () => {
      setScrollIndicatorVisible(false);
      if (scrollIndicatorTimerRef.current !== null) {
        window.clearTimeout(scrollIndicatorTimerRef.current);
      }
      scrollIndicatorTimerRef.current = window.setTimeout(() => {
        if (!hasDispatchedCompleteRef.current) {
          setScrollIndicatorVisible(true);
        }
      }, 1500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollIndicatorTimerRef.current !== null) {
        window.clearTimeout(scrollIndicatorTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (kvComplete) {
      setScrollIndicatorVisible(false);
    }
  }, [kvComplete]);

  useLayoutEffect(() => {
    if (!kvEverCompleted) return;
    if (scrollAdjustedRef.current) return;
    scrollAdjustedRef.current = true;
    const el = containerRef.current;
    if (!el) return;
    const kvBottom = el.offsetTop + el.offsetHeight;
    window.scrollTo(0, kvBottom + savedContentOffsetRef.current);
  }, [kvEverCompleted]);

  return (
    <div ref={containerRef} style={{ height: kvEverCompleted ? "100vh" : `${scrollPages * 100}vh`, overflowAnchor: "none" as const }}>
      <section className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        {layout === "vertical" && (
          <div
            aria-hidden="true"
            className={`absolute inset-0 overflow-hidden transition-opacity duration-1000 ease-in ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
            style={{ zIndex: -1 }}
          >
            <div
              className="absolute left-1/2 top-1/2 origin-center"
              style={{
                transform: `translate(-50%, -50%) scale(${coverScale * sceneZoom * 1.1})`,
                width: base.w,
                height: base.h,
                filter: "blur(0px)",
              }}
            >
              <img
                src={backgroundSrc}
                alt=""
                width={base.w}
                height={base.h}
                className="absolute inset-0 h-full w-full"
              />
              <img
                src={layers[0].src}
                alt=""
                width={layers[0].w}
                height={layers[0].h}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 block select-none"
                style={{
                  transform: `translate(-50%, -50%) translate(${layers[0].x}px, ${layers[0].y}px) scale(${layers[0].scale})`,
                }}
              />
            </div>
          </div>
        )}
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
            const layerY = isTe ? Math.min(Math.max(l.y * (1 - teFollowStrength * effectiveZoomProgress), l.y - 100), l.y + 100) : l.y;
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
            opacity: effectiveFinalRevealed ? 0.8 * (1 - whiteFadeOpacity) : 0,
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
            opacity: effectiveFinalRevealed ? 1 - whiteFadeOpacity : 0,
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

        <div
          className={`pointer-events-none absolute bottom-8 right-8 flex flex-col items-center text-neutral-700 transition-opacity ease-in [font-family:var(--font-roboto),'Hiragino_Kaku_Gothic_ProN',sans-serif] ${isVisible && scrollIndicatorVisible && !kvComplete ? "opacity-100 duration-1000" : "opacity-0 duration-500"}`}
          style={{ zIndex: 10 }}
        >
          <p
            className="whitespace-nowrap rotate-90 text-center text-[14px] font-medium tracking-[2.1px] [text-shadow:0_0_8px_rgba(106,115,120,0.15)]"
            style={{ animation: "kv-scroll-pulse 2000ms linear infinite" }}
          >
            SCROLL
          </p>
          <div className="relative mt-8 h-[60px] w-px overflow-hidden bg-neutral-700 drop-shadow-[0_0_8px_rgba(106,115,120,0.15)]">
            <div
              className="absolute inset-0 origin-top bg-neutral-50"
              style={{
                animation: "kv-scroll-bar-light-fill 2000ms linear infinite",
              }}
            />
            <div
              className="absolute inset-0 origin-top bg-neutral-700"
              style={{
                animation: "kv-scroll-bar-dark-fill 2000ms linear infinite",
              }}
            />
          </div>
        </div>
        <style>{`
          @keyframes kv-scroll-pulse {
            0% {
              color: var(--color-neutral-700);
              animation-timing-function: ease-in;
            }
            50% {
              color: var(--color-neutral-50);
              animation-timing-function: ease-out;
            }
            100% {
              color: var(--color-neutral-700);
            }
          }
          @keyframes kv-scroll-bar-light-fill {
            0% {
              transform: scaleY(0);
              animation-timing-function: ease-in;
            }
            50% {
              transform: scaleY(1);
              animation-timing-function: ease-out;
            }
            100% {
              transform: scaleY(1);
            }
          }
          @keyframes kv-scroll-bar-dark-fill {
            0% {
              transform: scaleY(0);
            }
            50% {
              transform: scaleY(0);
              animation-timing-function: ease-out;
            }
            100% {
              transform: scaleY(1);
              animation-timing-function: ease-in;
            }
          }
        `}</style>
      </section>
    </div>
  );
}
