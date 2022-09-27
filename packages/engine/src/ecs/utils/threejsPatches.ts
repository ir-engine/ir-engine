import * as THREE from 'three'
import { BufferGeometry, Euler, Mesh, Object3D, Quaternion, Vector2, Vector3 } from 'three'
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh'

import { Object3DUtils } from '../../common/functions/Object3DUtils'

//@ts-ignore
Vector3.prototype.toJSON = function () {
  return { x: this.x, y: this.y, z: this.z }
}
//@ts-ignore
Vector2.prototype.toJSON = function () {
  return { x: this.x, y: this.y }
}

//@ts-ignore
Quaternion.prototype.toJSON = function () {
  return { x: this._x, y: this._y, z: this._z, w: this._w }
}

//@ts-ignore
Euler.prototype.toJSON = function () {
  return { x: this._x, y: this._y, z: this._z, order: this._order }
}

Mesh.prototype.raycast = acceleratedRaycast
BufferGeometry.prototype['disposeBoundsTree'] = disposeBoundsTree
BufferGeometry.prototype['computeBoundsTree'] = computeBoundsTree

declare module 'three/src/core/Object3D' {
  export interface Object3D {
    matrixWorldAutoUpdate: boolean
  }
}

/**
 * Since we have complete control over matrix updates, we know that at any given point
 *  in execution time if the matrix will be up to date or a frame late, and we can simply
 *  grab the data we need from the world matrix
 */
Object3D.prototype.getWorldPosition = function (target) {
  return Object3DUtils.getWorldPosition(this, target)
}

Object3D.prototype.getWorldQuaternion = function (target) {
  return Object3DUtils.getWorldQuaternion(this, target)
}

Object3D.prototype.getWorldScale = function (target) {
  return Object3DUtils.getWorldScale(this, target)
}

Object3D.prototype.getWorldDirection = function (target) {
  const e = this.matrixWorld.elements
  return target.set(e[8], e[9], e[10]).normalize()
}

globalThis.THREE = THREE
