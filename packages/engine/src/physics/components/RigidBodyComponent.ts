import { RigidBody, RigidBodyType } from '@dimforge/rapier3d-compat'
import { Types } from 'bitecs'
import { Quaternion, Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

interface RigidBodyComponentType {
  body: RigidBody
  previousPosition: Vector3
  previousRotation: Quaternion
  previousLinearVelocity: Vector3
  previousAngularVelocity: Vector3
}

const { f32 } = Types
const Vector3Schema = { x: f32, y: f32, z: f32 }
const QuaternionSchema = { x: f32, y: f32, z: f32, w: f32 }
const SCHEMA = {
  previousPosition: Vector3Schema,
  previousRotation: QuaternionSchema,
  previousLinearVelocity: Vector3Schema,
  previousAngularVelocity: Vector3Schema
}

export const RigidBodyComponent = createMappedComponent<RigidBodyComponentType, typeof SCHEMA>(
  'RigidBodyComponent',
  SCHEMA
)
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
