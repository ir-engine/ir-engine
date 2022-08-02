import { BufferGeometry, Euler, Mesh, Quaternion, Vector2, Vector3 } from 'three'
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh'

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
