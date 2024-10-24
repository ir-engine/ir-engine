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

import React, { useEffect } from 'react'

import { InstanceID } from '@ir-engine/common/src/schema.type.module'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import {
  dispatchAction,
  getMutableState,
  getState,
  NetworkID,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'

import logger from '@ir-engine/common/src/logger'
import {
  MediasoupMediaConsumerActions,
  MediasoupMediaConsumerType,
  MediasoupMediaProducerConsumerState,
  MediasoupMediaProducersConsumersObjectsState
} from '@ir-engine/common/src/transports/mediasoup/MediasoupMediaProducerConsumerState'
import { MediasoupTransportState } from '@ir-engine/common/src/transports/mediasoup/MediasoupTransportState'
import { Engine, PresentationSystemGroup } from '@ir-engine/ecs'
import { NetworkState } from '@ir-engine/network'
import { useMediaNetwork } from '../../common/services/MediaInstanceConnectionService'
import { ConsumerExtension, SocketWebRTCClientNetwork, WebRTCTransportExtension } from './MediasoupClientFunctions'

export const receiveConsumerHandler = async (networkID: NetworkID, consumerState: MediasoupMediaConsumerType) => {
  const network = getState(NetworkState).networks[networkID] as SocketWebRTCClientNetwork

  const { peerID, mediaTag, channelID, paused } = consumerState

  const transport = MediasoupTransportState.getTransport(network.id, 'recv') as WebRTCTransportExtension
  if (!transport) return logger.error('No transport found for consumer')

  const consumer = (await transport.consume({
    id: consumerState.consumerID,
    producerId: consumerState.producerID,
    rtpParameters: consumerState.rtpParameters as any,
    kind: consumerState.kind!,
    appData: { peerID, mediaTag, channelId: channelID }
  })) as unknown as ConsumerExtension

  /** @todo check if we need any of this */
  // if we do already have a consumer, we shouldn't have called this method
  // const existingConsumer = MediasoupMediaProducerConsumerState.getConsumerByPeerIdAndMediaTag(
  //   network.id,
  //   peerID,
  //   mediaTag
  // ) as ConsumerExtension

  // if (!existingConsumer) {
  getMutableState(MediasoupMediaProducersConsumersObjectsState).consumers[consumer.id].set(consumer)
  MediasoupMediaProducerConsumerState.resumeConsumer(network, consumer.id)
  // } else if (existingConsumer.track?.muted) {
  //   dispatchAction(
  //     MediasoupMediaConsumerActions.consumerClosed({
  //       consumerID: existingConsumer.id,
  //       $network: network.id,
  //       $topic: network.topic,
  //       $to: peerID
  //     })
  //   )
  //   getMutableState(MediasoupMediaProducersConsumersObjectsState).consumers[consumer.id].set(consumer)
  //   MediasoupMediaProducerConsumerState.resumeConsumer(network, consumer.id)
  // } else {
  //   dispatchAction(
  //     MediasoupMediaConsumerActions.consumerClosed({
  //       consumerID: consumer.id,
  //       $network: network.id,
  //       $topic: network.topic,
  //       $to: peerID
  //     })
  //   )
  // }
}

const ConsumerReactor = (props: { consumerID: string; networkID: InstanceID }) => {
  const { consumerID, networkID } = props
  const consumer = useMutableState(MediasoupMediaProducerConsumerState)[networkID].consumers[consumerID].value

  useEffect(() => {
    receiveConsumerHandler(networkID, consumer)
  }, [])

  return null
}

/**
 * Network producer reactor
 * - Requests consumer for a peer's producer
 * @param props
 * @returns
 */
export const NetworkProducer = (props: { networkID: InstanceID; producerID: string }) => {
  const { networkID, producerID } = props
  const producerState = useHookstate(
    getMutableState(MediasoupMediaProducerConsumerState)[networkID].producers[producerID]
  )
  const networkState = useHookstate(getMutableState(NetworkState).networks[networkID])

  useEffect(() => {
    if (!networkState.ready?.value) return

    const peerID = producerState.peerID.value
    // dont need to request our own consumers
    if (peerID === Engine.instance.store.peerID) return

    const mediaTag = producerState.mediaTag.value
    const channelID = producerState.channelID.value
    const network = getState(NetworkState).networks[networkID] as SocketWebRTCClientNetwork

    dispatchAction(
      MediasoupMediaConsumerActions.requestConsumer({
        mediaTag,
        peerID,
        rtpCapabilities: network.mediasoupDevice.rtpCapabilities,
        channelID,
        $topic: network.topic,
        $to: network.hostPeerID
      })
    )
  }, [networkState.ready?.value])

  return null
}

const NetworkReactor = (props: { networkID: InstanceID }) => {
  const { networkID } = props
  const mediaProducerConsumerState = useMutableState(MediasoupMediaProducerConsumerState)[networkID]
  return (
    <>
      {mediaProducerConsumerState?.producers?.keys.map((producerID: string) => (
        <NetworkProducer key={producerID} producerID={producerID} networkID={networkID} />
      ))}
      {mediaProducerConsumerState?.consumers?.keys?.map((consumerID) => (
        <ConsumerReactor key={consumerID} consumerID={consumerID} networkID={networkID} />
      ))}
    </>
  )
}

const reactor = () => {
  const mediaProducerConsumerState = useMutableState(MediasoupMediaProducerConsumerState)
  const mediaNetworkState = useMediaNetwork()

  /** @todo in future we will have a better way of determining whether we need to connect to a server or not */
  if (!mediaNetworkState?.hostPeerID?.value) return null

  return (
    <>
      {mediaProducerConsumerState.keys.map((id: InstanceID) => (
        <NetworkReactor key={id} networkID={id} />
      ))}
    </>
  )
}

export const MediasoupMediaChannelSystem = defineSystem({
  uuid: 'ee.client.MediasoupMediaChannelSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
