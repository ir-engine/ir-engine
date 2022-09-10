import { Types } from 'bitecs'
import { Quaternion, Vector3 } from 'three'

import { createQuaternionProxy, createVector3Proxy } from '../../common/proxies/three'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, createMappedComponent, hasComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { GroupComponent } from '../../scene/components/GroupComponent'

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

globalThis.TransformComponent = TransformComponent

export function setTransformComponent(
  entity: Entity,
  position = new Vector3(),
  rotation = new Quaternion(),
  scale = new Vector3(1, 1, 1)
) {
  const dirtyTransforms = Engine.instance.currentWorld.dirtyTransforms
  return setComponent(entity, TransformComponent, {
    position: createVector3Proxy(TransformComponent.position, entity, dirtyTransforms, position),
    rotation: createQuaternionProxy(TransformComponent.rotation, entity, dirtyTransforms, rotation),
    scale: createVector3Proxy(TransformComponent.scale, entity, dirtyTransforms, scale)
  })
}

export const SCENE_COMPONENT_TRANSFORM = 'transform'
export const SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 }
}
