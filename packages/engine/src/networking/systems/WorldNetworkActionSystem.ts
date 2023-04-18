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
  for (const action of spawnObjectQueue()) WorldNetworkActionReceptor.receiveSpawnObject(action)
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
