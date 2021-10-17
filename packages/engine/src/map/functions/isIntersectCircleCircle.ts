import computeSquared from '../../../src/map/functions/computeSquaredDistanceFromCircle'

export default function isIntersectCircleCircle(
  centerPointA: [number, number],
  radiusA: number,
  centerPointB: [number, number],
  radiusB: number
): boolean {
  const distanceSquared = computeSquared(centerPointA, centerPointB, radiusB)
  return distanceSquared < radiusA * radiusA
}
