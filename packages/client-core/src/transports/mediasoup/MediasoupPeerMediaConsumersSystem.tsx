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

import { defineSystem, PresentationSystemGroup } from '@ir-engine/ecs'
import { useMediaNetwork } from '../../common/services/MediaInstanceConnectionService'
import { MediaStreamState } from '../../media/MediaStreamState'
import {
  createPeerMediaChannels,
  PeerMediaChannelState,
  removePeerMediaChannels
} from '../../media/PeerMediaChannelState'
import { ConsumerExtension, ProducerExtension } from './MediasoupClientFunctions'

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

  const peerID = consumerState.peerID.value
  const mediaTag = consumerState.mediaTag.value

  const type =
    mediaTag === screenshareAudioDataChannelType || mediaTag === screenshareVideoDataChannelType ? 'screen' : 'cam'
  const isAudio = mediaTag === webcamAudioDataChannelType || mediaTag === screenshareAudioDataChannelType

  const consumer = useHookstate(
    getMutableState(MediasoupMediaProducersConsumersObjectsState).consumers[props.consumerID]
  )?.value as ConsumerExtension

  const producer = useHookstate(getMutableState(MediasoupMediaProducersConsumersObjectsState).producers[producerID])
    ?.value as ProducerExtension

  useEffect(() => {
    if (!consumer) return
    const peerMediaChannelState = getMutableState(PeerMediaChannelState)[peerID]?.[type]
    if (!peerMediaChannelState) return
    if (isAudio) {
      const newMediaStream = new MediaStream([consumer.track.clone()])
      peerMediaChannelState.audioMediaStream.set(newMediaStream)
      return () => {
        newMediaStream.getTracks().forEach((track) => track.stop())
        peerMediaChannelState.audioMediaStream.set(null)
      }
    } else {
      const newMediaStream = new MediaStream([consumer.track.clone()])
      peerMediaChannelState.videoMediaStream.set(newMediaStream)
      return () => {
        newMediaStream.getTracks().forEach((track) => track.stop())
        peerMediaChannelState.videoMediaStream.set(null)
      }
    }
  }, [consumer])

  useEffect(() => {
    const peerMediaChannelState = getMutableState(PeerMediaChannelState)[peerID]?.[type]
    if (!peerMediaChannelState) return
    const paused = !!consumerState.paused.value || !!consumerState.producerPaused.value
    if (isAudio) peerMediaChannelState.audioStreamPaused.set(paused)
    else peerMediaChannelState.videoStreamPaused.set(paused)
  }, [consumerState.paused?.value, consumerState.producerPaused?.value])

  // useEffect(() => {
  //   const globalMute = !!producerState.globalMute?.value
  //   const paused = !!producerState.paused?.value

  //   const peerMediaChannelState = getMutableState(PeerMediaChannelState)[peerID]?.[type]
  //   if (!peerMediaChannelState) return

  //   if (isAudio) {
  //     peerMediaChannelState.audioProducerPaused.set(paused)
  //     peerMediaChannelState.audioProducerGlobalMute.set(globalMute)
  //   } else {
  //     peerMediaChannelState.videoProducerPaused.set(paused)
  //     peerMediaChannelState.videoProducerGlobalMute.set(globalMute)
  //   }
  // }, [producerState.paused?.value])

  return null
}

const SelfMedia = () => {
  const mediaStreamState = useMutableState(MediaStreamState)

  const peerMediaChannelState = useMutableState(PeerMediaChannelState)[Engine.instance.store.peerID]

  useEffect(() => {
    const microphoneEnabled = mediaStreamState.microphoneEnabled.value
    peerMediaChannelState.cam.audioMediaStream.set(
      microphoneEnabled ? mediaStreamState.microphoneMediaStream.value : null
    )
  }, [mediaStreamState.microphoneMediaStream.value, mediaStreamState.microphoneEnabled.value])

  useEffect(() => {
    const webcamEnabled = mediaStreamState.webcamEnabled.value
    peerMediaChannelState.cam.videoMediaStream.set(webcamEnabled ? mediaStreamState.webcamMediaStream.value : null)
  }, [mediaStreamState.value.webcamMediaStream, mediaStreamState.webcamEnabled.value])

  useEffect(() => {
    const videoStreamPaused = mediaStreamState.screenshareEnabled.value
    const audioStreamPaused = videoStreamPaused && mediaStreamState.screenShareAudioPaused.value
    peerMediaChannelState.screen.videoMediaStream.set(
      videoStreamPaused ? mediaStreamState.screenshareMediaStream.value : null
    )
    peerMediaChannelState.screen.audioMediaStream.set(
      audioStreamPaused ? mediaStreamState.screenshareMediaStream.value : null
    )
  }, [
    mediaStreamState.screenshareMediaStream.value,
    mediaStreamState.screenshareEnabled.value,
    mediaStreamState.screenShareAudioPaused.value
  ])

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

export const reactor = () => {
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

export const MediasoupPeerMediaConsumersSystem = defineSystem({
  uuid: 'ee.client.MediasoupPeerMediaConsumersSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
