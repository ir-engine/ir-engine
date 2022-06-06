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
// is multiplied by this number prior to storing the result. Doing this allows
// us to retain three decimal places.
export const FLOAT_PRECISION_MULT = 1000

// If v is the absolute value of the largest quaternion component, the next largest possible component value occurs
// when two components have the same absolute value and the other two components are zero.
// The length of that quaternion (v,v,0,0) is 1, therefore v^2 + v^2 = 1, 2v^2 = 1, v = 1/sqrt(2).
// This means you can encode the smallest three components in [-0.707107,+0.707107] instead of [-1,+1]
// giving more precision with the same number of bits.
export const QUAT_MAX_RANGE = 1 / Math.sqrt(2)

/**
 * This function compresses the number to 10bits. Where 9bits are precision bits and the 10th bit is used for storing sign.
 * If number is negative, sign bit will be 1.
 * @author Hamza Mushtaq <hamzzam@github>
 */
export const compress = (value: number) => {
  const valueWriteMask = 0b00000000000000000000000111111111
  const signBitWriteMask = 0b00000000000000000000001000000000

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
 * This function is used to expand number compressed to to 10bits using the compress function.
 * @author Hamza Mushtaq <hamzzam@github>
 */
export const expand = (compressedBinaryData: number) => {
  const valueReadMask = 0b00000000000000000000000111111111
  const signBitReadMask = 0b00000000000000000000001000000000

  let value = compressedBinaryData & valueReadMask
  let signBit = compressedBinaryData & signBitReadMask
  if (signBit) {
    value *= -1
  }

  return value
}
