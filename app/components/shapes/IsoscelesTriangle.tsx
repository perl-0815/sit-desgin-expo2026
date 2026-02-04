type Props = {
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  filter?: string
}

export default function IsoscelesTriangle({
  x,
  y,
  width,
  height,
  rotation = 0,
  fill = "none",
  stroke,
  strokeWidth,
  filter,
}: Props) {
  const hw = width / 2
  const hh = height / 2
  const cx = x + hw
  const cy = y + hh
  const points = `${cx},${cy - hh} ${cx + hw},${cy + hh} ${cx - hw},${cy + hh}`

  return (
    <polygon
      points={points}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      transform={rotation !== 0 ? `rotate(${rotation} ${cx} ${cy})` : undefined}
      filter={filter}
    />
  )
}
