/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { getComponent, getMutableComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { defineActionQueue } from '@ir-engine/hyperflux'

import { TransformComponent } from '../transform/components/TransformComponent'
import { PersistentAnchorActions, PersistentAnchorComponent } from './XRAnchorComponents'
import { XRPersistentAnchorSystem } from './XRPersistentAnchorSystem'

const vpsAnchorQuery = defineQuery([PersistentAnchorComponent])
const vpsAnchorFoundQueue = defineActionQueue(PersistentAnchorActions.anchorFound.matches)
const vpsAnchorUpdatedQueue = defineActionQueue(PersistentAnchorActions.anchorUpdated.matches)
const vpsAnchorLostQueue = defineActionQueue(PersistentAnchorActions.anchorLost.matches)

const execute = () => {
  const anchors = vpsAnchorQuery()

  for (const action of vpsAnchorFoundQueue()) {
    for (const entity of anchors) {
      const anchor = getMutableComponent(entity, PersistentAnchorComponent)
      if (anchor.name.value === action.name) {
        anchor.active.set(true)
        const transform = getComponent(entity, TransformComponent)
        transform.position.copy(action.position)
        transform.rotation.copy(action.rotation)
      }
    }
  }

  for (const action of vpsAnchorUpdatedQueue()) {
    for (const entity of anchors) {
      const anchor = getMutableComponent(entity, PersistentAnchorComponent)
      if (anchor.name.value === action.name) {
        const transform = getComponent(entity, TransformComponent)
        transform.position.copy(action.position)
        transform.rotation.copy(action.rotation)
      }
    }
  }

  for (const action of vpsAnchorLostQueue()) {
    for (const entity of anchors) {
      const anchor = getMutableComponent(entity, PersistentAnchorComponent)
      if (anchor.name.value === action.name) anchor.active.set(false)
    }
  }
}

export const VPSSystem = defineSystem({
  uuid: 'ee.engine.VPSSystem',
  insert: { after: XRPersistentAnchorSystem },
  execute
})
