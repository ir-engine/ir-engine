import { createState } from '@speigg/hookstate'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { InteractableComponent, InteractableComponentType } from '../../../interaction/components/InteractableComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'

export const SCENE_COMPONENT_INTERACTABLE = 'interactable'
export const SCENE_COMPONENT_INTERACTABLE_DEFAULT_VALUES = {}

export const deserializeInteractable: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<InteractableComponentType>
) => {
  const props = parseInteractableProperties(json.props)
  addComponent(entity, InteractableComponent, createState(props))

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_INTERACTABLE)

  updateInteractable(entity, props)
}

export const updateInteractable: ComponentUpdateFunction = (
  _entity: Entity,
  _properties: InteractableComponentType
) => {}

export const serializeInteractable: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, InteractableComponent).value
  if (!component) return

  return {
    name: SCENE_COMPONENT_INTERACTABLE,
    props: {
      interactionType: component.interactionType,
      interactionText: component.interactionText,
      interactionDistance: component.interactionDistance,
      interactionName: component.interactionName,
      interactionDescription: component.interactionDescription,
      interactionImages: component.interactionImages,
      interactionVideos: component.interactionVideos,
      interactionUrls: component.interactionUrls,
      interactionModels: component.interactionModels
    }
  }
}

const parseInteractableProperties = (props): InteractableComponentType => {
  return {
    ...props
  }
}
