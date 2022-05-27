import {
  AudioListener,
  BufferGeometry,
  Euler,
  Mesh,
  Object3D,
  PositionalAudio,
  Quaternion,
  Vector2,
  Vector3
} from 'three'
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

const _position = new Vector3()
const _quaternion = new Quaternion()
const _scale = new Vector3()
const _orientation = new Vector3()

AudioListener.prototype.updateMatrixWorld = function (force) {
  Object3D.prototype.updateMatrixWorld.call(this, force)

  const listener = this.context.listener
  if (this.context.state !== 'running') return

  const up = this.up

  this.timeDelta = this._clock.getDelta()

  this.matrixWorld.decompose(_position, _quaternion, _scale)

  _orientation.set(0, 0, -1).applyQuaternion(_quaternion)

  if (listener.positionX) {
    // code path for Chrome (see #14393)

    const endTime = this.context.currentTime + this.timeDelta

    listener.positionX.linearRampToValueAtTime(_position.x, endTime)
    listener.positionY.linearRampToValueAtTime(_position.y, endTime)
    listener.positionZ.linearRampToValueAtTime(_position.z, endTime)
    listener.forwardX.linearRampToValueAtTime(_orientation.x, endTime)
    listener.forwardY.linearRampToValueAtTime(_orientation.y, endTime)
    listener.forwardZ.linearRampToValueAtTime(_orientation.z, endTime)
    listener.upX.linearRampToValueAtTime(up.x, endTime)
    listener.upY.linearRampToValueAtTime(up.y, endTime)
    listener.upZ.linearRampToValueAtTime(up.z, endTime)
  } else {
    listener.setPosition(_position.x, _position.y, _position.z)
    listener.setOrientation(_orientation.x, _orientation.y, _orientation.z, up.x, up.y, up.z)
  }
}

PositionalAudio.prototype.updateMatrixWorld = function (force) {
  Object3D.prototype.updateMatrixWorld.call(this, force)

  if (this.context.state !== 'running') return

  if (this.hasPlaybackControl === true && this.isPlaying === false) return

  this.matrixWorld.decompose(_position, _quaternion, _scale)

  _orientation.set(0, 0, 1).applyQuaternion(_quaternion)

  const panner = this.panner

  if (panner.positionX) {
    // code path for Chrome and Firefox (see #14393)

    const endTime = this.context.currentTime + this.listener.timeDelta

    panner.positionX.linearRampToValueAtTime(_position.x, endTime)
    panner.positionY.linearRampToValueAtTime(_position.y, endTime)
    panner.positionZ.linearRampToValueAtTime(_position.z, endTime)
    panner.orientationX.linearRampToValueAtTime(_orientation.x, endTime)
    panner.orientationY.linearRampToValueAtTime(_orientation.y, endTime)
    panner.orientationZ.linearRampToValueAtTime(_orientation.z, endTime)
  } else {
    panner.setPosition(_position.x, _position.y, _position.z)
    panner.setOrientation(_orientation.x, _orientation.y, _orientation.z)
  }
}
