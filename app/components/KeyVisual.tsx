"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import CircularLensEffect from "./CircularLensEffect";
const horizontalBase = { w: 1280, h: 720 } as const;
const verticalBase = { w: 1080, h: 1920 } as const;
const COLOR_FADE_DURATION_MS = 800;
const TE_FADE_DURATION_MS = 300;
const FINAL_TO_ZOOM_THRESHOLD = 0.15;
const ZOOM_SCROLL_PAGES = 3.0;
// 変更理由: スクロールに追従した演出は維持しつつ、progress更新を微小差分で連打しないよう閾値を定義します。
// 0.003(約333段階)なら視覚上の連続性を保ちながら再レンダー回数を抑制できます。
const PROGRESS_UPDATE_EPSILON = 0.003;
// 変更理由: progressの丸め精度を統一して不要な小数揺れによる再描画を減らします。
const PROGRESS_ROUND_DIGITS = 3;
const KV_COMPLETED_STORAGE_KEY = "keyvisual:completed";
const KV_LOADED_STORAGE_KEY = "keyvisual:loaded";

// 変更理由: 再訪時の軽量モード判定を共通化し、例外時は安全側（未完了扱い）に倒します。
const hasCompletedKeyVisualInSession = () => {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(KV_COMPLETED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const COMMON_KV_SOURCES = [
  "/key-visual/center-text.svg",
  "/key-visual/center-circle.svg",
  "/key-visual/te.png",
  "/key-visual/center-mobile.png",
] as const;

const HORIZONTAL_KV_SOURCES = [
  "/key-visual/back-horizontal.png",
  "/key-visual/horizontal/hoka.svg",
  "/key-visual/horizontal/setu.svg",
  "/key-visual/horizontal/setu-color.svg",
  "/key-visual/horizontal/ten.svg",
  "/key-visual/horizontal/ten-color.svg",
  ...COMMON_KV_SOURCES,
] as const;

const VERTICAL_KV_SOURCES = [
  "/key-visual/back-vertical.png",
  "/key-visual/vertical/hoka.svg",
  "/key-visual/vertical/setu.svg",
  "/key-visual/vertical/setu-color.svg",
  "/key-visual/vertical/ten.svg",
  "/key-visual/vertical/ten-color.svg",
  ...COMMON_KV_SOURCES,
] as const;

export default function KeyVisual() {
  const [scale, setScale] = useState(1);
  const [coverScale, setCoverScale] = useState(1);
  const [layout, setLayout] = useState<"horizontal" | "vertical">("horizontal");
  const [layoutReady, setLayoutReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [colorShownProgress, setColorShownProgress] = useState<number | null>(null);
  const [colorFadeCompleted, setColorFadeCompleted] = useState(false);
  const [teShownProgress, setTeShownProgress] = useState<number | null>(null);
  const [teFadeCompleted, setTeFadeCompleted] = useState(false);
  const [finalShownProgress, setFinalShownProgress] = useState<number | null>(null);
  const [kvEverCompleted, setKvEverCompleted] = useState(false);
  const [isReturningSession, setIsReturningSession] = useState(false);
  const [scrollIndicatorVisible, setScrollIndicatorVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasDispatchedCompleteRef = useRef(false);
  const scrollAdjustedRef = useRef(false);
  const savedContentOffsetRef = useRef(0);
  const scrollIndicatorTimerRef = useRef<number | null>(null);
  const maxAllowedProgressRef = useRef(1);
  const hasInitializedLayoutRef = useRef(false);
  const initialRevealRafRef = useRef<number | null>(null);
  const hasStartedRevealRef = useRef(false);
  const restoredFromStorageRef = useRef(false);
  const progressRef = useRef(0);
  const kvMetricsRef = useRef({
    offsetTop: 0,
    offsetHeight: 0,
    scrollable: 0,
    maxScroll: 0,
  });

  const markInitialLoaded = useCallback(() => {
    if (typeof document === "undefined" || typeof window === "undefined") return;
    if (document.body.dataset.keyvisualLoaded === "1") return;
    document.body.dataset.keyvisualLoaded = "1";
    try {
      window.sessionStorage.setItem(KV_LOADED_STORAGE_KEY, "1");
    } catch {
      // セッションストレージが利用できない場合はフラグの永続化だけ諦める
    }
    window.dispatchEvent(new Event("keyvisual:loaded"));
  }, []);

  const startInitialReveal = useCallback(
    (isVertical: boolean) => {
      if (hasStartedRevealRef.current) return;
      hasStartedRevealRef.current = true;
      const preloadSources = (isVertical ? VERTICAL_KV_SOURCES : HORIZONTAL_KV_SOURCES) as readonly string[];

      const preloadImageWithRetry = (src: string, maxAttempts: number, retryDelayMs: number) =>
        new Promise<void>((resolve) => {
          let attempt = 0;
          const tryLoad = () => {
            attempt += 1;
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => {
              if (attempt < maxAttempts) {
                window.setTimeout(tryLoad, retryDelayMs);
              } else {
                resolve();
              }
            };
            img.src = src;
          };
          tryLoad();
        });

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        initialRevealRafRef.current = requestAnimationFrame(() => {
          setIsVisible(true);
          markInitialLoaded();
        });
      };

      Promise.all(
        preloadSources.map((src) => preloadImageWithRetry(src, 3, 300)),
      ).then(() => {
        finish();
      });
    },
    [markInitialLoaded],
  );

  const updateScale = useCallback(() => {
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
    if (!hasInitializedLayoutRef.current) {
      hasInitializedLayoutRef.current = true;
      setLayoutReady(true);
      startInitialReveal(isVertical);
    }
  }, [startInitialReveal]);

  const updateKvMetrics = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const offsetTop = el.offsetTop;
    const offsetHeight = el.offsetHeight;
    const scrollable = Math.max(offsetHeight - window.innerHeight, 0);
    kvMetricsRef.current = {
      offsetTop,
      offsetHeight,
      scrollable,
      maxScroll: offsetTop + scrollable * maxAllowedProgressRef.current,
    };
  }, []);

  useEffect(() => {
    let restoreRaf: number | null = null;
    const storedCompleted = hasCompletedKeyVisualInSession();
    if (storedCompleted) {
      restoredFromStorageRef.current = true;
      hasStartedRevealRef.current = true;
      hasDispatchedCompleteRef.current = true;
      document.body.dataset.keyvisualComplete = "1";
      // 変更理由: 戻る遷移時はKV演出を再実行せず、現在の見た目を保った静的表示へ即時復元します。
      // これにより重いプリロード・スクロール監視・段階アニメーションの再初期化を回避します。
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isVertical = vw / vh <= 4 / 3;
      const base = isVertical ? verticalBase : horizontalBase;
      restoreRaf = requestAnimationFrame(() => {
        setLayout(isVertical ? "vertical" : "horizontal");
        setScale(
          isVertical
            ? Math.min(vw / base.w, vh / base.h)
            : Math.max(vw / base.w, vh / base.h),
        );
        setCoverScale(Math.max(vw / base.w, vh / base.h));
        setLayoutReady(true);
        setIsVisible(true);
        setKvEverCompleted(true);
        setIsReturningSession(true);
        setScrollIndicatorVisible(false);
      });
      markInitialLoaded();
      window.dispatchEvent(new Event("keyvisual:complete"));
      return () => {
        if (restoreRaf !== null) {
          cancelAnimationFrame(restoreRaf);
        }
      };
    }

    const initialRaf = requestAnimationFrame(updateScale);
    window.addEventListener("resize", updateScale);
    return () => {
      if (restoreRaf !== null) {
        cancelAnimationFrame(restoreRaf);
      }
      if (initialRevealRafRef.current !== null) {
        cancelAnimationFrame(initialRevealRafRef.current);
      }
      cancelAnimationFrame(initialRaf);
      window.removeEventListener("resize", updateScale);
    };
  }, [markInitialLoaded, updateScale]);

  useEffect(() => {
    if (restoredFromStorageRef.current) {
      return;
    }
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const { offsetTop, offsetHeight, scrollable, maxScroll } = kvMetricsRef.current;
        if (scrollable > 0) {
          const raw = (window.scrollY - offsetTop) / scrollable;
          const nextProgress = Math.min(
            Math.min(Math.max(raw, 0), 1),
            maxAllowedProgressRef.current,
          );
          if (Math.abs(nextProgress - progressRef.current) >= PROGRESS_UPDATE_EPSILON) {
            const normalized =
              Math.round(nextProgress * 10 ** PROGRESS_ROUND_DIGITS) /
              10 ** PROGRESS_ROUND_DIGITS;
            progressRef.current = normalized;
            setProgress(normalized);
          }
        }
        if (!hasDispatchedCompleteRef.current && window.scrollY > maxScroll) {
          window.scrollTo(0, maxScroll);
        }
        if (
          hasDispatchedCompleteRef.current &&
          window.scrollY >= offsetTop + offsetHeight
        ) {
          savedContentOffsetRef.current = Math.max(
            0,
            window.scrollY - (offsetTop + offsetHeight),
          );
          setKvEverCompleted(true);
        }
        ticking = false;
      });
    };
    const onResize = () => {
      updateKvMetrics();
      onScroll();
    };
    updateKvMetrics();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [updateKvMetrics]);

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
    if (isReturningSession) return;
    if (progress <= colorRevealThreshold && colorShownProgress !== null) {
      setColorShownProgress(null);
      return;
    }
    if (colorShownProgress === null && colorRevealed) {
      setColorShownProgress(Math.min(progress, colorShownMax));
    }
  }, [progress, colorRevealed, colorShownProgress, colorShownMax, isReturningSession]);

  useEffect(() => {
    if (isReturningSession) return;
    if (!colorRevealed) {
      setColorFadeCompleted(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setColorFadeCompleted(true);
    }, COLOR_FADE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [colorRevealed, isReturningSession]);

  useEffect(() => {
    if (isReturningSession) return;
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
  }, [teRevealed, teShownProgress, progress, teShownMax, isReturningSession]);

  useEffect(() => {
    if (isReturningSession) return;
    if (!finalRevealed) {
      setFinalShownProgress(null);
      return;
    }
    if (finalShownProgress === null) {
      setFinalShownProgress(Math.min(progress, finalShownMax));
    }
  }, [finalRevealed, finalShownProgress, progress, finalShownMax, isReturningSession]);

  useLayoutEffect(() => {
    if (isReturningSession) return;
    if (!colorFadeCompleted) {
      maxAllowedProgressRef.current = teShownMax + 0.01;
    } else if (!teFadeCompleted) {
      maxAllowedProgressRef.current = finalShownMax + 0.01;
    } else {
      maxAllowedProgressRef.current = 1;
    }
    const { offsetTop, scrollable } = kvMetricsRef.current;
    kvMetricsRef.current.maxScroll = offsetTop + scrollable * maxAllowedProgressRef.current;
    if (!hasDispatchedCompleteRef.current && window.scrollY > kvMetricsRef.current.maxScroll) {
      window.scrollTo(0, kvMetricsRef.current.maxScroll);
    }
  }, [colorFadeCompleted, teFadeCompleted, teShownMax, finalShownMax, isReturningSession]);

  useEffect(() => {
    if (isReturningSession) return;
    updateKvMetrics();
  }, [kvEverCompleted, scrollPages, updateKvMetrics, isReturningSession]);

  // 変更理由: 各レンダーでレイヤー配列オブジェクトを再生成すると、スクロール中のJS負荷が増えるため、
  // 依存する表示状態が変わった時だけ再計算するようメモ化します。
  const horizontalLayers = useMemo(
    () => [
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
    ],
    [effectiveColorRevealed, effectiveTeRevealed],
  );

  // 変更理由: 縦レイアウト側も同じくメモ化し、スクロール中のオブジェクト生成コストを削減します。
  const verticalLayers = useMemo(
    () => [
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
    ],
    [effectiveColorRevealed, effectiveTeRevealed],
  );

  const layers = useMemo(
    () => (layout === "vertical" ? verticalLayers : horizontalLayers),
    [layout, verticalLayers, horizontalLayers],
  );
  const sceneZoomTarget = layout === "vertical" ? 4.1 : 3.2;
  const sceneZoom = 1 + (sceneZoomTarget - 1) * effectiveZoomProgress;
  const whiteFadeOpacity = Math.min(effectiveZoomProgress * 1.2, 1);
  const base = layout === "vertical" ? verticalBase : horizontalBase;
  const backgroundSrc =
    layout === "vertical"
      ? "/key-visual/back-vertical.png"
      : "/key-visual/back-horizontal.png";
  const isMobileMode = layout === "vertical";

  useEffect(() => {
    if (hasDispatchedCompleteRef.current) return;
    if (!finalRevealed || whiteFadeOpacity < 1) return;
    hasDispatchedCompleteRef.current = true;
    window.sessionStorage.setItem(KV_COMPLETED_STORAGE_KEY, "1");
    document.body.dataset.keyvisualComplete = "1";
    window.dispatchEvent(new Event("keyvisual:complete"));
  }, [finalRevealed, whiteFadeOpacity]);

  const kvComplete = kvEverCompleted || (finalRevealed && whiteFadeOpacity >= 1);

  useEffect(() => {
    if (isReturningSession) {
      return;
    }
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
  }, [isReturningSession]);

  useEffect(() => {
    if (kvComplete) {
      setScrollIndicatorVisible(false);
    }
  }, [kvComplete]);

  useLayoutEffect(() => {
    if (!kvEverCompleted) return;
    if (restoredFromStorageRef.current) return;
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
              layoutReady && isVisible ? "opacity-100" : "opacity-0"
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
            layoutReady && isVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transform: `translate(-50%, -50%) scale(${scale * sceneZoom})`,
            width: base.w,
            height: base.h,
            willChange: "transform",
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
            const isCenterCircle = l.src === "/key-visual/center-circle.svg";
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
              if (isMobileMode || isReturningSession) {
                return (
                  <img
                    key={isMobileMode ? "/key-visual/center-mobile.png" : l.src}
                    src={isMobileMode ? "/key-visual/center-mobile.png" : l.src}
                    alt=""
                    aria-hidden="true"
                    width={l.w}
                    height={l.h}
                    decoding="async"
                    // 変更理由: 再訪時はWebGLレンズ描画を省略し、静的画像で見た目を保ったままGPU負荷を下げます。
                    // 変更理由: クリティカル画像以外の eager/high を外し、同時フェッチ集中による帯域競合を抑えます。
                    loading="auto"
                    draggable={false}
                    className="absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 select-none"
                    style={{ ...common, width: l.w, height: l.h }}
                  />
                );
              }
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
                      radius: Math.min(l.w / 2, l.h / 2) * 1.285,
                      refraction: 0.3,
                      depth: 10.0,
                      dispersion: 0.35,
                      frost: 5,
                      spread: 10,
                    }}
                    className="absolute inset-0"
                  />
                </div>
              );
            }

            if (isMobileMode && isCenterCircle) {
              return null;
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
                    // 変更理由: カラーレイヤーは初期描画の必須要素ではないため優先度を通常化します。
                    loading="auto"
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
                // 変更理由: eager/high を多重指定するとネットワーク競合が起きやすいため、通常優先度へ揃えます。
                loading="auto"
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
          {/* Figma(1578:9939)に合わせ、PC版のみ文字サイズと配置(30x89)を揃えます。モバイルは既存の見た目を維持します。 */}
          <p
            className="whitespace-nowrap rotate-90 text-center text-[14px] font-medium tracking-[2.1px] [text-shadow:0_0_8px_rgba(106,115,120,0.1)] md:flex md:h-[89px] md:w-[30px] md:items-center md:justify-center md:text-[20px] md:leading-[1.5] md:tracking-[3px]"
            style={{ animation: "kv-scroll-pulse 2000ms linear infinite" }}
          >
            SCROLL
          </p>
          {/* モバイル版は既存アニメーションを残し、PC版の調整影響を切り離します。 */}
          <div className="relative mt-8 h-[60px] w-px overflow-hidden bg-neutral-700 drop-shadow-[0_0_8px_rgba(106,115,120,0.1)] md:hidden">
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
          {/* PC版はFigmaのLine(100px)仕様に合わせ、固定線+流れる線(-100px→-20px→60px)を再現します。 */}
          <div className="relative hidden h-[100px] w-[22px] overflow-hidden drop-shadow-[0_0_8px_rgba(106,115,120,0.1)] md:block">
            <div className="absolute left-1/2 top-0 h-[100px] w-px -translate-x-1/2 bg-neutral-700" />
            <div className="kv-scroll-indicator-line absolute left-1/2 top-0 h-[100px] w-px bg-neutral-50" />
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
