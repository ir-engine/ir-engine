import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { VisibleComponent } from '../../components/VisibleComponent'

export const SCENE_COMPONENT_VISIBLE = 'visible'
export const SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES = {}

export const deserializeVisible: ComponentDeserializeFunction = (entity: Entity, _: ComponentJson<{}>) => {
  addComponent(entity, VisibleComponent, true)
}

export const serializeVisible: ComponentSerializeFunction = (entity) => {
  if (hasComponent(entity, VisibleComponent)) {
    return {
      name: SCENE_COMPONENT_VISIBLE,
      props: {}
    }
  }
}
