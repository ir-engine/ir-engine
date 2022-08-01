import { Types } from 'bitecs'
import { Quaternion, Vector3 } from 'three'

import { createQuaternionProxy, createVector3Proxy } from '../../common/proxies/three'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { addComponent, createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type TransformComponentType = {
  position: Vector3
  rotation: Quaternion
  scale: Vector3
}

const { f32 } = Types
export const Vector3Schema = { x: f32, y: f32, z: f32 }
export const QuaternionSchema = { x: f32, y: f32, z: f32, w: f32 }
export const Object3DSchema = {
  position: Vector3Schema,
  rotation: QuaternionSchema,
  scale: Vector3Schema
}

export const TransformComponent = createMappedComponent<TransformComponentType, typeof Object3DSchema>(
  'TransformComponent',
  Object3DSchema
)
// createComponent('TransformComponent', SCHEMA).withMap<TransformComponentType>()

globalThis.TransformComponent = TransformComponent

export function addTransformComponent(entity: Entity) {
  return addComponent(entity, TransformComponent, {
    position: createVector3Proxy(TransformComponent.position, entity),
    rotation: createQuaternionProxy(TransformComponent.rotation, entity),
    scale: createVector3Proxy(TransformComponent.scale, entity).setScalar(1)
  })
}
