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

import { decode, encode } from 'msgpackr'
import { useEffect } from 'react'

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'

import { DataChannelType } from '@etherealengine/common/src/interfaces/DataChannelType'
import { RingBuffer } from '../common/classes/RingBuffer'

import { Engine } from '../ecs/classes/Engine'

import { defineSystem } from '../ecs/functions/SystemFunctions'
import { Network } from '../networking/classes/Network'
import { NetworkObjectComponent } from '../networking/components/NetworkObjectComponent'

import { Landmark, Results } from '@mediapipe/holistic'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { isClient } from '../common/functions/getEnvironment'
import { removeEntity } from '../ecs/functions/EntityFunctions'
import { addDataChannelHandler, removeDataChannelHandler } from '../networking/systems/DataChannelRegistry'
import { UUIDComponent } from '../scene/components/UUIDComponent'
import UpdateAvatar from './UpdateAvatar'
import { motionCaptureHeadSuffix, motionCaptureLeftHandSuffix, motionCaptureRightHandSuffix } from './UpdateIkHand'

export interface MotionCaptureStream extends Results {
  za: Landmark[]
}

export const sendResults = (results: MotionCaptureStream) => {
  return encode({
    timestamp: Date.now(),
    peerID: Engine.instance.peerID,
    results
  })
}

export const receiveResults = (buff: ArrayBuffer) => {
  const { timestamp, peerID, results } = decode(new Uint8Array(buff)) as {
    timestamp: number
    peerID: PeerID
    results: MotionCaptureStream
  }
  // console.log('received mocap data', peerID, results)
  return { timestamp, peerID, results }
}

export const MotionCaptureFunctions = {
  sendResults,
  receiveResults
}

export const mocapDataChannelType = 'ee.core.mocap.dataChannel' as DataChannelType

const handleMocapData = (
  network: Network,
  dataChannel: DataChannelType,
  fromPeerID: PeerID,
  message: ArrayBufferLike
) => {
  if (network.isHosting) {
    network.transport.bufferToAll(mocapDataChannelType, message)
  }
  const { peerID, results } = MotionCaptureFunctions.receiveResults(message as ArrayBuffer)
  if (!peerID) return
  if (!timeSeriesMocapData.has(peerID)) {
    timeSeriesMocapData.set(peerID, new RingBuffer(10))
  }
  timeSeriesMocapData.get(peerID)!.add(results)
}

export const timeSeriesMocapData = new Map<PeerID, RingBuffer<MotionCaptureStream>>()
const timeSeriesMocapLastSeen = new Map<PeerID, number>()

const execute = () => {
  const network = Engine.instance.worldNetwork
  for (const [peerID, mocapData] of timeSeriesMocapData) {
    if (!network?.peers?.[peerID] || timeSeriesMocapLastSeen.get(peerID)! < Date.now() - 1000) {
      timeSeriesMocapData.delete(peerID)
      timeSeriesMocapLastSeen.delete(peerID)
    }
  }

  const userPeers = network?.users?.[Engine.instance.userID]

  // Stop mocap by removing entities if data doesnt exist
  if (isClient && !userPeers?.find((peerID) => timeSeriesMocapData.has(peerID))) {
    const headUUID = (Engine.instance.userID + motionCaptureHeadSuffix) as EntityUUID
    const leftHandUUID = (Engine.instance.userID + motionCaptureLeftHandSuffix) as EntityUUID
    const rightHandUUID = (Engine.instance.userID + motionCaptureRightHandSuffix) as EntityUUID

    const ikTargetHead = UUIDComponent.entitiesByUUID[headUUID]
    const ikTargetLeftHand = UUIDComponent.entitiesByUUID[leftHandUUID]
    const ikTargetRightHand = UUIDComponent.entitiesByUUID[rightHandUUID]

    if (ikTargetHead) removeEntity(ikTargetHead)
    if (ikTargetLeftHand) removeEntity(ikTargetLeftHand)
    if (ikTargetRightHand) removeEntity(ikTargetRightHand)
  }

  for (const [peerID, mocapData] of timeSeriesMocapData) {
    const data = mocapData.popLast()
    timeSeriesMocapLastSeen.set(peerID, Date.now())
    const userID = network.peers[peerID]!.userId
    const entity = NetworkObjectComponent.getUserAvatarEntity(userID)
    if (data && entity) {
      UpdateAvatar(data, userID, entity)
    }
  }
}

const reactor = () => {
  useEffect(() => {
    addDataChannelHandler(mocapDataChannelType, handleMocapData)
    return () => {
      removeDataChannelHandler(mocapDataChannelType, handleMocapData)
    }
  }, [])
  return null
}

export const MotionCaptureSystem = defineSystem({
  uuid: 'ee.engine.MotionCaptureSystem',
  execute,
  reactor
})
