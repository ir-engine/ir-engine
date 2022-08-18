import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { PreventBakeTagComponent } from '../../components/PreventBakeTagComponent'

export const SCENE_COMPONENT_PREVENT_BAKE = 'prevent-bake'
export const SCENE_COMPONENT_PREVENT_BAKE_DEFAULT_VALUES = {}

export const deserializePreventBake: ComponentDeserializeFunction = (entity: Entity, _: ComponentJson<{}>) => {
  addComponent(entity, PreventBakeTagComponent, true)
}

export const serializePreventBake: ComponentSerializeFunction = (entity) => {
  if (hasComponent(entity, PreventBakeTagComponent)) {
    return {
      name: SCENE_COMPONENT_PREVENT_BAKE,
      props: {}
    }
  }
}
