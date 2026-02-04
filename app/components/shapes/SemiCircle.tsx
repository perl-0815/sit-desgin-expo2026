type Props = {
  x: number
  y: number
  r: number
  rotation?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  filter?: string
}

export default function SemiCircle({
  x,
  y,
  r,
  rotation = 0,
  fill = "none",
  stroke,
  strokeWidth,
  filter,
}: Props) {
  const cx = x + r
  const cy = y + r
  const d = `M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy} Z`

  return (
    <path
      d={d}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      transform={`rotate(${rotation} ${cx} ${cy})`}
      filter={filter}
    />
  )
}
