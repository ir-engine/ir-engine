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

import { clientSettingPath, InstanceID } from '@ir-engine/common/src/schema.type.module'
import {
  MediasoupMediaProducerConsumerState,
  MediasoupMediaProducersConsumersObjectsState
} from '@ir-engine/common/src/transports/mediasoup/MediasoupMediaProducerConsumerState'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { getMutableState, getState, PeerID, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import {
  NetworkState,
  screenshareAudioDataChannelType,
  screenshareVideoDataChannelType,
  VideoConstants,
  webcamAudioDataChannelType
} from '@ir-engine/network'

import { useFind } from '@ir-engine/common'
import { defineSystem, PresentationSystemGroup } from '@ir-engine/ecs'
import { MediaSettingsState } from '@ir-engine/engine/src/audio/MediaSettingsState'
import { useMediaNetwork } from '../../common/services/MediaInstanceConnectionService'
import {
  createPeerMediaChannels,
  PeerMediaChannelState,
  removePeerMediaChannels
} from '../../media/PeerMediaChannelState'
import { ConsumerExtension, ProducerExtension } from './MediasoupClientFunctions'

const MAX_RES_TO_USE_TOP_LAYER = 540 // If under 540p, use the topmost video layer, otherwise use layer n-1

/**
 * Peer media reactor
 * - Manages the media stream for a peer
 * @param props
 * @returns
 */
const PeerMedia = (props: { consumerID: string; networkID: InstanceID }) => {
  const immersiveMedia = useMutableState(MediaSettingsState).immersiveMedia.value

  const consumerState = useHookstate(
    getMutableState(MediasoupMediaProducerConsumerState)[props.networkID].consumers[props.consumerID]
  )

  const producerID = consumerState.producerID.value

  const peerID = consumerState.peerID.value
  const mediaTag = consumerState.mediaTag.value

  const type =
    mediaTag === screenshareAudioDataChannelType || mediaTag === screenshareVideoDataChannelType ? 'screen' : 'cam'
  const isAudio = mediaTag === webcamAudioDataChannelType || mediaTag === screenshareAudioDataChannelType

  const peerMediaChannelState = useMutableState(PeerMediaChannelState)[peerID]?.[type]

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
    if (!consumer) return
    const peerMediaChannelState = getMutableState(PeerMediaChannelState)[peerID]?.[type]
    if (!peerMediaChannelState) return
    const paused =
      (isAudio ? peerMediaChannelState.audioStreamPaused.value : peerMediaChannelState.videoStreamPaused.value) ||
      !!consumerState.producerPaused.value
    const network = getState(NetworkState).networks[props.networkID]
    if (paused) {
      MediasoupMediaProducerConsumerState.pauseConsumer(network, consumer.id)
    } else {
      MediasoupMediaProducerConsumerState.resumeConsumer(network, consumer.id)
    }
  }, [
    isAudio ? peerMediaChannelState.audioStreamPaused.value : peerMediaChannelState.videoStreamPaused.value,
    consumerState.producerPaused?.value
  ])

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

  const clientSettingQuery = useFind(clientSettingPath)
  const clientSetting = clientSettingQuery.data[0]

  const isPiP = peerMediaChannelState.videoQuality.value === 'largest'

  useEffect(() => {
    if (!consumer || isAudio) return

    const isScreen = mediaTag === screenshareVideoDataChannelType

    const mediaNetwork = NetworkState.mediaNetwork
    const encodings = consumer.rtpParameters.encodings

    const { maxResolution } = clientSetting.mediaSettings.video
    const resolution = VideoConstants.VIDEO_CONSTRAINTS[maxResolution] || VideoConstants.VIDEO_CONSTRAINTS.hd
    if (isPiP || immersiveMedia) {
      let maxLayer
      const scalabilityMode = encodings && encodings[0].scalabilityMode
      if (!scalabilityMode) maxLayer = 0
      else {
        const execed = /L([0-9])/.exec(scalabilityMode)
        if (execed) maxLayer = parseInt(execed[1]) - 1 //Subtract 1 from max scalabilityMode since layers are 0-indexed
        else maxLayer = 0
      }
      // If we're in immersive media mode, using max-resolution video for everyone could overwhelm some devices.
      // If there are more than 2 layers, then use layer n-1 to balance quality and performance
      // (immersive video bubbles are bigger than the flat bubbles, so low-quality video will be more noticeable).
      // If we're not, then the highest layer is still probably more than necessary, so use the n-1 layer unless the
      // n layer is under a specified constant
      MediasoupMediaProducerConsumerState.setPreferredConsumerLayer(
        mediaNetwork,
        consumer.id,
        (immersiveMedia && maxLayer) > 1
          ? maxLayer - 1
          : (!isScreen && resolution.height.ideal) > MAX_RES_TO_USE_TOP_LAYER
          ? maxLayer - 1
          : maxLayer
      )
    }
    // Standard video bubbles in flat/non-immersive mode should use the lowest quality layer for performance reasons
    else MediasoupMediaProducerConsumerState.setPreferredConsumerLayer(mediaNetwork, consumer.id, 0)
  }, [consumer, immersiveMedia, isPiP])

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
      ? Array.from(mediaNetwork.peers.keys as PeerID[]).filter(
          (peerID) => peerID !== mediaNetwork.value.hostPeerID && peerID !== Engine.instance.store.peerID
        )
      : []
    mediaPeers.set(mediaChannelPeers)
  }, [mediaNetwork?.peers?.keys?.length])

  /** @todo in future we will have a better way of determining whether we need to connect to a server or not */
  if (!mediaNetwork?.hostPeerID?.value) return null

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

  return (
    <>
      <PeerMediaChannels />
      {networkIDs.keys
        .filter((id) => !!networks[id])
        .filter((networkID: InstanceID) => getState(NetworkState).networks[networkID].hostPeerID)
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
