import { Collider, RigidBody, RigidBodyDesc } from '@dimforge/rapier3d-compat'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type RigidBodyDynamicComponentType = {
  rigidBody: RigidBody
  rigidBodyDesc: RigidBodyDesc
  collider: Collider
}

export const RigidBodyDynamicComponent =
  createMappedComponent<RigidBodyDynamicComponentType>('RigidBodyDynamicComponent')
