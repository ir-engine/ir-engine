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

import { Validator } from 'ts-matches'

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { dispatchAction, getMutableState, none } from '@etherealengine/hyperflux'
import { Action, ResolvedActionType } from '@etherealengine/hyperflux/functions/ActionFunctions'

import { AvatarNetworkAction } from '../../avatar/state/AvatarNetworkActions'
import { Engine } from '../../ecs/classes/Engine'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { NetworkState } from '../NetworkState'
import { Network } from '../classes/Network'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { WorldState } from '../interfaces/WorldState'
import { WorldNetworkAction } from './WorldNetworkAction'

function createPeer(
  network: Network,
  peerID: PeerID,
  peerIndex: number,
  userID: UserID,
  userIndex: number,
  name: string
) {
  const networkState = getMutableState(NetworkState).networks[network.id]

  networkState.userIDToUserIndex[userID].set(userIndex)
  networkState.userIndexToUserID[userIndex].set(userID)
  networkState.peerIDToPeerIndex[peerID].set(peerIndex)
  networkState.peerIndexToPeerID[peerIndex].set(peerID)

  networkState.peers.merge({
    [peerID]: {
      peerID,
      peerIndex,
      userId: userID,
      userIndex
    }
  })

  if (!network.users[userID]) {
    networkState.users.merge({ [userID]: [peerID] })
  } else {
    if (!network.users[userID]!.includes(peerID)) networkState.users[userID].merge([peerID])
  }

  const worldState = getMutableState(WorldState)
  worldState.userNames[userID].set(name)
}

function destroyPeer(network: Network, peerID: PeerID) {
  if (!network.peers[peerID])
    return console.warn(`[NetworkPeerFunctions]: tried to remove client with peerID ${peerID} that doesn't exit`)

  if (peerID === Engine.instance.peerID) return console.warn(`[NetworkPeerFunctions]: tried to remove local client`)

  // reactively set
  const userID = network.peers[peerID]!.userId

  const networkState = getMutableState(NetworkState).networks[network.id]
  networkState.peers[peerID].set(none)

  const userIndex = network.userIDToUserIndex[userID]!
  networkState.userIDToUserIndex[userID].set(none)
  networkState.userIndexToUserID[userIndex].set(none)

  const peerIndex = network.peerIDToPeerIndex[peerID]!
  networkState.peerIDToPeerIndex[peerID].set(none)
  networkState.peerIndexToPeerID[peerIndex].set(none)

  const userPeers = network.users[userID]!
  const peerIndexInUserPeers = userPeers.indexOf(peerID)
  userPeers.splice(peerIndexInUserPeers, 1)
  if (!userPeers.length) networkState.users[userID].set(none)

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
    if (!network.users[userID] && network.isHosting) {
      // Engine.instance.store.actions.cached = Engine.instance.store.actions.cached.filter((a) => a.$from !== userID)
      for (const eid of NetworkObjectComponent.getOwnedNetworkObjects(userID)) {
        const networkObject = getComponent(eid, NetworkObjectComponent)
        if (networkObject) {
          dispatchAction(
            WorldNetworkAction.destroyObject({ entityUUID: getComponent(eid, UUIDComponent), $from: userID })
          )
        }
      }
      // clearCachedActionsForUser(userID)
      // clearActionsHistoryForUser(userID)
    }
  }
}

const destroyAllPeers = (network: Network) => {
  for (const [peerID] of Object.entries(network.peers)) NetworkPeerFunctions.destroyPeer(network, peerID as PeerID)
}

function clearActionsHistoryForUser(userId: UserID) {
  for (const action of Engine.instance.store.actions.history) {
    if (action.$from === userId) {
      Engine.instance.store.actions.knownUUIDs.delete(action.$uuid)
    }
  }
}

function clearCachedActionsForUser(userId: UserID) {
  const cached = Engine.instance.store.actions.cached
  for (const action of [...cached]) {
    if (action.$from === userId) {
      const idx = cached.indexOf(action)
      cached.splice(idx, 1)
    }
  }
}

function clearCachedActionsOfTypeForUser(userId: UserID, actionShape: Validator<unknown, ResolvedActionType>) {
  const cached = Engine.instance.store.actions.cached
  for (const action of [...cached]) {
    if (action.$from === userId && actionShape.test(action)) {
      const idx = cached.indexOf(action)
      cached.splice(idx, 1)
    }
  }
}

function getCachedActionsForPeer(toPeerID: PeerID) {
  // send all cached and outgoing actions to joining user
  const cachedActions = [] as Required<Action>[]
  for (const action of Engine.instance.store.actions.cached as Array<ReturnType<typeof AvatarNetworkAction.spawn>>) {
    if (action.$peer === toPeerID) continue
    if (action.$to === 'all' || action.$to === toPeerID) cachedActions.push({ ...action, $stack: undefined! })
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
  getCachedActionsForPeer
}
