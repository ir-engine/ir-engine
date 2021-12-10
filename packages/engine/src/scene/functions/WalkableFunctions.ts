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
import { WalkableTagComponent } from '../components/Walkable'

export const deserializeWalkable: ComponentDeserializeFunction = (entity: Entity, _: ComponentJson) => {
  if (isClient) addComponent(entity, WalkableTagComponent, {})
}

export const serializeWalkable: ComponentSerializeFunction = (entity) => {
  if (hasComponent(entity, WalkableTagComponent)) {
    return {
      name: ComponentName.WALKABLE,
      props: {}
    }
  }
}
