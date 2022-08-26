import { Collider, RigidBody } from '@dimforge/rapier3d-compat'
import { Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { VectorSpringSimulator } from '../../physics/classes/springs/VectorSpringSimulator'

export type AvatarControllerComponentType = {
  controller: RigidBody
  bodyCollider: Collider
  movementEnabled: boolean
  isJumping: boolean
  isWalking: boolean
  isInAir: boolean
  localMovementDirection: Vector3
  velocitySimulator: VectorSpringSimulator
  // Below two values used to smoothly transition between
  // walk and run speeds
  currentSpeed: number
  speedVelocity: { value: number }
  lastPosition: Vector3
  movementMode: 'relative' | 'absolute'
}

export const AvatarControllerComponent =
  createMappedComponent<AvatarControllerComponentType>('AvatarControllerComponent')
