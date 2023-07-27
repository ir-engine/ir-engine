/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Group, Mesh, MeshBasicMaterial, Object3D, Quaternion, SphereGeometry, Vector3 } from 'three'

import { V_100 } from '../../common/constants/MathConstants'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { addObjectToGroup } from '../../scene/components/GroupComponent'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { solveTwoBoneIK } from './TwoBoneIKSolver'

let hasAdded = false
const debug = false

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
export function solveHipHeight(entity: Entity, headPosition: Vector3) {
  const rigComponent = getComponent(entity, AvatarRigComponent)
  const body = getComponent(entity, RigidBodyComponent)

  if (debug && !hasAdded) {
    hasAdded = true
    addObjectToGroup(entity, group)
    Engine.instance.scene.add(
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
  const headTargetY = headPosition.y - body.position.y
  const clampedHeadTargetY =
    Math.min(Math.max(minHeadHeight, headTargetY), headToFeetLength + rigComponent.footHeight) - rigComponent.footHeight

  const targetToRealRatio = Math.min(clampedHeadTargetY / headToFeetLength, 0.9999)

  /** calculate angle of pivot joint scaled by the relative head height */
  const pivotToHeadLength = (headToFeetLength - pivotHalfLength - rigComponent.lowerLegLength) * targetToRealRatio // h1
  const pivotToFootLength = (headToFeetLength - pivotHalfLength - rigComponent.torsoLength) * targetToRealRatio // h2

  /** calculate internal angle of head to hip using cosine rule */
  const hipToheadInternalAngle = Math.acos(
    Math.min(
      1,
      (rigComponent.torsoLength * rigComponent.torsoLength +
        pivotToHeadLength * pivotToHeadLength -
        pivotHalfLengthSquare) /
        (2 * rigComponent.torsoLength * pivotToHeadLength)
    )
  )

  /** calculate internal angle of feet to knee using cosine rule */
  const kneeToFootInternalAngle = Math.acos(
    Math.min(
      1,
      (rigComponent.lowerLegLength * rigComponent.lowerLegLength +
        pivotToFootLength * pivotToFootLength -
        pivotHalfLengthSquare) /
        (2 * rigComponent.lowerLegLength * pivotToFootLength)
    )
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

  // console.log(rig.Hips.name, rig.Hips.parent!.name, rig.Hips.parent!.parent!.name, rig.Hips.parent!.parent!.parent!.name)
  // console.log('before', rig.Hips.getWorldPosition(_vec3).y, rig.Hips.parent!.getWorldPosition(_vec3).y, rig.Hips.parent!.parent!.getWorldPosition(_vec3).y, rig.Hips.parent!.parent!.parent!.getWorldPosition(_vec3).y)

  /** move hips to the new position */
  const hipDifference = fullLegLength - (footToKneeY + kneeToHipsY)
  rig.Hips.position.y -= hipDifference
  rig.Hips.position.z -= hipX

  /** Update matrices */
  rig.Hips.updateWorldMatrix(true, true)

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

  /** copy foot world pose into target */
  rig.LeftFoot.getWorldPosition(leftFootTarget.position) //.sub(body.position)
  rig.RightFoot.getWorldPosition(rightFootTarget.position) //.sub(body.position)

  /** get original knee position in avatar local space */
  rig.LeftLeg.getWorldPosition(originalLeftKneeOffset).sub(body.position)
  originalLeftKneeOffset.applyQuaternion(_quat.copy(body.rotation).invert())
  const originalLeftFootAngle = rig.LeftFoot.getWorldQuaternion(_quat).angleTo(quatXforward0)

  rig.RightLeg.getWorldPosition(originalRightKneeOffset).sub(body.position)
  originalRightKneeOffset.applyQuaternion(_quat.copy(body.rotation).invert())
  const originalRightFootAngle = rig.RightFoot.getWorldQuaternion(_quat).angleTo(quatXforward0)

  /** calculate how much the knees should flare out based on the distance the knees move forward, adding to the original position (to preserve animations) */
  const leftKneeFlare = kneeFlareSeparation + kneeX * kneeFlareMultiplier

  /** add knee flare to foot position */
  _vec3.set(
    kneeFlareSeparation + leftKneeFlare * footKneeFlareRatio,
    hipDifference + leftFootTarget.position.y - body.position.y, // TODO replace this line with `hipDifference,` once the idle animation is better
    0
  )
  _vec3.applyQuaternion(body.rotation)
  leftFootTarget.position.copy(body.position) // TODO: remove this line once the idle animation is better
  leftFootTarget.position.add(_vec3)

  /** hint is where the knees aim */
  leftFootTargetHint.position.set(kneeFlareSeparation + leftKneeFlare, footToKneeY, 0.1 + kneeX * 0.9)
  leftFootTargetHint.position.applyQuaternion(body.rotation)
  leftFootTargetHint.position.add(leftFootTarget.position)
  rig.LeftFoot.getWorldQuaternion(leftFootTarget.quaternion)
  leftFootTargetHint.updateMatrixWorld(true)

  solveTwoBoneIK(
    rig.LeftUpLeg,
    rig.LeftLeg,
    rig.LeftFoot,
    leftFootTarget.position,
    leftFootTarget.quaternion,
    null,
    leftFootTargetHint,
    1,
    0,
    1
  )

  /** Right Foot */
  const rightKneeFlare = -kneeFlareSeparation - kneeX * kneeFlareMultiplier
  _vec3.set(
    -kneeFlareSeparation + rightKneeFlare * footKneeFlareRatio,
    hipDifference + rightFootTarget.position.y - body.position.y, // TODO replace this line with `hipDifference,` once the idle animation is better
    0
  )
  _vec3.applyQuaternion(body.rotation)
  rightFootTarget.position.copy(body.position) // TODO: remove this line once the idle animation is better
  rightFootTarget.position.add(_vec3)

  rightFootTargetHint.position.set(kneeFlareSeparation + rightKneeFlare, footToKneeY, 0.1 + kneeX * 0.9)
  rightFootTargetHint.position.applyQuaternion(body.rotation)
  rightFootTargetHint.position.add(rightFootTarget.position)
  rig.RightFoot.getWorldQuaternion(rightFootTarget.quaternion)
  rightFootTargetHint.updateMatrixWorld(true)

  solveTwoBoneIK(
    rig.RightUpLeg,
    rig.RightLeg,
    rig.RightFoot,
    rightFootTarget.position,
    rightFootTarget.quaternion,
    null,
    rightFootTargetHint,
    1,
    0,
    1
  )

  /** Torso */
  /** Apply the hip internal angle we calculated previously */
  rig.Spine.applyQuaternion(_quat.setFromAxisAngle(V_100, degtoRad90 - hipToHeadAngle))

  /** Angle feet */

  /** get the current angle of the foot in world space */
  /** get the difference between the two angles */
  /** apply the difference to the foot */
  /** left foot */
  const currentLeftFootAngle = rig.LeftFoot.getWorldQuaternion(_quat).angleTo(quatXforward0)
  const leftFootAngleDifference = originalLeftFootAngle - currentLeftFootAngle
  rig.LeftFoot.applyQuaternion(_quat.setFromAxisAngle(V_100, leftFootAngleDifference))

  /** right foot */
  const currentRightFootAngle = rig.RightFoot.getWorldQuaternion(_quat).angleTo(quatXforward0)
  const rightFootAngleDifference = originalRightFootAngle - currentRightFootAngle
  rig.RightFoot.applyQuaternion(_quat.setFromAxisAngle(V_100, rightFootAngleDifference))
}
