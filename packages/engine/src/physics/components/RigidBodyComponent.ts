import { RigidBody } from '@dimforge/rapier3d-compat'
import { Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

interface RigidBodyComponentType {
  body: RigidBody
  previousPosition: Vector3
}

export const RigidBodyComponent = createMappedComponent<RigidBodyComponentType>('RigidBodyComponent')
