type Props = {
  x: number
  y: number
  r: number
  sides: number
  rotation?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  filter?: string
}

export default function Polygon({
  x,
  y,
  r,
  sides,
  rotation = -90,
  fill = "none",
  stroke,
  strokeWidth,
  filter,
}: Props) {
  const cx = x + r
  const cy = y + r
  const points = Array.from({ length: sides }, (_, i) => {
    const angle = ((2 * Math.PI * i) / sides) + (rotation * Math.PI) / 180
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(" ")

  return (
    <polygon
      points={points}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      filter={filter}
    />
  )
}
