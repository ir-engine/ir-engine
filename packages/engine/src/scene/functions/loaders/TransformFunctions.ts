import { Euler, Matrix4, Quaternion, Vector3 } from 'three'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import {
  LocalTransformComponent,
  SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES,
  setTransformComponent,
  TransformComponent,
  TransformComponentType
} from '../../../transform/components/TransformComponent'

const euler = new Euler()
const v3 = new Vector3()

export const deserializeTransform: ComponentDeserializeFunction = (entity: Entity, data: TransformComponentType) => {
  const props = parseTransformProperties(data)
  const component = hasComponent(entity, TransformComponent)
    ? getComponent(entity, TransformComponent)
    : setTransformComponent(entity)

  /** all scene entities are assumpted to have transform components already */
  component.position.copy(props?.position ?? new Vector3())
  component.rotation.copy(props?.rotation ?? new Quaternion())
  component.scale.copy(props?.scale ?? new Vector3(1, 1, 1))

  const localTransform = getComponent(entity, LocalTransformComponent)
  if (localTransform) {
    localTransform.position.copy(props.position)
    localTransform.rotation.copy(props.rotation)
    localTransform.scale.copy(props.scale)
  }
}

export const serializeTransform: ComponentSerializeFunction = (entity) => {
  const component = hasComponent(entity, LocalTransformComponent)
    ? getComponent(entity, LocalTransformComponent)
    : getComponent(entity, TransformComponent)
  return {
    position: new Vector3().copy(component.position),
    rotation: new Quaternion().copy(component.rotation),
    scale: new Vector3().copy(component.scale)
  }
}

export const parseTransformProperties = (props: any): TransformComponentType => {
  const result = {} as TransformComponentType

  let tempV3 = props.position ?? SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES.position
  result.position = new Vector3(tempV3.x, tempV3.y, tempV3.z)

  tempV3 = props.scale ?? SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES.scale
  result.scale = new Vector3(tempV3.x, tempV3.y, tempV3.z)

  tempV3 = props.rotation ?? SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES.rotation
  const tempQuat = tempV3
  if (tempQuat.w !== undefined) {
    result.rotation = new Quaternion(tempQuat.x, tempQuat.y, tempQuat.z, tempQuat.w)
  } else {
    //backwards compatible with rotations saved as eulers
    result.rotation = new Quaternion().setFromEuler(euler.setFromVector3(v3.set(tempV3.x, tempV3.y, tempV3.z), 'XYZ'))
  }
  return result
}

export const applyTransformPositionOffset = (
  transform: TransformComponentType,
  referenceTransform: TransformComponentType,
  offsetPosition: Vector3
): void => {
  transform.position.copy(offsetPosition).applyQuaternion(referenceTransform.rotation).add(referenceTransform.position)
}

export const applyTransformRotationOffset = (
  transform: TransformComponentType,
  referenceTransform: TransformComponentType,
  offsetRotation: Quaternion
): void => {
  transform.rotation.copy(referenceTransform.rotation).multiply(offsetRotation)
}
