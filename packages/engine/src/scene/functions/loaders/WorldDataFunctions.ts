import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Engine } from '../../../ecs/classes/Engine'
import { useWorld } from '../../../ecs/functions/SystemHooks'
import { Object3D } from 'three'
import { Object3DComponent } from '../../components/Object3DComponent'
import { InteractableComponent } from '../../../interaction/components/InteractableComponent'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { WorldDataComponentType } from '../../components/WorldDataComponent'

export const SCENE_COMPONENT_WORLDDATA = '_metadata'

export const deserializeWorldData: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<WorldDataComponentType>
) => {
  addComponent(entity, Object3DComponent, { value: new Object3D() })
  const { data } = json.props
  addComponent(entity, InteractableComponent, { action: '_metadata', interactionUserData: data })
  const transform = getComponent(entity, TransformComponent)
  const { x, y, z } = transform.position
  useWorld().worldMetadata[data] = x + ',' + y + ',' + z

  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_WORLDDATA)

  updateWorldData(entity)
}

export const updateWorldData: ComponentUpdateFunction = (entity: Entity, props: any) => {
  const { data } = props
  if (!data) return
  getComponent(entity, InteractableComponent).interactionUserData = data
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
      data: component.interactionUserData
    }
  }
}
