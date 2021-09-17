import { Feature } from 'geojson'
import computeDistanceFromCircle from '../functions/computeDistanceFromCircle'
import { FeatureKey, MapDerivedFeatureComplete, MapDerivedFeatureGeometry } from '../types'
import CreateCompleteObjectTask from './CreateCompleteObjectTask'
import FeatureCache from './FeatureCache'
import { Vector3 } from 'three'
import CachingPhase from './CachingPhase'
import { vector3ToArray2 } from '../util'
import ArrayKeyedMap from './ArrayKeyedMap'

export default class CreateCompleteObjectPhase extends CachingPhase<
  CreateCompleteObjectTask,
  FeatureKey,
  MapDerivedFeatureComplete
> {
  taskMap: ArrayKeyedMap<FeatureKey, CreateCompleteObjectTask>
  featureCache: FeatureCache<Feature>
  geometryCache: FeatureCache<MapDerivedFeatureGeometry>
  cache: FeatureCache<MapDerivedFeatureComplete>
  viewerPosition: Vector3
  minimumSceneRadius: number

  constructor(
    taskMap: ArrayKeyedMap<FeatureKey, CreateCompleteObjectTask>,
    featureCache: FeatureCache<Feature>,
    geometryCache: FeatureCache<MapDerivedFeatureGeometry>,
    completeObjectsCache: FeatureCache<MapDerivedFeatureComplete>,
    viewerPosition: Vector3,
    minimumSceneRadius: number
  ) {
    super()
    this.taskMap = taskMap
    this.featureCache = featureCache
    this.geometryCache = geometryCache
    this.cache = completeObjectsCache
    this.viewerPosition = viewerPosition
    this.minimumSceneRadius = minimumSceneRadius
  }

  *getTaskKeys() {
    for (const key of this.featureCache.keys()) {
      const geometry = this.geometryCache.get(key)
      // TODO create separate worker for centerPoint and boundingCircleRadius? that way we could do this check in an earlier phase
      if (
        geometry &&
        computeDistanceFromCircle(
          vector3ToArray2(this.viewerPosition),
          geometry.centerPoint,
          geometry.boundingCircleRadius
        ) < this.minimumSceneRadius
      ) {
        yield key
      }
    }
  }

  createTask(layerName: string, x: number, y: number, tileIndex: string) {
    return new CreateCompleteObjectTask(this.featureCache, this.geometryCache, this.cache, layerName, x, y, tileIndex)
  }
}
