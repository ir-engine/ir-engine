import { Camera, Quaternion, Vector3 } from 'three'

const vec3_getInputVector = new Vector3()
const vec3_getCameraDirection = new Vector3()
const quat = new Quaternion()
// Use constant
const forward = new Vector3(0, 0, 1)

function getCameraDirection(camera: Camera) {
  camera.getWorldDirection(vec3_getCameraDirection)

  vec3_getCameraDirection.setY(0).normalize()
  quat.setFromUnitVectors(forward, vec3_getCameraDirection)
  return quat
}

export function getInputVector(target: Vector3, position: Vector3, camera: Camera) {
  console.log({ target, position })
  return vec3_getInputVector
    .set(target.z - position.z, target.x - position.x, target.y - position.y)
    .normalize()
    .applyQuaternion(getCameraDirection(camera).invert())
}
