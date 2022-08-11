import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import {
  SceneDynamicLoadTagComponent,
  SceneDynamicLoadTagComponentType
} from '../../components/SceneDynamicLoadTagComponent'

export const SCENE_COMPONENT_DYNAMIC_LOAD = 'dynamic-load'
export const SCENE_COMPONENT_DYNAMIC_LOAD_DEFAULT_VALUES = {
  distance: 20
}

export const deserializeDynamicLoad: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<SceneDynamicLoadTagComponentType>
) => {
  const props = parseDynamicLoadProperties(json.props)
  addComponent(entity, SceneDynamicLoadTagComponent, props)
  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_DYNAMIC_LOAD)
}

export const serializeDynamicLoad: ComponentSerializeFunction = (entity) => {
  const dynamicLoad = getComponent(entity, SceneDynamicLoadTagComponent)
  return {
    name: SCENE_COMPONENT_DYNAMIC_LOAD,
    props: {
      distance: dynamicLoad.distance
    }
  }
}

export const parseDynamicLoadProperties = (
  props: SceneDynamicLoadTagComponentType
): SceneDynamicLoadTagComponentType => {
  return {
    distance: props.distance ?? SCENE_COMPONENT_DYNAMIC_LOAD_DEFAULT_VALUES.distance
  }
}
