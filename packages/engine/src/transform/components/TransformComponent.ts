import { Types } from 'bitecs'
import { Matrix4, Quaternion, Vector3 } from 'three'

import { DeepReadonly } from '@etherealengine/common/src/DeepReadonly'

import { proxifyQuaternionWithDirty, proxifyVector3WithDirty } from '../../common/proxies/createThreejsProxy'
import { Engine } from '../../ecs/classes/Engine'
import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import { defineComponent, hasComponent, setComponent } from '../../ecs/functions/ComponentFunctions'

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

export const TransformComponent = defineComponent({
  name: 'TransformComponent',
  schema: TransformSchema,

  onInit: (entity) => {
    return {
      position: null! as Vector3,
      rotation: null! as Quaternion,
      scale: null! as Vector3,
      matrix: new Matrix4(),
      matrixInverse: new Matrix4()
    }
  },

  onSet: (entity, component, json) => {
    const dirtyTransforms = TransformComponent.dirtyTransforms

    if (!component.position.value)
      component.position.set(
        proxifyVector3WithDirty(TransformComponent.position, entity, dirtyTransforms, new Vector3())
      )
    if (!component.rotation.value)
      component.rotation.set(
        proxifyQuaternionWithDirty(TransformComponent.rotation, entity, dirtyTransforms, new Quaternion())
      )
    if (!component.scale.value)
      component.scale.set(
        proxifyVector3WithDirty(TransformComponent.scale, entity, dirtyTransforms, new Vector3(1, 1, 1))
      )

    if (!json) return

    if (json.position) component.position.value.copy(json.position)
    if (json.rotation) component.rotation.value.copy(json.rotation)
    if (json.scale) component.scale.value.copy(json.scale)
  },

  toJSON(entity, component) {
    return {
      position: component.position.value,
      rotation: component.rotation.value,
      scale: component.scale.value
    }
  },

  onRemove: (entity) => {
    delete TransformComponent.dirtyTransforms[entity]
  },

  dirtyTransforms: {} as Record<Entity, boolean>
})

export const LocalTransformComponent = defineComponent({
  name: 'LocalTransformComponent',
  schema: TransformSchema,

  onInit: (entity) => {
    return {
      parentEntity: UndefinedEntity as Entity,
      position: new Vector3(),
      rotation: new Quaternion(),
      scale: new Vector3(1, 1, 1),
      matrix: new Matrix4()
    }
  },

  onSet: (entity, component, json: Partial<DeepReadonly<TransformComponentType>> & { parentEntity: Entity }) => {
    if (!json) return

    const position = json.position ?? new Vector3()
    const rotation = json.rotation ?? new Quaternion()
    const scale = json.scale ?? new Vector3(1, 1, 1)
    const parentEntity = json.parentEntity

    const dirtyTransforms = TransformComponent.dirtyTransforms

    if (entity === parentEntity!) throw new Error('Tried to parent entity to self - this is not allowed')
    if (!hasComponent(entity, TransformComponent)) setComponent(entity, TransformComponent)

    component.parentEntity.set(parentEntity)

    // clone incoming transform properties, because we don't want to accidentally bind obj properties to local transform
    component.position.set(
      proxifyVector3WithDirty(LocalTransformComponent.position, entity, dirtyTransforms, position.clone())
    )
    component.rotation.set(
      proxifyQuaternionWithDirty(LocalTransformComponent.rotation, entity, dirtyTransforms, rotation.clone())
    )
    component.scale.set(proxifyVector3WithDirty(LocalTransformComponent.scale, entity, dirtyTransforms, scale.clone()))

    component.matrix.value.identity()
  }
})

globalThis.TransformComponent = TransformComponent

/**
 * @deprecated - now included in TransfromComponent.onSet
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
  setComponent(entity, TransformComponent, { position, rotation, scale })
}

/**
 * @deprecated - now included in LocalTransfromComponent.onSet
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
  setComponent(entity, LocalTransformComponent, { parentEntity, position, rotation, scale })
}

export const SCENE_COMPONENT_TRANSFORM = 'transform'
export const SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0, w: 1 },
  scale: { x: 1, y: 1, z: 1 }
}
