import { BBox } from 'geojson'
import { TILE_ZOOM } from '../constants'
import { LongLat, tileXToLong, tileYToLat, toMetersFromCenter } from '../units'

const $array2 = Array(2)

export default function computeTileBoundingBox(
  x: number,
  y: number,
  center: LongLat,
  target: BBox = Array(4) as any
): BBox {
  toMetersFromCenter([tileXToLong(x, TILE_ZOOM), tileYToLat(y, TILE_ZOOM)], center, $array2)

  target[0] = $array2[0]
  target[1] = $array2[1]

  toMetersFromCenter([tileXToLong(x + 1, TILE_ZOOM), tileYToLat(y + 1, TILE_ZOOM)], center, $array2)

  target[2] = $array2[0]
  target[3] = $array2[1]

  return target
}
