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

import { NetworkID, PeerID, UserID, defineState, getMutableState, none } from '@ir-engine/hyperflux'
import { NetworkActions, NetworkPeer } from './NetworkState'

export const NetworkPeerState = defineState({
  name: 'ir.network.NetworkPeerState',
  initial: {} as Record<
    NetworkID,
    {
      peers: Record<PeerID, NetworkPeer>
      peerIndexToPeerID: Record<number, PeerID>
      peerIDToPeerIndex: Record<PeerID, number>
      users: Record<UserID, PeerID[]>
    }
  >,
  receptors: {
    onPeerJoined: NetworkActions.peerJoined.receive((action) => {
      const state = getMutableState(NetworkPeerState)
      if (!state.value[action.$network]) {
        state[action.$network].set({
          peers: {},
          peerIDToPeerIndex: {},
          peerIndexToPeerID: {},
          users: {}
        })
      }
      state[action.$network].peers[action.peerID].set({
        peerID: action.peerID,
        peerIndex: action.peerIndex,
        userId: action.userID
      })

      state[action.$network].peerIDToPeerIndex[action.peerID].set(action.peerIndex)
      state[action.$network].peerIndexToPeerID[action.peerIndex].set(action.peerID)

      if (!state[action.$network].users.value[action.userID]) {
        state[action.$network].users.merge({ [action.userID]: [action.peerID] })
      } else {
        if (!state[action.$network].users[action.userID].value!.includes(action.peerID))
          state[action.$network].users[action.userID].merge([action.peerID])
      }
    }),
    onPeerLeft: NetworkActions.peerLeft.receive((action) => {
      const state = getMutableState(NetworkPeerState)

      if (!state[action.$network].peers[action.peerID]) {
        console.error(`NetworkPeerState: peer ${action.peerID} not found`)
        return
      }

      // reactively set
      const userID = state[action.$network].peers[action.peerID]!.userId.value

      state[action.$network].peers[action.peerID].set(none)

      const peerIndex = state[action.$network].peerIDToPeerIndex[action.peerID]!.value
      state[action.$network].peerIDToPeerIndex[action.peerID].set(none)
      state[action.$network].peerIndexToPeerID[peerIndex].set(none)

      const userPeers = state[action.$network].users[userID]!
      const index = userPeers.value.indexOf(action.peerID)
      userPeers[index].set(none)

      if (!userPeers.length) state[action.$network].users[userID].set(none)
      if (!state[action.$network].peers.keys.length) state[action.$network].set(none)
    })
  }
})

export const WorldUserState = defineState({
  name: 'ir.network.WorldUserState',
  initial: {} as Record<UserID, Record<NetworkID, PeerID[]>>,
  receptors: {
    onPeerJoined: NetworkActions.peerJoined.receive((action) => {
      const state = getMutableState(WorldUserState)
      if (!state.value[action.userID]) {
        state[action.userID].set({})
      }
      if (!state[action.userID].value[action.$network]) {
        state[action.userID].merge({ [action.$network]: [action.peerID] })
      } else {
        if (!state[action.userID][action.$network].value!.includes(action.peerID))
          state[action.userID][action.$network].merge([action.peerID])
      }
    }),
    onPeerLeft: NetworkActions.peerLeft.receive((action) => {
      const state = getMutableState(WorldUserState)
      const userPeers = state[action.userID][action.$network]!
      const index = userPeers.value.indexOf(action.peerID)
      userPeers[index].set(none)
      if (!userPeers.length) state[action.userID][action.$network].set(none)
      if (!state[action.userID].keys.length) state[action.userID].set(none)
    })
  }
})
