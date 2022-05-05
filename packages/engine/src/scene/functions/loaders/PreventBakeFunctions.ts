import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { PreventBakeTagComponent } from '../../components/PreventBakeTagComponent'

export const SCENE_COMPONENT_PREVENT_BAKE = 'prevent-bake'
export const SCENE_COMPONENT_PREVENT_BAKE_DEFAULT_VALUES = {}

export const deserializePreventBake: ComponentDeserializeFunction = (entity: Entity, _: ComponentJson<{}>) => {
  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_PREVENT_BAKE)
  addComponent(entity, PreventBakeTagComponent, {})
}

export const serializePreventBake: ComponentSerializeFunction = (entity) => {
  if (hasComponent(entity, PreventBakeTagComponent)) {
    return {
      name: SCENE_COMPONENT_PREVENT_BAKE,
      props: {}
    }
  }
}
