import { Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { VectorSpringSimulator } from '../../physics/classes/springs/VectorSpringSimulator'

export type AvatarControllerComponentType = {
  controller: PhysX.PxCapsuleController
  filterData: PhysX.PxFilterData
  collisions: [boolean, boolean, boolean]
  movementEnabled: boolean
  isJumping: boolean
  isWalking: boolean
  localMovementDirection: Vector3
  velocitySimulator: VectorSpringSimulator
}

export const AvatarControllerComponent =
  createMappedComponent<AvatarControllerComponentType>('AvatarControllerComponent')
