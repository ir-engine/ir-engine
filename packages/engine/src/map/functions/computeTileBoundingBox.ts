import { BBox } from 'geojson'
import { TILE_ZOOM } from '../constants'
import { LongLat, tileXToLong, tileYToLat, toMetersFromCenter } from '../functions/UnitConversionFunctions'

const $array2 = Array(2)

export default function computeTileBoundingBox(
  x: number,
  y: number,
  center: LongLat,
  target: BBox = Array(4) as any
): BBox {
  toMetersFromCenter([tileXToLong(x, TILE_ZOOM), tileYToLat(y, TILE_ZOOM)], center, $array2)

  const [x1, y1] = $array2

  toMetersFromCenter([tileXToLong(x + 1, TILE_ZOOM), tileYToLat(y + 1, TILE_ZOOM)], center, $array2)

  const [x2, y2] = $array2

  target[0] = Math.min(x1, x2)
  target[1] = Math.min(y1, y2)
  target[2] = Math.max(x1, x2)
  target[3] = Math.max(y1, y2)
  return target
}
