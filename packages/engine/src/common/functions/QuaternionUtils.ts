/** Interface for quaternion Axis. */
export interface quatAxis {
  x: number
  y: number
  z: number
  w: number
}

export function vector4ArrayToAxisObject(q: number[]): quatAxis {
  // TODO: different orders
  return {
    x: q[0],
    y: q[2], // three has y/z axis swapped from standard math orientation
    z: q[1],
    w: q[3]
  }
}

// bank
export function pitchFromQuaternion(q: number[]): number {
  const a = vector4ArrayToAxisObject(q)
  const wx = a.w * a.x
  const yz = a.y * a.z
  const x2 = a.x * a.x
  const y2 = a.y * a.y

  const result = Math.atan2(2 * (wx + yz), 1 - 2 * (x2 + y2))
  return result
}

// attitude:  rotation about the new Y-axis (z-up)
export function rollFromQuaternion(q: number[]): number {
  const a = vector4ArrayToAxisObject(q)
  const wy = a.w * a.y
  const zx = a.z * a.x

  const result = Math.asin(2 * (wy - zx))
  return result
}

// heading: rotation about the Z-axis (z up)
export function yawFromQuaternion(q: number[]): number {
  const a = vector4ArrayToAxisObject(q)
  const wz = a.w * a.z
  const xy = a.x * a.y
  const y2 = a.y * a.y
  const z2 = a.z * a.z

  const result = Math.atan2(2 * (wz + xy), 1 - 2 * (y2 + z2))
  return result
}
