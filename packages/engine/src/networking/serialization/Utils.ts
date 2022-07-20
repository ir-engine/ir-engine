import { Entity } from '../../ecs/classes/Entity'

export type Vector3SoA = {
  x: Float32Array
  y: Float32Array
  z: Float32Array
}

export type Vector4SoA = {
  x: Float32Array
  y: Float32Array
  z: Float32Array
  w: Float32Array
}

/**
 * Creates an internal cache of inputs to outputs for idemponent functions
 *
 * @param fn function to memoize inputs for
 * @returns {function}
 */
const memoize = (fn: Function) => {
  const cache = new Map()
  return (input: any) => {
    if (cache.has(input)) return cache.get(input)
    else {
      const output = fn(input)
      cache.set(input, output)
      return output
    }
  }
}

/**
 * Recursively flattens all of a component's SoA leaf properties into a linear array
 * Function is idemponent, thus safe and efficient to memoize
 *
 * @param  {object} component
 */
export const flatten = memoize((component: any) =>
  // get all props on component
  Object.keys(component)
    // filter out "private" props
    .filter((p) => !p.includes('_'))
    // flatMap props to
    .flatMap((p) => {
      if (!ArrayBuffer.isView(component[p])) {
        return flatten(component[p])
      }
      return component[p]
    })
    .flat()
)

export const getVector4IndexBasedComponentValue = (vector4: Vector4SoA, entity: Entity, index: number) => {
  switch (index) {
    case 0:
      return vector4.x[entity]
    case 1:
      return vector4.y[entity]
    case 2:
      return vector4.z[entity]
    case 3:
      return vector4.w[entity]

    default:
      console.error('Vector4SOA tried to read with out of bounds index')
      break
  }
}

// Used when compressing float values, where the decimal portion of the floating point value
// is multiplied by this number prior to storing the result.
export const QUAT_PRECISION_MULT = 1000
export const VEC3_PRECISION_MULT = 1000

// If v is the absolute value of the largest quaternion component, the next largest possible component value occurs
// when two components have the same absolute value and the other two components are zero.
// The length of that quaternion (v,v,0,0) is 1, therefore v^2 + v^2 = 1, 2v^2 = 1, v = 1/sqrt(2).
// This means you can encode the smallest three components in [-0.707107,+0.707107] instead of [-1,+1]
// giving more precision with the same number of bits.
export const QUAT_MAX_RANGE = 1 / Math.sqrt(2)

export const VEC3_MAX_RANGE = 1 / 32

/**
 * This function compresses the number to specified number of bits. E.g if 10 bits are to be used then 9bits are precision bits and the 10th bit is used for storing sign.
 * If number is negative, sign bit will be 1.
 */
export const compress = (value: number, numOfBitsToUse: number) => {
  const signBitWriteMask = Math.pow(2, numOfBitsToUse - 1)
  const valueWriteMask = signBitWriteMask - 1

  let signBit = 0
  if (value < 0) {
    signBit = 1
    value = Math.abs(value)
  }
  value &= valueWriteMask
  signBit ? (value |= signBitWriteMask) : 0

  return value
}

/**
 * This function is used to expand number compressed using the compress function. Same number of bits must be specified as used when compressing the number.
 */
export const expand = (compressedBinaryData: number, numOfBitsToUse: number) => {
  const signBitReadMask = Math.pow(2, numOfBitsToUse - 1)
  const valueReadMask = signBitReadMask - 1

  let value = compressedBinaryData & valueReadMask
  let signBit = compressedBinaryData & signBitReadMask
  if (signBit) {
    value *= -1
  }

  return value
}
