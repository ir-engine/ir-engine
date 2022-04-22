import { Object3D } from 'three'

/**
 * Object3D traverse function with abort ability
 * @param object
 * @param callback
 * @returns
 */
export function traverse(object: Object3D, callback) {
  if (!object) return false

  if (callback(object)) return true
  const children = object.children

  for (let i = 0, l = children.length; i < l; i++) {
    if (traverse(children[i], callback)) return true
  }
}
