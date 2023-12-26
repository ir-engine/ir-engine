/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License") you may not use this file except in compliance
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

import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import {
  defineQuery,
  getComponent,
  hasComponent,
  setComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeComponent, iterateEntityNode } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import {
  AttachmentPointData,
  ObjectGridSnapComponent,
  flipAround
} from '@etherealengine/engine/src/scene/components/ObjectGridSnapComponent'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { TransformSystem, computeTransformMatrix } from '@etherealengine/engine/src/transform/systems/TransformSystem'
import { getMutableState, getState } from '@etherealengine/hyperflux'
import { Quaternion, Vector3 } from 'three'
import { EditorHelperState } from '../services/EditorHelperState'
import { SelectionState } from '../services/SelectionServices'
let lastExecutionTime = 0
const interval = 1000

export function findClosestRotation(n: number, srcRotation: Quaternion, dstRotation: Quaternion): Quaternion {
  const yAxis = new Vector3(0, 1, 0)
  let minAngle = Infinity
  const closestRotation = new Quaternion()

  for (let i = 0; i < n; i++) {
    // Compute the angle increment
    const angle = (i * 2 * Math.PI) / n // Convert to radians

    // Create a rotation about the Y-axis of dstRotation
    const incrementalRotation = new Quaternion().setFromAxisAngle(yAxis, angle)
    const testRotation = dstRotation.clone().multiply(incrementalRotation)

    // Compute the angular distance to srcRotation
    const angleDistance = srcRotation.angleTo(testRotation)

    // Update closest rotation if a new minimum is found
    if (angleDistance < minAngle) {
      minAngle = angleDistance
      closestRotation.copy(testRotation)
    }
  }

  return closestRotation
}

const execute = () => {
  //only execute if attachment point snap is enabled
  const helperState = getState(EditorHelperState)
  if (!helperState.attachmentPointSnap) return

  //execute according to interval
  const now = Date.now()
  if (now - lastExecutionTime < interval) return
  lastExecutionTime = now
  const attachmentPointQuery = defineQuery([ObjectGridSnapComponent])

  //calculate select entity
  const selectionState = getMutableState(SelectionState) //access the list of currently selected entities
  const selectedAttachmentPoints = selectionState.selectedEntities.value.flatMap((entity: Entity) => {
    return iterateEntityNode(
      entity,
      (e) => e,
      (e) => hasComponent(e, ObjectGridSnapComponent)
    )
  })
  let shortestDistance = Infinity
  let shortestAngle = Infinity
  let srcPosition: Vector3 | null = null
  let srcRotation: Quaternion | null = null
  let dstPosition: Vector3 | null = null
  let dstRotation: Quaternion | null = null
  let srcAttachmentPoint: AttachmentPointData | null = null
  let dstAttachmentPoint: AttachmentPointData | null = null
  let srcSnapEntity: Entity | null = null
  let dstSnapEntity: Entity | null = null

  const threshold = 1
  //loop to caculate the distance
  for (const selectedObjSnapEntity of selectedAttachmentPoints) {
    const selectedSnapComponent = getComponent(selectedObjSnapEntity, ObjectGridSnapComponent)
    const selectTransform = getComponent(selectedObjSnapEntity, TransformComponent)
    for (const selectedAttachmentPoint of selectedSnapComponent.attachmentPoints) {
      //const selectTransform = getComponent(selectParententity, TransformComponent)
      const srcWorldspacePosition = selectedAttachmentPoint.position.clone().applyMatrix4(selectTransform.matrixWorld)
      for (const candidateDstSnapEntity of attachmentPointQuery()) {
        if (selectedAttachmentPoints.includes(candidateDstSnapEntity)) continue

        //if selected attachment point
        const dstSnapTransform = getComponent(candidateDstSnapEntity, TransformComponent)
        const attachmentPoints = getComponent(candidateDstSnapEntity, ObjectGridSnapComponent).attachmentPoints
        //loop through all attachment points
        for (const attachmentPoint of attachmentPoints) {
          const attachmentPointWorldSpacePosition = attachmentPoint.position
            .clone()
            .applyMatrix4(dstSnapTransform.matrixWorld)
          const srcWorldspaceRotation = TransformComponent.getWorldRotation(
            selectedObjSnapEntity,
            new Quaternion()
          ).multiply(selectedAttachmentPoint.rotation)
          const attachmentPointWorldSpaceRotation = TransformComponent.getWorldRotation(
            candidateDstSnapEntity,
            new Quaternion()
          ).multiply(attachmentPoint.rotation)
          const distance = srcWorldspacePosition.distanceTo(attachmentPointWorldSpacePosition)
          //store the attachment point transform and selected attachment point
          if (distance < shortestDistance) {
            shortestDistance = distance
            const closestRotation = findClosestRotation(4, srcWorldspaceRotation, attachmentPointWorldSpaceRotation)
            const candidateShortestAngle = srcWorldspaceRotation.angleTo(closestRotation)
            if (candidateShortestAngle < shortestAngle) {
              shortestAngle = candidateShortestAngle
              srcAttachmentPoint = selectedAttachmentPoint
              srcPosition = srcWorldspacePosition
              srcRotation = srcWorldspaceRotation
              dstAttachmentPoint = attachmentPoint
              dstPosition = attachmentPointWorldSpacePosition
              dstRotation = closestRotation
              srcSnapEntity = selectedObjSnapEntity
              dstSnapEntity = candidateDstSnapEntity
            }
          }
        }
      }
    }
  }
  //snap two object according two closest attachment points
  // if (shortestDistance < threshold && closestPosition && closestRotation && node && shortestDistance!=0) {
  if (
    shortestDistance < threshold &&
    srcPosition &&
    srcRotation &&
    dstPosition &&
    dstRotation &&
    srcSnapEntity &&
    shortestDistance != 0
  ) {
    let selectParententityFinal = srcSnapEntity
    while (!selectionState.selectedEntities.value.includes(selectParententityFinal)) {
      const parent = getComponent(selectParententityFinal, EntityTreeComponent).parentEntity
      if (!parent) break
      selectParententityFinal = parent
    }
    const srcPointTransform = getComponent(srcSnapEntity, TransformComponent)
    if (selectParententityFinal) {
      const parentTransform = getComponent(selectParententityFinal, TransformComponent)
      const q1 = srcRotation.clone()
      const q2 = dstRotation.clone()

      // Compute the alignment quaternion
      const alignment = q2.clone().multiply(q1.clone().conjugate())

      // Apply this combined rotation to the parent's rotation
      const initialRotation = alignment.multiply(parentTransform.rotation.clone())
      const flipRotation = flipAround(initialRotation)
      // Apply the flip to the parent's rotation
      const rotation = flipRotation.multiply(initialRotation)

      setComponent(selectParententityFinal, TransformComponent, {
        rotation
      })
      computeTransformMatrix(srcSnapEntity)
      const nuSrcPosition = srcAttachmentPoint!.position.clone().applyMatrix4(srcPointTransform.matrix)
      const dstPointTransform = getComponent(dstSnapEntity!, TransformComponent)
      const nuDstPosition = dstAttachmentPoint!.position.clone().applyMatrix4(dstPointTransform.matrix)
      const position = parentTransform.position.clone().add(nuDstPosition.clone().sub(nuSrcPosition))
      setComponent(selectParententityFinal, TransformComponent, {
        position
      })
    }
  }
}

export const AttachmentPointSystem = defineSystem({
  uuid: 'ee.engine.AttachmentPointSystem',
  insert: { after: TransformSystem },
  execute
})
