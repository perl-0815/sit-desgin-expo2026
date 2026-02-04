type Props = {
  cx: number
  cy: number
  r: number
  sides: number
  rotation?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
}

export default function Polygon({
  cx,
  cy,
  r,
  sides,
  rotation = -90,
  fill = "currentColor",
  stroke,
  strokeWidth,
}: Props) {
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
    />
  )
}
