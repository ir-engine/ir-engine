import { TileKey } from '../types'
import AsyncPhase from './AsyncPhase'
import FetchTileTask from './FetchTileTask'
import { VectorTile } from '../types'
import { LongLat } from '../units'
import TileCache from './TileCache'
import createSurroundingTileIterator from '../functions/createSurroundingTileIterator'
import { TILE_ZOOM } from '../constants'
import ArrayKeyedMap from './ArrayKeyedMap'

export default class FetchTilesPhase extends AsyncPhase<FetchTileTask, TileKey, VectorTile> {
  taskMap: ArrayKeyedMap<TileKey, FetchTileTask>
  center: LongLat
  minimumSceneRadius: number
  cache: TileCache<VectorTile>

  constructor(
    taskMap: ArrayKeyedMap<TileKey, FetchTileTask>,
    tileCache: TileCache<VectorTile>,
    center: LongLat,
    minimumSceneRadius: number
  ) {
    super()
    this.taskMap = taskMap
    this.cache = tileCache
    this.center = center
    this.minimumSceneRadius = minimumSceneRadius
  }

  getTaskKeys() {
    return createSurroundingTileIterator(this.center, this.minimumSceneRadius, TILE_ZOOM)
  }

  createTask(x: number, y: number) {
    return new FetchTileTask(this.cache, x, y)
  }

  cleanupCacheItem() {}
}
