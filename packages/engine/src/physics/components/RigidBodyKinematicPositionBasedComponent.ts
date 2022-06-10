import { Collider, RigidBody, RigidBodyDesc } from '@dimforge/rapier3d-compat'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type RigidBodyKinematicPositionBasedComponentType = {
  rigidBody: RigidBody
  rigidBodyDesc: RigidBodyDesc
  collider: Collider
}

export const RigidBodyKinematicPositionBasedComponent =
  createMappedComponent<RigidBodyKinematicPositionBasedComponentType>('RigidBodyKinematicPositionBasedComponent')
