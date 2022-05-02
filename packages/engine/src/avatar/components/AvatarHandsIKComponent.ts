import { Bone, Object3D } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

/**
 * Avatar Hands IK Solver Component.
 */
export type AvatarHandsIKComponentType = {
  leftTarget: Object3D
  leftHint: Object3D | null
  leftTargetOffset: Object3D
  leftTargetPosWeight: number
  leftTargetRotWeight: number
  leftHintWeight: number

  rightTarget: Object3D
  rightHint: Object3D | null
  rightTargetOffset: Object3D
  rightTargetPosWeight: number
  rightTargetRotWeight: number
  rightHintWeight: number
}

export const AvatarHandsIKComponent = createMappedComponent<AvatarHandsIKComponentType>('AvatarHandsIKComponent')
