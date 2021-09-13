import { VectorTile } from '@mapbox/vector-tile'
import { Config } from '@xrengine/common/src/config'
import TileCache from '../classes/TileCache'
import { TILE_ZOOM } from '../constants'
import { vectors } from '../vectors'
import getMapboxUrl from './getMapboxUrl'

// TODO move the caching logic to a decorator?

async function fetchVectorTile(x: number, y: number): Promise<VectorTile> {
  const url = getMapboxUrl(
    'mapbox.mapbox-streets-v8',
    x,
    y,
    TILE_ZOOM,
    'vector.pbf',
    Config.publicRuntimeConfig.MAPBOX_API_KEY
  )
  const response = await fetch(url)
  const blob = await response.blob()
  return new Promise((resolve) => {
    vectors(blob, (tile: VectorTile) => {
      resolve(tile)
    })
  })
}

export default async function fetchVectorTileUsingCache(
  tileCache: TileCache<VectorTile>,
  x: number,
  y: number
): Promise<VectorTile> {
  const cachedTile = tileCache.get(x, y)
  let tile: VectorTile
  if (cachedTile) {
    tile = cachedTile
  } else {
    tile = await fetchVectorTile(x, y)

    tileCache.set(x, y, tile)
  }
  return tile
}
