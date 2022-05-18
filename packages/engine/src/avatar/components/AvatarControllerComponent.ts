import { Vector3 } from 'three'
import { VectorSpringSimulator } from '../../physics/classes/springs/VectorSpringSimulator'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

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
