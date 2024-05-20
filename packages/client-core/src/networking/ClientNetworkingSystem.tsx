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

import React, { useLayoutEffect } from 'react'

import { InstanceID } from '@etherealengine/common/src/schema.type.module'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@etherealengine/ecs/src/SystemGroups'
import {
  defineActionQueue,
  getMutableState,
  getState,
  PeerID,
  useHookstate,
  useMutableState
} from '@etherealengine/hyperflux'
import {
  MediasoupMediaConsumerActions,
  MediasoupTransportActions,
  MediasoupTransportObjectsState,
  MediasoupTransportState,
  NetworkActions,
  NetworkPeerFunctions,
  NetworkState
} from '@etherealengine/network'

import { PeerMediaConsumers } from '../media/PeerMedia'
import {
  onTransportCreated,
  receiveConsumerHandler,
  SocketWebRTCClientNetwork,
  WebRTCTransportExtension
} from '../transports/SocketWebRTCClientFunctions'
import { InstanceProvisioning } from './NetworkInstanceProvisioning'

/** @todo replace this with event sourcing */
const consumerCreatedQueue = defineActionQueue(MediasoupMediaConsumerActions.consumerCreated.matches)
const transportCreatedActionQueue = defineActionQueue(MediasoupTransportActions.transportCreated.matches)
const updatePeersActionQueue = defineActionQueue(NetworkActions.updatePeers.matches)

const execute = () => {
  for (const action of consumerCreatedQueue()) receiveConsumerHandler(action)
  for (const action of transportCreatedActionQueue()) onTransportCreated(action)
  // TODO replace with event sourcing
  for (const action of updatePeersActionQueue()) {
    const network = getState(NetworkState).networks[action.$network] as SocketWebRTCClientNetwork | undefined
    if (!network) continue

    for (const peer of action.peers) {
      NetworkPeerFunctions.createPeer(network, peer.peerID, peer.peerIndex, peer.userID, peer.userIndex)
    }
    for (const [peerID, peer] of Object.entries(network.peers))
      if (!action.peers.find((p) => p.peerID === peerID)) {
        NetworkPeerFunctions.destroyPeer(network, peerID as PeerID)
      }
  }
}

const NetworkConnectionReactor = (props: { networkID: InstanceID }) => {
  const transportState = useMutableState(MediasoupTransportObjectsState)
  const networkState = useMutableState(NetworkState).networks[props.networkID]

  useLayoutEffect(() => {
    if (!networkState.value) return
    const topic = networkState.topic.value
    const topicEnabled = getState(NetworkState).config[topic]
    if (topicEnabled) {
      const sendTransport = MediasoupTransportState.getTransport(props.networkID, 'send') as WebRTCTransportExtension
      const recvTransport = MediasoupTransportState.getTransport(props.networkID, 'recv') as WebRTCTransportExtension
      networkState.ready.set(!!recvTransport && !!sendTransport)
    } else {
      networkState.ready.set(true)
    }
  }, [transportState, networkState])

  return null
}

const reactor = () => {
  const networkConfig = useHookstate(getMutableState(NetworkState).config)
  const isOnline = networkConfig.world.value || networkConfig.media.value
  const networkIDs = Object.keys(useHookstate(getMutableState(NetworkState).networks).value)

  /** @todo - instead of checking for network config, we should filter NetworkConnectionReactor by networks with a "real" transport */
  if (!isOnline) return null

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
