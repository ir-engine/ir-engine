import { Feature } from 'geojson'
import AsyncTask from './AsyncTask'
import FeatureCache from './FeatureCache'
import { MapDerivedFeatureGeometry } from '../types'
import { LongLat } from '../units'
import { createGeometryUsingCache } from '../functions/createGeometry'

export default class CreateGeometryTask extends AsyncTask<MapDerivedFeatureGeometry> {
  featureCache: FeatureCache<Feature>
  geometryCache: FeatureCache<MapDerivedFeatureGeometry>
  layerName: string
  x: number
  y: number
  tileIndex: string
  center: LongLat
  constructor(
    featureCache: FeatureCache<Feature>,
    geometryCache: FeatureCache<MapDerivedFeatureGeometry>,
    layerName: string,
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
  start() {
    const feature = this.featureCache.get([this.layerName, this.x, this.y, this.tileIndex])
    return createGeometryUsingCache(
      this.geometryCache,
      this.layerName,
      this.x,
      this.y,
      this.tileIndex,
      feature,
      this.center
    )
  }
}
