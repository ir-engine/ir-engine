import { RigidBody } from '@dimforge/rapier3d-compat'
import { Quaternion, Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

interface RigidBodyComponentType {
  body: RigidBody
  previousPosition: Vector3
  previousRotation: Quaternion
  previousLinearVelocity: Vector3
  previousAngularVelocity: Vector3
}

export const RigidBodyComponent = createMappedComponent<RigidBodyComponentType>('RigidBodyComponent')
