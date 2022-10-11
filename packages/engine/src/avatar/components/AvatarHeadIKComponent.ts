import { Camera, Object3D } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { QuaternionSchema, Vector3Schema } from '../../transform/components/TransformComponent'

/**
 * Rotate the target bone with given camera
 */
export type AvatarHeadIKComponentType = {
  camera: Object3D
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
  camera: PoseSchema
}

export const AvatarHeadIKComponent = createMappedComponent<AvatarHeadIKComponentType, typeof XRHeadIKSchema>(
  'AvatarHeadIKComponent',
  XRHeadIKSchema
)
