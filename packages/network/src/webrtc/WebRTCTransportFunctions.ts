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

import { defineState, getMutableState, getState, HyperFlux, NetworkID, none, PeerID } from '@ir-engine/hyperflux'
import { DataChannelType } from '../DataChannelRegistry'
import { MediaTagType } from '../NetworkState'

const loggingEnabled = false //isDev
const logger = loggingEnabled ? console : { log: () => {}, warn: () => {}, error: () => {} }

/**
 * See https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Perfect_negotiation for more information
 */

export const StunServerState = defineState({
  name: 'ir.network.webrtc.stunServers',
  initial: [] as RTCIceServer[]
})

/**
 * RTCPeerConnectionState is a state that manages the RTCPeerConnection instances
 */
export const RTCPeerConnectionState = defineState({
  name: 'ir.network.webrtc.RTCPeerConnection',
  initial: {} as Record<
    NetworkID,
    Record<
      PeerID,
      {
        makingOffer: boolean
        ignoreOffer: boolean
        peerConnection: RTCPeerConnection
        dataChannels: Record<DataChannelType, RTCDataChannel>
        incomingMediaTracks: Record<string, { mediaTag: MediaTagType | null; stream: MediaStream | null }>
        outgoingMediaTracks: Record<string, { mediaTag: MediaTagType | null; stream: MediaStream | null }>
        ready: boolean
      }
    >
  >
})

export type PollMessage = {
  type: 'poll'
}

export type DescriptionMessage = {
  type: 'description'
  description: RTCSessionDescriptionInit
}

export type CandidateMessage = {
  type: 'candidate'
  candidate: RTCIceCandidate | null
}

export type StartTrackMessage = {
  type: 'start-track'
  id: string
  mediaTag: MediaTagType
}

export type StopTrackMessage = {
  type: 'stop-track'
  id: string
}

export type PauseTrackMessage = {
  type: 'pause-track'
  id: string
  paused: boolean
}

export type VideoQualityMessage = {
  type: 'video-quality'
  id: string
  scale: number
  bitrate: number
}

export type MessageTypes =
  | PollMessage
  | DescriptionMessage
  | CandidateMessage
  | StartTrackMessage
  | StopTrackMessage
  | PauseTrackMessage
  | VideoQualityMessage

export type SendMessageType = (networkID: NetworkID, targetPeerID: PeerID, message: MessageTypes) => void

const onMessage = (sendMessage: SendMessageType, networkID: NetworkID, fromPeerID: PeerID, message: MessageTypes) => {
  // console.log('onMessage', message)
  switch (message.type) {
    case 'poll':
      return WebRTCTransportFunctions.makeCall(sendMessage, networkID, fromPeerID)
    case 'description':
      return WebRTCTransportFunctions.handleDescription(sendMessage, networkID, fromPeerID, message)
    case 'candidate':
      return WebRTCTransportFunctions.handleCandidate(networkID, fromPeerID, message)
    case 'start-track':
      return WebRTCTransportFunctions.handleStartTrack(networkID, fromPeerID, message)
    case 'stop-track':
      return WebRTCTransportFunctions.handleStopTrack(networkID, fromPeerID, message)
    case 'pause-track':
      return WebRTCTransportFunctions.handlePauseMediaChannel(networkID, fromPeerID, message)
    case 'video-quality':
      return WebRTCTransportFunctions.handleVideoQuality(networkID, fromPeerID, message)
    default:
      logger.warn('Unknown message type', (message as any).type)
      break
  }
}

/**
 * Assumes that the STUN server configuration is already set
 */
const createPeerConnection = (sendMessage: SendMessageType, networkID: NetworkID, targetPeerID: PeerID) => {
  const pc = new RTCPeerConnection({ iceServers: getState(StunServerState) as RTCIceServer[] })

  pc.onicecandidate = (e) => {
    sendMessage(networkID, targetPeerID, {
      type: 'candidate',
      candidate: e.candidate
    })
  }

  pc.onconnectionstatechange = () => {
    logger.log('onconnectionstatechange', pc.connectionState)
    if (pc.connectionState === 'connected') {
      getMutableState(RTCPeerConnectionState)[networkID][targetPeerID].ready.set(true)
    }
    if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
      pc.close()
      getMutableState(RTCPeerConnectionState)[networkID][targetPeerID].set(none)
    }
  }

  pc.onsignalingstatechange = () => {
    logger.log('onsignalingstatechange', networkID, targetPeerID, pc.signalingState)
  }

  pc.ondatachannel = (e) => {
    logger.log('[WebRTCTransportFunctions] ondatachannel', networkID, e.channel.label)
    e.channel.onopen = () => {
      logger.log('[WebRTCTransportFunctions] ondatachannel open', networkID, e.channel.label)
      getMutableState(RTCPeerConnectionState)[networkID][targetPeerID].dataChannels[e.channel.label].set(e.channel)
    }
  }

  pc.ontrack = (e) => {
    logger.log('[WebRTCTransportFunctions] ontrack', e.track)
    const stream = e.streams[0]
    const mediaTracks = getMutableState(RTCPeerConnectionState)[networkID][targetPeerID].incomingMediaTracks
    if (!mediaTracks.value[stream.id]) {
      mediaTracks.merge({ [stream.id]: { mediaTag: null!, stream } })
    } else {
      mediaTracks[stream.id].stream.set(stream)
    }
  }

  pc.onnegotiationneeded = async (e) => {
    logger.log('[WebRTCTransportFunctions] onnegotiationneeded', networkID, e)
    const makingOffer = getMutableState(RTCPeerConnectionState)[networkID]?.[targetPeerID]?.makingOffer
    try {
      makingOffer.set(true)
      await pc.setLocalDescription()
      sendMessage(networkID, targetPeerID, { type: 'description', description: pc.localDescription! })
    } catch (err) {
      logger.error('Failed to create offer', err)
    } finally {
      makingOffer.set(false)
    }
  }

  pc.oniceconnectionstatechange = () => {
    if (pc.iceConnectionState === 'failed') {
      pc.restartIce()
    }
  }

  if (!getState(RTCPeerConnectionState)[networkID]) {
    getMutableState(RTCPeerConnectionState)[networkID].set({})
  }
  getMutableState(RTCPeerConnectionState)[networkID][targetPeerID].set({
    makingOffer: false,
    ignoreOffer: false,
    peerConnection: pc,
    dataChannels: {},
    incomingMediaTracks: {},
    outgoingMediaTracks: {},
    ready: false
  })

  return pc
}

const poll = (sendMessage: SendMessageType, networkID: NetworkID, peerID: PeerID) => {
  sendMessage(networkID, peerID, { type: 'poll' })
}

const makeCall = async (sendMessage: SendMessageType, networkID: NetworkID, targetPeerID: PeerID) => {
  logger.log('[WebRTCTransportFunctions] makeCall', networkID, targetPeerID)
  if (getState(RTCPeerConnectionState)[networkID]?.[targetPeerID]) return // already polled

  const pc = WebRTCTransportFunctions.createPeerConnection(sendMessage, networkID, targetPeerID)

  /**
   * If we are not the peer that initiative polling, then poll the other peer to let them know we are ready.
   */
  if (HyperFlux.store.peerID < targetPeerID) {
    sendMessage(networkID, targetPeerID, { type: 'poll' })
    return
  }

  /**
   * If we are the peer that initiated polling, once we know the other peer is ready,
   * we can create a data channel which will complete the negotiation and allow us to send actions.
   */
  const dc = pc.createDataChannel('actions')
  // timeout require to delay the reactor until the next update
  setTimeout(() => {
    dc.onopen = () => {
      logger.log('[WebRTCTransportFunctions] ondatachannel open', networkID, dc.label)
      getMutableState(RTCPeerConnectionState)[networkID][targetPeerID].dataChannels[dc.label].set(dc)
    }
  }, 1)
}

const handleDescription = async (
  sendMessage: SendMessageType,
  networkID: NetworkID,
  targetPeerID: PeerID,
  message: DescriptionMessage
) => {
  const description = message.description
  const peer = getState(RTCPeerConnectionState)[networkID]?.[targetPeerID]
  if (!peer) {
    return logger.error('Peer connection does not exist', targetPeerID)
  }

  const {
    peerConnection: pc,
    ignoreOffer,
    makingOffer
  } = getMutableState(RTCPeerConnectionState)[networkID][targetPeerID]

  const offerCollision = description.type === 'offer' && (makingOffer.value || pc.value.signalingState !== 'stable')

  const polite = HyperFlux.store.peerID > targetPeerID
  ignoreOffer.set(!polite && offerCollision)
  if (ignoreOffer.value) {
    return
  }

  await pc.value.setRemoteDescription(description)
  if (description.type === 'offer') {
    await pc.value.setLocalDescription()
    sendMessage(networkID, targetPeerID, { type: 'description', description: pc.value.localDescription! })
  }
}

const handleCandidate = async (networkID: NetworkID, targetPeerID: PeerID, candidate: CandidateMessage) => {
  const pc = getState(RTCPeerConnectionState)[networkID]?.[targetPeerID]?.peerConnection
  if (!pc) {
    return logger.error('Peer connection does not exist', targetPeerID)
  }
  if (!candidate.candidate?.candidate) {
    return
  } else {
    try {
      await pc.addIceCandidate(candidate.candidate)
    } catch (err) {
      const ignoreOffer = getState(RTCPeerConnectionState)[networkID]?.[targetPeerID]?.ignoreOffer
      if (!ignoreOffer) {
        throw err
      }
    }
  }
}

const close = (networkID: NetworkID, peerID: PeerID) => {
  const pc = getState(RTCPeerConnectionState)[networkID]?.[peerID]?.peerConnection
  if (pc) {
    pc.close()
    getMutableState(RTCPeerConnectionState)[networkID][peerID].set(none)
  }
}

const createDataChannel = (networkID: NetworkID, peerID: PeerID, label: DataChannelType) => {
  const pc = getState(RTCPeerConnectionState)[networkID]?.[peerID]?.peerConnection
  if (!pc) {
    return logger.error('Peer connection does not exist')
  }
  const dc = pc.createDataChannel(label)
  dc.onopen = () => {
    logger.log('[WebRTCTransportFunctions] ondatachannel open', networkID, dc.label)
    getMutableState(RTCPeerConnectionState)[networkID][peerID].dataChannels[dc.label].set(dc)
  }
  return dc
}

const closeDataChannel = (networkID: NetworkID, peerID: PeerID, label: DataChannelType) => {
  const dc = getState(RTCPeerConnectionState)[networkID]?.[peerID]?.dataChannels[label]
  if (dc) {
    dc.close()
    getMutableState(RTCPeerConnectionState)[networkID][peerID].dataChannels[label].set(none)
  }
}

const createMediaChannel = (
  sendMessage: SendMessageType,
  networkID: NetworkID,
  peerID: PeerID,
  track: MediaStreamTrack,
  mediaTag: MediaTagType
) => {
  const pc = getState(RTCPeerConnectionState)[networkID]?.[peerID]?.peerConnection
  if (!pc) {
    return logger.error('Peer connection does not exist')
  }
  const stream = new MediaStream([track])
  logger.log('[WebRTCTransportFunctions] createMediaChannel', networkID, stream.id, track)
  pc.addTrack(track, stream)
  sendMessage(networkID, peerID, { type: 'start-track', id: stream.id!, mediaTag })
  getMutableState(RTCPeerConnectionState)[networkID][peerID].outgoingMediaTracks.merge({
    [stream.id!]: { mediaTag, stream }
  })
  return stream
}

const closeMediaChannel = (
  sendMessage: SendMessageType,
  networkID: NetworkID,
  peerID: PeerID,
  track: MediaStreamTrack,
  stream: MediaStream
) => {
  const pc = getState(RTCPeerConnectionState)[networkID]?.[peerID]?.peerConnection
  if (!pc) {
    return logger.error('Peer connection does not exist')
  }
  logger.log('[WebRTCTransportFunctions] closeMediaChannel', networkID, stream.id, track)
  pc.getSenders().forEach((sender) => {
    if (sender.track === track) {
      pc.removeTrack(sender)
      sendMessage(networkID, peerID, { type: 'stop-track', id: stream.id! })
      getMutableState(RTCPeerConnectionState)[networkID][peerID].outgoingMediaTracks[stream.id!].set(none)
    }
  })
}

const handleStartTrack = (networkID: NetworkID, peerID: PeerID, message: StartTrackMessage) => {
  logger.log('[WebRTCTransportFunctions] handleStartTrack', networkID, peerID, message.id)
  const pc = getState(RTCPeerConnectionState)[networkID]?.[peerID]?.peerConnection
  if (!pc) {
    return logger.error('Peer connection does not exist')
  }
  const mediaTracks = getMutableState(RTCPeerConnectionState)[networkID][peerID].incomingMediaTracks
  if (!mediaTracks.value[message.id]) {
    mediaTracks.merge({ [message.id]: { mediaTag: message.mediaTag, stream: null } })
  } else {
    mediaTracks[message.id].mediaTag.set(message.mediaTag)
  }
}

const handleStopTrack = (networkID: NetworkID, peerID: PeerID, message: StopTrackMessage) => {
  logger.log('[WebRTCTransportFunctions] handleStopTrack', networkID, peerID, message.id)
  const pc = getState(RTCPeerConnectionState)[networkID]?.[peerID]?.peerConnection
  if (!pc) {
    return logger.error('Peer connection does not exist')
  }
  const mediaTracks = getMutableState(RTCPeerConnectionState)[networkID][peerID].incomingMediaTracks
  if (mediaTracks.value[message.id]) {
    mediaTracks[message.id].stream.value?.getTracks().forEach((track) => track.stop())
    mediaTracks[message.id].set(none)
  }
}

const pauseMediaChannel = (
  sendMessage: SendMessageType,
  networkID: NetworkID,
  peerID: PeerID,
  stream: MediaStream,
  paused: boolean
) => {
  const pc = getState(RTCPeerConnectionState)[networkID]?.[peerID]?.peerConnection
  if (!pc) {
    return logger.error('Peer connection does not exist')
  }
  const state = getState(RTCPeerConnectionState)[networkID][peerID].incomingMediaTracks?.[stream.id]
  if (!state.stream) return
  sendMessage(networkID, peerID, { type: 'pause-track', id: state.stream.id, paused })
}

const handlePauseMediaChannel = (networkID: NetworkID, peerID: PeerID, message: PauseTrackMessage) => {
  logger.log('[WebRTCTransportFunctions] handlePauseMediaChannel', networkID, peerID, message.id)
  const pc = getState(RTCPeerConnectionState)[networkID]?.[peerID]?.peerConnection
  if (!pc) {
    return logger.error('Peer connection does not exist')
  }
  const mediaTracks = getMutableState(RTCPeerConnectionState)[networkID][peerID].outgoingMediaTracks
  if (mediaTracks.value[message.id]) {
    const stream = mediaTracks[message.id].stream.value!
    stream.getTracks().forEach((track) => (track.enabled = !message.paused))
    /** @todo we may want to use parameter encodings instead */
    // const track = stream.getTracks()[0]
    // pc.getSenders().forEach((sender) => {
    //   if (sender.track === track) {
    //     pc.removeTrack(sender)
    //     sender.getParameters().encodings[0].active = !message.paused
    //     // getMutableState(RTCPeerConnectionState)[networkID][peerID].outgoingMediaTracks[stream.id].set(none)
    //   }
    // })
  }
}

const requestVideoQuality = (
  sendMessage: SendMessageType,
  networkID: NetworkID,
  peerID: PeerID,
  stream: MediaStream,
  scale: number,
  bitrate: number
) => {
  if (scale < 1) return logger.error('Invalid ratio')
  const track = stream.getTracks()[0]
  if (track.kind !== 'video') return logger.error('Invalid track')

  const pc = getState(RTCPeerConnectionState)[networkID]?.[peerID]?.peerConnection
  if (!pc) {
    return logger.error('Peer connection does not exist')
  }

  sendMessage(networkID, peerID, { type: 'video-quality', id: stream.id, scale, bitrate })
}

const handleVideoQuality = async (networkID: NetworkID, peerID: PeerID, message: VideoQualityMessage) => {
  const pc = getState(RTCPeerConnectionState)[networkID]?.[peerID]?.peerConnection
  if (!pc) {
    return logger.error('Peer connection does not exist')
  }

  const mediaTracks = getMutableState(RTCPeerConnectionState)[networkID][peerID].outgoingMediaTracks
  if (!mediaTracks.value[message.id])
    return logger.error(
      'Media track not found',
      message,
      getState(RTCPeerConnectionState)[networkID][peerID].outgoingMediaTracks
    )
  const stream = mediaTracks[message.id].stream.value!

  const senders = pc.getSenders()
  const sender = senders.find((sender) => sender.track === stream.getTracks()[0])
  if (!sender) return logger.error('Sender not found')

  const parameters = sender.getParameters()
  parameters.encodings[0].scaleResolutionDownBy = message.scale
  parameters.encodings[0].maxBitrate = message.bitrate
  await sender.setParameters(parameters)

  logger.log('setParameters', parameters)
}

export const WebRTCTransportFunctions = {
  onMessage,
  createPeerConnection,
  poll,
  makeCall,
  handleDescription,
  handleCandidate,
  close,
  createDataChannel,
  closeDataChannel,
  createMediaChannel,
  closeMediaChannel,
  handleStartTrack,
  handleStopTrack,
  pauseMediaChannel,
  handlePauseMediaChannel,
  requestVideoQuality,
  handleVideoQuality
}
