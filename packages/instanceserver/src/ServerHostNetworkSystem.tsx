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
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { NetworkPeerFunctions } from '@etherealengine/engine/src/networking/functions/NetworkPeerFunctions'
import { updatePeers } from '@etherealengine/engine/src/networking/systems/OutgoingActionSystem'
import React, { useEffect } from 'react'

import { DataChannelType } from '@etherealengine/common/src/interfaces/DataChannelType'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { NetworkTopics } from '@etherealengine/engine/src/networking/classes/Network'
import {
  DataChannelRegistryState,
  DataConsumerActions,
  DataProducerActions
} from '@etherealengine/engine/src/networking/systems/DataProducerConsumerState'
import {
  MediaConsumerActions,
  MediaProducerActions
} from '@etherealengine/engine/src/networking/systems/MediaProducerConsumerState'
import { NetworkTransportActions } from '@etherealengine/engine/src/networking/systems/NetworkTransportState'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { defineActionQueue, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import { SocketWebRTCServerNetwork } from './SocketWebRTCServerFunctions'
import {
  createOutgoingDataProducer,
  handleConsumeData,
  handleConsumerSetLayers,
  handleProduceData,
  handleRequestConsumer,
  handleRequestProducer,
  handleWebRtcTransportClose,
  handleWebRtcTransportConnect,
  handleWebRtcTransportCreate
} from './WebRTCFunctions'

export async function validateNetworkObjects(network: SocketWebRTCServerNetwork): Promise<void> {
  for (const [peerID, client] of network.peers) {
    if (client.userId === Engine.instance.userID) continue
    if (Date.now() - client.lastSeenTs > 5000) {
      NetworkPeerFunctions.destroyPeer(network, peerID)
      updatePeers(network)
    }
  }
}

const requestConsumerActionQueue = defineActionQueue(MediaConsumerActions.requestConsumer.matches)
const consumerLayersActionQueue = defineActionQueue(MediaConsumerActions.consumerLayers.matches)
const requestProducerActionQueue = defineActionQueue(MediaProducerActions.requestProducer.matches)

const dataRequestProducerActionQueue = defineActionQueue(DataProducerActions.requestProducer.matches)
const dataRequestConsumerActionQueue = defineActionQueue(DataConsumerActions.requestConsumer.matches)

const requestTransportActionQueue = defineActionQueue(NetworkTransportActions.requestTransport.matches)
const requestTransportConnectActionQueue = defineActionQueue(NetworkTransportActions.requestTransportConnect.matches)
const transportCloseActionQueue = defineActionQueue(NetworkTransportActions.closeTransport.matches)

const execute = () => {
  for (const action of requestConsumerActionQueue()) {
    handleRequestConsumer(action)
  }
  for (const action of consumerLayersActionQueue()) {
    handleConsumerSetLayers(action)
  }
  for (const action of requestProducerActionQueue()) {
    handleRequestProducer(action)
  }

  const worldNetwork = Engine.instance.worldNetwork as SocketWebRTCServerNetwork
  if (worldNetwork) {
    if (worldNetwork.isHosting) validateNetworkObjects(worldNetwork)
  }

  for (const action of dataRequestProducerActionQueue()) {
    handleProduceData(action)
  }
  for (const action of dataRequestConsumerActionQueue()) {
    handleConsumeData(action)
  }

  for (const action of requestTransportActionQueue()) {
    handleWebRtcTransportCreate(action)
  }
  for (const action of requestTransportConnectActionQueue()) {
    handleWebRtcTransportConnect(action)
  }
  for (const action of transportCloseActionQueue()) {
    handleWebRtcTransportClose(action)
  }
}

export const DataChannel = (props: { networkID: UserID; dataChannelType: DataChannelType }) => {
  const { networkID, dataChannelType } = props

  useEffect(() => {
    const network = getState(NetworkState).networks[networkID] as SocketWebRTCServerNetwork
    createOutgoingDataProducer(network, dataChannelType)

    return () => {
      // todo - cleanup
    }
  }, [])

  return null
}

const NetworkReactor = (props: { networkID: UserID }) => {
  const { networkID } = props
  const dataChannelRegistry = useHookstate(getMutableState(DataChannelRegistryState))
  return (
    <>
      {dataChannelRegistry.keys.map((dataChannelType) => (
        <DataChannel key={dataChannelType} networkID={networkID} dataChannelType={dataChannelType as DataChannelType} />
      ))}
    </>
  )
}

export const reactor = () => {
  const networkIDs = Object.entries(useHookstate(getMutableState(NetworkState).networks).value)
    .filter(([networkID, network]) => network.topic === NetworkTopics.world)
    .map(([networkID, network]) => networkID)
  return (
    <>
      {networkIDs.map((hostId: UserID) => (
        <NetworkReactor key={hostId} networkID={hostId} />
      ))}
    </>
  )
}

export const ServerHostNetworkSystem = defineSystem({
  uuid: 'ee.engine.ServerHostNetworkSystem',
  execute,
  reactor
})
