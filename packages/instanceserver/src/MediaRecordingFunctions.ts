import { Router } from 'mediasoup/node/lib/types'

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { DataChannelType } from '@etherealengine/engine/src/networking/classes/Network'
import {
  MediaTagType,
  PeerMediaType,
  screenshareAudioDataChannelType,
  webcamAudioDataChannelType,
  webcamVideoDataChannelType
} from '@etherealengine/engine/src/networking/NetworkState'
import { localConfig } from '@etherealengine/server-core/src/config'
import serverLogger from '@etherealengine/server-core/src/ServerLogger'

import { startFFMPEG } from './FFMPEG'
import { SocketWebRTCServerNetwork } from './SocketWebRTCServerFunctions'

const logger = serverLogger.child({ module: 'instanceserver:MediaRecording' })

export const createTransport = async (router: Router, port: number, rtcpPort: number, producerId: string) => {
  const transport = await router.createPlainTransport({
    // No RTP will be received from the remote side
    comedia: false,

    // FFmpeg don't support RTP/RTCP multiplexing ("a=rtcp-mux" in SDP)
    rtcpMux: false,

    ...localConfig.mediasoup.plainTransport
  })

  await transport.connect({
    ip: localConfig.mediasoup.recording.ip,
    port,
    rtcpPort
  })

  logger.info(
    'mediasoup AUDIO RTP SEND transport connected: %s:%d <--> %s:%d (%s)',
    transport.tuple.localIp,
    transport.tuple.localPort,
    transport.tuple.remoteIp,
    transport.tuple.remotePort,
    transport.tuple.protocol
  )

  logger.info(
    'mediasoup AUDIO RTCP SEND transport connected: %s:%d <--> %s:%d (%s)',
    transport.rtcpTuple?.localIp,
    transport.rtcpTuple?.localPort,
    transport.rtcpTuple?.remoteIp,
    transport.rtcpTuple?.remotePort,
    transport.rtcpTuple?.protocol
  )

  const consumer = await transport.consume({
    producerId,
    rtpCapabilities: router.rtpCapabilities, // Assume the recorder supports same formats as mediasoup's router
    paused: true
  })

  console.log(consumer.rtpParameters.codecs)

  logger.info(
    'mediasoup VIDEO RTP SEND consumer created, kind: %s, type: %s, paused: %s, SSRC: %s CNAME: %s',
    consumer.kind,
    consumer.type,
    consumer.paused,
    consumer.rtpParameters.encodings?.[0]?.ssrc,
    consumer.rtpParameters.rtcp?.cname
  )

  return { transport, consumer }
}

export type MediaRecordingPeer = {
  [media: string]: {
    video?: PeerMediaType
    videoTransport?: any
    videoConsumer?: any
    audio?: PeerMediaType
    audioTransport?: any
    audioConsumer?: any
  }
}

// todo - refactor to be in a reactor such that we can record media tracks that are started after the recording is

export const startMediaRecording = async (recordingID: string, userID: UserId, mediaChannels: MediaTagType[]) => {
  const network = Engine.instance.mediaNetwork as SocketWebRTCServerNetwork

  const peers = network.users.get(userID)

  if (!peers) return

  const mediaStreams = {} as Record<PeerID, MediaRecordingPeer>

  for (const peerID of peers) {
    const peer = network.peers.get(peerID)!
    const peerMedia = Object.entries(peer.media!).filter(([type]) => mediaChannels.includes(type as DataChannelType))

    if (peerMedia.length) {
      for (const [channelType, media] of peerMedia) {
        if (!mediaStreams[peerID]) mediaStreams[peerID] = {}
        const mediaType =
          channelType === webcamAudioDataChannelType || channelType === webcamVideoDataChannelType
            ? 'webcam'
            : 'screenshare'
        const trackType =
          channelType === webcamAudioDataChannelType || channelType === screenshareAudioDataChannelType
            ? 'audio'
            : 'video'
        if (!mediaStreams[peerID][mediaType]) mediaStreams[peerID][mediaType] = {}
        mediaStreams[peerID][mediaType][trackType] = media
      }
    }
  }

  let useAudio = false
  let useVideo = false

  const promises = [] as Promise<any>[]

  /** create transports */
  for (const [peerID, media] of Object.entries(mediaStreams)) {
    for (const [mediaType, tracks] of Object.entries(media)) {
      let router = null as Router | null

      if (tracks.video) {
        const routers = network.routers[`${tracks.video.channelType}:${tracks.video.channelId}`]
        router = routers[0]
      }

      if (!router && tracks.audio) {
        const routers = network.routers[`${tracks.audio.channelType}:${tracks.audio.channelId}`]
        router = routers[0]
      }

      if (router) {
        if (tracks.video) {
          useVideo = true
          const transportPromise = createTransport(
            router,
            localConfig.mediasoup.recording.videoPort,
            localConfig.mediasoup.recording.videoPortRtcp,
            tracks.video.producerId
          )
          promises.push(transportPromise)
          transportPromise.then(({ transport, consumer }) => {
            tracks.videoTransport = transport
            tracks.videoConsumer = consumer
          })
        }
        if (tracks.audio) {
          useAudio = true
          const transportPromise = createTransport(
            router,
            localConfig.mediasoup.recording.audioPort,
            localConfig.mediasoup.recording.audioPortRtcp,
            tracks.audio.producerId
          )
          promises.push(transportPromise)
          transportPromise.then(({ transport, consumer }) => {
            tracks.audioTransport = transport
            tracks.audioConsumer = consumer
          })
        }
      }
    }
  }

  await Promise.all(promises)

  const onExit = () => {
    stopRecording()
  }

  /** start ffmpeg */

  const ffmpegProcess = await startFFMPEG(useAudio, useVideo, onExit)

  /** resume consumers */

  for (const [peerID, media] of Object.entries(mediaStreams)) {
    for (const [mediaType, tracks] of Object.entries(media)) {
      if (tracks.video) {
        tracks.videoConsumer.resume()
        console.log('resuming video consumer', tracks.videoConsumer)
      }
      if (tracks.audio) {
        tracks.audioConsumer.resume()
        console.log('resuming audio consumer', tracks.audioConsumer)
      }
    }
  }

  const stopRecording = () => {
    for (const [peerID, media] of Object.entries(mediaStreams)) {
      for (const [mediaType, tracks] of Object.entries(media)) {
        if (tracks.video) {
          tracks.videoConsumer.close()
          tracks.videoTransport.close()
        }
        if (tracks.audio) {
          tracks.audioConsumer.close()
          tracks.audioTransport.close()
        }
      }
    }
    console.log('ffmpeg connected:', ffmpegProcess.childProcess.connected)
    if (ffmpegProcess.childProcess.connected) ffmpegProcess.stop()
  }

  return {
    stopRecording,
    ffmpegProcess
  }
}
