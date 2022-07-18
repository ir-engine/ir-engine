import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { MountPointComponent, MountPointComponentType } from '../../components/ChairComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'

export const SCENE_COMPONENT_MOUNT_POINT = 'mount-point'
export const SCENE_COMPONENT_MOUNT_POINT_DEFAULT_VALUES = {
  type: 'seat'
}

export const deserializeMountPoint: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<true>
): void => {
  const props = parseMountPointProperties(json.props)
  addComponent(entity, MountPointComponent, props)
  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_MOUNT_POINT)
}

export const serializeMountPoint: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, MountPointComponent)
  if (!component) return
  return {
    name: SCENE_COMPONENT_MOUNT_POINT,
    props: {
      type: component.type
    }
  }
}

export const parseMountPointProperties = (props): MountPointComponentType => {
  return {
    type: props.type ?? SCENE_COMPONENT_MOUNT_POINT_DEFAULT_VALUES.type
  }
}
