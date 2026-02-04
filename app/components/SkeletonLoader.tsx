"use client"

import React, { useState } from "react"

interface SkeletonLoaderProps {
  src?: string
  alt?: string
  className?: string
  reloadKey?: number
  type?: "image" | "text"
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void
  fallback?: React.ReactNode
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = (props) => {
  const { reloadKey = 0, src } = props
  const resetKey = `${reloadKey}-${src ?? "no-src"}`
  // 状態初期化のために key で再マウントし、useEffect の setState を避けます。
  return <SkeletonLoaderInner key={resetKey} {...props} />
}

const SkeletonLoaderInner: React.FC<SkeletonLoaderProps> = ({
  src,
  alt = "",
  className = "",
  reloadKey = 0,
  type = "image",
  onError,
  fallback = null,
}) => {
  const [isAnimating, setIsAnimating] = useState(!!src)
  const [contentVisible, setContentVisible] = useState(false)
  const [hasError, setHasError] = useState(false)

  // 自然で落ち着いたトーンの色設定
  const bgColor = type === "text" ? "bg-[#f0f2f3]" : "bg-[#f0f2f3]"
  const shimmerColor = "via-white/30" // 抑えめの輝き

  const handleLoad = () => {
    // 画像読み込み完了後にフェードインさせます。
    setContentVisible(true)
    setTimeout(() => setIsAnimating(false), 200)
  }

  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const alreadyTriedFallback =
      event.currentTarget.dataset.fallbackApplied === "true"
    // フォールバック読み込みのため一度ローディングへ戻します。
    if (onError && !alreadyTriedFallback) {
      setIsAnimating(true)
      onError(event)
      return
    }
    setHasError(true)
    setIsAnimating(false)
    setContentVisible(false)
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading Skeleton Overlay */}
      {isAnimating ? (
        <div
          key={`skeleton-layer-${reloadKey}`}
          className={`absolute inset-0 z-20 ${bgColor}`}
        >
          {/* 斜めのシマーエフェクト (落ち着いた速度と輝き) */}
          <div
            className={`absolute inset-0 skeleton-shimmer bg-linear-to-r from-transparent ${shimmerColor} to-transparent`}
          />
        </div>
      ) : null}

      {/* Content Rendering */}
      <div
        className={`h-full w-full transition-opacity duration-500 ${
          contentVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {type === "image" && src && !hasError ? (
          // 外部URLが環境依存のため、next/image ではなく <img> を使用します。
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className="w-full h-full object-cover"
          />
        ) : null}
        {hasError && fallback ? fallback : null}
      </div>
    </div>
  )
}
