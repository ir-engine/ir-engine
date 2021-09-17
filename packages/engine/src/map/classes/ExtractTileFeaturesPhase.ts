import { Feature } from 'geojson'
import { TileKey, VectorTile } from '../types'
import ArrayKeyedMap from './ArrayKeyedMap'
import CachingPhase from './CachingPhase'
import ExtractTileFeaturesTask from './ExtractTileFeaturesTask'
import FeatureCache from './FeatureCache'
import TileCache from './TileCache'

/** This one's a bit of an odd duck since it's taking items (tiles) from one cache, then converting each item into multiple items (features) that get put in to a different cache. Yet we still want to avoid re-doing the conversion for tiles we've already seen, hence breaking the mold of the CachingPhase a bit.
 */
export default class ExtractTileFeaturesPhase extends CachingPhase<ExtractTileFeaturesTask, TileKey, void> {
  taskMap: ArrayKeyedMap<TileKey, ExtractTileFeaturesTask>
  tileCache: TileCache<VectorTile>
  /* @ts-ignore:next-line */
  cache: FeatureCache<Feature>

  constructor(
    taskMap: ArrayKeyedMap<TileKey, ExtractTileFeaturesTask>,
    tileCache: TileCache<VectorTile>,
    featureCache: FeatureCache<Feature>
  ) {
    super()
    this.taskMap = taskMap
    this.tileCache = tileCache
    this.cache = featureCache
  }

  getTaskKeys() {
    return this.tileCache.keys()
  }

  createTask(x: number, y: number) {
    return new ExtractTileFeaturesTask(this.tileCache, this.cache, x, y)
  }

  cleanup() {
    this.cache.evictLeastRecentlyUsedItems()
  }
}
