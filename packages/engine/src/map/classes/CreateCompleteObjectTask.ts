import { Feature } from 'geojson'
import Task from './Task'
import { FeatureKey, MapDerivedFeatureComplete, MapDerivedFeatureGeometry } from '../types'
import FeatureCache from './FeatureCache'
import { createCompleteObjectsUsingCache as createCompleteObjectUsingCache } from '../functions/createCompleteObjects'

export default class CreateCompleteObjectTask extends Task<MapDerivedFeatureComplete> {
  featureCache: FeatureCache<Feature>
  geometryCache: FeatureCache<MapDerivedFeatureGeometry>
  completeObjectsCache: FeatureCache<MapDerivedFeatureComplete>
  layerName: string
  x: number
  y: number
  tileIndex: string
  constructor(
    featureCache: FeatureCache<Feature>,
    geometryCache: FeatureCache<MapDerivedFeatureGeometry>,
    completeObjectsCache: FeatureCache<MapDerivedFeatureComplete>,
    layerName: string,
    x: number,
    y: number,
    tileIndex: string
  ) {
    super()
    this.featureCache = featureCache
    this.geometryCache = geometryCache
    this.completeObjectsCache = completeObjectsCache
    this.layerName = layerName
    this.x = x
    this.y = y
    this.tileIndex = tileIndex
  }
  exec() {
    const key: FeatureKey = [this.layerName, this.x, this.y, this.tileIndex]
    const feature = this.featureCache.get(key)
    const geometry = this.geometryCache.get(key)
    return createCompleteObjectUsingCache(
      this.completeObjectsCache,
      this.layerName,
      this.x,
      this.y,
      this.tileIndex,
      geometry,
      feature
    )
  }
}
