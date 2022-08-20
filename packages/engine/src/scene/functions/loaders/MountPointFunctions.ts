import { Object3D } from 'three'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import {
  MountPointComponent,
  MountPointComponentType,
  SCENE_COMPONENT_MOUNT_POINT_DEFAULT_VALUES
} from '../../components/MountPointComponent'
import { Object3DComponent } from '../../components/Object3DComponent'

export const deserializeMountPoint: ComponentDeserializeFunction = (entity: Entity, data: true): void => {
  const props = parseMountPointProperties(data)
  let obj3d = getComponent(entity, Object3DComponent)?.value
  if (!obj3d) {
    obj3d = addComponent(entity, Object3DComponent, { value: new Object3D() }).value
  }
  addComponent(entity, MountPointComponent, props)
}

export const serializeMountPoint: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, MountPointComponent)
  return {
    type: component.type
  }
}

export const parseMountPointProperties = (props): MountPointComponentType => {
  return {
    type: props.type ?? SCENE_COMPONENT_MOUNT_POINT_DEFAULT_VALUES.type
  }
}
