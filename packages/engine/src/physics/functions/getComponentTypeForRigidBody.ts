import { RigidBody, RigidBodyType } from '@dimforge/rapier3d-compat'

import { RigidBodyDynamicComponent } from '../components/RigidBodyDynamicComponent'
import { RigidBodyFixedComponent } from '../components/RigidBodyFixedComponent'
import { RigidBodyKinematicPositionBasedComponent } from '../components/RigidBodyKinematicPositionBasedComponent'
import { RigidBodyKinematicVelocityBasedComponent } from '../components/RigidBodyKinematicVelocityBasedComponent'

export const getComponentTypeForRigidBody = (rigidBody: RigidBody) => {
  switch (rigidBody.bodyType()) {
    case RigidBodyType.Dynamic:
      return RigidBodyDynamicComponent

    case RigidBodyType.Fixed:
      return RigidBodyFixedComponent

    case RigidBodyType.KinematicPositionBased:
      return RigidBodyKinematicPositionBasedComponent

    case RigidBodyType.KinematicVelocityBased:
      return RigidBodyKinematicVelocityBasedComponent
  }
}
