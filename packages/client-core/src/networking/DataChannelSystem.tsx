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

import { DataChannelType } from '@etherealengine/common/src/interfaces/DataChannelType'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { NetworkTopics } from '@etherealengine/engine/src/networking/classes/Network'
import { DataChannelRegistryState } from '@etherealengine/engine/src/networking/systems/DataChannelRegistry'
import {
  MediasoupDataConsumerActions,
  MediasoupDataProducerConsumerState,
  MediasoupDataProducersConsumersObjectsState
} from '@etherealengine/engine/src/networking/systems/MediasoupDataProducerConsumerState'
import {
  MediasoupTransportObjectsState,
  MediasoupTransportState
} from '@etherealengine/engine/src/networking/systems/MediasoupTransportState'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { defineActionQueue, dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'
import { none, useHookstate } from '@hookstate/core'
import { DataProducer, DataProducerOptions } from 'mediasoup-client/lib/DataProducer'
import React, { useEffect } from 'react'
import { SocketWebRTCClientNetwork, WebRTCTransportExtension } from '../transports/SocketWebRTCClientFunctions'

export async function createDataConsumer(
  network: SocketWebRTCClientNetwork,
  dataChannel: DataChannelType
): Promise<void> {
  dispatchAction(
    MediasoupDataConsumerActions.requestConsumer({
      dataChannel,
      $network: network.id,
      $topic: network.topic,
      $to: network.hostPeerID
    })
  )
}

export async function createDataProducer(
  network: SocketWebRTCClientNetwork,
  args = {
    ordered: false,
    maxRetransmits: 1,
    maxPacketLifeTime: undefined,
    protocol: 'raw',
    appData: {}
  } as DataProducerOptions & {
    label: DataChannelType
  }
): Promise<void> {
  console.log('createDataProducer', args.label, network)
  const producer = MediasoupDataProducerConsumerState.getProducerByDataChannel(network.id, args.label) as DataProducer
  if (producer) return

  const sendTransport = MediasoupTransportState.getTransport(network.id, 'send') as WebRTCTransportExtension

  const dataProducer = await sendTransport.produceData({
    label: args.label,
    ordered: args.ordered,
    appData: args.appData,
    maxPacketLifeTime: args.maxPacketLifeTime,
    maxRetransmits: args.maxRetransmits,
    protocol: args.protocol // sub-protocol for type of data to be transmitted on the channel e.g. json, raw etc. maybe make type an enum rather than string
  })

  dataProducer.on('transportclose', () => {
    dataProducer.close()
  })

  dataProducer.observer.on('close', () => {
    getMutableState(MediasoupDataProducersConsumersObjectsState).producers[dataProducer.id].set(none)
  })

  getMutableState(MediasoupDataProducersConsumersObjectsState).producers[dataProducer.id].set(dataProducer)
}

export const consumerData = async (action: typeof MediasoupDataConsumerActions.consumerCreated.matches._TYPE) => {
  const network = getState(NetworkState).networks[action.$network] as SocketWebRTCClientNetwork

  const recvTransport = MediasoupTransportState.getTransport(network.id, 'recv') as WebRTCTransportExtension

  const dataConsumer = await recvTransport.consumeData({
    id: action.consumerID,
    sctpStreamParameters: action.sctpStreamParameters,
    label: action.dataChannel,
    protocol: action.protocol,
    appData: action.appData,
    // this is unused, but for whatever reason mediasoup will throw an error if it's not defined
    dataProducerId: ''
  })

  // Firefox uses blob as by default hence have to convert binary type of data consumer to 'arraybuffer' explicitly.
  dataConsumer.binaryType = 'arraybuffer'
  dataConsumer.on('message', (message: any) => {
    try {
      const dataChannelFunctions = getState(DataChannelRegistryState)[dataConsumer.label as DataChannelType]
      if (dataChannelFunctions) {
        for (const func of dataChannelFunctions)
          func(network, dataConsumer.label as DataChannelType, network.hostPeerID, message) // assmume for now data is coming from the host
      }
    } catch (e) {
      console.error(e)
    }
  }) // Handle message received

  dataConsumer.on('transportclose', () => {
    dataConsumer.close()
  })

  dataConsumer.observer.on('close', () => {
    getMutableState(MediasoupDataProducersConsumersObjectsState).consumers[dataConsumer.id].set(none)
  })

  getMutableState(MediasoupDataProducersConsumersObjectsState).consumers[dataConsumer.id].set(dataConsumer)
}

const dataConsumerCreatedActionQueue = defineActionQueue(MediasoupDataConsumerActions.consumerCreated.matches)

const execute = () => {
  for (const action of dataConsumerCreatedActionQueue()) {
    consumerData(action)
  }
}

export const DataChannel = (props: { networkID: UserID; dataChannelType: DataChannelType }) => {
  const { networkID, dataChannelType } = props
  const transportState = useHookstate(getMutableState(MediasoupTransportObjectsState))

  useEffect(() => {
    const recvTransport = MediasoupTransportState.getTransport(networkID, 'recv') as WebRTCTransportExtension
    const sendTransport = MediasoupTransportState.getTransport(networkID, 'send') as WebRTCTransportExtension
    if (!recvTransport || !sendTransport) return

    const network = getState(NetworkState).networks[networkID] as SocketWebRTCClientNetwork
    createDataProducer(network, { label: dataChannelType })
    createDataConsumer(network, dataChannelType)

    return () => {
      // todo - cleanup
    }
  }, [transportState.keys])

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

export const DataChannels = () => {
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

export const DataChannelSystem = defineSystem({
  uuid: 'ee.client.DataChannelSystem',
  execute,
  reactor: DataChannels
})
