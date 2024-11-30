import 'jsdom-global/register'

import './receiveSubprocess'

import { createEngine } from '@ir-engine/ecs/src/Engine'

import webrtc from 'webrtc-polyfill'
globalThis.RTCPeerConnection = webrtc.RTCPeerConnection

import { PUBLIC_STUN_SERVERS } from '@ir-engine/common/src/constants/STUNServers'
import { HyperFlux, NetworkID, PeerID, getMutableState, getState } from '@ir-engine/hyperflux'
import {
  MessageTypes,
  RTCPeerConnectionState,
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

  // wait for action data channel to exist
  const actionDataChannel = await new Promise<RTCDataChannel>((resolve) => {
    const interval = setInterval(() => {
      const channel = getState(RTCPeerConnectionState)[networkID!]?.[testPeerID!]?.dataChannels?.['actions']
      if (channel) {
        clearInterval(interval)
        clearTimeout(timeout)
        resolve(channel)
      }
    }, 100)
    const timeout = setTimeout(() => {
      clearInterval(interval)
      throw new Error('timeout')
    }, 5000)
  })

  actionDataChannel.onmessage = (event) => actionDataChannel.send(event.data)

  const pc = getState(RTCPeerConnectionState)[networkID!][testPeerID!].peerConnection
  const ondatachannel = pc.ondatachannel!

  // echo back any new data channels
  pc.ondatachannel = (dc) => {
    ondatachannel.call(pc, dc)
    dc.channel.send('')
    dc.channel.onmessage = (event) => {
      dc.channel.send(event.data)
    }
  }

  // send initial message to tell other peer we are ready
  actionDataChannel.send('')
}

mockOtherPeer()
