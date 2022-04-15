import { AudioListener, BufferGeometry, Euler, Mesh, Object3D, PositionalAudio, Quaternion, Vector3 } from 'three'
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh'

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
  const up = this.up

  this.timeDelta = this._clock.getDelta()

  this.matrixWorld.decompose(_position, _quaternion, _scale)

  _orientation.set(0, 0, -1).applyQuaternion(_quaternion)

  if (listener.positionX) {
    // code path for Chrome (see #14393)

    const endTime = this.context.currentTime + this.timeDelta

    listener.positionX.setValueAtTime(_position.x, endTime)
    listener.positionY.setValueAtTime(_position.y, endTime)
    listener.positionZ.setValueAtTime(_position.z, endTime)
    listener.forwardX.setValueAtTime(_orientation.x, endTime)
    listener.forwardY.setValueAtTime(_orientation.y, endTime)
    listener.forwardZ.setValueAtTime(_orientation.z, endTime)
    listener.upX.setValueAtTime(up.x, endTime)
    listener.upY.setValueAtTime(up.y, endTime)
    listener.upZ.setValueAtTime(up.z, endTime)
  } else {
    listener.setPosition(_position.x, _position.y, _position.z)
    listener.setOrientation(_orientation.x, _orientation.y, _orientation.z, up.x, up.y, up.z)
  }
}

PositionalAudio.prototype.updateMatrixWorld = function (force) {
  Audio.prototype.updateMatrixWorld.call(this, force)

  if (this.hasPlaybackControl === true && this.isPlaying === false) return

  this.matrixWorld.decompose(_position, _quaternion, _scale)

  _orientation.set(0, 0, 1).applyQuaternion(_quaternion)

  const panner = this.panner

  if (panner.positionX) {
    // code path for Chrome and Firefox (see #14393)

    const endTime = this.context.currentTime + this.listener.timeDelta

    panner.positionX.setValueAtTime(_position.x, endTime)
    panner.positionY.setValueAtTime(_position.y, endTime)
    panner.positionZ.setValueAtTime(_position.z, endTime)
    panner.orientationX.setValueAtTime(_orientation.x, endTime)
    panner.orientationY.setValueAtTime(_orientation.y, endTime)
    panner.orientationZ.setValueAtTime(_orientation.z, endTime)
  } else {
    panner.setPosition(_position.x, _position.y, _position.z)
    panner.setOrientation(_orientation.x, _orientation.y, _orientation.z)
  }
}
