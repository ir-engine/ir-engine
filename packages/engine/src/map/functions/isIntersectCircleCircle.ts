import computeDistanceFromCircle from '../../../src/map/functions/computeDistanceFromCircle'

export default function isIntersectCircleCircle(
  centerPointA: [number, number],
  radiusA: number,
  centerPointB: [number, number],
  radiusB: number
): boolean {
  const distance = computeDistanceFromCircle(centerPointA, centerPointB, radiusB)
  return distance < radiusA
}
