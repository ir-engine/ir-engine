import { Euler, Matrix4, Quaternion, Vector3 } from "three"
import { Helpers } from "./Helpers"

const zeroVector = new Vector3()
const forwardVector = new Vector3(0, 0, 1)
const leftRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)
const rightRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2)
const bankLeftRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2)
const bankRightRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), -Math.PI / 2)
const z180Quaternion = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI)

const localVector = new Vector3()
const localVector2 = new Vector3()
const localVector3 = new Vector3()
const localVector4 = new Vector3()
const localVector5 = new Vector3()
const localVector6 = new Vector3()
const localQuaternion = new Quaternion()
const localQuaternion2 = new Quaternion()
const localQuaternion3 = new Quaternion()
const localEuler = new Euler()
const localMatrix = new Matrix4()

class VRArmIK {
  arm: any
  shoulder: any
  shoulderPoser: any
  target: any
  left: any
  upperArmLength: number
  lowerArmLength: number
  armLength: number
  constructor(arm, shoulder, shoulderPoser, target, left) {
    this.arm = arm
    this.shoulder = shoulder
    this.shoulderPoser = shoulderPoser
    this.target = target
    this.left = left

    this.upperArmLength = 0
    this.lowerArmLength = 0
    this.armLength = 0
  }

  Start() {
    this.upperArmLength = Helpers.getWorldPosition(this.arm.lowerArm, localVector).distanceTo(
      Helpers.getWorldPosition(this.arm.upperArm, localVector2)
    )
    this.lowerArmLength = Helpers.getWorldPosition(this.arm.hand, localVector).distanceTo(
      Helpers.getWorldPosition(this.arm.lowerArm, localVector2)
    )
    this.armLength = this.upperArmLength + this.lowerArmLength
  }

  Update() {
    Helpers.updateMatrixWorld(this.arm.transform)
    Helpers.updateMatrixWorld(this.arm.upperArm)

    const upperArmPosition = Helpers.getWorldPosition(this.arm.upperArm, localVector)
    const handRotation = this.target.quaternion
    const handPosition = localVector2.copy(this.target.position)

    const shoulderRotation = Helpers.getWorldQuaternion(this.shoulder.transform, localQuaternion)
    const shoulderRotationInverse = localQuaternion2.copy(shoulderRotation).invert()

    const hypotenuseDistance = this.upperArmLength
    const directDistance = upperArmPosition.distanceTo(handPosition) / 2
    const offsetDistance =
      hypotenuseDistance > directDistance
        ? Math.sqrt(hypotenuseDistance * hypotenuseDistance - directDistance * directDistance)
        : 0
    const offsetDirection = localVector3
      .copy(handPosition)
      .sub(upperArmPosition)
      .normalize()
      .cross(localVector4.set(-1, 0, 0).applyQuaternion(shoulderRotation))

    const targetEuler = localEuler.setFromQuaternion(
      localQuaternion3.multiplyQuaternions(handRotation, shoulderRotationInverse).premultiply(z180Quaternion),
      "XYZ"
    )
    if (this.left) {
      const yFactor = Math.min(Math.max((targetEuler.y + Math.PI * 0.1) / (Math.PI / 2), 0), 1)
      targetEuler.z = Math.min(Math.max(targetEuler.z, -Math.PI / 2), 0)
      targetEuler.z = targetEuler.z * (1 - yFactor) + (-Math.PI / 2) * yFactor
    } else {
      const yFactor = Math.min(Math.max((-targetEuler.y - Math.PI * 0.1) / (Math.PI / 2), 0), 1)
      targetEuler.z = Math.min(Math.max(targetEuler.z, 0), Math.PI / 2)
      targetEuler.z = targetEuler.z * (1 - yFactor) + (Math.PI / 2) * yFactor
    }
    offsetDirection
      .applyQuaternion(shoulderRotationInverse)
      .applyAxisAngle(forwardVector, targetEuler.z)
      .applyQuaternion(shoulderRotation)

    const elbowPosition = localVector4
      .copy(upperArmPosition)
      .add(handPosition)
      .divideScalar(2)
      .add(localVector5.copy(offsetDirection).multiplyScalar(offsetDistance))
    const upVector = localVector5.set(this.left ? -1 : 1, 0, 0).applyQuaternion(shoulderRotation)
    this.arm.upperArm.quaternion
      .setFromRotationMatrix(
        localMatrix.lookAt(zeroVector, localVector6.copy(elbowPosition).sub(upperArmPosition), upVector)
      )
      .multiply(this.left ? rightRotation : leftRotation)
      .premultiply(Helpers.getWorldQuaternion(this.arm.upperArm.parent, localQuaternion3).invert())
    Helpers.updateMatrixMatrixWorld(this.arm.upperArm)
    this.arm.lowerArm.quaternion
      .setFromRotationMatrix(
        localMatrix.lookAt(zeroVector, localVector6.copy(handPosition).sub(elbowPosition), upVector)
      )
      .multiply(this.left ? rightRotation : leftRotation)
      .premultiply(Helpers.getWorldQuaternion(this.arm.lowerArm.parent, localQuaternion3).invert())
    Helpers.updateMatrixMatrixWorld(this.arm.lowerArm)

    // this.arm.hand.position = handPosition;
    this.arm.hand.quaternion
      .copy(this.target.quaternion)
      .multiply(this.left ? bankRightRotation : bankLeftRotation)
      .premultiply(Helpers.getWorldQuaternion(this.arm.hand.parent, localQuaternion3).invert())
    Helpers.updateMatrixMatrixWorld(this.arm.hand)
  }
}

export default VRArmIK
