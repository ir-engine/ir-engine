import { Collider, RigidBody, RigidBodyDesc } from '@dimforge/rapier3d-compat'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type RigidBodyFixedComponentType = {
  rigidBody: RigidBody
  rigidBodyDesc: RigidBodyDesc
  collider: Collider
}

export const RigidBodyFixedComponent = createMappedComponent<RigidBodyFixedComponentType>('RigidBodyFixedComponent')
