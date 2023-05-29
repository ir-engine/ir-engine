import { Validator } from 'ts-matches'

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { dispatchAction, getMutableState } from '@etherealengine/hyperflux'
import { Action, ResolvedActionType } from '@etherealengine/hyperflux/functions/ActionFunctions'
import { getState, none } from '@etherealengine/hyperflux/functions/StateFunctions'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { removeEntity } from '../../ecs/functions/EntityFunctions'
import { Network, NetworkTopics } from '../classes/Network'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { WorldState } from '../interfaces/WorldState'
import { NetworkState, updateNetwork } from '../NetworkState'
import { WorldNetworkAction } from './WorldNetworkAction'

function createPeer(
  network: Network,
  peerID: PeerID,
  peerIndex: number,
  userID: UserId,
  userIndex: number,
  name: string
) {
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

  if (!network.users.has(userID)) {
    network.users.set(userID, [peerID])
  } else {
    if (!network.users.get(userID)!.includes(peerID)) network.users.get(userID)!.push(peerID)
  }

  //TODO: remove this once all network state properties are reactively set
  updateNetwork(network)

  // TODO: we probably want an explicit config for detecting a non-user peer
  if (peerID !== 'server') {
    const worldState = getMutableState(WorldState)
    worldState.userNames[userID].set(name)
  }
}

function destroyPeer(network: Network, peerID: PeerID) {
  if (!network.peers.has(peerID))
    return console.warn(`[NetworkPeerFunctions]: tried to remove client with peerID ${peerID} that doesn't exit`)
  const userID = network.peers.get(peerID)!.userId
  if (userID === Engine.instance.userId) return console.warn(`[NetworkPeerFunctions]: tried to remove local client`)

  network.peers.delete(peerID)

  const userIndex = network.userIDToUserIndex.get(userID)!
  network.userIDToUserIndex.delete(userID)
  network.userIndexToUserID.delete(userIndex)

  const peerIndex = network.peerIDToPeerIndex.get(peerID)!
  network.peerIDToPeerIndex.delete(peerID)
  network.peerIndexToPeerID.delete(peerIndex)

  const userPeers = network.users.get(userID)!
  const peerIndexInUserPeers = userPeers.indexOf(peerID)
  userPeers.splice(peerIndexInUserPeers, 1)
  if (!userPeers.length) network.users.delete(userID)

  //TODO: remove this once all network state properties are reactively set
  updateNetwork(network)

  /**
   * if no other connections exist for this user, and this action is occurring on the world network,
   * we want to remove them from world.users
   */
  if (network.topic === 'world') {
    // todo - when multiple world servers are running, we may need to do this
    // const remainingPeersForDisconnectingUser = Object.entries(getState(NetworkState).networks)
    //   .map(([id, network]) => {
    //     return network.users.has(userID)
    //   })
    //   .filter((peer) => !!peer)
    // console.log({remainingPeersForDisconnectingUser})
    if (!network.users.has(userID) && network.isHosting) {
      // Engine.instance.store.actions.cached = Engine.instance.store.actions.cached.filter((a) => a.$from !== userID)
      for (const eid of Engine.instance.getOwnedNetworkObjects(userID)) {
        const networkObject = getComponent(eid, NetworkObjectComponent)
        if (networkObject) {
          dispatchAction(WorldNetworkAction.destroyObject({ networkId: networkObject.networkId, $from: userID }))
        }
      }
      // clearCachedActionsForUser(userID)
      // clearActionsHistoryForUser(userID)
    }
  }
}

const destroyAllPeers = (network: Network) => {
  for (const [userId] of network.peers) NetworkPeerFunctions.destroyPeer(network, userId)
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
  clearActionsHistoryForUser,
  clearCachedActionsOfTypeForUser,
  getCachedActionsForUser
}
