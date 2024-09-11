import config from '@ir-engine/common/src/config'
import multiLogger from '@ir-engine/common/src/logger'
import {
  MediasoupMediaProducerActions,
  MediasoupMediaProducerConsumerState,
  MediasoupMediaProducersConsumersObjectsState
} from '@ir-engine/common/src/transports/mediasoup/MediasoupMediaProducerConsumerState'
import { MediasoupTransportState } from '@ir-engine/common/src/transports/mediasoup/MediasoupTransportState'
import { PresentationSystemGroup, defineSystem } from '@ir-engine/ecs'
import { defineState, dispatchAction, getMutableState, getState, useMutableState } from '@ir-engine/hyperflux'
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
import { clientContextParams } from '../../util/contextParams'
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

  useEffect(() => {
    const audioStream = mediaStreamState.microphoneMediaStream.value
    if (!microphoneEnabled || !ready || !audioStream) return

    if (!camAudioProducer || camAudioProducer.closed) return

    const network = getState(NetworkState).networks[mediaNetworkState.id.value]

    const channelConnectionState = getState(MediaInstanceState)
    const currentChannelInstanceConnection = channelConnectionState.instances[network.id]
    const channelId = currentChannelInstanceConnection.channelId

    //To control the producer audio volume, we need to clone the audio track and connect a Gain to it.
    //This Gain is saved on MediaStreamState so it can be accessed from the user's component and controlled.
    const audioTrack = audioStream.getAudioTracks()[0]
    const ctx = new AudioContext()
    const src = ctx.createMediaStreamSource(new MediaStream([audioTrack]))
    const dst = ctx.createMediaStreamDestination()
    const gainNode = ctx.createGain()
    gainNode.gain.value = 1
    ;[src, gainNode, dst].reduce((a, b) => a && (a.connect(b) as any))
    mediaStreamState.microphoneGainNode.set(gainNode)
    audioStream.removeTrack(audioTrack)
    audioStream.addTrack(dst.stream.getAudioTracks()[0])

    const transport = MediasoupTransportState.getTransport(network.id, 'send') as WebRTCTransportExtension

    const codecOptions = { ...VideoConstants.CAM_AUDIO_CODEC_OPTIONS }
    const mediaSettings = config.client.mediaSettings
    if (mediaSettings?.audio) codecOptions.opusMaxAverageBitrate = mediaSettings.audio.maxBitrate * 1000

    const abortController = new AbortController()

    transport
      .produce({
        track: audioStream!.getAudioTracks()[0],
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

    camAudioProducer.replaceTrack({ track: microphoneMediaStream.getAudioTracks()[0] })
    // MediasoupMediaProducerConsumerState.resumeProducer(network, camAudioProducer.id)

    return () => {
      // MediasoupMediaProducerConsumerState.pauseProducer(network, camAudioProducer.id)
      camAudioProducer.track?.stop()
    }
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
    // MediasoupMediaProducerConsumerState.resumeProducer(network, camVideoProducer.id)

    return () => {
      /** @todo close producer */
      // MediasoupMediaProducerConsumerState.pauseProducer(network, camVideoProducer.id)
      camVideoProducer.track?.stop()
    }
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
          MediasoupMediaProducerActions.producerPaused({
            producerID: mediasoupSelfProducerState.screenVideoProducer.value.id,
            globalMute: false,
            paused: true,
            $network: network.id,
            $topic: network.topic
          })
        )
        mediasoupSelfProducerState.screenVideoProducer.value.pause()
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
          MediasoupMediaProducerActions.producerPaused({
            producerID: mediasoupSelfProducerState.screenAudioProducer.value.id,
            globalMute: false,
            paused: true,
            $network: network.id,
            $topic: network.topic
          })
        )
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
