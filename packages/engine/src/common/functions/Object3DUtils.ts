import { Matrix4, Object3D, Quaternion, Vector3 } from 'three'

const _v1 = new Vector3()
const _m1 = new Matrix4()

const _pos = new Vector3()
const _scale = new Vector3()
const _quat = new Quaternion()

// A set of Object3D helper functions
export class Object3DUtils {
  /**
   * Updates world matrix of an object and its parents
   * limited by specified levels
   * @param {Object3D} object
   * @param {number} level
   * @returns
   */
  static updateParentsMatrixWorld(object: Object3D | null | undefined, level: number): void {
    if (level > 0) Object3DUtils.updateParentsMatrixWorld(object?.parent, level - 1)

    if (!object) return

    object.updateMatrix()
    object.matrixWorldNeedsUpdate = false

    if (!object.parent) {
      object.matrixWorld.copy(object.matrix)
    } else {
      object.matrixWorld.multiplyMatrices(object.parent.matrixWorld, object.matrix)
    }
  }

  /**
   * Extracts the quaternion part of the object's matrixWorld.
   * Does not update the matrix chain
   * @param {Object3D} object
   * @param {Quaternion} outQuaternion
   */
  static getWorldQuaternion(object: Object3D, outQuaternion: Quaternion): Quaternion {
    const te = object.matrixWorld.elements

    let sx = _v1.set(te[0], te[1], te[2]).length()
    const sy = _v1.set(te[4], te[5], te[6]).length()
    const sz = _v1.set(te[8], te[9], te[10]).length()

    // if determine is negative, we need to invert one scale
    const det = object.matrixWorld.determinant()
    if (det < 0) sx = -sx

    // scale the rotation part
    _m1.copy(object.matrixWorld)

    const invSX = 1 / sx
    const invSY = 1 / sy
    const invSZ = 1 / sz

    _m1.elements[0] *= invSX
    _m1.elements[1] *= invSX
    _m1.elements[2] *= invSX

    _m1.elements[4] *= invSY
    _m1.elements[5] *= invSY
    _m1.elements[6] *= invSY

    _m1.elements[8] *= invSZ
    _m1.elements[9] *= invSZ
    _m1.elements[10] *= invSZ

    outQuaternion.setFromRotationMatrix(_m1)

    return outQuaternion
  }

  /**
   * Extracts the scale part of the object's matrixWorld.
   * Does not update the matrix chain
   * @param {Object3D} object
   * @param {Quaternion} outQuaternion
   */
  static getWorldScale(object: Object3D, outVector: Vector3): Vector3 {
    const te = object.matrixWorld.elements

    let sx = _v1.set(te[0], te[1], te[2]).length()
    const sy = _v1.set(te[4], te[5], te[6]).length()
    const sz = _v1.set(te[8], te[9], te[10]).length()

    // if determine is negative, we need to invert one scale
    const det = object.matrixWorld.determinant()
    if (det < 0) sx = -sx

    outVector.x = sx
    outVector.y = sy
    outVector.z = sz

    return outVector
  }

  /**
   * Extracts the position part of the object's matrixWorld.
   * Does not update the matrix chain
   * @param {Object3D} object
   * @param {Vector3} outPosition
   */
  static getWorldPosition(object: Object3D, outPosition: Vector3): Vector3 {
    outPosition.x = object.matrixWorld.elements[12]
    outPosition.y = object.matrixWorld.elements[13]
    outPosition.z = object.matrixWorld.elements[14]
    return outPosition
  }

  /**
   * Premultiplies a world-space quaternion with object's quaternion
   * @param {Object3D} object
   * @param {Quaternion} quaternion
   */
  static premultiplyWorldQuaternion(object: Object3D, quaternion: Quaternion) {
    Object3DUtils.getWorldQuaternion(object, object.quaternion)
    object.quaternion.premultiply(quaternion)
    Object3DUtils.worldQuaternionToLocal(object.quaternion, object.parent)
  }

  /**
   * Converts a world-space quaternion to local-space
   * @param {Quaternion} quaternion
   * @param {Object3D} parent
   */
  static worldQuaternionToLocal(quaternion: Quaternion, parent: Object3D | null): Quaternion {
    if (!parent) return quaternion
    const parentQuatInverse = Object3DUtils.getWorldQuaternion(parent, _quat).invert()
    quaternion.premultiply(parentQuatInverse)
    return quaternion
  }

  /**
   * Object3D traverse function with abort ability
   * @param object
   * @param callback
   * @returns
   */
  static traverse(object: Object3D, callback) {
    if (!object) return false

    if (callback(object)) return true
    const children = object.children

    for (let i = 0, l = children.length; i < l; i++) {
      if (Object3DUtils.traverse(children[i], callback)) return true
    }
  }

  /**
   * Finds the topmost object in the Object3D hierarchy
   * @param object
   * @returns
   */
  static findRoot(object: Object3D) {
    if (!object) return null
    let node = object
    while (node.parent) {
      node = node.parent
    }
    return node
  }
}
