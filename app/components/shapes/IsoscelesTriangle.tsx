type Props = {
  cx: number
  cy: number
  width: number
  height: number
  rotation?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
}

export default function IsoscelesTriangle({
  cx,
  cy,
  width,
  height,
  rotation = 0,
  fill = "currentColor",
  stroke,
  strokeWidth,
}: Props) {
  const hw = width / 2
  const hh = height / 2
  const points = `${cx},${cy - hh} ${cx + hw},${cy + hh} ${cx - hw},${cy + hh}`

  return (
    <polygon
      points={points}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      transform={rotation !== 0 ? `rotate(${rotation} ${cx} ${cy})` : undefined}
    />
  )
}
