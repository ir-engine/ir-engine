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
import {
  MediasoupMediaProducerConsumerState,
  MediasoupMediaProducersConsumersObjectsState
} from '@ir-engine/common/src/transports/mediasoup/MediasoupMediaProducerConsumerState'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { getMutableState, PeerID, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import {
  NetworkState,
  screenshareAudioDataChannelType,
  screenshareVideoDataChannelType,
  webcamAudioDataChannelType
} from '@ir-engine/network'

import { useMediaNetwork } from '../common/services/MediaInstanceConnectionService'
import { MediaStreamState } from '../transports/MediaStreams'
import {
  createPeerMediaChannels,
  PeerMediaChannelState,
  removePeerMediaChannels
} from '../transports/PeerMediaChannelState'

/**
 * Peer media reactor
 * - Manages the media stream for a peer
 * @param props
 * @returns
 */
const PeerMedia = (props: { consumerID: string; networkID: InstanceID }) => {
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
      return () => {
        peerMediaChannelState.audioStream.set(null)
      }
    } else {
      peerMediaChannelState.videoStream.set(consumer)
      return () => {
        peerMediaChannelState.videoStream.set(null)
      }
    }
  }, [consumer])

  useEffect(() => {
    const peerMediaChannelState = getMutableState(PeerMediaChannelState)[peerID]?.[type]
    if (!peerMediaChannelState) return
    if (isAudio) peerMediaChannelState.audioStreamPaused.set(!!consumerState.paused.value)
    else peerMediaChannelState.videoStreamPaused.set(!!consumerState.paused.value)
  }, [consumerState.paused?.value])

  useEffect(() => {
    const peerMediaChannelState = getMutableState(PeerMediaChannelState)[peerID]?.[type]
    if (!peerMediaChannelState) return
    if (isAudio) peerMediaChannelState.audioProducerPaused.set(!!consumerState.producerPaused.value)
    else peerMediaChannelState.videoProducerPaused.set(!!consumerState.producerPaused.value)
  }, [consumerState.producerPaused?.value])

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
  }, [producerState.paused?.value])

  return null
}

const SelfMedia = () => {
  const mediaStreamState = useMutableState(MediaStreamState)

  const peerMediaChannelState = useMutableState(PeerMediaChannelState)[Engine.instance.store.peerID]

  useEffect(() => {
    const audioEnabled = mediaStreamState.audioEnabled.value
    peerMediaChannelState.cam.audioStream.set(audioEnabled ? mediaStreamState.camAudioProducer.value : null)
  }, [mediaStreamState.camAudioProducer, mediaStreamState.audioEnabled])

  useEffect(() => {
    const videoEnabled = mediaStreamState.videoEnabled.value
    peerMediaChannelState.cam.videoStream.set(videoEnabled ? mediaStreamState.camVideoProducer.value : null)
  }, [mediaStreamState.camVideoProducer, mediaStreamState.videoEnabled])

  useEffect(() => {
    peerMediaChannelState.screen.audioStream.set(mediaStreamState.screenAudioProducer.value)
  }, [mediaStreamState.screenAudioProducer])

  useEffect(() => {
    peerMediaChannelState.screen.videoStream.set(mediaStreamState.screenVideoProducer.value)
  }, [mediaStreamState.screenVideoProducer])

  return null
}

const NetworkConsumers = (props: { networkID: InstanceID }) => {
  const { networkID } = props
  const consumers = useHookstate(getMutableState(MediasoupMediaProducerConsumerState)[networkID].consumers)
  return (
    <>
      {consumers.keys.map((consumerID: string) => (
        <PeerMedia key={consumerID} consumerID={consumerID} networkID={networkID} />
      ))}
    </>
  )
}

export const PeerMediaChannel = (props: { peerID: PeerID }) => {
  useEffect(() => {
    createPeerMediaChannels(props.peerID)
    return () => {
      removePeerMediaChannels(props.peerID)
    }
  }, [])
  return null
}

export const PeerMediaChannels = () => {
  const mediaNetwork = useMediaNetwork()

  const mediaPeers = useHookstate([] as PeerID[])

  useEffect(() => {
    const mediaChannelPeers = mediaNetwork?.peers?.keys?.length
      ? Array.from(mediaNetwork.peers.keys as PeerID[]).filter((peerID) => peerID !== mediaNetwork.value.hostPeerID)
      : [Engine.instance.store.peerID]
    mediaPeers.set(mediaChannelPeers)
  }, [mediaNetwork?.peers?.keys?.length])

  return (
    <>
      {mediaPeers.value.map((peerID) => (
        <PeerMediaChannel key={peerID} peerID={peerID} />
      ))}
    </>
  )
}

export const PeerMediaConsumers = () => {
  const networkIDs = useMutableState(MediasoupMediaProducerConsumerState)
  const networks = useHookstate(getMutableState(NetworkState).networks)
  const selfPeerMediaChannelState = useHookstate(getMutableState(PeerMediaChannelState)[Engine.instance.store.peerID])
  return (
    <>
      <PeerMediaChannels />
      {selfPeerMediaChannelState.value && <SelfMedia key={'SelfMedia'} />}
      {networkIDs.keys
        .filter((id) => !!networks[id])
        .map((id: InstanceID) => (
          <NetworkConsumers key={id} networkID={id} />
        ))}
    </>
  )
}
