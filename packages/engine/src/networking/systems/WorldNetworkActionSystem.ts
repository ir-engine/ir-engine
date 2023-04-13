import { createActionQueue, removeActionQueue } from '@etherealengine/hyperflux'

import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { WorldNetworkAction } from '../functions/WorldNetworkAction'
import { WorldNetworkActionReceptor } from '../functions/WorldNetworkActionReceptor'

const spawnObjectQueue = createActionQueue(WorldNetworkAction.spawnObject.matches)
const registerSceneObjectQueue = createActionQueue(WorldNetworkAction.registerSceneObject.matches)
const spawnDebugPhysicsObjectQueue = createActionQueue(WorldNetworkAction.spawnDebugPhysicsObject.matches)
const destroyObjectQueue = createActionQueue(WorldNetworkAction.destroyObject.matches)
const requestAuthorityOverObjectQueue = createActionQueue(WorldNetworkAction.requestAuthorityOverObject.matches)
const transferAuthorityOfObjectQueue = createActionQueue(WorldNetworkAction.transferAuthorityOfObject.matches)
const setUserTypingQueue = createActionQueue(WorldNetworkAction.setUserTyping.matches)

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

const reactor = () => {
  useEffect(() => {
    return () => {
      removeActionQueue(spawnObjectQueue)
      removeActionQueue(registerSceneObjectQueue)
      removeActionQueue(spawnDebugPhysicsObjectQueue)
      removeActionQueue(destroyObjectQueue)
      removeActionQueue(requestAuthorityOverObjectQueue)
      removeActionQueue(transferAuthorityOfObjectQueue)
      removeActionQueue(setUserTypingQueue)
    }
  }, [])
  return null
}

export const WorldNetworkActionSystem = defineSystem({
  uuid: 'ee.engine.WorldNetworkActionSystem',
  execute,
  reactor
})
