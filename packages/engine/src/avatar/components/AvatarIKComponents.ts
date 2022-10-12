import { Object3D } from 'three'

import { ParityValue } from '../../common/enums/ParityValue'
import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { QuaternionSchema, Vector3Schema } from '../../transform/components/TransformComponent'
import { AvatarRigComponent } from './AvatarAnimationComponent'

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

/**
 * Gets the hand position in world space
 * @param entity the player entity
 * @param hand which hand to get
 * @returns {Vector3}
 */
export const getHandTarget = (entity: Entity, hand: ParityValue = ParityValue.NONE): Object3D | null => {
  switch (hand) {
    case ParityValue.LEFT:
      if (hasComponent(entity, AvatarLeftHandIKComponent)) return getComponent(entity, AvatarLeftHandIKComponent).target
      if (hasComponent(entity, AvatarRigComponent)) return getComponent(entity, AvatarRigComponent).rig.LeftHand
      break
    case ParityValue.RIGHT:
      if (hasComponent(entity, AvatarRightHandIKComponent))
        return getComponent(entity, AvatarRightHandIKComponent).target
      if (hasComponent(entity, AvatarRigComponent)) return getComponent(entity, AvatarRigComponent).rig.RightHand
      break
    case ParityValue.NONE:
      if (hasComponent(entity, AvatarHeadIKComponent)) return getComponent(entity, AvatarHeadIKComponent).target
      if (hasComponent(entity, AvatarRigComponent)) return getComponent(entity, AvatarRigComponent).rig.Head
      break
  }
  return null
}
