import AsyncTask from './AsyncTask'
import { TileKey, VectorTile } from '../types'
import TileCache from './TileCache'
import fetchVectorTile from '../functions/fetchVectorTile'
import fetchUsingCache from '../functions/fetchUsingCache'

export const fetchVectorTileUsingCache = fetchUsingCache<TileKey, VectorTile>(fetchVectorTile)

export default class FetchTileTask extends AsyncTask<VectorTile> {
  tileCache: TileCache<VectorTile>
  x: number
  y: number
  constructor(tileCache: TileCache<VectorTile>, x: number, y: number) {
    super()
    this.tileCache = tileCache
    this.x = x
    this.y = y
  }
  start() {
    return fetchVectorTileUsingCache(this.tileCache, [this.x, this.y])
  }
}
