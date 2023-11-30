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

import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import {
  defineQuery,
  getComponent,
  hasComponent,
  setComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeComponent, iterateEntityNode } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { AttachmentPointComponent } from '@etherealengine/engine/src/scene/components/AttachmentPointComponent'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { TransformSystem, computeTransformMatrix } from '@etherealengine/engine/src/transform/systems/TransformSystem'
import { getMutableState, getState } from '@etherealengine/hyperflux'
import { Quaternion, Vector3 } from 'three'
import { EditorHelperState } from '../services/EditorHelperState'
import { SelectionState } from '../services/SelectionServices'
let lastExecutionTime = 0
const interval = 100
const execute = () => {
  //only execute if attachment point snap is enabled
  const helperState = getState(EditorHelperState)
  if (!helperState.attachmentPointSnap) return

  //execute according to interval
  const now = Date.now()
  if (now - lastExecutionTime < interval) return
  lastExecutionTime = now
  const attachmentPointQuery = defineQuery([AttachmentPointComponent])

  //calculate select entity
  const selectionState = getMutableState(SelectionState) //access the list of currently selected entities
  const selectedAttachmentPoints = selectionState.selectedEntities.value.flatMap((entity: Entity) => {
    return iterateEntityNode(
      entity,
      (e) => e,
      (e) => hasComponent(e, AttachmentPointComponent)
    )
  })
  let shortestDistance = Infinity
  let dstPosition: Vector3 | null = null
  let dstRotation: Quaternion | null = null
  let node: Entity | null = null

  const threshold = 1
  //loop to caculate the distance
  for (const selectedAttachmentPoint of selectedAttachmentPoints) {
    //find the select attacment point in select ararry
    //const selectedTransform = getComponent(selectedAttachmentPoint, TransformComponent)
    const selectChildEntity = getComponent(selectedAttachmentPoint, EntityTreeComponent).children
    //only process select attachment point not parent entity
    if (selectChildEntity.length != 0) continue
    //const selectTransform = getComponent(selectParententity, TransformComponent)
    const selectTransform = getComponent(selectedAttachmentPoint, TransformComponent)
    for (const entity of attachmentPointQuery()) {
      if (selectedAttachmentPoints.includes(entity)) continue

      if (selectedAttachmentPoints.length == 1) {
        const childPoints = getComponent(
          getComponent(selectedAttachmentPoints as unknown as Entity, EntityTreeComponent).parentEntity as Entity,
          EntityTreeComponent
        ).children
        if (childPoints.includes(entity)) continue
      }
      if (getComponent(entity, EntityTreeComponent).children.length != 0) continue

      //if selected attachment point
      const transform = getComponent(entity, TransformComponent)
      const distance = transform.position.distanceTo(selectTransform.position)
      //store the attachment point transform and selected attachment point
      if (distance < shortestDistance) {
        shortestDistance = distance
        dstPosition = transform.position
        dstRotation = transform.rotation
        node = selectedAttachmentPoint
      }
    }
  }
  //snap two object according two closest attachment points
  // if (shortestDistance < threshold && closestPosition && closestRotation && node && shortestDistance!=0) {
  if (shortestDistance < threshold && dstPosition && dstRotation && node && shortestDistance != 0) {
    const selectParententityFinal = getComponent(node, EntityTreeComponent).parentEntity
    const srcPointTransform = getComponent(node, TransformComponent)
    if (selectParententityFinal) {
      const parentTransform = getComponent(selectParententityFinal, TransformComponent)
      const q1 = srcPointTransform.rotation.clone()
      const q2 = dstRotation.clone()

      // Compute the alignment quaternion
      const alignment = q2.clone().multiply(q1.clone().conjugate())

      // Apply this combined rotation to the parent's rotation
      const initialRotation = alignment.multiply(parentTransform.rotation.clone())

      const localYAxis = new Vector3(0, 1, 0)
      localYAxis.applyQuaternion(initialRotation)
      const flipAround = new Quaternion().setFromAxisAngle(localYAxis, Math.PI)

      // Apply the flip to the parent's rotation
      const rotation = flipAround.multiply(initialRotation)

      setComponent(selectParententityFinal, TransformComponent, {
        rotation
      })
      computeTransformMatrix(node)
      const position = parentTransform.position.clone().add(dstPosition.clone().sub(srcPointTransform.position))
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
