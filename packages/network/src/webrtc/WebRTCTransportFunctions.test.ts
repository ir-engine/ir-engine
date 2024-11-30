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
import { afterEach, assert, beforeEach, describe, it, vi } from 'vitest'

import { PUBLIC_STUN_SERVERS } from '@ir-engine/common/src/constants/STUNServers'
import { Engine, createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { NetworkID, PeerID, getMutableState, getState } from '@ir-engine/hyperflux'

import '../EntityNetworkState'

import webrtc from 'webrtc-polyfill'
globalThis.RTCPeerConnection = webrtc.RTCPeerConnection

import {
  MessageTypes,
  RTCPeerConnectionState,
  SendMessageType,
  StunServerState,
  WebRTCTransportFunctions
} from './WebRTCTransportFunctions'

import { ChildProcess } from 'child_process'
import { PeerMessage } from '../../tests/interfaces'
import { startSubprocess } from '../../tests/startSubprocess'
import { DataChannelType } from '../DataChannelRegistry'

const initiatorPeerID = 'peer' as PeerID

let childProcess: ChildProcess | undefined

const startPeer = async (networkID: NetworkID) => {
  const peerProcess = startSubprocess('packages/network/tests/mockOtherPeer.ts')
  childProcess = peerProcess

  await new Promise<void>((resolve) => {
    const listener = (data: any) => {
      if (data === 'ready') {
        resolve()
        peerProcess.off('message', listener)
      }
    }
    peerProcess.on('message', listener)
  })

  peerProcess.send({ peerID: Engine.instance.store.peerID, networkID })

  let otherPeerID: PeerID | undefined

  await new Promise<void>((resolve) => {
    const listener = (data: any) => {
      otherPeerID = data
      resolve()
    }
    peerProcess.on('message', listener)
  })

  if (!otherPeerID) throw new Error('otherPeerID not set')

  return { peerProcess, otherPeerID: otherPeerID! }
}

const setupMessaging = async (networkID: NetworkID) => {
  const peerID = Engine.instance.store.peerID

  const { peerProcess, otherPeerID } = await startPeer(networkID)

  const sendMessage: SendMessageType = (networkID: NetworkID, toPeerID: PeerID, message: MessageTypes) => {
    // console.log('sendMessage', Date.now(), networkID, toPeerID, message)
    if (!peerProcess.channel) return console.error('peer process not connected')
    peerProcess.send({ networkID, toPeerID, message } as PeerMessage)
  }

  peerProcess.on('message', (data: PeerMessage) => {
    if (onMessageCallback) onMessageCallback(data)
    // console.log('on message', Date.now(), data)
    const { networkID, toPeerID, message } = data
    if (toPeerID !== peerID) return console.error('received message not for us')
    const fromPeerID = otherPeerID!
    WebRTCTransportFunctions.onMessage(sendMessage, networkID, fromPeerID, message)
  })

  return { peerProcess, otherPeerID, sendMessage }
}

let onMessageCallback: ((data: PeerMessage) => void) | undefined

const awaitResponse = (time = 10000) => {
  return new Promise<PeerMessage>((resolve, reject) => {
    onMessageCallback = (data) => {
      onMessageCallback = undefined
      resolve(data)
      clearTimeout(timeout)
    }
    const timeout = setTimeout(() => reject(new Error('timeout')), time)
  })
}

describe('WebRTCTransportFunctions', () => {
  beforeEach(async () => {
    createEngine()
    getMutableState(StunServerState).set(PUBLIC_STUN_SERVERS)
  })

  afterEach(() => {
    if (childProcess) process.kill(-childProcess.pid!, 'SIGINT')
    childProcess = undefined
    return destroyEngine()
  })

  it('can start test peer as initiator', async () => {
    Engine.instance.store.peerID = initiatorPeerID

    const { otherPeerID } = await startPeer('' as NetworkID)

    const isInitiator = Engine.instance.store.peerID > otherPeerID

    assert(isInitiator)

    if (childProcess) process.kill(-childProcess.pid!, 'SIGINT')
    childProcess = undefined
  })

  it('can start other peer as initiator', async () => {
    Engine.instance.store.peerID = '_peer' as PeerID

    const { otherPeerID } = await startPeer('' as NetworkID)

    const isOtherInitiator = Engine.instance.store.peerID < otherPeerID

    assert(isOtherInitiator)

    if (childProcess) process.kill(-childProcess.pid!, 'SIGINT')
    childProcess = undefined
  })

  it('should connect to peer in other process as initiator', async () => {
    const networkID = 'network' as NetworkID
    Engine.instance.store.peerID = initiatorPeerID
    const peerID = Engine.instance.store.peerID

    const { otherPeerID, sendMessage } = await setupMessaging(networkID)

    WebRTCTransportFunctions.poll(sendMessage, networkID, otherPeerID)

    const pollResponse = await awaitResponse()
    assert.equal(pollResponse.networkID, networkID)
    assert.equal(pollResponse.toPeerID, peerID)
    assert.equal(pollResponse.message.type, 'poll')

    assert.equal(getState(RTCPeerConnectionState)[networkID][otherPeerID].makingOffer, true)
    assert.ok(getState(RTCPeerConnectionState)[networkID][otherPeerID].peerConnection)

    const descriptionResponse = await awaitResponse()
    assert.equal(descriptionResponse.networkID, networkID)
    assert.equal(descriptionResponse.toPeerID, peerID)
    assert.equal(descriptionResponse.message.type, 'description')

    // should have at least one candidate negotiation message
    const negotiationResponse = await awaitResponse()
    assert.equal(negotiationResponse.networkID, networkID)
    assert.equal(negotiationResponse.toPeerID, peerID)
    assert.equal(negotiationResponse.message.type, 'candidate')

    const ready = await vi.waitUntil(() => getState(RTCPeerConnectionState)[networkID][otherPeerID].ready, {
      timeout: 1000,
      interval: 20
    })

    assert.equal(ready, true)
    assert.equal(getState(RTCPeerConnectionState)[networkID][otherPeerID].makingOffer, false)

    // data channel
    assert.ok(getState(RTCPeerConnectionState)[networkID][otherPeerID].dataChannels['actions'])

    if (childProcess) process.kill(-childProcess.pid!, 'SIGINT')
    childProcess = undefined
  })

  it('should be able to send data over data channel', async () => {
    const networkID = 'network' as NetworkID
    Engine.instance.store.peerID = initiatorPeerID
    const peerID = Engine.instance.store.peerID

    const { otherPeerID, sendMessage } = await setupMessaging(networkID)

    WebRTCTransportFunctions.poll(sendMessage, networkID, otherPeerID)

    await vi.waitUntil(() => getState(RTCPeerConnectionState)?.[networkID]?.[otherPeerID]?.ready, {
      timeout: 10000,
      interval: 20
    })

    const message = { type: 'test', data: 'test' }

    await vi.waitUntil(
      () => getState(RTCPeerConnectionState)[networkID]?.[otherPeerID]?.dataChannels?.['actions' as DataChannelType],
      {
        timeout: 10000,
        interval: 20
      }
    )

    const actionChannel =
      getState(RTCPeerConnectionState)[networkID][otherPeerID].dataChannels['actions' as DataChannelType]

    await new Promise<void>((resolve) => {
      actionChannel.onmessage = (event) => resolve()
    })

    let response: typeof message | undefined

    actionChannel.onmessage = (event) => {
      const data = JSON.parse(event.data)
      response = data
    }

    actionChannel.send(JSON.stringify(message))

    const responseData = await vi.waitUntil(() => response, {
      timeout: 10000,
      interval: 20
    })

    assert.deepEqual(responseData, message)

    if (childProcess) process.kill(-childProcess.pid!, 'SIGINT')
    childProcess = undefined
  })

  it('should be able to open custom data channel', async () => {
    const networkID = 'network' as NetworkID
    Engine.instance.store.peerID = initiatorPeerID
    const peerID = Engine.instance.store.peerID

    const { otherPeerID, sendMessage } = await setupMessaging(networkID)

    WebRTCTransportFunctions.poll(sendMessage, networkID, otherPeerID)

    await vi.waitUntil(() => getState(RTCPeerConnectionState)?.[networkID]?.[otherPeerID]?.ready, {
      timeout: 10000,
      interval: 20
    })

    const actionChannel =
      getState(RTCPeerConnectionState)[networkID][otherPeerID].dataChannels['actions' as DataChannelType]

    await new Promise<void>((resolve) => {
      actionChannel.onmessage = (event) => resolve()
    })

    const channelType = 'testChannel' as DataChannelType

    const message = { type: 'test', data: 'test' }

    const customDataChannel = WebRTCTransportFunctions.createDataChannel(networkID, otherPeerID, channelType)!
    await new Promise<void>((resolve) => {
      customDataChannel.onmessage = (event) => resolve()
    })

    let response: typeof message | undefined

    customDataChannel.onmessage = (event) => {
      const data = JSON.parse(event.data)
      response = data
    }

    customDataChannel.send(JSON.stringify(message))

    const responseData = await vi.waitUntil(() => response, {
      timeout: 10000,
      interval: 20
    })

    assert.deepEqual(responseData, message)

    if (childProcess) process.kill(-childProcess.pid!, 'SIGINT')
    childProcess = undefined
  })
})
