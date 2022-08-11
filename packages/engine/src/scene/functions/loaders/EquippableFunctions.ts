import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { setBoundingBoxDynamicTag } from '../../../interaction/components/BoundingBoxComponents'
import { EquippableComponent } from '../../../interaction/components/EquippableComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'

export const SCENE_COMPONENT_EQUIPPABLE = 'equippable'
export const SCENE_COMPONENT_EQUIPPABLE_DEFAULT_VALUE = {}

export const deserializeEquippable: ComponentDeserializeFunction = (entity: Entity, component: ComponentJson<any>) => {
  addComponent(entity, EquippableComponent, true)
  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_EQUIPPABLE)
  setBoundingBoxDynamicTag(entity)
}

export const serializeEquippable: ComponentSerializeFunction = (entity) => {
  return {
    name: SCENE_COMPONENT_EQUIPPABLE,
    props: {}
  }
}
