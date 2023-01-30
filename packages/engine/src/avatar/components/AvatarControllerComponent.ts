import { Collider, KinematicCharacterController, RigidBody } from '@dimforge/rapier3d-compat'
import { Quaternion, Vector2, Vector3 } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type AvatarControllerComponentType = {
  /** The camera entity that should be updated by this controller */
  cameraEntity: Entity
  controller: KinematicCharacterController
  bodyCollider: Collider
  movementEnabled: boolean
  isJumping: boolean
  isWalking: boolean
  isInAir: boolean
  /** velocity along the Y axis */
  verticalVelocity: number
  /** Is the gamepad-driven jump active */
  gamepadJumpActive: boolean
  /** gamepad-driven input, in the local XZ plane */
  gamepadLocalInput: Vector3
  /** gamepad-driven movement, in the world XZ plane */
  gamepadWorldMovement: Vector3
  // Below two values used to smoothly transition between
  // walk and run speeds
  /** @todo refactor animation system */
  speedVelocity: { value: number }
  translationApplied: Vector3
  // Below are autopilot input values
  autopilotWalkpoint: Vector3 | undefined
}

export const AvatarControllerComponent =
  createMappedComponent<AvatarControllerComponentType>('AvatarControllerComponent')
