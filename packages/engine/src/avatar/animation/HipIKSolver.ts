import { Group, Mesh, MeshBasicMaterial, Object3D, Quaternion, SphereGeometry, Vector3 } from 'three'

import { V_001, V_100 } from '../../common/constants/MathConstants'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { addObjectToGroup } from '../../scene/components/GroupComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { solveTwoBoneIK } from './TwoBoneIKSolver'

let hasAdded = false
const debug = true

const quatXforward0 = new Quaternion().setFromAxisAngle(V_100, 0)

const knee = new Mesh(new SphereGeometry(0.1), new MeshBasicMaterial({ color: 'red' }))
const hips = new Mesh(new SphereGeometry(0.1), new MeshBasicMaterial({ color: 'green' }))
const head = new Mesh(new SphereGeometry(0.1), new MeshBasicMaterial({ color: 'blue' }))
const group = new Group()
group.add(hips, knee, head)

const degtoRad90 = Math.PI * 0.5
const sin90 = Math.sin(degtoRad90)

const originalLeftKneeOffset = new Vector3()
const originalRightKneeOffset = new Vector3()
const _vec3 = new Vector3()
const _quat = new Quaternion()
const _quat2 = new Quaternion()
const leftFootTarget = new Object3D().add(new Mesh(new SphereGeometry(0.05), new MeshBasicMaterial({ color: 'pink' })))
const leftFootTargetOffset = new Object3D().add(
  new Mesh(new SphereGeometry(0.05), new MeshBasicMaterial({ color: 'yellow' }))
)
const leftFootTargetHint = new Object3D().add(
  new Mesh(new SphereGeometry(0.05), new MeshBasicMaterial({ color: 'aqua' }))
)
const rightFootTarget = new Object3D().add(new Mesh(new SphereGeometry(0.05), new MeshBasicMaterial({ color: 'pink' })))
const rightFootTargetOffset = new Object3D().add(
  new Mesh(new SphereGeometry(0.05), new MeshBasicMaterial({ color: 'yellow' }))
)
const rightFootTargetHint = new Object3D().add(
  new Mesh(new SphereGeometry(0.05), new MeshBasicMaterial({ color: 'aqua' }))
)

/**
 * Solves the hip height of the avatar rig, by applying a four bar joined sliding mechanism calculation,
 *   pushing the hips backwards and the knees forwards, lowering the head match the target height.
 *   A two bone IK solver is then applied to each leg, ensuring the feet are on the ground.
 * @param entity
 * @param target
 */
export function solveHipHeight(entity: Entity, target: Object3D) {
  const rigComponent = getComponent(entity, AvatarRigComponent)
  const transform = getComponent(entity, TransformComponent)

  if (debug && !hasAdded) {
    hasAdded = true
    addObjectToGroup(entity, group)
    Engine.instance.currentWorld.scene.add(
      leftFootTarget,
      leftFootTargetOffset,
      leftFootTargetHint,
      rightFootTarget,
      rightFootTargetOffset,
      rightFootTargetHint
    )
  }

  const headToFeetLength = rigComponent.torsoLength + rigComponent.upperLegLength + rigComponent.lowerLegLength
  const fullLegLength = rigComponent.upperLegLength + rigComponent.lowerLegLength
  const pivotHalfLength = rigComponent.upperLegLength * 0.5
  const pivotHalfLengthSquare = pivotHalfLength * pivotHalfLength
  const minHeadHeight = pivotHalfLength + rigComponent.lowerLegLength + rigComponent.footHeight
  const headTargetY = target.getWorldPosition(_vec3).y
  const clampedHeadTargetY = Math.max(minHeadHeight, headTargetY)

  const targetToRealRatio = clampedHeadTargetY / headToFeetLength

  /** calculate angle of pivot joint scaled by the relative head height */
  const pivotToHeadLength = (headToFeetLength - pivotHalfLength - rigComponent.lowerLegLength) * targetToRealRatio // h1
  const pivotToFootLength = (headToFeetLength - pivotHalfLength - rigComponent.torsoLength) * targetToRealRatio // h2

  /** calculate internal angle of head to hip using cosine rule */
  const hipToheadInternalAngle = Math.acos(
    (rigComponent.torsoLength * rigComponent.torsoLength +
      pivotToHeadLength * pivotToHeadLength -
      pivotHalfLengthSquare) /
      (2 * rigComponent.torsoLength * pivotToHeadLength)
  )

  /** calculate internal angle of feet to knee using cosine rule */
  const kneeToFootInternalAngle = Math.acos(
    (rigComponent.lowerLegLength * rigComponent.lowerLegLength +
      pivotToFootLength * pivotToFootLength -
      pivotHalfLengthSquare) /
      (2 * rigComponent.lowerLegLength * pivotToFootLength)
  )

  const hipToHeadAngle = degtoRad90 - hipToheadInternalAngle
  const kneeToFootAngle = degtoRad90 - kneeToFootInternalAngle
  /** get the x and y offsets of this calculation */
  const headToHipY = (Math.sin(hipToHeadAngle) * rigComponent.torsoLength) / sin90
  const footToKneeY = (Math.sin(kneeToFootAngle) * rigComponent.lowerLegLength) / sin90
  const kneeToHipsY = clampedHeadTargetY - headToHipY - footToKneeY

  const hipX = (Math.sin(hipToheadInternalAngle) * rigComponent.torsoLength) / sin90
  const kneeX = (Math.sin(kneeToFootInternalAngle) * rigComponent.lowerLegLength) / sin90

  /** update four bar joint mechanism helpers with result data */
  if (debug) {
    hips.position.z = -hipX
    knee.position.z = kneeX
    head.position.y = footToKneeY + kneeToHipsY + headToHipY + rigComponent.footHeight
    hips.position.y = footToKneeY + kneeToHipsY + rigComponent.footHeight
    knee.position.y = footToKneeY + rigComponent.footHeight
  }

  /** Solve IK */
  const rig = rigComponent.rig
  /**
   * @todo
   * instead of flaring the knees based on how far the knees are forward,
   * and deriving foot position from that, we should instead derive knee flare based on the angle the feet have to the hips
   * (biomechanically, the most efficient movement pattern is knees following the plane that bisects the toes, ankle and hips)
   */
  /** minimum distance the knees are to be apart */
  const kneeFlareSeparation = 0.1
  /** multiplier of how far the knees are forward to flare the knees outward */
  const kneeFlareMultiplier = 0.4
  /** determins how far apart the feet are as a mulitplier of how far apart the knees are*/
  const footKneeFlareRatio = 0.2

  /** update leg matrices after animation has been applied */
  rig.LeftUpLeg.updateWorldMatrix(false, true)
  rig.RightUpLeg.updateWorldMatrix(false, true)

  /** copy foot world pose into target */
  rig.LeftFoot.getWorldPosition(leftFootTarget.position)
  rig.LeftFoot.getWorldQuaternion(leftFootTarget.quaternion)
  rig.RightFoot.getWorldPosition(rightFootTarget.position)
  rig.RightFoot.getWorldQuaternion(rightFootTarget.quaternion)

  /** get original knee position in avatar local space */
  rig.LeftLeg.getWorldPosition(originalLeftKneeOffset).sub(transform.position)
  originalLeftKneeOffset.applyQuaternion(_quat.copy(transform.rotation).invert())
  const originalLeftFootAngle = rig.LeftFoot.getWorldQuaternion(_quat).angleTo(quatXforward0)

  rig.RightLeg.getWorldPosition(originalRightKneeOffset).sub(transform.position)
  originalRightKneeOffset.applyQuaternion(_quat.copy(transform.rotation).invert())
  const originalRightFootAngle = rig.RightFoot.getWorldQuaternion(_quat).angleTo(quatXforward0)

  /** move hips to the new position */
  const hipDifference = fullLegLength - (footToKneeY + kneeToHipsY)
  rig.Hips.position.y -= hipDifference
  rig.Hips.position.z -= hipX

  /** calculate how much the knees should flare out based on the distance the knees move forward, adding to the original position (to preserve animations) */
  const leftKneeFlare = kneeFlareSeparation + originalLeftKneeOffset.x + kneeX * kneeFlareMultiplier

  /** add knee flare to foot position */
  _vec3.set(kneeFlareSeparation + leftKneeFlare * footKneeFlareRatio, leftFootTarget.position.y + hipDifference, 0)
  _vec3.applyQuaternion(transform.rotation)
  leftFootTarget.position.copy(_vec3)
  leftFootTarget.position.add(transform.position)
  leftFootTarget.updateMatrixWorld(true)

  /** hint is where the knees aim */
  leftFootTargetHint.position.set(leftKneeFlare, 0, 0.1 + kneeX * 0.9)
  leftFootTargetHint.position.applyQuaternion(transform.rotation)
  leftFootTargetHint.position.y = footToKneeY
  leftFootTargetHint.position.add(transform.position)
  leftFootTargetHint.updateMatrixWorld(true)

  solveTwoBoneIK(rig.LeftUpLeg, rig.LeftLeg, rig.LeftFoot, leftFootTarget, leftFootTargetHint, leftFootTargetOffset)

  /** Right Foot */
  const kneeFlare = -kneeFlareSeparation + originalRightKneeOffset.x - kneeX * kneeFlareMultiplier
  _vec3.set(-kneeFlareSeparation + kneeFlare * footKneeFlareRatio, rightFootTarget.position.y + hipDifference, 0)
  _vec3.applyQuaternion(transform.rotation)
  rightFootTarget.position.copy(_vec3)
  rightFootTarget.position.add(transform.position)
  rightFootTarget.updateMatrixWorld(true)

  rightFootTargetHint.position.set(kneeFlare, 0, 0.1 + kneeX * 0.9)
  rightFootTargetHint.position.applyQuaternion(transform.rotation)
  rightFootTargetHint.position.y = footToKneeY
  rightFootTargetHint.position.add(transform.position)
  rightFootTargetHint.updateMatrixWorld(true)

  solveTwoBoneIK(
    rig.RightUpLeg,
    rig.RightLeg,
    rig.RightFoot,
    rightFootTarget,
    rightFootTargetHint,
    rightFootTargetOffset
  )

  /** Torso */
  /** Apply the hip internal angle we calculated previously */
  rig.Spine.applyQuaternion(_quat.setFromAxisAngle(V_100, degtoRad90 - hipToHeadAngle))

  /** Angle feet */

  /** left foot */
  /** get the current angle of the foot in world space */
  /** get the difference between the two angles */
  /** apply the difference to the foot */
  const currentLeftFootAngle = rig.LeftFoot.getWorldQuaternion(_quat).angleTo(quatXforward0)
  const leftFootAngleDifference = originalLeftFootAngle - currentLeftFootAngle
  rig.LeftFoot.applyQuaternion(_quat.setFromAxisAngle(V_100, leftFootAngleDifference))

  /** right foot */
  const currentRightFootAngle = rig.RightFoot.getWorldQuaternion(_quat).angleTo(quatXforward0)
  const rightFootAngleDifference = originalRightFootAngle - currentRightFootAngle
  rig.RightFoot.applyQuaternion(_quat.setFromAxisAngle(V_100, rightFootAngleDifference))

  // debug
  rig.Hips.updateMatrixWorld(true)
}
