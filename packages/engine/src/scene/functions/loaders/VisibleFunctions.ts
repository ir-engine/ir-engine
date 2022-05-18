import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { VisibleComponent } from '../../components/VisibleComponent'

export const SCENE_COMPONENT_VISIBLE = 'visible'
export const SCENE_COMPONENT_VISIBLE_DEFAULT_VALUES = {}

export const deserializeVisible: ComponentDeserializeFunction = (entity: Entity, _: ComponentJson<{}>) => {
  if (isClient) addComponent(entity, VisibleComponent, {})
  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_VISIBLE)
}

export const serializeVisible: ComponentSerializeFunction = (entity) => {
  if (hasComponent(entity, VisibleComponent)) {
    return {
      name: SCENE_COMPONENT_VISIBLE,
      props: {}
    }
  }
}
