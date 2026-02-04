type Props = {
  cx: number
  cy: number
  r: number
  fill?: string
  stroke?: string
  strokeWidth?: number
}

export default function Circle({
  cx,
  cy,
  r,
  fill = "currentColor",
  stroke,
  strokeWidth,
}: Props) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  )
}
