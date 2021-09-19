import { Feature } from 'geojson'
import { FeatureKey, ILayerName } from '../types'
import FeatureCache from './FeatureCache'
import CachingPhase from './CachingPhase'
import ArrayKeyedMap from './ArrayKeyedMap'
import CreateLabelTask from './CreateLabelTask'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { LongLat } from '../units'

const ALLOWED_GEOMETRIES: Feature['geometry']['type'][] = ['LineString']

export default class CreateLabelPhase extends CachingPhase<CreateLabelTask, FeatureKey, Entity> {
  world: World
  taskMap: ArrayKeyedMap<FeatureKey, CreateLabelTask>
  featureCache: FeatureCache<Feature>
  cache: FeatureCache<Entity>
  originalCenter: LongLat

  constructor(
    world: World,
    taskMap: ArrayKeyedMap<FeatureKey, CreateLabelTask>,
    labelCache: FeatureCache<Entity>,
    featureCache: FeatureCache<Feature>,
    originalCenter: LongLat
  ) {
    super()
    this.world = world
    this.taskMap = taskMap
    this.featureCache = featureCache
    this.cache = labelCache
    this.originalCenter = originalCenter
  }

  *getTaskKeys() {
    let count = 0
    for (const key of this.featureCache.keys()) {
      const feature = this.featureCache.get(key)
      if (key[0] === 'road' && ALLOWED_GEOMETRIES.includes(feature.geometry.type) && feature.properties.name) {
        yield key
      }

      // TODO somehow this generator never seems to finish, who needs more than 1000 labels anyway?
      if (count > 1000) return
      count++
    }
  }

  createTask(layerName: ILayerName, x: number, y: number, tileIndex: string) {
    return new CreateLabelTask(
      this.world,
      this.featureCache,
      this.cache,
      layerName,
      x,
      y,
      tileIndex,
      this.originalCenter
    )
  }
}
