import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { InteractableComponent, setInteractableComponent } from '../../../interaction/components/InteractableComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'

export const SCENE_COMPONENT_INTERACTABLE = 'interactable'

export const deserializeInteractable: ComponentDeserializeFunction = (entity: Entity, json: ComponentJson) => {
  setInteractableComponent(entity)
  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_INTERACTABLE)
}

export const serializeInteractable: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, InteractableComponent)
  if (!component) return

  return {
    name: SCENE_COMPONENT_INTERACTABLE,
    props: {}
  }
}
