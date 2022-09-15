import { Quaternion, Vector3 } from 'three'
import { Vector3 as YukaVector3 } from 'yuka'

const vec3 = new Vector3()

export function getMovementDirection(target: Vector3, origin: Vector3) {
  vec3.copy(target).sub(origin).normalize()

  // TODO this needs to change for paths in 3D
  vec3.setY(0)
  return vec3
}

// TODO Use Matrix4 instead
export function applyTransform({
  position,
  rotation,
  scale
}: {
  position: Vector3
  rotation: Quaternion
  scale: Vector3
}) {
  return (source: Vector3, target: Vector3) => {
    return target.copy(source).applyQuaternion(rotation).multiply(scale).add(position)
  }
}

export function toYukaVector(v: Vector3): YukaVector3 {
  return new YukaVector3().copy(v as any)
}

export function fromYukaVector(v: YukaVector3): Vector3 {
  return new Vector3().copy(v as any)
}
