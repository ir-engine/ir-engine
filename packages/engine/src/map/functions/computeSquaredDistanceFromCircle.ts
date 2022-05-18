export default function computeDistanceFromCircle(
  point: [number, number],
  circleCenter: [number, number],
  circleRadius: number
) {
  return Math.hypot(point[0] - circleCenter[0], point[1] - circleCenter[1]) - circleRadius
}
