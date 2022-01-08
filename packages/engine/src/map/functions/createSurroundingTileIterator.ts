import TileKey from '../classes/TileKey'
import {
  LongLat,
  fromMetersFromCenter,
  latToTileYFraction,
  longToTileXFraction
} from '../functions/UnitConversionFunctions'
import createIntersectTestTileCircle from './createIntersectionTestTileCircle'

export default function* createSurroundingTileIterator(
  center: LongLat,
  minimumSceneRadius: number,
  zoomLevel: number
): Generator<TileKey> {
  const [startLong, startLat] = fromMetersFromCenter([-minimumSceneRadius, -minimumSceneRadius], center)
  const [endLong, endLat] = fromMetersFromCenter([minimumSceneRadius, minimumSceneRadius], center)

  const centerX = longToTileXFraction(center[0], zoomLevel)
  const centerY = latToTileYFraction(center[1], zoomLevel)

  const startTileFractionX = longToTileXFraction(startLong, zoomLevel)
  const endTileFractionX = longToTileXFraction(endLong, zoomLevel)
  const startTileFractionY = latToTileYFraction(startLat, zoomLevel)
  const endTileFractionY = latToTileYFraction(endLat, zoomLevel)

  const startTileX = Math.floor(startTileFractionX)
  const endTileX = Math.floor(endTileFractionX)
  const startTileY = Math.floor(startTileFractionY)
  const endTileY = Math.floor(endTileFractionY)

  const radiusTiles = (endTileFractionX - startTileFractionX) / 2
  const isIntersectTileCircle = createIntersectTestTileCircle(centerX, centerY, radiusTiles)

  for (let tileY = startTileY; tileY <= endTileY; tileY++) {
    for (let tileX = startTileX; tileX <= endTileX; tileX++) {
      if (isIntersectTileCircle(tileX, tileY)) {
        yield new TileKey(tileX, tileY)
      }
    }
  }
}
