import { Feature } from 'geojson'
import { FeatureKey, TileKey, VectorTile } from '../types'
import CachingPhase from './CachingPhase'
import ConvertTileToFeaturesTask from './ConvertTileToFeaturesTask'
import FeatureCache from './FeatureCache'
import TileCache from './TileCache'

/** This one's a bit of an odd duck since it's taking items (tiles) from one cache, then converting each item into multiple items (features) that get put in to a different cache. Yet we still want to avoid re-doing the conversion for tiles we've already seen, so breaking the mold of the CachingPhase a bit.
 */
export default class ConvertTilesToFeaturesPhase extends CachingPhase<ConvertTileToFeaturesTask, TileKey, void> {
  tileCache: TileCache<VectorTile>
  /* @ts-ignore:next-line */
  cache: FeatureCache<Feature>

  constructor(tileCache: TileCache<VectorTile>, featureCache: FeatureCache<Feature>) {
    super()
    this.tileCache = tileCache
    this.cache = featureCache
  }

  getTaskKeys() {
    return this.tileCache.keys()
  }

  createTask(x: number, y: number) {
    return new ConvertTileToFeaturesTask(this.tileCache, this.cache, x, y)
  }

  cleanup() {
    this.cache.evictLeastRecentlyUsedItems()
  }
}
