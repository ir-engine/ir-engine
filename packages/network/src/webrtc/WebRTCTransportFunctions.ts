import { defineState, getMutableState, getState, NetworkID, none, PeerID } from '@ir-engine/hyperflux'
import { DataChannelType } from '../DataChannelRegistry'

const loggingEnabled = false
const logger = loggingEnabled ? console : { log: () => {} }

export const RTCPeerConnectionState = defineState({
  name: 'ir.network.webrtc.RTCPeerConnection',
  initial: {} as Record<
    NetworkID,
    Record<
      PeerID,
      { peerConnection: RTCPeerConnection; dataChannels: Record<DataChannelType, RTCDataChannel>; ready: boolean }
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

export type MessageTypes = OfferMessage | AnswerMessage | CandidateMessage

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
    default:
      console.warn('Unknown message type', (message as any).type)
      break
  }
}

const createPeerConnection = (sendMessage: SendMessageType, networkID: NetworkID, targetPeerID: PeerID) => {
  const pc = new RTCPeerConnection()
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
    e.channel.onopen = () => {
      getMutableState(RTCPeerConnectionState)[networkID][targetPeerID].dataChannels[e.channel.label].set(e.channel)
    }
  }

  if (!getState(RTCPeerConnectionState)[networkID]) {
    getMutableState(RTCPeerConnectionState)[networkID].set({})
  }
  getMutableState(RTCPeerConnectionState)[networkID][targetPeerID].set({
    peerConnection: pc,
    dataChannels: {},
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
  return dc
}

const closeDataChannel = (networkID: NetworkID, peerID: PeerID, label: DataChannelType) => {
  const dc = getState(RTCPeerConnectionState)[networkID]?.[peerID]?.dataChannels[label]
  if (dc) {
    dc.close()
    getMutableState(RTCPeerConnectionState)[networkID][peerID].dataChannels[label].set(none)
  }
}

export const WebRTCTransportFunctions = {
  onMessage,
  createPeerConnection,
  makeCall,
  handleOffer,
  handleAnswer,
  handleCandidate,
  close,
  createDataChannel,
  closeDataChannel
}
