import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  hasComponent
} from '../../ecs/functions/ComponentFunctions'
import { ComponentName } from '../../common/constants/ComponentNames'
import { VisibleComponent } from '../components/VisibleComponent'
import { isClient } from '../../common/functions/isClient'

export const deserializeVisible: ComponentDeserializeFunction = (entity: Entity, json: ComponentJson) => {
  if (isClient) addComponent(entity, VisibleComponent, {})
}

export const serializeVisible: ComponentSerializeFunction = (entity) => {
  if (hasComponent(entity, VisibleComponent)) {
    return {
      name: ComponentName.VISIBILE,
      props: {}
    }
  }
}
