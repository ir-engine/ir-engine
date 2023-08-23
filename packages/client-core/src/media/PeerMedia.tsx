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

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import {
  NetworkState,
  screenshareAudioDataChannelType,
  screenshareVideoDataChannelType,
  webcamAudioDataChannelType
} from '@etherealengine/engine/src/networking/NetworkState'
import { dispatchAction, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import {
  MediasoupMediaConsumerActions,
  MediasoupMediaProducerConsumerState,
  MediasoupMediaProducersConsumersObjectsState
} from '@etherealengine/engine/src/networking/systems/MediasoupMediaProducerConsumerState'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { MediaStreamState } from '../transports/MediaStreams'
import {
  PeerMediaChannelState,
  createPeerMediaChannels,
  removePeerMediaChannels
} from '../transports/PeerMediaChannelState'
import { SocketWebRTCClientNetwork } from '../transports/SocketWebRTCClientFunctions'

/**
 * Sets media stream state for a peer
 */
const PeerMedia = (props: { consumerID: string; networkID: UserID }) => {
  const consumerState = useHookstate(
    getMutableState(MediasoupMediaProducerConsumerState)[props.networkID].consumers[props.consumerID]
  )
  const producerID = consumerState.producerID.value
  const producerState = useHookstate(
    getMutableState(MediasoupMediaProducerConsumerState)[props.networkID].producers[producerID]
  )

  const peerID = consumerState.peerID.value
  const mediaTag = consumerState.mediaTag.value

  const type =
    mediaTag === screenshareAudioDataChannelType || mediaTag === screenshareVideoDataChannelType ? 'screen' : 'cam'
  const isAudio = mediaTag === webcamAudioDataChannelType || mediaTag === screenshareAudioDataChannelType

  const consumer = useHookstate(
    getMutableState(MediasoupMediaProducersConsumersObjectsState).consumers[props.consumerID]
  )?.value

  useEffect(() => {
    if (!consumer) return
    const peerMediaChannelState = getMutableState(PeerMediaChannelState)[peerID]?.[type]
    if (!peerMediaChannelState) return
    if (isAudio) {
      peerMediaChannelState.audioStream.set(consumer)
    } else {
      peerMediaChannelState.videoStream.set(consumer)
    }
  }, [consumer])

  useEffect(() => {
    const peerMediaChannelState = getMutableState(PeerMediaChannelState)[peerID]?.[type]
    if (!peerMediaChannelState) return
    if (isAudio) peerMediaChannelState.audioStreamPaused.set(!!consumerState.paused.value)
    else peerMediaChannelState.videoStreamPaused.set(!!consumerState.paused.value)
  }, [consumerState.paused])

  useEffect(() => {
    const globalMute = !!producerState.globalMute?.value
    const paused = !!producerState.paused?.value

    const peerMediaChannelState = getMutableState(PeerMediaChannelState)[peerID]?.[type]
    if (!peerMediaChannelState) return

    if (isAudio) {
      peerMediaChannelState.audioProducerPaused.set(paused)
      peerMediaChannelState.audioProducerGlobalMute.set(globalMute)
    } else {
      peerMediaChannelState.videoProducerPaused.set(paused)
      peerMediaChannelState.videoProducerGlobalMute.set(globalMute)
    }
  }, [producerState.paused])

  return null
}

const SelfMedia = () => {
  const mediaStreamState = useHookstate(getMutableState(MediaStreamState))

  const peerMediaChannelState = useHookstate(getMutableState(PeerMediaChannelState)[Engine.instance.peerID])

  useEffect(() => {
    peerMediaChannelState.cam.audioStream.set(mediaStreamState.camAudioProducer.value)
  }, [mediaStreamState.camAudioProducer])

  useEffect(() => {
    peerMediaChannelState.cam.videoStream.set(mediaStreamState.camVideoProducer.value)
  }, [mediaStreamState.camVideoProducer])

  useEffect(() => {
    peerMediaChannelState.screen.audioStream.set(mediaStreamState.screenAudioProducer.value)
  }, [mediaStreamState.screenAudioProducer])

  useEffect(() => {
    peerMediaChannelState.screen.videoStream.set(mediaStreamState.screenVideoProducer.value)
  }, [mediaStreamState.screenVideoProducer])

  return null
}

export const PeerMediaChannels = (props: { networkID: UserID }) => {
  const mediaStreamState = useHookstate(getMutableState(MediaStreamState))
  const mediaNetworkState = useHookstate(getMutableState(NetworkState).networks[props.networkID])
  const consumerState = useHookstate(getMutableState(MediasoupMediaProducerConsumerState)[props.networkID].consumers)

  // create a peer media stream for each peer with a consumer
  useEffect(() => {
    const mediaNetwork = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork
    if (!mediaNetwork) return
    const peerMediaChannels = getState(PeerMediaChannelState)
    const mediaChannelPeers = Array.from(mediaNetwork.peers.keys()).filter((peerID) => peerID !== 'server')
    for (const peerID of mediaChannelPeers) {
      if (!peerMediaChannels[peerID]) {
        createPeerMediaChannels(peerID)
      }
    }
    for (const peerID of Object.keys(peerMediaChannels)) {
      const peerConsumers = mediaChannelPeers.filter((peer) => peer === peerID)
      if (peerConsumers.length === 0) {
        removePeerMediaChannels(peerID as PeerID)
      }
    }
  }, [
    mediaNetworkState?.peers?.size,
    consumerState.keys.length,
    mediaStreamState.videoStream,
    mediaStreamState.audioStream,
    mediaStreamState.screenAudioProducer,
    mediaStreamState.screenVideoProducer
  ])

  return null
}

export const NetworkProducer = (props: { networkID: UserID; producerID: string }) => {
  const { networkID, producerID } = props
  const producerState = useHookstate(
    getMutableState(MediasoupMediaProducerConsumerState)[networkID].producers[producerID]
  )

  useEffect(() => {
    const peerID = producerState.peerID.value
    const mediaTag = producerState.mediaTag.value
    const channelID = producerState.channelID.value
    const network = getState(NetworkState).networks[networkID] as SocketWebRTCClientNetwork

    dispatchAction(
      MediasoupMediaConsumerActions.requestConsumer({
        mediaTag,
        peerID,
        rtpCapabilities: network.transport.mediasoupDevice.rtpCapabilities,
        channelID,
        $topic: network.topic,
        $to: network.hostPeerID
      })
    )
  }, [])

  return null
}

const NetworkConsumers = (props: { networkID: UserID }) => {
  const { networkID } = props
  const consumers = useHookstate(getMutableState(MediasoupMediaProducerConsumerState)[networkID].consumers)
  const producers = useHookstate(getMutableState(MediasoupMediaProducerConsumerState)[networkID].producers)
  return (
    <>
      <PeerMediaChannels key={'PeerMediaChannels'} networkID={networkID} />
      {producers.keys.map((producerID: string) => (
        <NetworkProducer key={producerID} producerID={producerID} networkID={networkID} />
      ))}
      {consumers.keys.map((consumerID: string) => (
        <PeerMedia key={consumerID} consumerID={consumerID} networkID={networkID} />
      ))}
    </>
  )
}

export const PeerMediaConsumers = () => {
  const networkIDs = useHookstate(getMutableState(MediasoupMediaProducerConsumerState))
  const selfPeerMediaChannelState = useHookstate(getMutableState(PeerMediaChannelState)[Engine.instance.peerID])
  return (
    <>
      {selfPeerMediaChannelState.value && <SelfMedia key={'SelfMedia'} />}
      {networkIDs.keys.map((hostId: UserID) => (
        <NetworkConsumers key={hostId} networkID={hostId} />
      ))}
    </>
  )
}
