import { Vector3, Quaternion } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { Types, ComponentType, defineComponent } from 'bitecs'

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
