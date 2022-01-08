import { ComponentType, Types, defineComponent } from 'bitecs'
import { Quaternion, Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type TransformComponentType = {
  position: Vector3
  rotation: Quaternion
  scale: Vector3
}

const { f32 } = Types
const Vector3Schema = { x: f32, y: f32, z: f32 }
const QuaternionSchema = { x: f32, y: f32, z: f32, w: f32 }
const SCHEMA = {
  position: Vector3Schema,
  rotation: QuaternionSchema,
  scale: Vector3Schema
}

export const TransformComponent = createMappedComponent<TransformComponentType, typeof SCHEMA>(
  'TransformComponent',
  SCHEMA
)
// createComponent('TransformComponent', SCHEMA).withMap<TransformComponentType>()

globalThis.TransformComponent = TransformComponent
