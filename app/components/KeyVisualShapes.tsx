import { Circle, Polygon, Star } from "./shapes"

export default function KeyVisualShapes() {
  return (
    <>
      <Circle x={100} y={100} r={60} />
      <Polygon x={300} y={150} r={60} sides={6} />
      <Star x={500} y={100} outerR={70} innerR={35} points={5} />
    </>
  )
}
