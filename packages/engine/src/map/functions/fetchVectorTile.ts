import TileKey from '../classes/TileKey'
import { TILE_ZOOM } from '../constants'
import { VectorTile } from '../types'
import { vectors } from '../vectors'
import getMapboxUrl from './getMapboxUrl'

export default async function fetchVectorTile(_: any, key: TileKey): Promise<VectorTile> {
  const [x, y] = key
  const url = getMapboxUrl(
    'mapbox.mapbox-streets-v8',
    x,
    y,
    TILE_ZOOM,
    'vector.pbf',
    globalThis.process.env['VITE_MAPBOX_API_KEY'] || ''
  )
  const response = await fetch(url)
  const blob = await response.blob()
  return new Promise((resolve) => {
    vectors(blob, (tile: VectorTile) => {
      resolve(tile)
    })
  })
}
