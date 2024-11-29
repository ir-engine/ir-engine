import 'jsdom-global/register'

import './receiveSubprocess'

import { createEngine } from '@ir-engine/ecs/src/Engine'

import webrtc from 'webrtc-polyfill'
globalThis.RTCPeerConnection = webrtc.RTCPeerConnection

import { PUBLIC_STUN_SERVERS } from '@ir-engine/common/src/constants/STUNServers'
import { HyperFlux, NetworkID, PeerID, getMutableState } from '@ir-engine/hyperflux'
import {
  MessageTypes,
  SendMessageType,
  StunServerState,
  WebRTCTransportFunctions
} from '../src/webrtc/WebRTCTransportFunctions'
import { PeerMessage } from './interfaces'

createEngine()
HyperFlux.store.peerID = 'other peer' as PeerID
getMutableState(StunServerState).set(PUBLIC_STUN_SERVERS)

let testPeerID: PeerID | undefined
let networkID: NetworkID | undefined

const mockOtherPeer = async () => {
  process.send!('ready')

  await new Promise<void>((resolve) => {
    const listener = (data: any) => {
      testPeerID = data.peerID
      networkID = data.networkID
      resolve()
      process.off('message', listener)
    }
    process.on('message', listener)
  })

  process.send!(HyperFlux.store.peerID)

  const sendMessage: SendMessageType = (networkID: NetworkID, toPeerID: PeerID, message: MessageTypes) => {
    // console.log('sendMessage', networkID, toPeerID, message)
    process.send!({ networkID, toPeerID, message } as PeerMessage)
  }

  process.on('message', (data: PeerMessage) => {
    // console.log('on message', data)
    const { networkID, toPeerID, message } = data
    if (toPeerID !== HyperFlux.store.peerID) return console.error('received message not for us')
    const fromPeerID = testPeerID!
    WebRTCTransportFunctions.onMessage(sendMessage, networkID, fromPeerID, message)
  })
}

mockOtherPeer()
