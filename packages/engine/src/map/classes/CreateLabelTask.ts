import { Feature, LineString } from 'geojson'
import Task from './Task'
import { FeatureKey, ILayerName } from '../types'
import FeatureCache from './FeatureCache'
import createUsingCache from '../functions/createUsingCache'
import { Entity } from '../../ecs/classes/Entity'
import createFeatureLabel from '../functions/createFeatureLabel'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { UpdatableComponent } from '../../scene/components/UpdatableComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { World } from '../../ecs/classes/World'
import MapFeatureLabelComponent from '../MapFeatureLabelComponent'
import { LongLat } from '../units'

export default class CreateLabelTask extends Task<Entity> {
  world: World
  featureCache: FeatureCache<Feature>
  labelCache: FeatureCache<Entity>
  layerName: ILayerName
  x: number
  y: number
  tileIndex: string
  originalCenter: LongLat
  constructor(
    world: World,
    featureCache: FeatureCache<Feature>,
    labelCache: FeatureCache<Entity>,
    layerName: ILayerName,
    x: number,
    y: number,
    tileIndex: string,
    originalCenter: LongLat
  ) {
    super()
    this.world = world
    this.featureCache = featureCache
    this.labelCache = labelCache
    this.layerName = layerName
    this.x = x
    this.y = y
    this.tileIndex = tileIndex
    this.originalCenter = originalCenter
  }

  createUsingCache = createUsingCache((...key: FeatureKey) => {
    const feature = this.featureCache.get(key)
    const componentValue = createFeatureLabel(feature as Feature<LineString>, this.originalCenter)
    const entity = createEntity()
    addComponent(entity, MapFeatureLabelComponent, { value: componentValue }, this.world)
    addComponent(entity, UpdatableComponent, null, this.world)
    return entity
  })

  exec() {
    const key: FeatureKey = [this.layerName, this.x, this.y, this.tileIndex]
    return this.createUsingCache(this.labelCache, key)
  }
}
