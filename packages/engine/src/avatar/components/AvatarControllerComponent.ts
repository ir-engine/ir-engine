import type { Controller } from '../../physics/physx'
import { Vector3 } from 'three'
import { VectorSpringSimulator } from '../../physics/classes/VectorSpringSimulator'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type AvatarControllerComponentType = {
  controller: Controller
  movementEnabled: boolean
  isJumping: boolean
  isWalking: boolean
  localMovementDirection: Vector3
  velocitySimulator: VectorSpringSimulator
}

export const AvatarControllerComponent =
  createMappedComponent<AvatarControllerComponentType>('AvatarControllerComponent')
