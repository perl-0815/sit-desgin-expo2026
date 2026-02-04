type Props = {
  x: number
  y: number
  outerR: number
  innerR: number
  points: number
  rotation?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  filter?: string
}

export default function Star({
  x,
  y,
  outerR,
  innerR,
  points: numPoints,
  rotation = -90,
  fill = "none",
  stroke,
  strokeWidth,
  filter,
}: Props) {
  const cx = x + outerR
  const cy = y + outerR
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
      filter={filter}
    />
  )
}
