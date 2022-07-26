import { ArrowHelper, Object3D, Vector3 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { MountPointComponent, MountPointComponentType } from '../../components/MountPointComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { ObjectLayers } from '../../constants/ObjectLayers'
import { setObjectLayers } from '../setObjectLayers'

export const SCENE_COMPONENT_MOUNT_POINT = 'mount-point'
export const SCENE_COMPONENT_MOUNT_POINT_DEFAULT_VALUES = {
  type: 'seat',
  animation: {}
}

export const deserializeMountPoint: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<true>
): void => {
  const props = parseMountPointProperties(json.props)
  let obj3d = getComponent(entity, Object3DComponent)?.value
  if (!obj3d) {
    obj3d = addComponent(entity, Object3DComponent, { value: new Object3D() }).value
  }
  if (Engine.instance.isEditor) {
    const arrowHelper = new ArrowHelper(new Vector3(0, 0, 1), new Vector3(0, 0, 0), 0.5, 0xffffff)
    obj3d.add(arrowHelper)
    arrowHelper.userData.isHelper = true
    setObjectLayers(arrowHelper, ObjectLayers.NodeHelper)
  }
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
