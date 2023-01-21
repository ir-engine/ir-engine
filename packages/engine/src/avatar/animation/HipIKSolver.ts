import { Group, Mesh, MeshBasicMaterial, Object3D, Quaternion, SphereGeometry, Vector3 } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { addObjectToGroup } from '../../scene/components/GroupComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { solveTwoBoneIK } from './TwoBoneIKSolver'

let hasAdded = false
const debug = false

const knee = new Mesh(new SphereGeometry(0.1), new MeshBasicMaterial({ color: 'red' }))
const hips = new Mesh(new SphereGeometry(0.1), new MeshBasicMaterial({ color: 'green' }))
const head = new Mesh(new SphereGeometry(0.1), new MeshBasicMaterial({ color: 'blue' }))
const group = new Group()
group.add(hips, knee, head)

const degtoRad90 = Math.PI * 0.5
const sin90 = Math.sin(degtoRad90)

const _vec3 = new Vector3()
const _quat = new Quaternion()
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
  const transformComponent = getComponent(entity, TransformComponent)

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
  // const headTargetY = target.getWorldPosition(_vec3).y
  /** @DEBUG */
  const headTargetY =
    (Math.sin(Engine.instance.currentWorld.elapsedSeconds * 2) + 1) * 0.5 * (headToFeetLength - minHeadHeight) +
    minHeadHeight
  const clampedHeadTargetY = Math.max(minHeadHeight, headTargetY)

  const targetToRealRatio = clampedHeadTargetY / headToFeetLength

  /** calculate angle of pivot joint scaled by the relative head height */
  const pivotToHeadLength = (headToFeetLength - pivotHalfLength - rigComponent.lowerLegLength) * targetToRealRatio // h1
  const pivotToFootLength = (headToFeetLength - pivotHalfLength - rigComponent.torsoLength) * targetToRealRatio // h2

  /** calculate internal angle of head to hip using cosine rule */
  const headToHipInternalAngle = Math.acos(
    (rigComponent.torsoLength * rigComponent.torsoLength +
      pivotToHeadLength * pivotToHeadLength -
      pivotHalfLengthSquare) /
      (2 * rigComponent.torsoLength * pivotToHeadLength)
  )

  /** calculate internal angle of feet to knee using cosine rule */
  const footToKneeInternalAngle = Math.acos(
    (rigComponent.lowerLegLength * rigComponent.lowerLegLength +
      pivotToFootLength * pivotToFootLength -
      pivotHalfLengthSquare) /
      (2 * rigComponent.lowerLegLength * pivotToFootLength)
  )

  const headToHipAngle = degtoRad90 - headToHipInternalAngle
  const footToKneeAngle = degtoRad90 - footToKneeInternalAngle
  /** get the x and y offsets of this calculation */
  const headToHipY = (Math.sin(headToHipAngle) * rigComponent.torsoLength) / sin90
  const footToKneeY = (Math.sin(footToKneeAngle) * rigComponent.lowerLegLength) / sin90
  const kneeToHipsY = clampedHeadTargetY - headToHipY - footToKneeY

  const hipX = (Math.sin(headToHipInternalAngle) * rigComponent.torsoLength) / sin90
  const kneeX = (Math.sin(footToKneeInternalAngle) * rigComponent.lowerLegLength) / sin90

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

  /** update matrices after animation has been applied */
  rig.LeftUpLeg.updateWorldMatrix(false, true)
  const originalLeftKneeX = rig.LeftLeg.getWorldPosition(_vec3).x
  /** copy foot world pose into target */
  rig.LeftFoot.getWorldPosition(leftFootTarget.position)
  rig.LeftFoot.getWorldQuaternion(leftFootTarget.quaternion)

  rig.RightUpLeg.updateWorldMatrix(false, true)
  const originalRightKneeX = rig.RightLeg.getWorldPosition(_vec3).x
  rig.RightFoot.getWorldPosition(rightFootTarget.position)
  rig.RightFoot.getWorldQuaternion(rightFootTarget.quaternion)

  /** move hips to the new position */
  const hipDifference = fullLegLength - (footToKneeY + kneeToHipsY)
  rig.Hips.position.y -= hipDifference
  rig.Hips.position.z -= hipX

  /** calculate how much the knees should flare out based on the distance the knees move forward, adding to the original position (to preserve animations) */
  const leftKneeFlare = originalLeftKneeX + kneeX * 0.8

  /** add knee flare to foot position */
  _vec3.set(leftKneeFlare * 0.5, leftFootTarget.position.y + hipDifference, 0)
  _vec3.applyQuaternion(transformComponent.rotation)
  leftFootTarget.position.copy(_vec3)
  leftFootTarget.position.z = transformComponent.position.z
  leftFootTarget.updateMatrixWorld(true)

  /** hint is where the knees aim */
  leftFootTargetHint.position.set(leftKneeFlare, 0, 0.1 + kneeX * 0.9)
  leftFootTargetHint.position.applyQuaternion(transformComponent.rotation)
  leftFootTargetHint.position.y = footToKneeY
  leftFootTargetHint.position.add(transformComponent.position)
  leftFootTargetHint.updateMatrixWorld(true)

  solveTwoBoneIK(rig.LeftUpLeg, rig.LeftLeg, rig.LeftFoot, leftFootTarget, leftFootTargetHint, leftFootTargetOffset)

  /** Right Foot */
  const kneeFlare = originalRightKneeX - kneeX * 0.8
  _vec3.set(kneeFlare * 0.5, rightFootTarget.position.y + hipDifference, 0)
  _vec3.applyQuaternion(transformComponent.rotation)
  rightFootTarget.position.copy(_vec3)
  rightFootTarget.position.z = transformComponent.position.z
  rightFootTarget.updateMatrixWorld(true)

  rightFootTargetHint.position.set(kneeFlare, 0, 0.1 + kneeX * 0.9)
  rightFootTargetHint.position.applyQuaternion(transformComponent.rotation)
  rightFootTargetHint.position.y = footToKneeY
  rightFootTargetHint.position.add(transformComponent.position)
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
  rig.Spine.applyQuaternion(_quat.setFromAxisAngle(_vec3.set(1, 0, 0), degtoRad90 - headToHipAngle))

  /** Angle feet */
  // todo
}
