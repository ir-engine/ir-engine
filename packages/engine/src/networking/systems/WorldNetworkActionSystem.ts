import { createActionQueue } from '@xrengine/hyperflux'

import { WorldNetworkAction } from '../functions/WorldNetworkAction'
import { WorldNetworkActionReceptor } from '../functions/WorldNetworkActionReceptor'

/**
 * @author Gheric Speiginer <github.com/speigg>
 * @author Josh Field <github.com/HexaField>
 */
export default async function WorldNetworkActionSystem() {
  const createPeerQueue = createActionQueue(WorldNetworkAction.createPeer.matches)
  const destroyPeerQueue = createActionQueue(WorldNetworkAction.destroyPeer.matches)
  const spawnObjectQueue = createActionQueue(WorldNetworkAction.spawnObject.matches)
  const spawnDebugPhysicsObjectQueue = createActionQueue(WorldNetworkAction.spawnDebugPhysicsObject.matches)
  const destroyObjectQueue = createActionQueue(WorldNetworkAction.destroyObject.matches)
  const requestAuthorityOverObjectQueue = createActionQueue(WorldNetworkAction.requestAuthorityOverObject.matches)
  const transferAuthorityOfObjectQueue = createActionQueue(WorldNetworkAction.transferAuthorityOfObject.matches)
  const setEquippedObjectQueue = createActionQueue(WorldNetworkAction.setEquippedObject.matches)
  const setUserTypingQueue = createActionQueue(WorldNetworkAction.setUserTyping.matches)

  return () => {
    for (const action of createPeerQueue()) WorldNetworkActionReceptor.receiveCreatePeers(action)
    for (const action of destroyPeerQueue()) WorldNetworkActionReceptor.receiveDestroyPeers(action)
    for (const action of spawnDebugPhysicsObjectQueue())
      WorldNetworkActionReceptor.receiveSpawnDebugPhysicsObject(action)
    for (const action of spawnObjectQueue()) WorldNetworkActionReceptor.receiveSpawnObject(action)
    for (const action of destroyObjectQueue()) WorldNetworkActionReceptor.receiveDestroyObject(action)
    for (const action of requestAuthorityOverObjectQueue())
      WorldNetworkActionReceptor.receiveRequestAuthorityOverObject(action)
    for (const action of transferAuthorityOfObjectQueue())
      WorldNetworkActionReceptor.receiveTransferAuthorityOfObject(action)
    for (const action of setEquippedObjectQueue()) WorldNetworkActionReceptor.receiveSetEquippedObject(action)
    for (const action of setUserTypingQueue()) WorldNetworkActionReceptor.receiveSetUserTyping(action)
  }
}
