"use client"

import { useEffect, type DependencyList } from "react"

// ページ内セクションをスクロール表示でフェード/スライドインさせる共通フックです。
// JS無効時は通常表示されるよう、bodyへ準備クラスを付与してから初期状態を適用します。
export default function useSectionReveal(deps: DependencyList = []) {
  // 描画対象が後から差し替わるページでも再観測できるよう、依存配列を受け取ります。
  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    )
    if (targets.length === 0) {
      return
    }

    const readyClass = "page-reveal-ready"
    document.body.classList.add(readyClass)

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return
          }
          entry.target.classList.add("is-visible")
          currentObserver.unobserve(entry.target)
        })
      },
      {
        root: null,
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px",
      },
    )

    // 初期表示時に即座にis-visibleを付与するとトランジションが発火しないため、
    // 1フレーム待ってから状態を切り替えます。
    const revealInNextFrame = () => {
      targets.forEach((target) => {
        const rect = target.getBoundingClientRect()
        const isInView = rect.top < window.innerHeight * 0.9
        if (isInView) {
          target.classList.add("is-visible")
          return
        }
        observer.observe(target)
      })
    }
    const rafId = window.requestAnimationFrame(revealInNextFrame)

    return () => {
      window.cancelAnimationFrame(rafId)
      observer.disconnect()
      document.body.classList.remove(readyClass)
    }
  }, deps)
}
