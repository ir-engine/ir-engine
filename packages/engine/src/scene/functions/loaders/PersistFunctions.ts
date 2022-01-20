import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { PersistTagComponent } from '../../components/PersistTagComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Engine } from '../../../ecs/classes/Engine'

export const SCENE_COMPONENT_PERSIST = 'persist'

export const deserializePersist: ComponentDeserializeFunction = (entity: Entity, _: ComponentJson<{}>) => {
  if (isClient) addComponent(entity, PersistTagComponent, {})
  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_PERSIST)
}

export const serializePersist: ComponentSerializeFunction = (entity) => {
  if (hasComponent(entity, PersistTagComponent)) {
    return {
      name: SCENE_COMPONENT_PERSIST,
      props: {}
    }
  }
}
