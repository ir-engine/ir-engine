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

import { defineActionQueue } from '@etherealengine/hyperflux'

import { getComponent, getMutableComponent } from '../ecs/functions/ComponentFunctions'
import { defineQuery } from '../ecs/functions/QueryFunctions'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { LocalTransformComponent } from '../transform/components/TransformComponent'
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
        const localTransform = getComponent(entity, LocalTransformComponent)
        localTransform.position.copy(action.position)
        localTransform.rotation.copy(action.rotation)
      }
    }
  }

  for (const action of vpsAnchorUpdatedQueue()) {
    for (const entity of anchors) {
      const anchor = getMutableComponent(entity, PersistentAnchorComponent)
      if (anchor.name.value === action.name) {
        const localTransform = getComponent(entity, LocalTransformComponent)
        localTransform.position.copy(action.position)
        localTransform.rotation.copy(action.rotation)
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
