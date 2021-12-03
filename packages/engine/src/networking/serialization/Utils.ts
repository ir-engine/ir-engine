import { TypedArray } from 'bitecs'
import { Entity } from '../../ecs/classes/Entity'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { ViewCursor } from './ViewCursor'

export type Vector3SoA = {
  x: Float32Array
  y: Float32Array
  z: Float32Array
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
