import { Vector3, Quaternion } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { Types } from 'bitecs'
import { ComponentName } from '../../common/constants/ComponentNames'

export type TransformComponentType = {
  position: Vector3
  rotation: Quaternion
  scale: Vector3
}

const { f32 } = Types
const Vector3Schema = { x: f32, y: f32, z: f32 }
const QuaternionSchema = { x: f32, y: f32, z: f32, w: f32 }

export const TransformComponent = createMappedComponent<TransformComponentType>(ComponentName.TRANSFORM, {
  position: Vector3Schema,
  rotation: QuaternionSchema,
  scale: Vector3Schema
})
