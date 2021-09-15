import { Feature } from 'geojson'
import AsyncTask from './AsyncTask'
import FeatureCache from './FeatureCache'
import { FeatureKey, ILayerName, MapDerivedFeatureGeometry } from '../types'
import { LongLat } from '../units'
import createGeometry from '../functions/createGeometry'
import fetchUsingCache from '../functions/fetchUsingCache'

export default class CreateGeometryTask extends AsyncTask<MapDerivedFeatureGeometry> {
  featureCache: FeatureCache<Feature>
  geometryCache: FeatureCache<MapDerivedFeatureGeometry>
  layerName: ILayerName
  x: number
  y: number
  tileIndex: string
  center: LongLat
  constructor(
    featureCache: FeatureCache<Feature>,
    geometryCache: FeatureCache<MapDerivedFeatureGeometry>,
    layerName: ILayerName,
    x: number,
    y: number,
    tileIndex: string,
    center: LongLat
  ) {
    super()
    this.featureCache = featureCache
    this.geometryCache = geometryCache
    this.layerName = layerName
    this.x = x
    this.y = y
    this.tileIndex = tileIndex
    this.center = center
  }

  /** using fetchUsingCache since createGeometry returns a promise */
  createGeometryUsingCache = fetchUsingCache((...key: FeatureKey) => {
    const feature = this.featureCache.get(key)
    return createGeometry(this.geometryCache.map.getKey(key), this.layerName, feature, this.center)
  })

  start() {
    return this.createGeometryUsingCache(this.geometryCache, [this.layerName, this.x, this.y, this.tileIndex])
  }
}
