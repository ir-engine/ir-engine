import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import {
  MountPointComponent,
  MountPointComponentType,
  SCENE_COMPONENT_MOUNT_POINT_DEFAULT_VALUES
} from '../../components/MountPointComponent'

export const deserializeMountPoint: ComponentDeserializeFunction = (entity: Entity, data: true): void => {
  const props = parseMountPointProperties(data)
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
