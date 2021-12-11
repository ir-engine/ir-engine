import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/ComponentNames'
import { VisibleComponent } from '../../components/VisibleComponent'
import { isClient } from '../../../common/functions/isClient'

export const SCENE_COMPONENT_VISIBLE = 'visible'

export const deserializeVisible: ComponentDeserializeFunction = (entity: Entity, json: ComponentJson) => {
  if (isClient) addComponent(entity, VisibleComponent, {})
}

export const serializeVisible: ComponentSerializeFunction = (entity) => {
  if (hasComponent(entity, VisibleComponent)) {
    return {
      name: SCENE_COMPONENT_VISIBLE,
      props: {}
    }
  }
}
