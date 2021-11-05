export default function createIntersectTestTileCircle(centerX: number, centerY: number, radius: number) {
  return function isIntersectTileCircle(cellX: number, cellY: number): boolean {
    const testEdgeX = centerX < cellX ? cellX : centerX > cellX + 1 ? cellX + 1 : centerX
    const testEdgeY = centerY < cellY ? cellY : centerY > cellY + 1 ? cellY + 1 : centerY
    const distanceFromCenter = Math.hypot(testEdgeX - centerX, testEdgeY - centerY)

    return distanceFromCenter < radius
  }
}
