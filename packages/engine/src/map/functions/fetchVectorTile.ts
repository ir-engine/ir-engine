import { Config } from '@xrengine/common/src/config'
import { TILE_ZOOM } from '../constants'
import { VectorTile } from '../types'
import { vectors } from '../vectors'
import getMapboxUrl from './getMapboxUrl'

export default async function fetchVectorTile(x: number, y: number): Promise<VectorTile> {
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
