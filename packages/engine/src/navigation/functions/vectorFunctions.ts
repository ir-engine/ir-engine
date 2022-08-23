import { Quaternion, Vector3 } from 'three'

const vec3 = new Vector3()

export function getMovementDirection(target: Vector3, origin: Vector3) {
  vec3.copy(target).sub(origin).normalize()

  vec3.setY(0)
  return vec3
}
