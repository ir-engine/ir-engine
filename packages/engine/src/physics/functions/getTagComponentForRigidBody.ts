import { RigidBody, RigidBodyType } from '@dimforge/rapier3d-compat'

import { RigidBodyDynamicTagComponent } from '../components/RigidBodyDynamicTagComponent'
import { RigidBodyFixedTagComponent } from '../components/RigidBodyFixedTagComponent'
import { RigidBodyKinematicPositionBasedTagComponent } from '../components/RigidBodyKinematicPositionBasedTagComponent'
import { RigidBodyKinematicVelocityBasedTagComponent } from '../components/RigidBodyKinematicVelocityBasedTagComponent'

export const getTagComponentForRigidBody = (rigidBody: RigidBody) => {
  switch (rigidBody.bodyType()) {
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
