import { RigidBody } from '@dimforge/rapier3d-compat'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type RigidBodyComponentType = {
  rigidBody: RigidBody
}

export const RigidBodyComponent = createMappedComponent<RigidBodyComponentType>('RigidBodyComponent')
