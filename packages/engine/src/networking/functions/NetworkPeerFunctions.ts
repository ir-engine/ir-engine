import { Validator } from 'ts-matches'

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { getState } from '@etherealengine/hyperflux'
import { Action, ActionShape, ResolvedActionType } from '@etherealengine/hyperflux/functions/ActionFunctions'
import { none } from '@etherealengine/hyperflux/functions/StateFunctions'

import { Engine } from '../../ecs/classes/Engine'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { removeEntity } from '../../ecs/functions/EntityFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Network } from '../classes/Network'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { WorldState } from '../interfaces/WorldState'
import { WorldNetworkAction } from './WorldNetworkAction'

function createPeer(
  network: Network,
  peerID: PeerID,
  peerIndex: number,
  userID: UserId,
  userIndex: number,
  name: string,
  world = Engine.instance.currentWorld
) {
  console.log('[Network]: Create Peer', network.topic, peerID, peerIndex, userID, userIndex, name)

  network.userIDToUserIndex.set(userID, userIndex)
  network.userIndexToUserID.set(userIndex, userID)
  network.peerIDToPeerIndex.set(peerID, peerIndex)
  network.peerIndexToPeerID.set(peerIndex, peerID)

  network.peers.set(peerID, {
    peerID,
    peerIndex,
    userId: userID,
    userIndex
  })

  const worldState = getState(WorldState)
  worldState.userNames[userID].set(name)
}

function destroyPeer(network: Network, peerID: PeerID, world = Engine.instance.currentWorld) {
  console.log('[Network]: Destroy Peer', network.topic, peerID)
  if (!network.peers.has(peerID))
    return console.warn(`[WorldNetworkActionReceptors]: tried to remove client with peerID ${peerID} that doesn't exit`)
  const userID = network.peers.get(peerID)!.userId
  if (userID === Engine.instance.userId)
    return console.warn(`[WorldNetworkActionReceptors]: tried to remove local client`)

  network.peers.delete(peerID)

  const userIndex = network.userIDToUserIndex.get(userID)!
  network.userIDToUserIndex.delete(userID)
  network.userIndexToUserID.delete(userIndex)

  const peerIndex = network.peerIDToPeerIndex.get(peerID)!
  network.peerIDToPeerIndex.delete(peerID)
  network.peerIndexToPeerID.delete(peerIndex)

  /**
   * if no other connections exist for this user, and this action is occurring on the world network,
   * we want to remove them from world.users
   */
  if (network.topic === 'world') {
    const remainingPeersForDisconnectingUser = Object.entries(world.networks.entries())
      .map(([id, network]: [string, Network]) => {
        return network.peers.has(peerID)
      })
      .filter((peer) => !!peer)

    if (!remainingPeersForDisconnectingUser.length) {
      Engine.instance.store.actions.cached = Engine.instance.store.actions.cached.filter((a) => a.$from !== userID)
      for (const eid of world.getOwnedNetworkObjects(userID)) removeEntity(eid)
    }

    clearCachedActionsForUser(userID)
    clearActionsHistoryForUser(userID)
  }
}

const destroyAllPeers = (network: Network, world = Engine.instance.currentWorld) => {
  for (const [userId] of network.peers) NetworkPeerFunctions.destroyPeer(network, userId, world)
}

function clearActionsHistoryForUser(userId: UserId) {
  for (const action of Engine.instance.store.actions.history) {
    if (action.$from === userId) {
      Engine.instance.store.actions.knownUUIDs.delete(action.$uuid)
    }
  }
}

function clearCachedActionsForUser(userId: UserId) {
  const cached = Engine.instance.store.actions.cached
  for (const action of [...cached]) {
    if (action.$from === userId) {
      const idx = cached.indexOf(action)
      cached.splice(idx, 1)
    }
  }
}

function clearCachedActionsOfTypeForUser(userId: UserId, actionShape: Validator<unknown, ResolvedActionType>) {
  const cached = Engine.instance.store.actions.cached
  for (const action of [...cached]) {
    if (action.$from === userId && actionShape.test(action)) {
      const idx = cached.indexOf(action)
      cached.splice(idx, 1)
    }
  }
}

function getCachedActionsForUser(toUserId: UserId) {
  // send all cached and outgoing actions to joining user
  const cachedActions = [] as Required<Action>[]
  for (const action of Engine.instance.store.actions.cached as Array<
    ReturnType<typeof WorldNetworkAction.spawnAvatar>
  >) {
    if (action.$from === toUserId) continue
    if (action.$to === 'all' || action.$to === toUserId) cachedActions.push({ ...action, $stack: undefined! })
  }

  return cachedActions
}

export const NetworkPeerFunctions = {
  createPeer,
  destroyPeer,
  destroyAllPeers,
  clearCachedActionsForUser,
  clearCachedActionsOfTypeForUser,
  getCachedActionsForUser
}
