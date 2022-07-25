import { RigidBody } from '@dimforge/rapier3d-compat'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export const RigidBodyComponent = createMappedComponent<RigidBody>('RigidBodyComponent')
