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
const MOBILE_KV_STATIC_IMAGE_SRC = "/key-visual/kv-sp.png";

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
  "/key-visual/te.webp",
  "/key-visual/center-mobile.webp",
] as const;

// 変更理由: 初回表示の待機時間を短縮するため、KVの事前読み込み対象を「初期フレーム表示に必須な素材」のみに限定します。
// 従来は大型SVGを含む全レイヤーを Promise.all で待っており、回線が遅い環境で表示開始が大幅に遅延していました。
const HORIZONTAL_KV_CRITICAL_SOURCES = [
  "/key-visual/back-horizontal.webp",
  ...COMMON_KV_SOURCES,
] as const;

// 変更理由: モバイル縦レイアウトも同様に、初期に必要な背景と中央要素のみを先読みし、
// 残りレイヤーは通常読み込みへ委譲して体感表示速度を優先します。
const VERTICAL_KV_CRITICAL_SOURCES = [
  "/key-visual/back-vertical.webp",
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
  const [isMobileKvStaticImageReady, setIsMobileKvStaticImageReady] = useState(false);
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
  const hasDispatchedRenderedRef = useRef(false);
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

  const markKvRendered = useCallback(() => {
    if (typeof document === "undefined" || typeof window === "undefined") return;
    if (hasDispatchedRenderedRef.current) return;
    hasDispatchedRenderedRef.current = true;
    document.body.dataset.keyvisualRendered = "1";
    window.dispatchEvent(new Event("keyvisual:rendered"));
  }, []);

  useLayoutEffect(() => {
    // 変更理由: 再訪時もその表示サイクルでの描画完了を待てるよう、
    // 前回の rendered 状態を毎マウントで初期化します。
    hasDispatchedRenderedRef.current = false;
    if (typeof document !== "undefined") {
      delete document.body.dataset.keyvisualRendered;
    }
  }, []);

  const preloadKvSources = useCallback(
    (
      sources: readonly string[],
      maxAttempts = 3,
      retryDelayMs = 300,
    ) =>
      Promise.all(
        sources.map(
          (src) =>
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
            }),
        ),
      ),
    [],
  );

  const startInitialReveal = useCallback(
    (isVertical: boolean) => {
      if (hasStartedRevealRef.current) return;
      hasStartedRevealRef.current = true;
      const preloadSources = (isVertical
        ? VERTICAL_KV_CRITICAL_SOURCES
        : HORIZONTAL_KV_CRITICAL_SOURCES) as readonly string[];

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        initialRevealRafRef.current = requestAnimationFrame(() => {
          setIsVisible(true);
          markInitialLoaded();
        });
      };

      preloadKvSources(preloadSources, 3, 300).then(() => {
        finish();
      });
    },
    [markInitialLoaded, preloadKvSources],
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

  useLayoutEffect(() => {
    let restoreRaf: number | null = null;
    let cancelled = false;
    const storedCompleted = hasCompletedKeyVisualInSession();
    if (storedCompleted) {
      restoredFromStorageRef.current = true;
      hasStartedRevealRef.current = true;
      hasDispatchedCompleteRef.current = true;
      document.body.dataset.keyvisualComplete = "1";
      // 変更理由: 再訪時はKVを静的表示として扱い、スクロール/リサイズ監視を一切走らせない要件に合わせるため、
      // 復元処理の完了を待たずに「再訪セッション」状態へ即時遷移させます。
      // これにより、下流の監視系 useEffect が初回レンダーから早期 return し、イベント購読が張られません。
      setIsReturningSession(true);
      setScrollIndicatorVisible(false);
      // 変更理由: 戻る遷移時はKV演出を再実行せず、現在の見た目を保った静的表示へ即時復元します。
      // これにより重いプリロード・スクロール監視・段階アニメーションの再初期化を回避します。
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isVertical = vw / vh <= 4 / 3;
      const base = isVertical ? verticalBase : horizontalBase;
      const preloadSources = (isVertical
        ? VERTICAL_KV_CRITICAL_SOURCES
        : HORIZONTAL_KV_CRITICAL_SOURCES) as readonly string[];
      // 変更理由: 再訪時に loaded/complete を先に発火すると、ローダー解除後にKVレイヤーが段階表示されて
      // 「パーツがバラバラに出る」ちらつきが起きるため、必要素材の読み込み完了後に表示を切り替えます。
      preloadKvSources(preloadSources, 2, 120).then(() => {
        if (cancelled) return;
        restoreRaf = requestAnimationFrame(() => {
          if (cancelled) return;
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
          markInitialLoaded();
          window.dispatchEvent(new Event("keyvisual:complete"));
        });
      });
      return () => {
        cancelled = true;
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
  }, [markInitialLoaded, preloadKvSources, updateScale]);

  useEffect(() => {
    // 変更理由: 初回演出のスクロール完了後は同一セッション内でも静的表示へ移行し、
    // scroll/resize 監視を即時停止して挙動の安定性を優先するため、再訪モード時は監視を開始しません。
    if (isReturningSession) {
      return;
    }
    if (restoredFromStorageRef.current) {
      return;
    }
    // 変更理由: KV完了後までスクロール監視を継続すると、下層セクションからKVへ戻る際にも
    // progress再計算でレイヤー再描画が発生し、モバイルでちらつきやすくなります。
    // 完了後は見た目が固定状態のため、監視を解除して描画を安定化します。
    if (kvEverCompleted) {
      return;
    }
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const { offsetTop, offsetHeight, scrollable } = kvMetricsRef.current;
        const isLikelyMobileKv = window.innerWidth / window.innerHeight <= 4 / 3;
        if (scrollable > 0) {
          const raw = (window.scrollY - offsetTop) / scrollable;
          const nextProgress = Math.min(
            Math.min(Math.max(raw, 0), 1),
            maxAllowedProgressRef.current,
          );
          // 変更理由: モバイルKVは慣性スクロールで進捗が前後に揺れやすく、
          // しきい値付近でレイヤー表示が点滅しやすいため、進捗を単調増加で安定化します。
          const stabilizedProgress = isLikelyMobileKv
            ? Math.max(progressRef.current, nextProgress)
            : nextProgress;
          if (Math.abs(stabilizedProgress - progressRef.current) >= PROGRESS_UPDATE_EPSILON) {
            const normalized =
              Math.round(stabilizedProgress * 10 ** PROGRESS_ROUND_DIGITS) /
              10 ** PROGRESS_ROUND_DIGITS;
            progressRef.current = normalized;
            setProgress(normalized);
          }
        }
        // 変更理由: 早いスクロール操作時に `scrollTo(maxScroll)` で位置を巻き戻すと、
        // 「引き戻される」体感が強くなり操作感を損なうため、強制補正は行いません。
        // 進捗は `maxAllowedProgressRef` 側で上限管理することで、演出制御のみ維持します。
        if (window.scrollY >= offsetTop + offsetHeight) {
          // 変更理由: 高速スクロール時は `window.scrollY - KV下端` が過大になりやすく、
          // 完了後にその差分で再配置するとフッター付近まで一気に飛ぶことがあります。
          // 操作速度に関係なく着地点を安定させるため、完了時の補正量は常に0（KV直後固定）に統一します。
          savedContentOffsetRef.current = 0;
          // 変更理由: ユーザー要望に合わせ、KVスクロール完了時点で再訪モードへ即移行します。
          // これにより、同一セッション内の「初回完了直後」でも監視を終了でき、1回目の再訪時の不安定さを抑制します。
          setIsReturningSession(true);
          setScrollIndicatorVisible(false);
          // 変更理由: スクロール完了時点で完了フラグ永続化と complete イベント通知を保証し、
          // ルート遷移直後の復帰でも必ず静的復元ルートへ入るようにします。
          try {
            window.sessionStorage.setItem(KV_COMPLETED_STORAGE_KEY, "1");
          } catch {
            // セッションストレージが利用不可でも画面内状態の静的化は継続する
          }
          if (!hasDispatchedCompleteRef.current) {
            hasDispatchedCompleteRef.current = true;
            document.body.dataset.keyvisualComplete = "1";
            window.dispatchEvent(new Event("keyvisual:complete"));
          }
          setKvEverCompleted(true);
        }
        ticking = false;
      });
    };
    const onResize = () => {
      // 変更理由: モバイルではブラウザUI(アドレスバー)の伸縮で `resize` が頻発し、
      // KVスクロール中に maxScroll が揺れて `scrollTo` 補正が発火すると「スクロールが飛ぶ」体感になります。
      // KV未完了中のモバイルではメトリクス再計算を抑止し、終端判定の安定性を優先します。
      const isLikelyMobileKv = window.innerWidth / window.innerHeight <= 4 / 3;
      if (isLikelyMobileKv && !hasDispatchedCompleteRef.current) {
        return;
      }
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
  }, [updateKvMetrics, kvEverCompleted, isReturningSession]);

  useEffect(() => {
    if (!layoutReady || !isVisible) return;
    if (hasDispatchedRenderedRef.current) return;
    let cancelled = false;

    const waitForKvImagesRendered = async () => {
      const root = containerRef.current;
      if (!root) return;
      const images = Array.from(root.querySelectorAll("img"));
      await Promise.all(
        images.map(async (image) => {
          if (!image.complete) {
            await new Promise<void>((resolve) => {
              const done = () => resolve();
              image.addEventListener("load", done, { once: true });
              image.addEventListener("error", done, { once: true });
            });
          }
          if (typeof image.decode === "function") {
            try {
              await image.decode();
            } catch {
              // decode失敗時はload/error結果を優先し、処理は継続します。
            }
          }
        }),
      );
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (cancelled) return;
        markKvRendered();
      });
    };

    waitForKvImagesRendered();
    return () => {
      cancelled = true;
    };
  }, [isVisible, layoutReady, layout, markKvRendered]);

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
    // 変更理由: 閾値更新タイミングで現在スクロール位置を同期補正すると、
    // 早スクロール時に逆方向へ戻される見え方が発生するため、ここでも位置補正は行いません。
    // 表示上限の制御は progress のクランプのみで担保します。
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
        src: "/key-visual/te.webp",
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
        src: "/key-visual/te.webp",
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
  // 変更理由: 戻る遷移時は復元描画を最優先し、フェードの初期1フレームで発生するちらつきを抑えます。
  const sceneVisible = isReturningSession ? true : layoutReady && isVisible;
  const backgroundSrc =
    layout === "vertical"
      ? "/key-visual/back-vertical.webp"
      : "/key-visual/back-horizontal.webp";
  const isMobileMode = layout === "vertical";
  const kvComplete = kvEverCompleted || (finalRevealed && whiteFadeOpacity >= 1);
  const shouldUseMobileKvStaticImage =
    isMobileMode && kvComplete && isMobileKvStaticImageReady;

  useEffect(() => {
    // 変更理由: モバイルはアニメーション完了後に中央KVを1枚画像へ置き換える仕様のため、
    // 置換タイミングで白抜けしないよう、先行して `kv-sp.png` を非同期先読みします。
    if (!isMobileMode) {
      setIsMobileKvStaticImageReady(false);
      return;
    }
    let cancelled = false;
    const image = new Image();
    image.decoding = "async";
    const markReady = () => {
      if (cancelled) return;
      setIsMobileKvStaticImageReady(true);
    };
    image.onload = markReady;
    image.onerror = markReady;
    image.src = MOBILE_KV_STATIC_IMAGE_SRC;
    if (image.complete) {
      markReady();
    }
    return () => {
      cancelled = true;
    };
  }, [isMobileMode]);

  useEffect(() => {
    if (hasDispatchedCompleteRef.current) return;
    if (!finalRevealed || whiteFadeOpacity < 1) return;
    hasDispatchedCompleteRef.current = true;
    window.sessionStorage.setItem(KV_COMPLETED_STORAGE_KEY, "1");
    document.body.dataset.keyvisualComplete = "1";
    window.dispatchEvent(new Event("keyvisual:complete"));
  }, [finalRevealed, whiteFadeOpacity]);

  useEffect(() => {
    if (isReturningSession || restoredFromStorageRef.current) {
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
    // 変更理由: モバイルで補正を完全無効化すると、KV高さ縮小後にブラウザ側の自動クランプで
    // ページ最下部へ飛ぶケースがあるため、完了直後に明示的に「KV直後」へ位置合わせします。
    scrollAdjustedRef.current = true;
    const el = containerRef.current;
    if (!el) return;
    const kvBottom = el.offsetTop + el.offsetHeight;
    window.scrollTo(0, kvBottom + savedContentOffsetRef.current);
  }, [kvEverCompleted]);

  useEffect(() => {
    // 変更理由: 初回演出完了後はスクロール監視を停止したままにしつつ、
    // ウィンドウ幅変更（端末回転・レスポンシブ切替）時だけはKVの縦横レイアウトを正しく追従させるため、
    // 再訪モードでは最小限の resize 監視のみを許可します。
    if (!isReturningSession) return;
    const syncStaticLayoutByViewport = () => {
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
      setLayoutReady(true);
    };
    syncStaticLayoutByViewport();
    window.addEventListener("resize", syncStaticLayoutByViewport);
    return () => {
      window.removeEventListener("resize", syncStaticLayoutByViewport);
    };
  }, [isReturningSession]);

  return (
    <div ref={containerRef} style={{ height: kvEverCompleted ? "100vh" : `${scrollPages * 100}vh`, overflowAnchor: "none" as const }}>
      <section className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        {layout === "vertical" && (
          <div
            aria-hidden="true"
            className={`absolute inset-0 overflow-hidden ${
              isReturningSession ? "" : "transition-opacity duration-1000 ease-in"
            } ${
              sceneVisible ? "opacity-100" : "opacity-0"
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
          className={`absolute left-1/2 top-1/2 origin-center ${
            isReturningSession ? "" : "transition-opacity duration-1000 ease-in"
          } ${
            sceneVisible ? "opacity-100" : "opacity-0"
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
          {shouldUseMobileKvStaticImage ? (
            <img
              key={MOBILE_KV_STATIC_IMAGE_SRC}
              src={MOBILE_KV_STATIC_IMAGE_SRC}
              alt=""
              aria-hidden="true"
              width={base.w}
              height={base.h}
              decoding="async"
              loading="eager"
              draggable={false}
              // 変更理由: ユーザー要望に合わせ、モバイルKVの完了後は中央の複数レイヤー描画を停止し、
              // `kv-sp.png` 1枚へ置換してGPU負荷と描画揺れを抑えます。
              // 背景側の隙間埋め描画は上段レイヤーを残しているため、従来どおり維持されます。
              className="absolute left-0 top-0 block h-full w-full select-none"
            />
          ) : layers.map((l) => {
            const isColor = l.src.includes("-color");
            const isCenterText = l.src === "/key-visual/center-text.svg";
            const isCenterCircle = l.src === "/key-visual/center-circle.svg";
            const isTe = l.src === "/key-visual/te.webp";
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
                    key={isMobileMode ? "/key-visual/center-mobile.webp" : l.src}
                    src={isMobileMode ? "/key-visual/center-mobile.webp" : l.src}
                    alt=""
                    aria-hidden="true"
                    width={l.w}
                    height={l.h}
                    decoding="async"
                    // 変更理由: 再訪時はWebGLレンズ描画を省略し、静的画像で見た目を保ったままGPU負荷を下げます。
                    // 変更理由: クリティカル画像以外の eager/high を外し、同時フェッチ集中による帯域競合を抑えます。
                    // 変更理由: KV表示領域は常時ビューポート内のため eager で読み込み、
                    // 戻る遷移時のレイヤー遅延表示によるちらつきを抑えます。
                    loading="eager"
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
                    // 変更理由: カラーレイヤーも視覚上は初期から必要になるため eager に統一します。
                    loading="eager"
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
                // 変更理由: 主レイヤーは遅延読み込みのメリットが小さいため eager で表示欠けを防ぎます。
                loading="eager"
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
