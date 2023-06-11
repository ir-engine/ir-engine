import React, { useEffect } from 'react'

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { MessageTypes } from '@etherealengine/engine/src/networking/enums/MessageTypes'
import {
  MediaTagType,
  NetworkState,
  screenshareAudioDataChannelType,
  screenshareVideoDataChannelType,
  webcamAudioDataChannelType,
  webcamVideoDataChannelType
} from '@etherealengine/engine/src/networking/NetworkState'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { useMediaNetwork } from '../common/services/MediaInstanceConnectionService'
import { MediaStreamState } from '../transports/MediaStreams'
import {
  createPeerMediaChannels,
  PeerMediaChannelState,
  removePeerMediaChannels
} from '../transports/PeerMediaChannelState'
import {
  ConsumerExtension,
  ProducerExtension,
  SocketWebRTCClientNetwork
} from '../transports/SocketWebRTCClientFunctions'

/**
 * Sets media stream state for a peer
 */
const PeerMedia = (props: {
  channel: ConsumerExtension | ProducerExtension
  peerID: PeerID
  mediaTag: MediaTagType
}) => {
  const mediaStreamState = useHookstate(getMutableState(MediaStreamState))

  const peerID = props.peerID
  const type =
    props.mediaTag === screenshareAudioDataChannelType || props.mediaTag === screenshareVideoDataChannelType
      ? 'screen'
      : 'cam'
  const isAudio = props.mediaTag === webcamAudioDataChannelType || props.mediaTag === screenshareAudioDataChannelType

  const isScreen = type === 'screen'
  const network = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork
  const isSelf = props.peerID === Engine.instance.peerID

  const peerMediaChannelState = useHookstate(getMutableState(PeerMediaChannelState)[peerID][type])

  const { videoStream, audioStream, videoElement, audioElement } = peerMediaChannelState.value

  const pauseConsumerListener = (consumerId: string) => {
    if (consumerId === videoStream?.id) peerMediaChannelState.videoStreamPaused.set(true)
    else if (consumerId === audioStream?.id) peerMediaChannelState.audioStreamPaused.set(true)
  }

  const resumeConsumerListener = (consumerId: string) => {
    if (consumerId === videoStream?.id) peerMediaChannelState.videoStreamPaused.set(false)
    else if (consumerId === audioStream?.id) peerMediaChannelState.audioStreamPaused.set(false)
  }

  const pauseProducerListener = ({ producerId, globalMute }: { producerId: string; globalMute: boolean }) => {
    if (producerId === videoStream?.id && globalMute) {
      peerMediaChannelState.videoProducerPaused.set(true)
      peerMediaChannelState.videoProducerGlobalMute.set(true)
    } else if (producerId === audioStream?.id && globalMute) {
      peerMediaChannelState.audioProducerPaused.set(true)
      peerMediaChannelState.audioProducerGlobalMute.set(true)
    } else {
      const videoConsumer = network.consumers.find(
        (c) =>
          c.appData.peerID === peerID &&
          c.producerId === producerId &&
          c.appData.mediaTag === (isScreen ? screenshareVideoDataChannelType : webcamVideoDataChannelType)
      )
      const audioConsumer = network.consumers.find(
        (c) =>
          c.appData.peerID === peerID &&
          c.producerId === producerId &&
          c.appData.mediaTag === (isScreen ? screenshareAudioDataChannelType : webcamAudioDataChannelType)
      )
      if (videoConsumer) {
        videoConsumer.producerPaused = true
        peerMediaChannelState.videoProducerPaused.set(true)
      }
      if (audioConsumer) {
        audioConsumer.producerPaused = true
        peerMediaChannelState.audioProducerPaused.set(true)
      }
    }
  }

  const resumeProducerListener = (producerId: string) => {
    if (producerId === videoStream?.id) {
      peerMediaChannelState.videoProducerPaused.set(false)
      peerMediaChannelState.videoProducerGlobalMute.set(false)
    } else if (producerId === audioStream?.id) {
      peerMediaChannelState.audioProducerPaused.set(false)
      peerMediaChannelState.audioProducerGlobalMute.set(false)
    } else {
      const videoConsumer = network.consumers.find(
        (c) =>
          c.appData.peerID === peerID &&
          c.producerId === producerId &&
          c.appData.mediaTag === (isScreen ? screenshareVideoDataChannelType : webcamVideoDataChannelType)
      )
      const audioConsumer = network.consumers.find(
        (c) =>
          c.appData.peerID === peerID &&
          c.producerId === producerId &&
          c.appData.mediaTag === (isScreen ? screenshareAudioDataChannelType : webcamAudioDataChannelType)
      )
      if (videoConsumer) {
        videoConsumer.producerPaused = false
        peerMediaChannelState.videoProducerPaused.set(false)
      }
      if (audioConsumer) {
        audioConsumer.producerPaused = false
        peerMediaChannelState.audioProducerPaused.set(false)
      }
    }
  }

  const closeProducerListener = (producerId: string) => {
    if (producerId === videoStream?.id) {
      ;(videoElement?.srcObject as MediaStream)?.getVideoTracks()[0].stop()
      if (!isScreen) mediaStreamState.videoStream.value!.getVideoTracks()[0].stop()
      else mediaStreamState.localScreen.value!.getVideoTracks()[0].stop
    }

    if (producerId === audioStream?.id) {
      ;(audioElement?.srcObject as MediaStream)?.getAudioTracks()[0].stop()
      if (!isScreen) mediaStreamState.audioStream.value!.getAudioTracks()[0].stop()
    }
  }

  useEffect(() => {
    if (isSelf) {
      if (isScreen) {
        if (isAudio && mediaStreamState.screenAudioProducer.value) {
          peerMediaChannelState.audioStream.set(mediaStreamState.screenAudioProducer.value)
          peerMediaChannelState.audioStreamPaused.set(mediaStreamState.screenShareAudioPaused.value)
        } else if (mediaStreamState.screenVideoProducer.value) {
          peerMediaChannelState.videoStream.set(mediaStreamState.screenVideoProducer.value)
          peerMediaChannelState.videoStreamPaused.set(mediaStreamState.screenShareVideoPaused.value)
        }
      } else {
        if (isAudio && mediaStreamState.camAudioProducer.value) {
          peerMediaChannelState.audioStream.set(mediaStreamState.camAudioProducer.value)
          peerMediaChannelState.audioStreamPaused.set(mediaStreamState.audioPaused.value)
        } else if (mediaStreamState.camVideoProducer.value) {
          peerMediaChannelState.videoStream.set(mediaStreamState.camVideoProducer.value)
          peerMediaChannelState.videoStreamPaused.set(mediaStreamState.videoPaused.value)
        }
      }
    } else {
      const videoConsumer = network.consumers.find(
        (c) =>
          c.appData.peerID === peerID &&
          c.appData.mediaTag === (isScreen ? screenshareVideoDataChannelType : webcamVideoDataChannelType)
      )
      const audioConsumer = network.consumers.find(
        (c) =>
          c.appData.peerID === peerID &&
          c.appData.mediaTag === (isScreen ? screenshareAudioDataChannelType : webcamAudioDataChannelType)
      )
      if (videoConsumer) {
        peerMediaChannelState.videoProducerPaused.set(videoConsumer.producerPaused)
        peerMediaChannelState.videoStreamPaused.set(videoConsumer.paused)
        peerMediaChannelState.videoStream.set(videoConsumer)
      }
      if (audioConsumer) {
        peerMediaChannelState.audioProducerPaused.set(audioConsumer.producerPaused)
        peerMediaChannelState.audioStreamPaused.set(audioConsumer.paused)
        peerMediaChannelState.audioStream.set(audioConsumer)
      }
    }
  }, [
    mediaStreamState.camAudioProducer,
    mediaStreamState.camVideoProducer,
    mediaStreamState.screenAudioProducer,
    mediaStreamState.screenVideoProducer,
    mediaStreamState.audioPaused,
    mediaStreamState.videoPaused,
    mediaStreamState.screenShareAudioPaused,
    mediaStreamState.screenShareVideoPaused,
    network.consumers,
    peerID,
    isScreen,
    isSelf
  ])

  useEffect(() => {
    const mediaNetwork = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork
    const primus = mediaNetwork.primus
    if (typeof primus?.on === 'function') {
      const responseFunction = (message) => {
        if (message) {
          const { type, data, id } = message
          switch (type) {
            case MessageTypes.WebRTCPauseConsumer.toString():
              pauseConsumerListener(data)
              break
            case MessageTypes.WebRTCResumeConsumer.toString():
              resumeConsumerListener(data)
              break
            case MessageTypes.WebRTCPauseProducer.toString():
              pauseProducerListener(data)
              break
            case MessageTypes.WebRTCResumeProducer.toString():
              resumeProducerListener(data)
              break
            case MessageTypes.WebRTCCloseProducer.toString():
              closeProducerListener(data)
              break
          }
        }
      }
      Object.defineProperty(responseFunction, 'name', { value: `responseFunction${peerID}`, writable: true })
      primus.on('data', responseFunction)
      primus.on('end', () => {
        primus.removeListener('data', responseFunction)
      })
    }
  }, [])

  useEffect(() => {
    if (isSelf) {
      peerMediaChannelState.audioStreamPaused.set(mediaStreamState.audioPaused.value)
    }
  }, [mediaStreamState.audioPaused])

  useEffect(() => {
    if (isSelf && !isScreen) {
      peerMediaChannelState.videoStreamPaused.set(mediaStreamState.videoPaused.value)
      if (videoElement != null) {
        if (mediaStreamState.videoPaused.value) {
          ;(videoElement?.srcObject as MediaStream)?.getVideoTracks()[0].stop()
          mediaStreamState.videoStream.value!.getVideoTracks()[0].stop()
        }
      }
    }
  }, [mediaStreamState.videoPaused])

  return null
}

export const PeerMediaChannels = () => {
  const mediaStreamState = useHookstate(getMutableState(MediaStreamState))
  const mediaNetworkState = useMediaNetwork()

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
    mediaNetworkState?.consumers?.length,
    mediaStreamState.videoStream,
    mediaStreamState.audioStream,
    mediaStreamState.screenAudioProducer,
    mediaStreamState.screenVideoProducer
  ])

  return null
}

export const PeerConsumers = () => {
  const mediaStreamState = useHookstate(getMutableState(MediaStreamState))
  const peerMediaChannelState = useHookstate(getMutableState(PeerMediaChannelState))
  const networkState = useHookstate(getMutableState(NetworkState))
  const network = networkState?.get({ noproxy: true })
  const mediaHostId = network.hostIds?.media
  const mediaNetwork = mediaHostId ? network.networks[mediaHostId] : null

  const mediaChannels = [] as {
    peerID: PeerID
    mediaTag: MediaTagType
    channel: ConsumerExtension | ProducerExtension
  }[]

  if (mediaNetwork)
    mediaChannels.push(
      ...mediaNetwork.consumers.map((media: ConsumerExtension) => {
        return { peerID: media.appData.peerID, mediaTag: media.appData.mediaTag, channel: media }
      })
    )

  // own peer id
  const peerID = Engine.instance.peerID
  const alreadyContainsSelf = mediaChannels.find((channel) => channel.peerID === peerID)
  if (!alreadyContainsSelf) {
    if (mediaStreamState.camVideoProducer.value)
      mediaChannels.push({
        peerID,
        channel: mediaStreamState.camVideoProducer.value,
        mediaTag: webcamVideoDataChannelType
      })
    if (mediaStreamState.camAudioProducer.value)
      mediaChannels.push({
        peerID,
        channel: mediaStreamState.camAudioProducer.value,
        mediaTag: webcamAudioDataChannelType
      })
    if (mediaStreamState.screenVideoProducer.value)
      mediaChannels.push({
        peerID,
        channel: mediaStreamState.screenVideoProducer.value,
        mediaTag: screenshareVideoDataChannelType
      })
    if (mediaStreamState.screenAudioProducer.value)
      mediaChannels.push({
        peerID,
        channel: mediaStreamState.screenAudioProducer.value,
        mediaTag: screenshareAudioDataChannelType
      })
  }

  return (
    <>
      <PeerMediaChannels />
      {mediaChannels
        .filter(({ peerID }) => peerMediaChannelState.get({ noproxy: true })[peerID])
        .map(({ channel, peerID, mediaTag }) => (
          <PeerMedia channel={channel} peerID={peerID} mediaTag={mediaTag} key={peerID + '-' + mediaTag} />
        ))}
    </>
  )
}
