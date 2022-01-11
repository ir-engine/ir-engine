import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { InteractableComponent, InteractableComponentType } from '../../../interaction/components/InteractableComponent'

export const SCENE_COMPONENT_INTERACTABLE = 'interactable'
export const SCENE_COMPONENT_INTERACTABLE_DEFAULT_VALUES = {
  interactable: false
}

export const deserializeInteractable: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<InteractableComponentType>
) => {
  addComponent(entity, InteractableComponent, { ...json.props })

  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_INTERACTABLE)

  updateInteractable(entity, json.props)
}

export const updateInteractable: ComponentUpdateFunction = async (
  _entity: Entity,
  _properties: InteractableComponentType
) => {}

export const serializeInteractable: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, InteractableComponent) as InteractableComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_INTERACTABLE,
    props: {
      interactable: component.interactable
    }
  }
}
