import { useId } from "react"

type GradientStop = {
  offset: number
  color: string
  opacity?: number
}

type Props = {
  children: React.ReactNode
  gradient?: {
    type: "linear" | "radial"
    stops: GradientStop[]
    angle?: number
  }
}

export default function Group({ children, gradient }: Props) {
  const id = useId()
  const gradientId = `group-gradient-${id}`

  return (
    <g fill={gradient ? `url(#${gradientId})` : undefined}>
      {gradient && (
        <defs>
          {gradient.type === "linear" ? (
            <linearGradient
              id={gradientId}
              gradientTransform={`rotate(${gradient.angle ?? 0})`}
            >
              {gradient.stops.map((stop, i) => (
                <stop
                  key={i}
                  offset={`${stop.offset * 100}%`}
                  stopColor={stop.color}
                  stopOpacity={stop.opacity}
                />
              ))}
            </linearGradient>
          ) : (
            <radialGradient id={gradientId}>
              {gradient.stops.map((stop, i) => (
                <stop
                  key={i}
                  offset={`${stop.offset * 100}%`}
                  stopColor={stop.color}
                  stopOpacity={stop.opacity}
                />
              ))}
            </radialGradient>
          )}
        </defs>
      )}
      {children}
    </g>
  )
}
