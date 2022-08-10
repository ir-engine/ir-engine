import { Types } from 'bitecs'
import { Quaternion, Vector3 } from 'three'

import { createQuaternionProxy, createVector3Proxy } from '../../common/proxies/three'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent, setComponent } from '../../ecs/functions/ComponentFunctions'

export type TransformComponentType = {
  position: Vector3
  rotation: Quaternion
  scale: Vector3
}

const { f32 } = Types
export const Vector3Schema = { x: f32, y: f32, z: f32 }
export const QuaternionSchema = { x: f32, y: f32, z: f32, w: f32 }
export const TransformSchema = {
  position: Vector3Schema,
  rotation: QuaternionSchema,
  scale: Vector3Schema
}

export const TransformComponent = createMappedComponent<TransformComponentType, typeof TransformSchema>(
  'TransformComponent',
  TransformSchema
)
// createComponent('TransformComponent', SCHEMA).withMap<TransformComponentType>()

globalThis.TransformComponent = TransformComponent

export function setTransformComponent(entity: Entity) {
  const dirtyTransforms = Engine.instance.currentWorld.dirtyTransforms
  return setComponent(entity, TransformComponent, {
    position: createVector3Proxy(TransformComponent.position, entity, dirtyTransforms),
    rotation: createQuaternionProxy(TransformComponent.rotation, entity, dirtyTransforms),
    scale: createVector3Proxy(TransformComponent.scale, entity, dirtyTransforms).setScalar(1)
  })
}
