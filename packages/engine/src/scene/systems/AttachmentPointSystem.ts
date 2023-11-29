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

import { hasComponent, setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeComponent, iterateEntityNode } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { getMutableState } from '@etherealengine/hyperflux'
import { Quaternion, Vector3 } from 'three'
import { SelectionState } from '../../../../../packages/editor/src/services/SelectionServices'
import { Entity } from '../../ecs/classes/Entity'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { TransformSystem } from '../../transform/systems/TransformSystem'
import { AttachmentPointComponent } from '../components/AttachmentPointComponent'
const execute = () => {
  const attachmentPointQuery = defineQuery([AttachmentPointComponent])

  //cauculate select entity
  const selectionState = getMutableState(SelectionState) //access the list of currently selected entities
  const selectedAttachmentPoints = selectionState.selectedEntities.value.flatMap((entity: Entity) => {
    return iterateEntityNode(
      entity,
      (e) => e,
      (e) => hasComponent(e, AttachmentPointComponent)
    )
  })
  let shortestDistance = Infinity
  let closestPosition: Vector3 | null = null
  let closestRotation: Quaternion | null = null
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
        closestPosition = transform.position
        closestRotation = transform.rotation
        node = selectedAttachmentPoint
      }
    }
  }
  //snap two object according two closest attachment points
  // if (shortestDistance < threshold && closestPosition && closestRotation && node && shortestDistance!=0) {
  if (shortestDistance < threshold && closestPosition && closestRotation && node && shortestDistance != 0) {
    const selectParententityFinal = getComponent(node, EntityTreeComponent).parentEntity
    const selectedTransformFinal = getComponent(node, TransformComponent)
    if (selectParententityFinal) {
      const selectTransform = getComponent(selectParententityFinal, TransformComponent)
      const localYAxis = new Vector3(0, 1, 0)
      const q = new Quaternion()
      //apply rotation to selected object
      localYAxis.applyQuaternion(closestRotation)
      q.setFromAxisAngle(localYAxis, Math.PI)

      setComponent(selectParententityFinal, TransformComponent, {
        rotation: q.clone().multiply(closestRotation)
      })
      setComponent(selectParententityFinal, TransformComponent, {
        position: selectTransform.position.add(closestPosition.clone().sub(selectedTransformFinal.position))
      })
    }
  }
}

export const AttachmentPointSystem = defineSystem({
  uuid: 'ee.engine.AttachmentPointSystem',
  insert: { after: TransformSystem },
  execute
})
