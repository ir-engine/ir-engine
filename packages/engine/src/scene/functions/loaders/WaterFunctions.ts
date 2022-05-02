import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { Water } from '../../classes/Water'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { UpdatableComponent } from '../../components/UpdatableComponent'
import { WaterComponent, WaterComponentType } from '../../components/WaterComponent'

export const SCENE_COMPONENT_WATER = 'water'
export const SCENE_COMPONENT_WATER_DEFAULT_VALUES = {}

export const deserializeWater: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<WaterComponentType>
) => {
  if (!isClient) return

  const obj3d = new Water()
  obj3d.userData.disableOutline = true

  addComponent(entity, Object3DComponent, { value: obj3d })
  addComponent(entity, WaterComponent, { ...json.props })
  addComponent(entity, UpdatableComponent, {})

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_WATER)

  updateWater(entity, json.props)
}

export const updateWater: ComponentUpdateFunction = (_entity: Entity, _properties: WaterComponentType) => {}

export const serializeWater: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, WaterComponent) as WaterComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_WATER,
    props: {}
  }
}
