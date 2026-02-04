type Props = {
  cx: number
  cy: number
  r: number
  rotation?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
}

export default function SemiCircle({
  cx,
  cy,
  r,
  rotation = 0,
  fill = "currentColor",
  stroke,
  strokeWidth,
}: Props) {
  const d = `M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy} Z`

  return (
    <path
      d={d}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      transform={`rotate(${rotation} ${cx} ${cy})`}
    />
  )
}
