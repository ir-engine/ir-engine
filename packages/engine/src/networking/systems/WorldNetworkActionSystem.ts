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

import { useEffect } from 'react'

import { defineActionQueue, removeActionQueue } from '@etherealengine/hyperflux'

import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { WorldNetworkAction } from '../functions/WorldNetworkAction'
import { WorldNetworkActionReceptor } from '../functions/WorldNetworkActionReceptor'

const spawnObjectQueue = defineActionQueue(WorldNetworkAction.spawnObject.matches)
const registerSceneObjectQueue = defineActionQueue(WorldNetworkAction.registerSceneObject.matches)
const spawnDebugPhysicsObjectQueue = defineActionQueue(WorldNetworkAction.spawnDebugPhysicsObject.matches)
const destroyObjectQueue = defineActionQueue(WorldNetworkAction.destroyObject.matches)
const requestAuthorityOverObjectQueue = defineActionQueue(WorldNetworkAction.requestAuthorityOverObject.matches)
const transferAuthorityOfObjectQueue = defineActionQueue(WorldNetworkAction.transferAuthorityOfObject.matches)
const setUserTypingQueue = defineActionQueue(WorldNetworkAction.setUserTyping.matches)

const execute = () => {
  for (const action of spawnObjectQueue()) {
    console.log(action)
    WorldNetworkActionReceptor.receiveSpawnObject(action)
  }
  for (const action of registerSceneObjectQueue()) WorldNetworkActionReceptor.receiveRegisterSceneObject(action)
  for (const action of spawnDebugPhysicsObjectQueue()) WorldNetworkActionReceptor.receiveSpawnDebugPhysicsObject(action)
  for (const action of destroyObjectQueue()) WorldNetworkActionReceptor.receiveDestroyObject(action)
  for (const action of requestAuthorityOverObjectQueue())
    WorldNetworkActionReceptor.receiveRequestAuthorityOverObject(action)
  for (const action of transferAuthorityOfObjectQueue())
    WorldNetworkActionReceptor.receiveTransferAuthorityOfObject(action)
  for (const action of setUserTypingQueue()) WorldNetworkActionReceptor.receiveSetUserTyping(action)
}

export const WorldNetworkActionSystem = defineSystem({
  uuid: 'ee.engine.WorldNetworkActionSystem',
  execute
})
