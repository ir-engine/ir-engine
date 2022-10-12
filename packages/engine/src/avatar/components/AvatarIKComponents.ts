import { Camera, Object3D } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { QuaternionSchema, Vector3Schema } from '../../transform/components/TransformComponent'

export const AvatarHeadDecapComponent = createMappedComponent<true>('AvatarHeadDecapComponent')

export type AvatarHeadIKComponentType = {
  target: Object3D
  /**
   * Clamp the angle between bone forward vector and camera forward in radians
   * Use 0 to disable
   */
  rotationClamp: number
}

const PoseSchema = {
  position: Vector3Schema,
  quaternion: QuaternionSchema
}

const XRHeadIKSchema = {
  target: PoseSchema
}

export const AvatarHeadIKComponent = createMappedComponent<AvatarHeadIKComponentType, typeof XRHeadIKSchema>(
  'AvatarHeadIKComponent',
  XRHeadIKSchema
)

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

export type AvatarIKTargetsType = {
  head: boolean
  leftHand: boolean
  rightHand: boolean
}

export const AvatarIKTargetsComponent = createMappedComponent<AvatarIKTargetsType>('AvatarIKTargetsComponent')