import AsyncTask from './AsyncTask'
import { VectorTile } from '../types'
import TileCache from './TileCache'
import FeatureCache from './FeatureCache'
import { Feature } from 'geojson'
import { fetchVectorTileUsingCache } from '../functions/fetchVectorTile'

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
    return fetchVectorTileUsingCache(this.tileCache, this.x, this.y)
  }
}
