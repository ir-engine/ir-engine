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

import { UserID } from '@etherealengine/common/src/schema.type.module'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { getMutableState, none, PeerID } from '@etherealengine/hyperflux'
import { Action } from '@etherealengine/hyperflux/functions/ActionFunctions'

import { Network } from '../Network'
import { NetworkState } from '../NetworkState'

function createPeer(network: Network, peerID: PeerID, peerIndex: number, userID: UserID, userIndex: number) {
  const networkState = getMutableState(NetworkState).networks[network.id]

  networkState.userIDToUserIndex[userID].set(userIndex)
  networkState.userIndexToUserID[userIndex].set(userID)
  networkState.peerIDToPeerIndex[peerID].set(peerIndex)
  networkState.peerIndexToPeerID[peerIndex].set(peerID)

  networkState.peers[peerID].merge({
    peerID,
    peerIndex,
    userId: userID,
    userIndex
  })

  if (!network.users[userID]) {
    networkState.users.merge({ [userID]: [peerID] })
  } else {
    if (!network.users[userID]!.includes(peerID)) networkState.users[userID].merge([peerID])
  }
}

function destroyPeer(network: Network, peerID: PeerID) {
  if (!network.peers[peerID])
    return console.warn(`[NetworkPeerFunctions]: tried to remove client with peerID ${peerID} that doesn't exit`)

  if (peerID === Engine.instance.store.peerID)
    return console.warn(`[NetworkPeerFunctions]: tried to remove local client`)

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
}

function getCachedActionsForPeer(toPeerID: PeerID) {
  // send all cached and outgoing actions to joining user
  const cachedActions = [] as Required<Action>[]
  for (const action of Engine.instance.store.actions.cached) {
    if (action.$peer === toPeerID) continue
    if (action.$to === 'all' || action.$to === toPeerID) cachedActions.push({ ...action, $stack: undefined! })
  }

  return cachedActions
}

export const NetworkPeerFunctions = {
  createPeer,
  destroyPeer,
  getCachedActionsForPeer
}
