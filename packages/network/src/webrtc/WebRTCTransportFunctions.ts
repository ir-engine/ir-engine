import { defineState, getMutableState, getState, NetworkID, none, PeerID } from '@ir-engine/hyperflux'
import { DataChannelType } from '../DataChannelRegistry'
import { MediaTagType } from '../NetworkState'

const loggingEnabled = true
const logger = loggingEnabled ? console : { log: () => {} }

export const RTCPeerConnectionState = defineState({
  name: 'ir.network.webrtc.RTCPeerConnection',
  initial: {} as Record<
    NetworkID,
    Record<
      PeerID,
      {
        peerConnection: RTCPeerConnection
        dataChannels: Record<DataChannelType, RTCDataChannel>
        mediaTracks: Record<string, { mediaTag: MediaTagType | null; track: MediaStreamTrack | null }>
        ready: boolean
      }
    >
  >
})

export type OfferMessage = {
  type: 'offer'
  sdp: string
}

export type AnswerMessage = {
  type: 'answer'
  sdp: string
}

export type CandidateMessage = {
  type: 'candidate'
  candidate: string | null
  sdpMid?: string | null
  sdpMLineIndex?: number | null
}

export type VideoOfferMessage = {
  type: 'video-offer'
  sdp: RTCSessionDescriptionInit | null
}

export type VideoAnswerMessage = {
  type: 'video-answer'
  sdp: RTCSessionDescription | null
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

export type MessageTypes =
  | OfferMessage
  | AnswerMessage
  | CandidateMessage
  | VideoOfferMessage
  | VideoAnswerMessage
  | StartTrackMessage
  | StopTrackMessage

export type SendMessageType = (networkID: NetworkID, targetPeerID: PeerID, message: MessageTypes) => void

const onMessage = (sendMessage: SendMessageType, networkID: NetworkID, fromPeerID: PeerID, message: MessageTypes) => {
  // console.log('onMessage', message)
  switch (message.type) {
    case 'offer':
      return WebRTCTransportFunctions.handleOffer(sendMessage, networkID, fromPeerID, message)
    case 'answer':
      return WebRTCTransportFunctions.handleAnswer(networkID, fromPeerID, message)
    case 'candidate':
      return WebRTCTransportFunctions.handleCandidate(networkID, fromPeerID, message)
    case 'video-offer':
      return WebRTCTransportFunctions.handleVideoOffer(sendMessage, networkID, fromPeerID, message)
    case 'video-answer':
      return WebRTCTransportFunctions.handleVideoAnswer(networkID, fromPeerID, message)
    case 'start-track':
      return WebRTCTransportFunctions.handleStartTrack(networkID, fromPeerID, message)
    case 'stop-track':
      return WebRTCTransportFunctions.handleStopTrack(networkID, fromPeerID, message)
    default:
      console.warn('Unknown message type', (message as any).type)
      break
  }
}

export const PUBLIC_STUN_SERVERS = [
  {
    urls: 'stun:stun.l.google.com:19302'
  },
  {
    urls: 'stun:stun1.l.google.com:19302'
  },
  {
    urls: 'stun:stun.services.mozilla.com:3478'
  },
  {
    urls: 'stun:stun.ucsb.edu:3478'
  }
]

const createPeerConnection = (sendMessage: SendMessageType, networkID: NetworkID, targetPeerID: PeerID) => {
  const pc = new RTCPeerConnection({
    iceServers: PUBLIC_STUN_SERVERS
  })
  pc.onicecandidate = (e) => {
    const message: CandidateMessage = {
      type: 'candidate',
      candidate: null
    }
    if (e.candidate) {
      message.candidate = e.candidate.candidate
      message.sdpMid = e.candidate.sdpMid
      message.sdpMLineIndex = e.candidate.sdpMLineIndex
    }
    sendMessage(networkID, targetPeerID, message)
  }

  pc.onconnectionstatechange = () => {
    // logger.log('onconnectionstatechange', pc.connectionState)
    if (pc.connectionState === 'connected') {
      getMutableState(RTCPeerConnectionState)[networkID][targetPeerID].ready.set(true)
    }
    if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
      pc.close()
      getMutableState(RTCPeerConnectionState)[networkID][targetPeerID].set(none)
    }
  }

  pc.onsignalingstatechange = () => {
    // logger.log('onsignalingstatechange', pc.signalingState)
  }

  pc.ondatachannel = (e) => {
    logger.log('[WebRTCTransportFunctions] ondatachannel', networkID, e.channel.label)
    e.channel.onopen = () => {
      logger.log('[WebRTCTransportFunctions] ondatachannel open', networkID, e.channel.label)
      getMutableState(RTCPeerConnectionState)[networkID][targetPeerID].dataChannels[e.channel.label].set(e.channel)
    }
  }

  pc.ontrack = (e) => {
    logger.log('[WebRTCTransportFunctions] ontrack', e.track.id, e.track)
    const mediaTracks = getMutableState(RTCPeerConnectionState)[networkID][targetPeerID].mediaTracks
    if (!mediaTracks.value[e.track.id]) {
      mediaTracks.merge({ [e.track.id]: { mediaTag: null!, track: e.track } })
    } else {
      mediaTracks[e.track.id].track.set(e.track)
    }
  }

  pc.onnegotiationneeded = (e) => {
    logger.log('[WebRTCTransportFunctions] onnegotiationneeded', networkID, e)
    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .then(() => {
        console.log('sending offer', pc.localDescription)
        sendMessage(networkID, targetPeerID, { type: 'video-offer', sdp: pc.localDescription! })
      })
      .catch((err) => {
        console.error('Failed to create offer', err)
      })
  }

  if (!getState(RTCPeerConnectionState)[networkID]) {
    getMutableState(RTCPeerConnectionState)[networkID].set({})
  }
  getMutableState(RTCPeerConnectionState)[networkID][targetPeerID].set({
    peerConnection: pc,
    dataChannels: {},
    mediaTracks: {},
    ready: false
  })

  return pc
}

const makeCall = async (sendMessage: SendMessageType, networkID: NetworkID, targetPeerID: PeerID) => {
  logger.log('[WebRTCTransportFunctions] makeCall', networkID, targetPeerID)
  const pc = WebRTCTransportFunctions.createPeerConnection(sendMessage, networkID, targetPeerID)
  const dc = pc.createDataChannel('actions')
  // timeout require to delay the reactor until the next update
  setTimeout(() => {
    dc.onopen = () => {
      logger.log('[WebRTCTransportFunctions] ondatachannel open', networkID, dc.label)
      getMutableState(RTCPeerConnectionState)[networkID][targetPeerID].dataChannels[dc.label].set(dc)
    }
  }, 1)
  const offer = await pc.createOffer()
  sendMessage(networkID, targetPeerID, { type: 'offer', sdp: offer.sdp! })
  await pc.setLocalDescription(offer)
}

const handleOffer = async (
  sendMessage: SendMessageType,
  networkID: NetworkID,
  targetPeerID: PeerID,
  offer: OfferMessage
) => {
  logger.log('[WebRTCTransportFunctions] handleOffer', networkID, targetPeerID)
  if (getState(RTCPeerConnectionState)[networkID]?.[targetPeerID]) {
    return console.error('Peer connection already exists')
  }
  const pc = WebRTCTransportFunctions.createPeerConnection(sendMessage, networkID, targetPeerID)

  await pc.setRemoteDescription(offer)

  const answer = await pc.createAnswer()
  sendMessage(networkID, targetPeerID, { type: 'answer', sdp: answer.sdp! })
  await pc.setLocalDescription(answer)
}

const handleAnswer = async (networkID: NetworkID, targetPeerID: PeerID, answer: AnswerMessage) => {
  logger.log('[WebRTCTransportFunctions] handleAnswer', networkID, targetPeerID)
  const pc = getState(RTCPeerConnectionState)[networkID][targetPeerID]?.peerConnection
  if (!pc) {
    return console.error('Peer connection does not exist')
  }
  await pc.setRemoteDescription({
    type: 'answer',
    sdp: answer.sdp
  })
}

const handleCandidate = async (networkID: NetworkID, targetPeerID: PeerID, candidate: CandidateMessage) => {
  const pc = getState(RTCPeerConnectionState)[networkID]?.[targetPeerID]?.peerConnection
  if (!pc) {
    return console.error('Peer connection does not exist')
  }
  if (!candidate.candidate) {
    await pc.addIceCandidate(null!) // must be null and not undefined
  } else {
    await pc.addIceCandidate({
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex
    })
  }
}

const handleVideoOffer = (
  sendMessage: SendMessageType,
  networkID: NetworkID,
  targetPeerID: PeerID,
  offer: VideoOfferMessage
) => {
  logger.log('[WebRTCTransportFunctions] handleVideoOffer', networkID, targetPeerID, offer.sdp)

  const pc = getState(RTCPeerConnectionState)[networkID]?.[targetPeerID]?.peerConnection
  const desc = new RTCSessionDescription(offer.sdp!)
  pc.setRemoteDescription(desc)
    .then(() => pc.createAnswer())
    .then((answer) => pc.setLocalDescription(answer))
    .then(() => {
      sendMessage(networkID, targetPeerID, {
        type: 'video-answer',
        sdp: pc.localDescription!
      })
    })
}

const handleVideoAnswer = (networkID: NetworkID, targetPeerID: PeerID, answer: VideoAnswerMessage) => {
  const pc = getState(RTCPeerConnectionState)[networkID]?.[targetPeerID]?.peerConnection
  const desc = new RTCSessionDescription(answer.sdp!)
  pc.setRemoteDescription(desc).catch(reportError)
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
    return console.error('Peer connection does not exist')
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
    return console.error('Peer connection does not exist')
  }
  logger.log('[WebRTCTransportFunctions] createMediaChannel', networkID, track.id, track)
  pc.addTrack(track)
  sendMessage(networkID, peerID, { type: 'start-track', id: track.id!, mediaTag })
}

const closeMediaChannel = (
  sendMessage: SendMessageType,
  networkID: NetworkID,
  peerID: PeerID,
  track: MediaStreamTrack
) => {
  const pc = getState(RTCPeerConnectionState)[networkID]?.[peerID]?.peerConnection
  if (!pc) {
    return console.error('Peer connection does not exist')
  }
  logger.log('[WebRTCTransportFunctions] closeMediaChannel', networkID, track.id, track)
  pc.getSenders().forEach((sender) => {
    if (sender.track === track) {
      pc.removeTrack(sender)
      sendMessage(networkID, peerID, { type: 'stop-track', id: track.id! })
    }
  })
}

const handleStartTrack = (networkID: NetworkID, peerID: PeerID, message: StartTrackMessage) => {
  logger.log('[WebRTCTransportFunctions] handleStartTrack', networkID, peerID, message.id)
  const pc = getState(RTCPeerConnectionState)[networkID]?.[peerID]?.peerConnection
  if (!pc) {
    return console.error('Peer connection does not exist')
  }
  const mediaTracks = getMutableState(RTCPeerConnectionState)[networkID][peerID].mediaTracks
  if (!mediaTracks.value[message.mediaTag]) {
    mediaTracks.merge({ [message.id]: { mediaTag: message.mediaTag, track: null } })
  } else {
    mediaTracks[message.mediaTag].mediaTag.set(message.mediaTag)
  }
}

const handleStopTrack = (networkID: NetworkID, peerID: PeerID, message: StopTrackMessage) => {
  logger.log('[WebRTCTransportFunctions] handleStopTrack', networkID, peerID, message.id)
  const pc = getState(RTCPeerConnectionState)[networkID]?.[peerID]?.peerConnection
  if (!pc) {
    return console.error('Peer connection does not exist')
  }
  const mediaTracks = getMutableState(RTCPeerConnectionState)[networkID][peerID].mediaTracks
  if (mediaTracks.value[message.id]) {
    mediaTracks[message.id].track.value?.stop()
    mediaTracks[message.id].set(none)
  }
}

export const WebRTCTransportFunctions = {
  onMessage,
  createPeerConnection,
  makeCall,
  handleOffer,
  handleAnswer,
  handleCandidate,
  handleVideoOffer,
  handleVideoAnswer,
  close,
  createDataChannel,
  closeDataChannel,
  createMediaChannel,
  closeMediaChannel,
  handleStartTrack,
  handleStopTrack
}
