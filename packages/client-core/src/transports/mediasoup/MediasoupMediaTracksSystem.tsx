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

import config from '@ir-engine/common/src/config'
import multiLogger from '@ir-engine/common/src/logger'
import {
  MediasoupMediaProducerActions,
  MediasoupMediaProducerConsumerState,
  MediasoupMediaProducersConsumersObjectsState
} from '@ir-engine/common/src/transports/mediasoup/MediasoupMediaProducerConsumerState'
import { MediasoupTransportState } from '@ir-engine/common/src/transports/mediasoup/MediasoupTransportState'
import { PresentationSystemGroup, defineSystem } from '@ir-engine/ecs'
import {
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'
import {
  NetworkState,
  VideoConstants,
  screenshareAudioDataChannelType,
  screenshareVideoDataChannelType,
  webcamAudioDataChannelType,
  webcamVideoDataChannelType
} from '@ir-engine/network'
import React, { useEffect } from 'react'
import { MediaInstanceState, useMediaNetwork } from '../../common/services/MediaInstanceConnectionService'
import { MediaStreamState } from '../../media/MediaStreamState'
import { clientContextParams } from '../../util/ClientContextState'
import { ProducerExtension, WebRTCTransportExtension } from './MediasoupClientFunctions'

const logger = multiLogger.child({
  component: 'client-core:MediasoupMediaTracksSystem',
  modifier: clientContextParams
})

export const MediasoupSelfProducerState = defineState({
  name: 'MediasoupSelfProducerState',
  initial: {
    camVideoProducer: null as ProducerExtension | null,
    camAudioProducer: null as ProducerExtension | null,
    screenVideoProducer: null as ProducerExtension | null,
    screenAudioProducer: null as ProducerExtension | null
  }
})

const MicrophoneReactor = () => {
  const mediaNetworkState = useMediaNetwork()
  const mediaStreamState = useMutableState(MediaStreamState)
  const microphoneEnabled = mediaStreamState.microphoneEnabled.value
  const microphoneMediaStream = mediaStreamState.microphoneMediaStream.value
  const ready = mediaNetworkState?.ready?.value
  const mediasoupSelfProducerState = useMutableState(MediasoupSelfProducerState)
  const camAudioProducer = mediasoupSelfProducerState.camAudioProducer.value

  const mediaStreamAudioSourceNode = useHookstate(null as MediaStreamAudioSourceNode | null)

  useEffect(() => {
    const audioStream = mediaStreamState.microphoneMediaStream.value
    if (!microphoneEnabled || !ready || !audioStream) return

    const network = getState(NetworkState).networks[mediaNetworkState.id.value]

    const channelConnectionState = getState(MediaInstanceState)
    const currentChannelInstanceConnection = channelConnectionState.instances[network.id]
    const channelId = currentChannelInstanceConnection.channelId

    const transport = MediasoupTransportState.getTransport(network.id, 'send') as WebRTCTransportExtension

    const codecOptions = { ...VideoConstants.CAM_AUDIO_CODEC_OPTIONS }
    const mediaSettings = config.client.mediaSettings
    if (mediaSettings?.audio) codecOptions.opusMaxAverageBitrate = mediaSettings.audio.maxBitrate * 1000

    const abortController = new AbortController()

    transport
      .produce({
        track: mediaStreamState.microphoneDestinationNode.value!.stream!.getAudioTracks()[0],
        codecOptions,
        appData: { mediaTag: webcamAudioDataChannelType, channelId: channelId }
      })
      .then((prod) => {
        if (abortController.signal.aborted) return
        const producer = prod as any as ProducerExtension
        getMutableState(MediasoupMediaProducersConsumersObjectsState).producers[producer.id].set(producer)
        mediasoupSelfProducerState.camAudioProducer.set(producer)
      })

    return () => {
      abortController.abort()

      if (mediasoupSelfProducerState.camAudioProducer.value) {
        dispatchAction(
          MediasoupMediaProducerActions.producerClosed({
            producerID: mediasoupSelfProducerState.camAudioProducer.value.id,
            $network: network.id,
            $topic: network.topic
          })
        )
        mediasoupSelfProducerState.camAudioProducer.value.close()
        mediasoupSelfProducerState.camAudioProducer.set(null)
      }
    }
  }, [microphoneMediaStream, microphoneEnabled, ready])

  useEffect(() => {
    if (!ready || !microphoneMediaStream) return

    if (!camAudioProducer || camAudioProducer.closed) return

    const sourceNode = mediaStreamAudioSourceNode.value

    if (!sourceNode) return

    sourceNode.mediaStream.removeTrack(sourceNode.mediaStream.getAudioTracks()[0])
    sourceNode.mediaStream.addTrack(microphoneMediaStream.getAudioTracks()[0])
  }, [microphoneMediaStream, camAudioProducer])

  return null
}

const getCodecEncodings = (service: 'video' | 'screenshare') => {
  const mediaSettings = config.client.mediaSettings
  const settings = mediaSettings[service]
  let codec, encodings
  if (settings) {
    switch (settings.codec) {
      case 'VP9':
        codec = VideoConstants.VP9_CODEC
        encodings = VideoConstants.CAM_VIDEO_SVC_CODEC_OPTIONS
        break
      case 'h264':
        codec = VideoConstants.H264_CODEC
        encodings = VideoConstants.CAM_VIDEO_SIMULCAST_ENCODINGS
        encodings[0].maxBitrate = settings.lowResMaxBitrate * 1000
        encodings[1].maxBitrate = settings.midResMaxBitrate * 1000
        encodings[2].maxBitrate = settings.highResMaxBitrate * 1000
        break
      case 'VP8':
        codec = VideoConstants.VP8_CODEC
        encodings = VideoConstants.CAM_VIDEO_SIMULCAST_ENCODINGS
        encodings[0].maxBitrate = settings.lowResMaxBitrate * 1000
        encodings[1].maxBitrate = settings.midResMaxBitrate * 1000
        encodings[2].maxBitrate = settings.highResMaxBitrate * 1000
    }
  }

  return { codec, encodings }
}

const WebcamReactor = () => {
  const mediaNetworkState = useMediaNetwork()
  const mediaStreamState = useMutableState(MediaStreamState)
  const webcamEnabled = mediaStreamState.webcamEnabled.value
  const webcamMediaStream = mediaStreamState.webcamMediaStream.value
  const ready = mediaNetworkState?.ready?.value
  const mediasoupSelfProducerState = useMutableState(MediasoupSelfProducerState)
  const camVideoProducer = mediasoupSelfProducerState.camVideoProducer.value

  useEffect(() => {
    if (!webcamEnabled || !ready || !webcamMediaStream) return

    if (camVideoProducer && !camVideoProducer.closed) return

    const network = getState(NetworkState).networks[mediaNetworkState.id.value]

    const channelConnectionState = getState(MediaInstanceState)
    const currentChannelInstanceConnection = channelConnectionState.instances[network.id]
    const channelId = currentChannelInstanceConnection.channelId

    const transport = MediasoupTransportState.getTransport(network.id, 'send') as WebRTCTransportExtension

    const { codec, encodings } = getCodecEncodings('video')

    const abortController = new AbortController()

    transport
      .produce({
        track: webcamMediaStream!.getVideoTracks()[0],
        encodings,
        codecOptions: VideoConstants.CAM_VIDEO_SIMULCAST_CODEC_OPTIONS,
        codec,
        appData: { mediaTag: webcamVideoDataChannelType, channelId: channelId }
      })
      .then((prod) => {
        if (abortController.signal.aborted) return
        const producer = prod as any as ProducerExtension
        getMutableState(MediasoupMediaProducersConsumersObjectsState).producers[producer.id].set(producer)
        mediasoupSelfProducerState.camVideoProducer.set(producer)
      })

    return () => {
      abortController.abort()

      if (mediasoupSelfProducerState.camVideoProducer.value) {
        dispatchAction(
          MediasoupMediaProducerActions.producerClosed({
            producerID: mediasoupSelfProducerState.camVideoProducer.value.id,
            $network: network.id,
            $topic: network.topic
          })
        )
        mediasoupSelfProducerState.camVideoProducer.value.close()
        mediasoupSelfProducerState.camVideoProducer.set(null)
      }
    }
  }, [webcamMediaStream, webcamEnabled, ready])

  useEffect(() => {
    if (!ready || !webcamMediaStream) return

    if (!camVideoProducer || camVideoProducer.closed) return

    camVideoProducer.replaceTrack({ track: webcamMediaStream.getVideoTracks()[0] })
  }, [webcamMediaStream, camVideoProducer])

  return null
}

const ScreenshareReactor = () => {
  const mediaNetworkState = useMediaNetwork()
  const mediaStreamState = useMutableState(MediaStreamState)
  const screenshareEnabled = mediaStreamState.screenshareEnabled.value
  const screenshareMediaStream = mediaStreamState.screenshareMediaStream.value
  const ready = mediaNetworkState?.ready?.value
  const mediasoupSelfProducerState = useMutableState(MediasoupSelfProducerState)
  const screenVideoProducer = mediasoupSelfProducerState.screenVideoProducer.value
  const screenAudioProducer = mediasoupSelfProducerState.screenAudioProducer.value
  const screenShareAudioPaused = mediaStreamState.screenShareAudioPaused.value

  useEffect(() => {
    if (!screenshareEnabled || !ready || !screenshareMediaStream) return

    if (screenVideoProducer && !screenVideoProducer.closed) return

    const videoTracks = screenshareMediaStream.getVideoTracks()
    if (!videoTracks.length) return logger.error('No video tracks found for screen share')

    const network = getState(NetworkState).networks[mediaNetworkState.id.value]

    const channelConnectionState = getState(MediaInstanceState)
    const currentChannelInstanceConnection = channelConnectionState.instances[network.id]
    const channelId = currentChannelInstanceConnection.channelId

    const transport = MediasoupTransportState.getTransport(network.id, 'send') as WebRTCTransportExtension

    const { codec, encodings } = getCodecEncodings('screenshare')

    const abortController = new AbortController()

    transport
      .produce({
        track: mediaStreamState.screenshareMediaStream.value!.getVideoTracks()[0],
        encodings,
        codecOptions: VideoConstants.CAM_VIDEO_SIMULCAST_CODEC_OPTIONS,
        codec,
        appData: { mediaTag: screenshareVideoDataChannelType, channelId }
      })
      .then((producer) => {
        if (abortController.signal.aborted) {
          producer.close()
          return
        }

        const videoProducer = producer as any as ProducerExtension

        mediasoupSelfProducerState.screenVideoProducer.set(videoProducer)

        getMutableState(MediasoupMediaProducersConsumersObjectsState).producers[videoProducer.id].set(videoProducer)

        // handler for screen share stopped event (triggered by the browser's built-in screen sharing ui)
        videoProducer!.track!.onended = () => {
          mediaStreamState.screenshareEnabled.set(false)
        }
      })

    // create a producer for audio, if we have it
    const audioTracks = mediaStreamState.screenshareMediaStream.value!.getAudioTracks()
    if (audioTracks.length) {
      transport
        .produce({
          track: audioTracks[0],
          appData: { mediaTag: screenshareAudioDataChannelType, channelId }
        })
        .then((producer) => {
          if (abortController.signal.aborted) {
            producer.close()
            return
          }
          const audioProducer = producer as any as ProducerExtension
          mediasoupSelfProducerState.screenAudioProducer.set(audioProducer)
          mediaStreamState.screenShareAudioPaused.set(false)
          getMutableState(MediasoupMediaProducersConsumersObjectsState).producers[audioProducer.id].set(audioProducer)
        })
    }

    return () => {
      abortController.abort()

      if (mediasoupSelfProducerState.screenVideoProducer.value) {
        dispatchAction(
          MediasoupMediaProducerActions.producerClosed({
            producerID: mediasoupSelfProducerState.screenVideoProducer.value.id,
            $network: network.id,
            $topic: network.topic
          })
        )
        mediasoupSelfProducerState.screenVideoProducer.value.close()
        mediasoupSelfProducerState.screenVideoProducer.set(null)
      }

      if (mediasoupSelfProducerState.screenAudioProducer.value) {
        dispatchAction(
          MediasoupMediaProducerActions.producerClosed({
            producerID: mediasoupSelfProducerState.screenAudioProducer.value.id,
            $network: network.id,
            $topic: network.topic
          })
        )
        mediasoupSelfProducerState.screenAudioProducer.value.close()
        mediasoupSelfProducerState.screenAudioProducer.set(null)
        mediaStreamState.screenShareAudioPaused.set(true)
      }
    }
  }, [screenshareMediaStream, screenshareEnabled, ready])

  useEffect(() => {
    if (!ready || !screenshareMediaStream) return

    if (!screenShareAudioPaused || !screenAudioProducer || screenAudioProducer.closed) return

    const network = getState(NetworkState).networks[mediaNetworkState.id.value]

    if (screenShareAudioPaused) MediasoupMediaProducerConsumerState.pauseProducer(network, screenAudioProducer.id)
    else MediasoupMediaProducerConsumerState.resumeConsumer(network, screenAudioProducer.id)
    logger.info({ event_name: 'screenshare', value: screenShareAudioPaused })
  }, [screenShareAudioPaused])

  return null
}

const reactor = () => {
  const mediaNetworkState = useMediaNetwork()

  /** @todo in future we will have a better way of determining whether we need to connect to a server or not */
  if (!mediaNetworkState?.hostPeerID?.value) return null

  return (
    <>
      <WebcamReactor />
      <MicrophoneReactor />
      <ScreenshareReactor />
    </>
  )
}

export const MediasoupMediaTracksSystem = defineSystem({
  uuid: 'ee.client.MediasoupMediaTracksSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
