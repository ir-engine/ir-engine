import { Box3, Vector3 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, setComponent } from '../../../ecs/functions/ComponentFunctions'
import { setBoundingBoxComponent } from '../../../interaction/components/BoundingBoxComponents'
import { InteractableComponent } from '../../../interaction/components/InteractableComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'

export const SCENE_COMPONENT_INTERACTABLE = 'interactable'
export const SCENE_COMPONENT_INTERACTABLE_DEFAULT_VALUES = {}

export const deserializeInteractable: ComponentDeserializeFunction = (entity: Entity, json: ComponentJson) => {
  addComponent(entity, InteractableComponent, true)
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
