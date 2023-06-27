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

import { createHash } from 'crypto'
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
import { uploadRecordingStaticResource } from './ServerRecordingSystem'
import { SocketWebRTCServerNetwork } from './SocketWebRTCServerFunctions'

const logger = serverLogger.child({ module: 'instanceserver:MediaRecording' })

export const createTransport = async (router: Router, port: number, rtcpPort: number, producerId: string) => {
  const transport = await router.createPlainTransport({
    // No RTP will be received from the remote side
    comedia: false,

    // FFmpeg don't support RTP/RTCP multiplexing ("a=rtcp-mux" in SDP)
    rtcpMux: false,

    listenIp: localConfig.mediasoup.plainTransport.listenIp
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

export type MediaTrackPair = {
  video?: PeerMediaType
  videoTransport?: any
  videoConsumer?: any
  audio?: PeerMediaType
  audioTransport?: any
  audioConsumer?: any
}

export const startMediaRecordingPair = async (
  peerID: PeerID,
  mediaType: 'webcam' | 'screenshare',
  tracks: MediaTrackPair
) => {
  const network = Engine.instance.mediaNetwork as SocketWebRTCServerNetwork

  const promises = [] as Promise<any>[]

  if (tracks.video) {
    const routers = network.routers[`${tracks.video.channelType}:${tracks.video.channelId}`]
    const transportPromise = createTransport(
      routers[0],
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
    const routers = network.routers[`${tracks.audio.channelType}:${tracks.audio.channelId}`]
    const transportPromise = createTransport(
      routers[0],
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

  await Promise.all(promises)

  const stopRecording = () => {
    if (tracks.video) {
      tracks.videoConsumer.close()
      tracks.videoTransport.close()
    }
    if (tracks.audio) {
      tracks.audioConsumer.close()
      tracks.audioTransport.close()
    }
    console.log('ffmpeg connected:', ffmpegProcess.childProcess.connected)
    if (ffmpegProcess.childProcess.connected) ffmpegProcess.stop()
  }

  const onExit = () => {
    stopRecording()
  }

  /** start ffmpeg */
  const isH264 = !!tracks.video && !!tracks.video?.encodings.find((encoding) => encoding.mimeType === 'video/h264')
  const ffmpegProcess = await startFFMPEG(!!tracks.audio, !!tracks.video, onExit, isH264)

  /** resume consumers */
  if (tracks.video) {
    tracks.videoConsumer.resume()
    logger.info('Resuming recording video consumer', tracks.videoConsumer)
  }
  if (tracks.audio) {
    tracks.audioConsumer.resume()
    logger.info('Resuming recording audio consumer', tracks.audioConsumer)
  }
  return {
    stopRecording,
    stream: ffmpegProcess.stream,
    peerID,
    mediaType,
    format: isH264 ? 'h264' : ((tracks.video ? 'vp8' : 'mp3') as 'h264' | 'vp8' | 'mp3')
  }
}

// todo - refactor to be in a reactor such that we can record media tracks that are started after the recording is

export const startMediaRecording = async (recordingID: string, userID: UserId, mediaChannels: MediaTagType[]) => {
  const network = Engine.instance.mediaNetwork as SocketWebRTCServerNetwork

  const peers = network.users.get(userID)

  if (!peers) return

  const mediaStreams = {} as Record<PeerID, { [mediaType: string]: MediaTrackPair }>

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

  const recordingPromises = [] as ReturnType<typeof startMediaRecordingPair>[]

  for (const [peer, media] of Object.entries(mediaStreams)) {
    for (const [mediaType, tracks] of Object.entries(media)) {
      recordingPromises.push(startMediaRecordingPair(peer as PeerID, mediaType as 'webcam' | 'screenshare', tracks))
    }
  }

  const recordings = await Promise.all(recordingPromises)

  const activeUploads = recordings.map((recording) => {
    const stream = recording.stream
    const format = recording.format === 'mp3' ? 'audio/opus' : recording.format === 'vp8' ? 'video/webm' : 'video/mp4'
    const ext = recording.format === 'mp3' ? 'mp3' : recording.format === 'vp8' ? 'webm' : 'mp4'
    const key = `recordings/${recordingID}/${recording.peerID}-${recording.mediaType}.${ext}`

    const upload = uploadRecordingStaticResource({
      recordingID,
      key,
      body: stream,
      mimeType: format,
      hash: createHash('sha3-256').update(key.split('/').pop()!.split('.')[0]).digest('hex')
    }).then(() => {
      logger.info('Uploaded media file' + key)
    })

    return upload
  })

  return {
    recordings,
    activeUploads
  }
}
