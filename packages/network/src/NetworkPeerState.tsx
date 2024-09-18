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

import { NetworkID, PeerID, defineState, getMutableState, getState, none, useMutableState } from '@ir-engine/hyperflux'
import React, { useEffect } from 'react'
import { NetworkActions, NetworkPeer, NetworkState } from './NetworkState'
import { NetworkPeerFunctions } from './functions/NetworkPeerFunctions'

export const NetworkPeerState = defineState({
  name: 'ir.network.NetworkPeerState',
  initial: {} as Record<NetworkID, { [peerID: PeerID]: NetworkPeer }>,
  receptors: {
    onUpdatePeers: NetworkActions.updatePeers.receive((action) => {
      const network = getState(NetworkState).networks[action.$network]
      if (!network) {
        console.error(`NetworkPeerState: network ${action.$network} not found`)
        return
      }

      const state = getMutableState(NetworkPeerState)
      if (!state.value[action.$network]) {
        state[action.$network].set({})
      }

      for (const peer of action.peers) {
        state[action.$network][peer.peerID].set({
          peerID: peer.peerID,
          peerIndex: peer.peerIndex,
          userId: peer.userID,
          userIndex: peer.userIndex
        })
      }

      for (const peerID of Object.keys(state[action.$network])) {
        if (!action.peers.find((p) => p.peerID === peerID)) {
          state[action.$network][peerID].set(none)
        }
      }
    })
  },

  reactor() {
    const state = useMutableState(NetworkPeerState)
    return (
      <>
        {state.keys.map((networkID: NetworkID) => (
          <NetworkReactor key={networkID} networkID={networkID} />
        ))}
      </>
    )
  }
})

const NetworkReactor = (props: { networkID: NetworkID }) => {
  const { networkID } = props
  const state = useMutableState(NetworkPeerState)[networkID]

  const network = useMutableState(NetworkState).networks[networkID]

  useEffect(() => {
    if (network) return () => state.set(none)
  }, [network])

  if (!network) return null

  return (
    <>
      {state.keys.map((peerID: PeerID) => (
        <PeerReactor key={peerID} peerID={peerID} networkID={networkID} />
      ))}
    </>
  )
}

const PeerReactor = (props: { peerID: PeerID; networkID: NetworkID }) => {
  const { peerID, networkID } = props

  useEffect(() => {
    const network = getState(NetworkState).networks[networkID]
    const peer = getState(NetworkPeerState)[networkID][peerID]
    NetworkPeerFunctions.createPeer(network, peer.peerID, peer.peerIndex, peer.userId, peer.userIndex)

    return () => {
      /** @todo why do we need this? */
      // const otherNetworkWithPeer = Object.values(getState(NetworkState).networks).find((n) => n.peers[peerID])
      // if (!otherNetworkWithPeer) {
      NetworkPeerFunctions.destroyPeer(network, peerID)
      // }
    }
  }, [])

  return null
}
