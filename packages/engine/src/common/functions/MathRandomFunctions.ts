import { Euler, Quaternion, Vector3 } from 'three'
import assert from 'assert'

export const randomVector3 = (scale = 1) => {
  return new Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2)
    .normalize()
    .multiplyScalar(scale)
}

export const randomQuat = () => {
  return new Quaternion().setFromUnitVectors(new Vector3(), randomVector3())
}

export const compareArrays = (arr1, arr2, tolerance) => {
  if (tolerance) {
    arr1.forEach((val, i) => {
      assert(Math.abs(arr2[i] - val) < tolerance)
    })
  } else {
    arr1.forEach((val, i) => {
      assert.equal(val, arr2[i])
    })
  }
}

export const eulerToQuaternion = (x, y, z, order = 'XYZ') => {
  return new Quaternion().setFromEuler(new Euler(x, y, z, order))
}

const RND_BASIS = 0x100000000

/** Generate random Id */
export function randomId(): string {
  return Math.random().toString(36).substr(2, 6)
}

/**
 * Create pseudo random number from seed
 * @param s Seed
 * @returns Function to generate pseudo random numbers.
 */
export function createPseudoRandom(s): Function {
  let seed = s || Math.random() * RND_BASIS

  return () => {
    seed = (1664525 * seed + 1013904223) % RND_BASIS
    return seed / RND_BASIS
  }
}

/**
 * Generate random number between 2 numbers
 * @param min
 * @param max
 * @param rndFn Random function to be used to generate random number.
 * @returns Random number between min and max limit.
 */
export function randomNumber(min, max, rndFn = Math.random) {
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
