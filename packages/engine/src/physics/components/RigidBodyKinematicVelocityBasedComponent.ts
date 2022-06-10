import { Collider, RigidBody, RigidBodyDesc } from '@dimforge/rapier3d-compat'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type RigidBodyKinematicVelocityBasedComponentType = {
  rigidBody: RigidBody
  rigidBodyDesc: RigidBodyDesc
  collider: Collider
}

export const RigidBodyKinematicVelocityBasedComponent =
  createMappedComponent<RigidBodyKinematicVelocityBasedComponentType>('RigidBodyKinematicVelocityBasedComponent')
