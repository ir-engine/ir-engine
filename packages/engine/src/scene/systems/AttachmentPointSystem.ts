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

import { hasComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeComponent, iterateEntityNode } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { getMutableState } from '@etherealengine/hyperflux'
import { Vector3 } from 'three'
import { SelectionState } from '../../../../../packages/editor/src/services/SelectionServices'
import { Entity } from '../../ecs/classes/Entity'
import { defineQuery, getComponent, updateComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AttachmentPointComponent } from '../components/AttachmentPointComponent'

const execute = () => {
  const attachmentPointQuery = defineQuery([AttachmentPointComponent])

  function Distance(point1: Vector3, point2: Vector3) {
    const dx = point2.x - point1.x
    const dy = point2.y - point1.y
    const dz = point2.z - point1.z
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
    return distance
  }

  //cauculate select entity
  const selectionState = getMutableState(SelectionState) //access the list of currently selected entities
  const select_entities = selectionState.selectedEntities.value.flatMap((entity: Entity) => {
    return iterateEntityNode(
      entity,
      (e) => e,
      (e) => hasComponent(e, AttachmentPointComponent)
    )
  })

  //loop to caculate the distance
  for (const select_entity of select_entities) {
    const threshold = 1.0
    let shortestDistance = Infinity
    let distance
    let node: Entity
    node = createEntity()
    const selectAttachmentPoint = getComponent(select_entity, TransformComponent)
    const selectParententity = getComponent(select_entity, EntityTreeComponent).parentEntity
    if (selectParententity) {
      const selectTransform = getComponent(selectParententity, TransformComponent)

      for (const entity of attachmentPointQuery()) {
        const transform = getComponent(entity, TransformComponent)
        const attachmentPoint = getComponent(entity, TransformComponent)
        const Parententity = getComponent(select_entity, EntityTreeComponent).parentEntity
        if (Parententity) {
          const parentTransform = getComponent(Parententity, TransformComponent)
          distance = Distance(
            selectTransform.position.add(selectAttachmentPoint.position),
            parentTransform.position.add(attachmentPoint.position)
          )
          if (distance < shortestDistance) {
            shortestDistance = distance
            node = entity
            //}
          }
        }
      }
      if (shortestDistance < threshold) {
        //offset between shortist attachment point and select point
        const offset = getComponent(node, TransformComponent).position.sub(selectAttachmentPoint.position)
        selectTransform.position.add(offset)
        updateComponent(selectParententity, TransformComponent, selectTransform)
      }
    }
  }

  AttachmentPointSystem // if so, attach to that point
}

export const AttachmentPointSystem = defineSystem({
  uuid: 'ee.engine.AttachmentPointSystem',
  execute
})
