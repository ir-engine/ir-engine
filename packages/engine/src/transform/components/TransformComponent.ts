import { Types } from 'bitecs'
import { Matrix4, Quaternion, Vector3 } from 'three'

import { proxifyQuaternionWithDirty, proxifyVector3WithDirty } from '../../common/proxies/createThreejsProxy'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent, setComponent } from '../../ecs/functions/ComponentFunctions'

export type TransformComponentType = {
  position: Vector3
  rotation: Quaternion
  scale: Vector3
  matrix: Matrix4
}

const { f32 } = Types
export const Vector3Schema = { x: f32, y: f32, z: f32 }
export const QuaternionSchema = { x: f32, y: f32, z: f32, w: f32 }
export const TransformSchema = {
  position: Vector3Schema,
  rotation: QuaternionSchema,
  scale: Vector3Schema
}

export const TransformComponent = createMappedComponent<
  TransformComponentType & { matrixInverse: Matrix4 },
  typeof TransformSchema
>('TransformComponent', TransformSchema)

globalThis.TransformComponent = TransformComponent

export function setTransformComponent(
  entity: Entity,
  position = new Vector3(),
  rotation = new Quaternion(),
  scale = new Vector3(1, 1, 1)
) {
  const dirtyTransforms = Engine.instance.currentWorld.dirtyTransforms
  return setComponent(entity, TransformComponent, {
    position: proxifyVector3WithDirty(TransformComponent.position, entity, dirtyTransforms, position),
    rotation: proxifyQuaternionWithDirty(TransformComponent.rotation, entity, dirtyTransforms, rotation),
    scale: proxifyVector3WithDirty(TransformComponent.scale, entity, dirtyTransforms, scale),
    matrix: new Matrix4(),
    matrixInverse: new Matrix4()
  })
}

export const SCENE_COMPONENT_TRANSFORM = 'transform'
export const SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 }
}
