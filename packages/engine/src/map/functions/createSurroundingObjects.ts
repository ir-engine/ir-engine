import { LongLat } from '../functions/UnitConversionFunctions'
import createSurroundingTileIterator from './createSurroundingTileIterator'
import fetchVectorTileUsingCache from './fetchVectorTile'
import createObjectsFromVectorTile from './createObjectsFromVectorTile'
import { MapDerivedFeatureComplete } from '../types'
import TileCache from '../classes/TileCache'

const tileCache = new TileCache(24)

export default async function createSurroundingObjects(
  output: Map<string, MapDerivedFeatureComplete>,
  center: LongLat,
  minimumSceneRadius: number,
  tileZoom: number
) {
  const promises = []
  const tileCoords = []
  for (const tileCoord of createSurroundingTileIterator(center, minimumSceneRadius, tileZoom)) {
    const [x, y] = tileCoord
    const cachedTile = tileCache.get(x, y)
    if (!cachedTile) {
      promises.push(fetchVectorTileUsingCache(tileCache, x, y))
    }

    tileCoords.push(tileCoord)
  }

  await Promise.all(promises)
  for (const [x, y] of tileCoords) {
    const tile = tileCache.get(x, y)
    const objects = createObjectsFromVectorTile(tile, x, y, tileZoom, center)
    for await (const object of objects) {
      output.set(object.uuid, object)
    }
  }
  tileCache.evictLeastRecentlyUsedItems()
}
