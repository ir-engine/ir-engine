import { createState } from '@speigg/hookstate'
import { Object3D } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../../ecs/functions/SystemHooks'
import { InteractableComponent, InteractableComponentType } from '../../../interaction/components/InteractableComponent'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { WorldDataComponentType } from '../../components/WorldDataComponent'

export const SCENE_COMPONENT_WORLDDATA = '_metadata'

export const deserializeWorldData: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<WorldDataComponentType>
) => {
  const obj3d = new Object3D()
  const data = json.props.data ?? ''
  addComponent(entity, Object3DComponent, { value: obj3d })
  addComponent(
    entity,
    InteractableComponent,
    createState({ action: '_metadata', interactionUserData: data } as InteractableComponentType)
  )

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_WORLDDATA)

  updateWorldData(entity, json.props)
}

export const updateWorldData: ComponentUpdateFunction = (entity: Entity, props: any) => {
  const { data } = props
  if (!data) return
  getComponent(entity, InteractableComponent).interactionUserData.set(data)
  ;(getComponent(entity, Object3DComponent).value as any)._data = data
  const transform = getComponent(entity, TransformComponent)
  const { x, y, z } = transform.position
  useWorld().worldMetadata[data] = x + ',' + y + ',' + z
}

export const serializeWorldData: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, InteractableComponent)
  if (!component) return

  return {
    name: SCENE_COMPONENT_WORLDDATA,
    props: {
      data: component.interactionUserData.value
    }
  }
}
