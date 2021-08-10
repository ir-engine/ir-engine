import type { Controller } from 'three-physx'
import { PerspectiveCamera, Vector3 } from 'three'
import { VectorSpringSimulator } from '../../physics/classes/VectorSpringSimulator'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type AvatarControllerComponentType = {
  controller: Controller
  frustumCamera: PerspectiveCamera
  movementEnabled: boolean
  isJumping: boolean
  isWalking: boolean
  walkSpeed: number
  runSpeed: number
  moveSpeed: number
  jumpHeight: number
  localMovementDirection: Vector3
  velocitySimulator: VectorSpringSimulator
}

export const AvatarControllerComponent = createMappedComponent<AvatarControllerComponentType>()
