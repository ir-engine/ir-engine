import { Euler, Quaternion, Vector3 } from 'three'

export const Deg2Rad = (Math.PI * 2) / 360
export const Rad2Deg = 1 / Deg2Rad

/**
 * @deprecated creates new vector3
 * */
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

export const lookAt = (position: Vector3, rotation: Quaternion, targetPos: Vector3): number => {
  const x = targetPos.x - position.x
  const y = targetPos.z - position.z
  let angle = Math.atan2(x, y)
  angle *= Rad2Deg
  return angle
}

/**
 * @deprecated creates new euler and quaternion
 * */
export const rotate = (rot: Quaternion, x: number, y: number, z: number) => {
  return rot.multiply(eulerToQuaternion(x, y, z))
}

/**
 * @deprecated creates new euler and quaternion
 * */
export const eulerToQuaternion = (x, y, z, order = 'XYZ') => {
  return new Quaternion().setFromEuler(new Euler(x, y, z, order))
}

export const isZero = (v: Vector3): boolean => {
  return v.x === 0 && v.y === 0 && v.z === 0
}

// https://stats.stackexchange.com/questions/70801/how-to-normalize-data-to-0-1-range
export const normalizeRange = (val, rangeMin, rangeMax) => {
  return (val - rangeMin) / (rangeMax - rangeMin)
}

// bank
export function pitchFromQuaternion(q: Quaternion) {
  const wx = q.w * q.x
  const yz = q.y * q.z
  const x2 = q.x * q.x
  const y2 = q.y * q.y
  const result = Math.atan2(2 * (wx + yz), 1 - 2 * (x2 + y2))
  return result
}

// attitude:  rotation about the new Y-axis (z-up)
export function rollFromQuaternion(q: Quaternion): number {
  const wy = q.w * q.y
  const zx = q.z * q.x
  const result = Math.asin(2 * (wy - zx))
  return result
}

// heading: rotation about the Z-axis (z up)
export function yawFromQuaternion(q: Quaternion): number {
  const wz = q.w * q.z
  const xy = q.x * q.y
  const y2 = q.y * q.y
  const z2 = q.z * q.z
  const result = Math.atan2(2 * (wz + xy), 1 - 2 * (y2 + z2))
  return result
}

/**
 * ==============
 * Random Numbers
 * ==============
 */

export const randomVector3 = (scale = 1) => {
  return new Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2)
    .normalize()
    .multiplyScalar(scale)
}

export const randomQuat = () => {
  return new Quaternion().setFromUnitVectors(new Vector3(), randomVector3())
}

const RND_BASIS = 0x100000000

/**
 * Create pseudo random number from seed
 * @param seed Seed
 * @returns Function to generate pseudo random numbers.
 */
export function createPseudoRandom(seed: number): Function {
  let _seed = seed || Math.random() * RND_BASIS

  return () => {
    _seed = (1664525 * _seed + 1013904223) % RND_BASIS
    return _seed / RND_BASIS
  }
}

/**
 * Generate random number between 2 numbers
 * @param min
 * @param max
 * @param rndFn Random function to be used to generate random number.
 * @returns Random number between min and max limit.
 */
export function randomNumber(min: number, max: number, rndFn = Math.random) {
  if (typeof min === 'undefined') return undefined
  if (typeof max === 'undefined') return min

  return rndFn() * (max - min) + min
}

/**
 * Generate an Object with keys filled with random number, object or array.
 * All keys of the min object will be added into generated object.
 * @param min
 * @param max
 * @param rndFn Random function to be used to generate random number.
 * @returns Object with keys filled with random number.
 */
export function randomObject(min, max, rndFn = Math.random): any {
  if (!min) return {}
  if (!max) return min

  const v = {}
  for (const k in min) {
    const typeofMin = typeof min[k]
    if (Array.isArray(min[k])) {
      v[k] = randomArray(min[k], max[k], rndFn)
    } else if (typeofMin === 'object') {
      v[k] = randomObject(min[k], max[k], rndFn)
    } else if (typeofMin === 'number') {
      v[k] = randomNumber(min[k], max[k], rndFn)
    } else {
      v[k] = min[k]
    }
  }
  return v
}

/**
 * Generate an array with random elements.
 * @param min
 * @param max
 * @param rndFn Random function to be used to generate random number.
 * @returns Array with random elements.
 */
export function randomArray(min, max, rndFn = Math.random) {
  if (!min) return []
  if (!max) return min

  const n = min.length
  const v = Array(n)
  for (let i = 0; i < n; i++) {
    const typeofMin = typeof min[i]
    if (Array.isArray(min[i])) {
      v[i] = randomArray(min[i], max[i], rndFn)
    } else if (typeofMin === 'object') {
      v[i] = randomObject(min[i], max[i], rndFn)
    } else if (typeofMin === 'number') {
      v[i] = randomNumber(min[i], max[i], rndFn)
    } else {
      v[i] = min[i]
    }
  }
  return v
}

/**
 * Generate random number, object or array. Type of output will be same as type of min.
 * @param min min value. Type of min will decide what to return.
 * @param max
 * @param rndFn Random function to be used to generate random number.
 * @returns Random number, object or array
 */
export function randomize(min, max, rndFn = Math.random) {
  const typeofMin = typeof min
  if (Array.isArray(min)) {
    return randomArray(min, max, rndFn)
  } else if (typeofMin === 'object') {
    return randomObject(min, max, rndFn)
  } else if (typeofMin === 'number') {
    return randomNumber(min, max, rndFn)
  } else {
    return min
  }
}

/** @returns Generate random box offset. */
export const randomBoxOffset = (dx, dy, dz, rndFn = Math.random) => {
  return {
    x: (rndFn() - 0.5) * dx,
    y: (rndFn() - 0.5) * dy,
    z: (rndFn() - 0.5) * dz
  }
}

// https://mathworld.wolfram.com/SpherePointPicking.html
// https://mathworld.wolfram.com/SphericalCoordinates.html
/** @returns Generate random ellipsoid offset. */
export const randomEllipsoidOffset = (rx, ry, rz, rndFn = Math.random) => {
  const theta = rndFn() * 2 * Math.PI
  const phi = Math.acos(2 * rndFn() - 1)
  return {
    x: rx * Math.cos(theta) * Math.sin(phi),
    y: ry * Math.sin(theta) * Math.sin(phi),
    z: rz * Math.cos(phi)
  }
}

/** @returns Generate random sphere offset. */
export const randomSphereOffset = (r, rndFn) => randomEllipsoidOffset(r, r, r, rndFn)
/** @returns Generate random cube offset. */
export const randomCubeOffset = (d, rndFn) => randomBoxOffset(d, d, d, rndFn)

export function getPrependicularVector(dir: Vector3, out: Vector3) {
  const arr = dir.toArray()
  const maxI = arr.indexOf(Math.max(...arr))
  const minI = arr.indexOf(Math.min(...arr))
  const midI = arr.findIndex((v, i) => i != minI && i != maxI)

  let temp = arr[midI]
  arr[midI] = -arr[maxI]
  arr[maxI] = temp
  arr[minI] = 0

  out.fromArray(arr).normalize()
}

const tempVec1 = new Vector3()
const tempVec2 = new Vector3()

// Create cone of normalized vectors around the input vector
// Useful for camera ray tests
export function createConeOfVectors(inputVec: Vector3, outputs: Vector3[], angle: number) {
  if (outputs.length < 1) {
    return
  }

  const dirLen = inputVec.length()
  const rayDelta = (2 * Math.PI) / outputs.length
  const coneRadius = Math.tan(angle) * dirLen

  getPrependicularVector(inputVec, tempVec1)
  tempVec2.crossVectors(inputVec, tempVec1).normalize()

  for (let i = 0; i < outputs.length; i++) {
    const vec = outputs[i]

    vec
      .set(0, 0, 0)
      .addScaledVector(tempVec1, Math.cos(rayDelta * i))
      .addScaledVector(tempVec2, Math.sin(rayDelta * i))
      .multiplyScalar(coneRadius)
      .add(inputVec)
      .normalize()
  }
}

export function easeOutElastic(x: number): number {
  const c4 = (2 * Math.PI) / 5
  return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1
}

export function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3)
}

export function PRNG(seed, modulo) {
  //@ts-ignore
  const str = `${((2 ** 31 - 1) & Math.imul(48271, seed)) / 2 ** 31}`.split('').slice(-10).join('') % modulo
  return str
}

export function SeedRandom(seed) {
  return PRNG(seed, Math.pow(2, 32))
}

export function stringHash(str: string) {
  var hash = 0,
    i,
    chr
  if (str.length === 0) return hash
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}
