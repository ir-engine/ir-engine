export default function computeSquaredDistanceFromCircle(
  point: [number, number],
  circleCenter: [number, number],
  circleRadius: number
) {
  const xDiff = point[0] - circleCenter[0]
  const yDiff = point[1] - circleCenter[1]

  return xDiff * xDiff + yDiff * yDiff - circleRadius * circleRadius
}
