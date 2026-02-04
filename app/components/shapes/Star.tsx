type Props = {
  cx: number
  cy: number
  outerR: number
  innerR: number
  points: number
  rotation?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
}

export default function Star({
  cx,
  cy,
  outerR,
  innerR,
  points: numPoints,
  rotation = -90,
  fill = "currentColor",
  stroke,
  strokeWidth,
}: Props) {
  const vertices = Array.from({ length: numPoints * 2 }, (_, i) => {
    const angle = ((Math.PI * i) / numPoints) + (rotation * Math.PI) / 180
    const r = i % 2 === 0 ? outerR : innerR
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(" ")

  return (
    <polygon
      points={vertices}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  )
}
