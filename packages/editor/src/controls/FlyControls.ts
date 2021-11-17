import { ActionSets, FlyActionSet, FlyMapping } from './input-mappings'
import { Vector3, Matrix4, Quaternion, MathUtils, PerspectiveCamera } from 'three'
import InputManager from './InputManager'
import { addInputActionMapping, getInput, removeInputActionMapping } from '../functions/parseInputActionMapping'

const EPSILON = 10e-5
const UP = new Vector3(0, 1, 0)
const IDENTITY = new Matrix4().identity()
const vec = new Vector3()
const quat = new Quaternion()
const worldPos = new Vector3()
const worldQuat = new Quaternion()
const worldScale = new Vector3()
const candidateWorldQuat = new Quaternion()
const parentInverse = new Matrix4()

export class FlyControls {
  enabled: boolean
  camera: any
  inputManager: InputManager
  moveSpeed: number
  boostSpeed: number
  lookSensitivity: number
  maxXRotation: any
  direction: Vector3
  onMouseUp: (e: any) => void
  constructor(camera: PerspectiveCamera, inputManager: InputManager) {
    this.enabled = false
    this.camera = camera
    this.inputManager = inputManager
    this.moveSpeed = 2
    this.boostSpeed = 2
    this.lookSensitivity = 10
    this.maxXRotation = MathUtils.degToRad(80)
    this.direction = new Vector3()
    this.onMouseUp = (e) => {
      if (this.enabled && e.button === 2) {
        if (document.pointerLockElement === this.inputManager.canvas) {
          document.exitPointerLock()
        }
      }
    }
  }
  enable() {
    this.enabled = true
    addInputActionMapping(ActionSets.FLY, FlyMapping)
    this.inputManager.canvas.addEventListener('mouseup', this.onMouseUp)
  }
  disable() {
    this.enabled = false
    removeInputActionMapping(ActionSets.FLY)
    this.inputManager.canvas.removeEventListener('mouseup', this.onMouseUp)
  }
  update(dt) {
    if (!this.enabled) return
    const input = this.inputManager
    // assume that this.camera[position,quaterion/rotation,scale] are authority
    this.camera.updateMatrix()
    this.camera.updateMatrixWorld()
    this.camera.matrixWorld.decompose(worldPos, worldQuat, worldScale)
    // rotate about the camera's local x axis
    candidateWorldQuat.multiplyQuaternions(
      quat.setFromAxisAngle(
        vec.set(1, 0, 0).applyQuaternion(worldQuat),
        getInput(FlyActionSet.lookY) * this.lookSensitivity
      ),
      worldQuat
    )
    // check change of local "forward" and "up" to disallow flipping
    const camUpY = vec.set(0, 1, 0).applyQuaternion(worldQuat).y
    const newCamUpY = vec.set(0, 1, 0).applyQuaternion(candidateWorldQuat).y
    const newCamForwardY = vec.set(0, 0, -1).applyQuaternion(candidateWorldQuat).y
    const extrema = Math.sin(this.maxXRotation)
    const allowRotationInX =
      newCamUpY > 0 && ((newCamForwardY < extrema && newCamForwardY > -extrema) || newCamUpY > camUpY)
    if (allowRotationInX) {
      this.camera.matrixWorld.compose(worldPos, candidateWorldQuat, worldScale)
      // assume that if camera.parent exists, its matrixWorld is up to date
      parentInverse.copy(this.camera.parent ? this.camera.parent.matrixWorld : IDENTITY).invert()
      this.camera.matrix.multiplyMatrices(parentInverse, this.camera.matrixWorld)
      this.camera.matrixWorld.decompose(this.camera.position, this.camera.quaternion, this.camera.scale)
    }
    this.camera.matrixWorld.decompose(worldPos, worldQuat, worldScale)
    // rotate about the world y axis
    candidateWorldQuat.multiplyQuaternions(
      quat.setFromAxisAngle(UP, getInput(FlyActionSet.lookX) * this.lookSensitivity),
      worldQuat
    )
    this.camera.matrixWorld.compose(worldPos, candidateWorldQuat, worldScale)
    this.camera.matrix.multiplyMatrices(parentInverse, this.camera.matrixWorld)
    this.camera.matrix.decompose(this.camera.position, this.camera.quaternion, this.camera.scale)
    // translate
    this.direction.set(getInput(FlyActionSet.moveX), 0, getInput(FlyActionSet.moveZ))
    const boostSpeed = getInput(FlyActionSet.boost) ? this.boostSpeed : 1
    const speed = dt * this.moveSpeed * boostSpeed
    if (this.direction.lengthSq() > EPSILON) {
      this.camera.translateOnAxis(this.direction, speed)
    }
    this.camera.position.y += getInput(FlyActionSet.moveY) * dt * this.moveSpeed * boostSpeed
  }
  dispose() {
    this.inputManager.canvas.removeEventListener('mouseup', this.onMouseUp)
  }
}
