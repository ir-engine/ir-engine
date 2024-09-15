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
          userId: peer.userID
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
    NetworkPeerFunctions.createPeer(network, peer.peerID, peer.peerIndex, peer.userId)

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
