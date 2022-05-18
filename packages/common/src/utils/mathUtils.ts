import { Euler, Quaternion, Vector3 } from 'three'

export const forwardVector3: Vector3 = new Vector3(0, 0, 1)
export const kEpsilon = 0.00001

export const Deg2Rad = () => {
  return (Math.PI * 2) / 360
}
export const Rad2Deg = () => {
  return 1 / Deg2Rad()
}

export const multiplyQuaternion = (q: Quaternion, v: Vector3): Vector3 => {
  const x = q.x * 2
  const y = q.y * 2
  const z = q.z * 2
  const xx = q.x * x
  const yy = q.y * y
  const zz = q.z * z
  const xy = q.x * y
  const xz = q.x * z
  const yz = q.y * z
  const wx = q.w * x
  const wy = q.w * y
  const wz = q.w * z

  const res = new Vector3(0, 0, 0)
  res.x = (1 - (yy + zz)) * v.x + (xy - wz) * v.y + (xz + wy) * v.z
  res.y = (xy + wz) * v.x + (1 - (xx + zz)) * v.y + (yz - wx) * v.z
  res.z = (xz - wy) * v.x + (yz + wx) * v.y + (1 - (xx + yy)) * v.z
  return res
}
export const subVector = (a: Vector3, b: Vector3): Vector3 => {
  return new Vector3(a.x - b.x, a.y - b.y, a.z - b.z)
}
export const multiplyVector = (v: Vector3, f: number): Vector3 => {
  return new Vector3(v.x * f, v.y * f, v.z * f)
}
export const normalize = (v: Vector3): Vector3 => {
  const mag = magnitude(v)
  if (mag > kEpsilon) return multiplyVector(v, 1 / mag)
  else return new Vector3(0, 0, 0)
}
export const magnitude = (v: Vector3): number => {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
}

export const getForward = (q: Quaternion): Vector3 => {
  return multiplyQuaternion(q, forwardVector3)
}

export const positionBehind = (position: Vector3, rotation: Quaternion, distance: number): Vector3 => {
  return subVector(position, multiplyVector(getForward(rotation), distance))
}

export const lookAt = (position: Vector3, rotation: Quaternion, targetPos: Vector3): number => {
  const x = targetPos.x - position.x
  const y = targetPos.z - position.z
  let angle = Math.atan2(x, y)
  angle *= Rad2Deg()
  return angle
}

export const rotate = (rot: Quaternion, x: number, y: number, z: number) => {
  return rot.multiply(eulerToQuaternion(x, y, z))
}

export const eulerToQuaternion = (x, y, z, order = 'XYZ') => {
  return new Quaternion().setFromEuler(new Euler(x, y, z, order))
}

export const isZero = (v: Vector3): boolean => {
  return v.x === 0 && v.y === 0 && v.z === 0
}
