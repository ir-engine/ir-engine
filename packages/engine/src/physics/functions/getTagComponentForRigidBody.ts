import { RigidBody, RigidBodyType } from '@dimforge/rapier3d-compat'

import { RigidBodyDynamicTagComponent } from '../components/RigidBodyDynamicTagComponent'
import { RigidBodyFixedTagComponent } from '../components/RigidBodyFixedTagComponent'
import { RigidBodyKinematicPositionBasedTagComponent } from '../components/RigidBodyKinematicPositionBasedTagComponent'
import { RigidBodyKinematicVelocityBasedTagComponent } from '../components/RigidBodyKinematicVelocityBasedTagComponent'

type RigidBodyTypes =
  | typeof RigidBodyDynamicTagComponent
  | typeof RigidBodyFixedTagComponent
  | typeof RigidBodyKinematicPositionBasedTagComponent
  | typeof RigidBodyKinematicVelocityBasedTagComponent

export const getTagComponentForRigidBody = (rigidBody: RigidBody): RigidBodyTypes => {
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
