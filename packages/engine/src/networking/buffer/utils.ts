import type { BufferView } from './types'

/**
 * Test if an entity is an plain object.
 * @param value Value to be tested.
 */
export function isObject<T extends Record<any, any>>(value: any): value is T {
  return typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype
}

/**
 * Test if an entity is an object that implements the BufferView interface.
 * @param value
 */
export function isBufferView(value: any): value is BufferView {
  return value && typeof value.type === 'string' && typeof value.bytes === 'number'
}
