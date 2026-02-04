type Props = {
  children: React.ReactNode
  viewBox?: string
  className?: string
}

export default function SvgCanvas({
  children,
  viewBox = "0 0 1280 720",
  className = "",
}: Props) {
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      className={`absolute inset-0 -z-10 h-full w-full ${className}`}
      fill="none"
      stroke="#000"
      strokeWidth={2}
      filter="url(#brush)"
    >
      <defs>
        <filter id="brush">
          <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      {children}
    </svg>
  )
}