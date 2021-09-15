import { Feature } from 'geojson'
import { FeatureKey, MapDerivedFeatureGeometry } from '../types'
import { LongLat } from '../units'
import ArrayKeyedMap from './ArrayKeyedMap'
import AsyncPhase from './AsyncPhase'
import CreateGeometryTask from './CreateGeometryTask'
import FeatureCache from './FeatureCache'

export default class CreateGeometryPhase extends AsyncPhase<CreateGeometryTask, FeatureKey, MapDerivedFeatureGeometry> {
  isAsyncPhase = true
  taskMap = new ArrayKeyedMap<FeatureKey, CreateGeometryTask>()
  center: LongLat
  minimumSceneRadius: number
  featureCache: FeatureCache<Feature>
  cache: FeatureCache<MapDerivedFeatureGeometry>

  constructor(
    featureCache: FeatureCache<Feature>,
    geometryCache: FeatureCache<MapDerivedFeatureGeometry>,
    center: LongLat
  ) {
    super()
    this.featureCache = featureCache
    this.cache = geometryCache
    this.center = center
  }

  getTaskKeys() {
    return this.featureCache.keys()
  }

  createTask(layerName: string, x: number, y: number, tileIndex: string) {
    return new CreateGeometryTask(this.featureCache, this.cache, layerName, x, y, tileIndex, this.center)
  }
}
