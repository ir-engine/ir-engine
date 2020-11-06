import { Euler, Quaternion, Vector3 } from "three"
import { Helpers } from "./Helpers"

const rightVector = new Vector3(1, 0, 0)
const z180Quaternion = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI)

const localVector = new Vector3()
const localVector2 = new Vector3()
const localQuaternion = new Quaternion()
const localQuaternion2 = new Quaternion()
const localQuaternion3 = new Quaternion()
const localEuler = new Euler()

class ShoulderPoser {
  rig: any
  shoulder: any
  poseManager: any
  vrTransforms: any

  constructor(rig, shoulder) {
    this.rig = rig
    this.shoulder = shoulder
    this.poseManager = rig.poseManager
    this.vrTransforms = this.poseManager.vrTransforms
  }
  Update() {
    this.shoulder.proneFactor = this.getProneFactor()
    this.shoulder.prone = this.shoulder.proneFactor > 0
    if (this.shoulder.prone) {
      this.shoulder.lastProneTimestamp = Date.now()
    } else {
      this.shoulder.lastStandTimestamp = Date.now()
    }

    this.updateHips()

    // this.shoulder.transform.rotation = Quaternion.identity;
    // this.positionShoulder();
    this.rotateShoulderBase()

    this.updateNeck()
  }

  updateHips() {
    const hmdRotation = localQuaternion.copy(this.vrTransforms.head.quaternion).multiply(z180Quaternion)

    const hmdEuler = localEuler.setFromQuaternion(hmdRotation, "YXZ")
    hmdEuler.x = 0
    hmdEuler.z = 0
    const hmdXYRotation = localQuaternion2.setFromEuler(hmdEuler)
    hmdXYRotation.multiply(localQuaternion3.setFromAxisAngle(rightVector, (this.shoulder.proneFactor * Math.PI) / 2))
    if (!this.rig.legsManager.leftLeg.standing && !this.rig.legsManager.rightLeg.standing) {
      const jumpFactor =
        1 - Math.min(this.rig.legsManager.leftLeg.standFactor, this.rig.legsManager.rightLeg.standFactor)
      hmdXYRotation.multiply(localQuaternion3.setFromAxisAngle(rightVector, (jumpFactor * Math.PI) / 4))
    } else {
      const standFactor = Math.min(this.rig.legsManager.leftLeg.standFactor, this.rig.legsManager.rightLeg.standFactor)
      hmdXYRotation.multiply(localQuaternion3.setFromAxisAngle(rightVector, ((1 - standFactor) * Math.PI) / 4))
    }

    const headPosition = localVector
      .copy(this.vrTransforms.head.position)
      .sub(localVector2.copy(this.shoulder.eyes.position).applyQuaternion(hmdRotation))
    const neckPosition = headPosition.sub(localVector2.copy(this.shoulder.head.position).applyQuaternion(hmdRotation))
    const chestPosition = neckPosition.sub(
      localVector2.copy(this.shoulder.neck.position).applyQuaternion(hmdXYRotation)
    )
    const spinePosition = chestPosition.sub(
      localVector2.copy(this.shoulder.transform.position).applyQuaternion(hmdXYRotation)
    )
    const hipsPosition = spinePosition.sub(
      localVector2.copy(this.shoulder.spine.position).applyQuaternion(hmdXYRotation)
    )

    this.shoulder.hips.position.copy(hipsPosition)
    this.shoulder.hips.quaternion.copy(hmdXYRotation)
    Helpers.updateMatrix(this.shoulder.hips)
    this.shoulder.hips.matrixWorld.copy(this.shoulder.hips.matrix)
    Helpers.updateMatrixWorld(this.shoulder.spine)
    Helpers.updateMatrixWorld(this.shoulder.transform)
  }

  updateNeck() {
    const hmdRotation = localQuaternion.copy(this.vrTransforms.head.quaternion).multiply(z180Quaternion)
    const hmdEuler = localEuler.setFromQuaternion(hmdRotation, "YXZ")
    hmdEuler.x = 0
    hmdEuler.z = 0
    const hmdXYRotation = localQuaternion2.setFromEuler(hmdEuler)

    this.shoulder.neck.quaternion
      .copy(hmdXYRotation)
      .premultiply(Helpers.getWorldQuaternion(this.shoulder.neck.parent, localQuaternion3).inverse())
    Helpers.updateMatrixMatrixWorld(this.shoulder.neck)

    this.shoulder.head.quaternion
      .copy(hmdRotation)
      .premultiply(Helpers.getWorldQuaternion(this.shoulder.head.parent, localQuaternion3).inverse())
    Helpers.updateMatrixMatrixWorld(this.shoulder.head)

    Helpers.updateMatrixWorld(this.shoulder.eyes)
  }

  rotateShoulderBase() {
    const angleY = this.getCombinedDirectionAngleUp()

    this.shoulder.transform.quaternion
      .setFromEuler(localEuler.set(0, angleY, 0, "YXZ"))
      .premultiply(localQuaternion.copy(this.shoulder.hips.quaternion).multiply(z180Quaternion))

    this.shoulder.transform.quaternion.premultiply(
      Helpers.getWorldQuaternion(this.shoulder.transform.parent, localQuaternion).inverse()
    )
    Helpers.updateMatrixMatrixWorld(this.shoulder.transform)
    Helpers.updateMatrixWorld(this.shoulder.leftShoulderAnchor)
    Helpers.updateMatrixWorld(this.shoulder.rightShoulderAnchor)
  }

  getCombinedDirectionAngleUp() {
    const hipsRotation = localQuaternion.copy(this.shoulder.hips.quaternion).multiply(z180Quaternion)
    const hipsRotationInverse = localQuaternion2.copy(hipsRotation).inverse()

    const distanceLeftHand = localVector
      .copy(this.vrTransforms.leftHand.position)
      .sub(this.vrTransforms.head.position)
      .applyQuaternion(hipsRotationInverse)
    const distanceRightHand = localVector2
      .copy(this.vrTransforms.rightHand.position)
      .sub(this.vrTransforms.head.position)
      .applyQuaternion(hipsRotationInverse)

    distanceLeftHand.y = 0
    distanceRightHand.y = 0

    const leftBehind = distanceLeftHand.z > 0
    const rightBehind = distanceRightHand.z > 0
    if (leftBehind) {
      distanceLeftHand.z *= rightBehind ? -2 : -1
    }
    if (rightBehind) {
      distanceRightHand.z *= leftBehind ? -2 : -1
    }

    const combinedDirection = localVector.addVectors(distanceLeftHand.normalize(), distanceRightHand.normalize())
    return Math.atan2(combinedDirection.x, combinedDirection.z)
  }

  getProneFactor() {
    return (
      1 -
      Math.min(Math.max((this.vrTransforms.head.position.y - this.rig.height * 0.3) / (this.rig.height * 0.3), 0), 1)
    )
  }
}

export default ShoulderPoser
