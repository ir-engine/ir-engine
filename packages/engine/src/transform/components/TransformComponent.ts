import { Types } from 'bitecs'
import { Matrix4, Quaternion, Vector3 } from 'three'

import { proxifyQuaternionWithDirty, proxifyVector3WithDirty } from '../../common/proxies/createThreejsProxy'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent, getComponent, hasComponent, setComponent } from '../../ecs/functions/ComponentFunctions'

export type TransformComponentType = {
  position: Vector3
  rotation: Quaternion
  scale: Vector3
  matrix: Matrix4
}

const { f64 } = Types
export const Vector3Schema = { x: f64, y: f64, z: f64 }
export const QuaternionSchema = { x: f64, y: f64, z: f64, w: f64 }
export const PoseSchema = {
  position: Vector3Schema,
  rotation: QuaternionSchema
}
export const TransformSchema = {
  position: Vector3Schema,
  rotation: QuaternionSchema,
  scale: Vector3Schema
}

export const TransformComponent = createMappedComponent<
  TransformComponentType & { matrixInverse: Matrix4 },
  typeof TransformSchema
>('TransformComponent', TransformSchema)

type LocalTransformComponentType = TransformComponentType & { parentEntity: Entity }

export const LocalTransformComponent = createMappedComponent<LocalTransformComponentType, typeof TransformSchema>(
  'LocalTransformComponent',
  TransformSchema
)

globalThis.TransformComponent = TransformComponent

/**
 * Sets the transform component.
 * Used for objects that exist as part of the world - such as avatars and scene objects
 * @param entity
 * @param parentEntity
 * @param position
 * @param rotation
 * @param scale
 * @returns
 */
export function setTransformComponent(entity: Entity, position?: Vector3, rotation?: Quaternion, scale?: Vector3) {
  const dirtyTransforms = Engine.instance.currentWorld.dirtyTransforms
  if (hasComponent(entity, TransformComponent)) {
    const existingTransform = getComponent(entity, TransformComponent)
    if (position) existingTransform.position.copy(position)
    if (rotation) existingTransform.rotation.copy(rotation)
    if (scale) existingTransform.scale.copy(scale)
  } else {
    setComponent(entity, TransformComponent, {
      position: proxifyVector3WithDirty(
        TransformComponent.position,
        entity,
        dirtyTransforms,
        position ?? new Vector3()
      ),
      rotation: proxifyQuaternionWithDirty(
        TransformComponent.rotation,
        entity,
        dirtyTransforms,
        rotation ?? new Quaternion()
      ),
      scale: proxifyVector3WithDirty(TransformComponent.scale, entity, dirtyTransforms, scale ?? new Vector3(1, 1, 1)),
      matrix: new Matrix4(),
      matrixInverse: new Matrix4()
    })
  }
}

/**
 * Sets the local transform component. This is used to calculate relative transforms.
 * Used for objects that exist as part of a specific coordinate system - such as avatars and scene objects
 * @param entity
 * @param parentEntity
 * @param position
 * @param rotation
 * @param scale
 * @returns
 */
export function setLocalTransformComponent(
  entity: Entity,
  parentEntity: Entity,
  position = new Vector3(),
  rotation = new Quaternion(),
  scale = new Vector3(1, 1, 1)
) {
  if (entity === parentEntity) throw new Error('Tried to parent entity to self - this is not allowed')
  if (!hasComponent(entity, TransformComponent)) setTransformComponent(entity)
  const dirtyTransforms = Engine.instance.currentWorld.dirtyTransforms
  setComponent(entity, LocalTransformComponent, {
    parentEntity,
    // clone incoming transform properties, because we don't want to accidentally bind obj properties to local transform
    position: proxifyVector3WithDirty(LocalTransformComponent.position, entity, dirtyTransforms, position.clone()),
    rotation: proxifyQuaternionWithDirty(LocalTransformComponent.rotation, entity, dirtyTransforms, rotation.clone()),
    scale: proxifyVector3WithDirty(LocalTransformComponent.scale, entity, dirtyTransforms, scale.clone()),
    matrix: new Matrix4()
  })
}

export const SCENE_COMPONENT_TRANSFORM = 'transform'
export const SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0, w: 1 },
  scale: { x: 1, y: 1, z: 1 }
}
