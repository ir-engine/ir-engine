import { Object3D } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { QuaternionSchema, Vector3Schema } from '../../transform/components/TransformComponent'

/**
 * Avatar Hands IK Solver Component.
 */
export type AvatarHandsIKComponentType = {
  target: Object3D
  hint: Object3D | null
  targetOffset: Object3D
  targetPosWeight: number
  targetRotWeight: number
  hintWeight: number
}

const PoseSchema = {
  position: Vector3Schema,
  quaternion: QuaternionSchema
}

const HandIKSchema = {
  target: PoseSchema
}

export const AvatarLeftHandIKComponent = createMappedComponent<AvatarHandsIKComponentType, typeof HandIKSchema>(
  'AvatarLeftHandIKComponent',
  HandIKSchema
)
export const AvatarRightHandIKComponent = createMappedComponent<AvatarHandsIKComponentType, typeof HandIKSchema>(
  'AvatarRightHandIKComponent',
  HandIKSchema
)
