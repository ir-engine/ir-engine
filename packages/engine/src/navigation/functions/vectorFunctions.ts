import { Quaternion, Vector3 } from 'three'
import { Vector3 as YukaVector3 } from 'yuka'

const vec3 = new Vector3()

export function getMovementDirection(target: Vector3, origin: Vector3) {
  vec3.copy(target).sub(origin).normalize()

  vec3.setY(0)
  return vec3
}

export function applyTransform(p: Vector3, r: Quaternion, s: Vector3) {
  return (source: Vector3, target: Vector3) => {
    return target.copy(source).applyQuaternion(r).multiply(s).add(p)
  }
}

export function toYukaVector(v: Vector3): YukaVector3 {
  return new YukaVector3().copy(v as any)
}

export function fromYukaVector(v: YukaVector3): Vector3 {
  return new Vector3().copy(v as any)
}
