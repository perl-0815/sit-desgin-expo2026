type Props = {
  x: number
  y: number
  r: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  filter?: string
}

export default function Circle({
  x,
  y,
  r,
  fill = "none",
  stroke,
  strokeWidth,
  filter,
}: Props) {
  return (
    <circle
      cx={x + r}
      cy={y + r}
      r={r}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      filter={filter}
    />
  )
}
