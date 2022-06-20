import { RigidBody, RigidBodyType } from '@dimforge/rapier3d-compat'
import { Quaternion, Vector3 } from 'three'

export const isKinematicBody = (body: RigidBody) => {
  return (
    body.bodyType() === RigidBodyType.KinematicPositionBased || body.bodyType() === RigidBodyType.KinematicVelocityBased
  )
}

export const isDynamicBody = (body: RigidBody) => {
  return body.bodyType() === RigidBodyType.Dynamic
}

export const isStaticBody = (body: RigidBody) => {
  return body.bodyType() === RigidBodyType.Fixed
}

export const teleportRigidbody = (body: RigidBody, translation: Vector3, rotation?: Quaternion) => {
  body.setTranslation(translation, true)
  if (rotation) body.setRotation(rotation, true)
}
