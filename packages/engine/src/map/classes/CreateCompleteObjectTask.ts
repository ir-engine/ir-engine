import { Feature } from 'geojson'
import Task from './Task'
import { FeatureKey, ILayerName, MapDerivedFeatureComplete, MapDerivedFeatureGeometry } from '../types'
import FeatureCache from './FeatureCache'
import createCompleteObject from '../functions/createCompleteObject'
import createUsingCache from '../functions/createUsingCache'

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

  createCompleteObjectUsingCache = createUsingCache((...key: FeatureKey) => {
    const [layerName] = key

    const feature = this.featureCache.get(key)
    const geometry = this.geometryCache.get(key)
    return createCompleteObject(layerName as ILayerName, geometry, feature)
  })

  exec() {
    const key: FeatureKey = [this.layerName, this.x, this.y, this.tileIndex]
    return this.createCompleteObjectUsingCache(this.completeObjectsCache, key)
  }
}
