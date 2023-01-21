import { Group, Mesh, MeshBasicMaterial, Object3D, SphereGeometry, Vector3 } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { addObjectToGroup } from '../../scene/components/GroupComponent'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'

/**
 * pre-cache height & other necessary measurements based on bone structure in rig component upon avatar load
 *   h: head to foot, a: head to hips, b: hips to knee, c: knee to feet
 */

let hasAdded = false
const knee = new Mesh(new SphereGeometry(0.1), new MeshBasicMaterial({ color: 'red' }))
const hips = new Mesh(new SphereGeometry(0.1), new MeshBasicMaterial({ color: 'green' }))
const head = new Mesh(new SphereGeometry(0.1), new MeshBasicMaterial({ color: 'blue' }))
const group = new Group()
group.add(hips, knee, head)

const horizontalOffset = 0.2
const degtoRad90 = Math.PI * 0.5
const sin90 = Math.sin(degtoRad90)

const _vec3 = new Vector3()

/**
 *
 * @param bone
 * @param target
 */
export function solveHipHeight(entity: Entity, target: Object3D) {
  const rigComponent = getComponent(entity, AvatarRigComponent)
  if (!hasAdded) {
    hasAdded = true
    addObjectToGroup(entity, group)
  }

  const headTotalLength = rigComponent.torsoLength + rigComponent.upperLegLength + rigComponent.lowerLegLength
  const pivothalfLength = rigComponent.upperLegLength * 0.5
  const pivotHalfLengthSquare = pivothalfLength * pivothalfLength
  const minHeadHeight = pivothalfLength + rigComponent.lowerLegLength
  // const headTargetY = target.getWorldPosition(_vec3).y
  const headTargetY =
    (Math.sin(Engine.instance.currentWorld.elapsedSeconds * 2) + 1) * 0.5 * (headTotalLength - minHeadHeight) +
    minHeadHeight
  const clampedHeadTargetY = Math.max(minHeadHeight, headTargetY)

  const targetToRealRatio = clampedHeadTargetY / headTotalLength

  /** calculate angle of pivot joint scaled by the relative head height */
  const pivotToHeadLength = (headTotalLength - pivothalfLength - rigComponent.lowerLegLength) * targetToRealRatio // h1
  const pivotToFootLength = (headTotalLength - pivothalfLength - rigComponent.torsoLength) * targetToRealRatio // h2

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
  const headToHipY = (Math.sin(headToHipAngle) * rigComponent.torsoLength) / sin90
  const footToKneeY = (Math.sin(footToKneeAngle) * rigComponent.lowerLegLength) / sin90
  const kneeToHipsY = clampedHeadTargetY - headToHipY - footToKneeY

  const hipX = (Math.sin(headToHipInternalAngle) * rigComponent.torsoLength) / sin90
  const kneeX = (Math.sin(footToKneeInternalAngle) * rigComponent.lowerLegLength) / sin90

  head.position.z = horizontalOffset
  hips.position.z = horizontalOffset - hipX
  knee.position.z = kneeX + horizontalOffset
  head.position.y = footToKneeY + kneeToHipsY + headToHipY
  hips.position.y = footToKneeY + kneeToHipsY
  knee.position.y = footToKneeY

  /** Solve IK */
}
