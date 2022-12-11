import { Collider, KinematicCharacterController, RigidBody } from '@dimforge/rapier3d-compat'
import { Vector3 } from 'three'

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
  /** vector representing current movement direction normalized in the XZ plane */
  gamepadMovementDirection: Vector3
  gamepadYVelocity: number
  gamepadMovementSmoothed: Vector3
  // Below two values used to smoothly transition between
  // walk and run speeds
  /** @todo refactor animation system */
  speedVelocity: { value: number }
  /** @deprecated @todo replace this with RigidBodyComponent */
  lastPosition: Vector3
}

export const AvatarControllerComponent =
  createMappedComponent<AvatarControllerComponentType>('AvatarControllerComponent')
