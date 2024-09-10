import config from '@ir-engine/common/src/config'
import multiLogger from '@ir-engine/common/src/logger'
import { InstanceID } from '@ir-engine/common/src/schema.type.module'
import {
  MediasoupMediaConsumerActions,
  MediasoupMediaProducerConsumerState,
  MediasoupMediaProducersConsumersObjectsState
} from '@ir-engine/common/src/transports/mediasoup/MediasoupMediaProducerConsumerState'
import { MediasoupTransportState } from '@ir-engine/common/src/transports/mediasoup/MediasoupTransportState'
import { Engine, PresentationSystemGroup, defineSystem } from '@ir-engine/ecs'
import { dispatchAction, getMutableState, getState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import {
  NetworkState,
  VideoConstants,
  webcamAudioDataChannelType,
  webcamVideoDataChannelType
} from '@ir-engine/network'
import React, { useEffect } from 'react'
import { MediaInstanceState, useMediaNetwork } from '../common/services/MediaInstanceConnectionService'
import { clientContextParams } from '../util/contextParams'
import { MediaStreamState } from './MediaStreams'
import { ProducerExtension, SocketWebRTCClientNetwork, WebRTCTransportExtension } from './SocketWebRTCClientFunctions'

const logger = multiLogger.child({
  component: 'client-core:MediasoupMediaTracksSystem',
  modifier: clientContextParams
})

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

const NetworkConsumers = (props: { networkID: InstanceID }) => {
  const { networkID } = props
  const producers = useHookstate(getMutableState(MediasoupMediaProducerConsumerState)[networkID].producers)
  return (
    <>
      {producers.keys.map((producerID: string) => (
        <NetworkProducer key={producerID} producerID={producerID} networkID={networkID} />
      ))}
    </>
  )
}

const MicrophoneReactor = () => {
  const mediaNetworkState = useMediaNetwork()
  const mediaStreamState = useMutableState(MediaStreamState)
  const microphoneEnabled = mediaStreamState.audioEnabled.value
  const audioStream = mediaStreamState.audioStream.value
  const ready = mediaNetworkState?.ready?.value
  const camAudioProducer = mediaStreamState.camAudioProducer.value

  useEffect(() => {
    const audioStream = mediaStreamState.audioStream.value
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
        mediaStreamState.camAudioProducer.set(producer)
      })

    return () => {
      abortController.abort()

      /**
       * @todo do we want to destroy the producer for any reason here?
       * - it already gets cleaned up when the network is left
       */
    }
  }, [mediaStreamState.audioStream.value, microphoneEnabled, mediaNetworkState?.ready.value])

  useEffect(() => {
    if (!ready || !audioStream) return

    if (!camAudioProducer || camAudioProducer.closed) return

    const network = getState(NetworkState).networks[mediaNetworkState.id.value]

    camAudioProducer.replaceTrack({ track: audioStream.getAudioTracks()[0] })
    MediasoupMediaProducerConsumerState.resumeProducer(network, camAudioProducer.id)
    logger.info({ event_name: 'microphone', value: true })

    return () => {
      MediasoupMediaProducerConsumerState.pauseProducer(network, camAudioProducer.id)
      logger.info({ event_name: 'microphone', value: false })
      camAudioProducer.track?.stop()
    }
  }, [audioStream, camAudioProducer])

  return null
}

const getCodecEncodings = (service: string) => {
  const mediaSettings = config.client.mediaSettings
  const settings = service === 'video' ? mediaSettings.video : mediaSettings.screenshare
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
  const webcamEnabled = mediaStreamState.videoEnabled.value
  const videoStream = mediaStreamState.videoStream.value
  const ready = mediaNetworkState?.ready?.value
  const camVideoProducer = mediaStreamState.camVideoProducer.value

  useEffect(() => {
    if (!webcamEnabled || !ready || !videoStream) return

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
        track: videoStream!.getVideoTracks()[0],
        encodings,
        codecOptions: VideoConstants.CAM_VIDEO_SIMULCAST_CODEC_OPTIONS,
        codec,
        appData: { mediaTag: webcamVideoDataChannelType, channelId: channelId }
      })
      .then((prod) => {
        if (abortController.signal.aborted) return
        const producer = prod as any as ProducerExtension
        getMutableState(MediasoupMediaProducersConsumersObjectsState).producers[producer.id].set(producer)
        mediaStreamState.camVideoProducer.set(producer)
      })

    return () => {
      abortController.abort()

      /**
       * @todo do we want to destroy the producer for any reason here?
       * - it already gets cleaned up when the network is left
       */
    }
  }, [videoStream, webcamEnabled, ready])

  useEffect(() => {
    console.log('webcamEnabled', {webcamEnabled, ready, videoStream, camVideoProducer})
    if (!ready || !videoStream) return

    if (!camVideoProducer || camVideoProducer.closed) return

    const network = getState(NetworkState).networks[mediaNetworkState.id.value]

    camVideoProducer.replaceTrack({ track: videoStream.getVideoTracks()[0] })
    MediasoupMediaProducerConsumerState.resumeProducer(network, camVideoProducer.id)
    logger.info({ event_name: 'camera', value: true })

    return () => {
      MediasoupMediaProducerConsumerState.pauseProducer(network, camVideoProducer.id)
      logger.info({ event_name: 'camera', value: false })
      camVideoProducer.track?.stop()
    }
  }, [videoStream, camVideoProducer])

  return null
}

const reactor = () => {
  const networkIDs = useMutableState(MediasoupMediaProducerConsumerState)
  const networks = useHookstate(getMutableState(NetworkState).networks)

  return (
    <>
      {networkIDs.keys
        .filter((id) => !!networks[id])
        .map((id: InstanceID) => (
          <NetworkConsumers key={id} networkID={id} />
        ))}
      <WebcamReactor />
      <MicrophoneReactor />
    </>
  )
}

export const MediasoupMediaTracksSystem = defineSystem({
  uuid: 'ee.client.MediasoupMediaTracksSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
