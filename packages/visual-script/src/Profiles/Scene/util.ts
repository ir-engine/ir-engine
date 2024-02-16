import { Quaternion, Vector3, Vector4 } from 'three'

import { Vec3 } from './Values/Internal/Vec3.js'
import { Vec4 } from './Values/Internal/Vec4.js'

export function toVec3(value: Vector3): Vec3 {
  return new Vec3(value.x, value.y, value.z)
}

export function toVec4(value: Vector4 | Quaternion): Vec4 {
  return new Vec4(value.x, value.y, value.z, value.w)
}

export function toVector3(value: Vec3): Vector3 | null {
  return value ? new Vector3(value.x, value.y, value.z) : null
}

export function toVector4(value: Vec4): Vector4 | null {
  return value ? new Vector4(value.x, value.y, value.z, value.w) : null
}

export function toQuat(value: Vec4): Quaternion | null {
  return value ? new Quaternion(value.x, value.y, value.z, value.w) : null
}
