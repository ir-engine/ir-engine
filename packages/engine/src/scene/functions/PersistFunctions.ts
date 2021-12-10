import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  hasComponent
} from '../../ecs/functions/ComponentFunctions'
import { ComponentName } from '../../common/constants/ComponentNames'
import { isClient } from '../../common/functions/isClient'
import { PersistTagComponent } from '../components/PersistTagComponent'

export const deserializePersist: ComponentDeserializeFunction = (entity: Entity, _: ComponentJson) => {
  if (isClient) addComponent(entity, PersistTagComponent, {})
}

export const serializePersist: ComponentSerializeFunction = (entity) => {
  if (hasComponent(entity, PersistTagComponent)) {
    return {
      name: ComponentName.PERSIST,
      props: {}
    }
  }
}
