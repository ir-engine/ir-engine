import { RigidBody, RigidBodyType } from '@dimforge/rapier3d-compat'
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
export const RigidBodyDynamicTagComponent = createMappedComponent<true>('RigidBodyDynamicTagComponent')
export const RigidBodyFixedTagComponent = createMappedComponent<true>('RigidBodyFixedTagComponent')
export const RigidBodyKinematicPositionBasedTagComponent = createMappedComponent<true>(
  'RigidBodyKinematicPositionBasedTagComponent'
)
export const RigidBodyKinematicVelocityBasedTagComponent = createMappedComponent<true>(
  'RigidBodyKinematicVelocityBasedTagComponent'
)

type RigidBodyTypes =
  | typeof RigidBodyDynamicTagComponent
  | typeof RigidBodyFixedTagComponent
  | typeof RigidBodyKinematicPositionBasedTagComponent
  | typeof RigidBodyKinematicVelocityBasedTagComponent

export const getTagComponentForRigidBody = (type: RigidBodyType): RigidBodyTypes => {
  switch (type) {
    case RigidBodyType.Dynamic:
      return RigidBodyDynamicTagComponent

    case RigidBodyType.Fixed:
      return RigidBodyFixedTagComponent

    case RigidBodyType.KinematicPositionBased:
      return RigidBodyKinematicPositionBasedTagComponent

    case RigidBodyType.KinematicVelocityBased:
      return RigidBodyKinematicVelocityBasedTagComponent
  }
}
