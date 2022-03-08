import { Quaternion, Vector3 } from 'three'

import { isKinematicBody } from '../classes/Physics'

export const teleportRigidbody = (body: PhysX.PxRigidActor, translation: Vector3, rotation?: Quaternion) => {
  const currentPose = body.getGlobalPose()
  currentPose.translation.x = translation.x
  currentPose.translation.y = translation.y
  currentPose.translation.z = translation.z
  if (rotation) {
    currentPose.rotation.x = rotation.x
    currentPose.rotation.y = rotation.y
    currentPose.rotation.z = rotation.z
    currentPose.rotation.w = rotation.w
  }

  if (isKinematicBody(body)) {
    ;(body as PhysX.PxRigidDynamic).setKinematicTarget(currentPose)
  }

  body.setGlobalPose(currentPose, true)
}
