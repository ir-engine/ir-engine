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

import React, { useEffect } from 'react'

import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { State, defineActionQueue, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { NetworkActions, NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { NetworkPeerFunctions } from '@etherealengine/engine/src/networking/functions/NetworkPeerFunctions'
import { MediasoupMediaConsumerActions } from '@etherealengine/engine/src/networking/systems/MediasoupMediaProducerConsumerState'
import {
  MediasoupTransportActions,
  MediasoupTransportObjectsState,
  MediasoupTransportState
} from '@etherealengine/engine/src/networking/systems/MediasoupTransportState'
import { InstanceID } from '@etherealengine/engine/src/schemas/networking/instance.schema'
import { PeerMediaConsumers } from '../media/PeerMedia'
import {
  SocketWebRTCClientNetwork,
  WebRTCTransportExtension,
  onTransportCreated,
  receiveConsumerHandler
} from '../transports/SocketWebRTCClientFunctions'
import { InstanceProvisioning } from './NetworkInstanceProvisioning'

const consumerCreatedQueue = defineActionQueue(MediasoupMediaConsumerActions.consumerCreated.matches)
const transportCreatedActionQueue = defineActionQueue(MediasoupTransportActions.transportCreated.matches)
const updatePeersActionQueue = defineActionQueue(NetworkActions.updatePeers.matches)

const execute = () => {
  for (const action of consumerCreatedQueue()) receiveConsumerHandler(action)
  for (const action of transportCreatedActionQueue()) onTransportCreated(action)
  // TODO replace with event sourcing
  for (const action of updatePeersActionQueue()) {
    const network = getState(NetworkState).networks[action.$network] as SocketWebRTCClientNetwork

    for (const peer of action.peers) {
      NetworkPeerFunctions.createPeer(network, peer.peerID, peer.peerIndex, peer.userID, peer.userIndex, peer.name)
    }
    for (const [peerID, peer] of Object.entries(network.peers))
      if (!action.peers.find((p) => p.peerID === peerID)) {
        NetworkPeerFunctions.destroyPeer(network, peerID as PeerID)
      }
  }
}

const NetworkConnectionReactor = (props: { networkID: InstanceID }) => {
  const networkState = getMutableState(NetworkState).networks[props.networkID] as State<SocketWebRTCClientNetwork>
  const transportState = useHookstate(getMutableState(MediasoupTransportObjectsState))

  useEffect(() => {
    const sendTransport = MediasoupTransportState.getTransport(props.networkID, 'send') as WebRTCTransportExtension
    const recvTransport = MediasoupTransportState.getTransport(props.networkID, 'recv') as WebRTCTransportExtension
    networkState.ready.set(!!recvTransport && !!sendTransport)
  }, [transportState])

  return null
}

const reactor = () => {
  const networkIDs = Object.keys(useHookstate(getMutableState(NetworkState).networks).value)

  return (
    <>
      {networkIDs.map((id: InstanceID) => (
        <NetworkConnectionReactor key={id} networkID={id} />
      ))}
      <PeerMediaConsumers />
      <InstanceProvisioning />
    </>
  )
}

export const ClientNetworkingSystem = defineSystem({
  uuid: 'ee.client.ClientNetworkingSystem',
  insert: { after: PresentationSystemGroup },
  execute,
  reactor
})
