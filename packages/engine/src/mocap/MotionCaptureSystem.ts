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
import { addDataChannelHandler, removeDataChannelHandler } from '../networking/NetworkState'
import { Network } from '../networking/classes/Network'
import { NetworkObjectComponent } from '../networking/components/NetworkObjectComponent'

import { Landmark, Results } from '@mediapipe/holistic'

import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../transform/components/TransformComponent'

import UpdateLandmarkFace from './UpdateLandmarkFace'
import UpdateLandmarkHands from './UpdateLandmarkHands'
import UpdateLandmarkPose from './UpdateLandmarkPose'

import { Entity } from '../ecs/classes/Entity'

const useSolvers = false

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
    if (!network?.peers?.has(peerID) || timeSeriesMocapLastSeen.get(peerID)! < Date.now() - 1000) {
      timeSeriesMocapData.delete(peerID)
      timeSeriesMocapLastSeen.delete(peerID)
    }
  }

  for (const [peerID, mocapData] of timeSeriesMocapData) {
    const data = mocapData.popLast()
    timeSeriesMocapLastSeen.set(peerID, Date.now())
    const userID = network.peers.get(peerID)!.userId
    const entity = NetworkObjectComponent.getUserAvatarEntity(userID)
    if (!entity) continue
    updatePose(entity, data)
  }
}

function updatePose(entity: Entity, data: MotionCaptureStream) {
  const avatarRig = getComponent(entity, AvatarRigComponent)
  const avatarTransform = getComponent(entity, TransformComponent)
  if (!avatarRig || !avatarTransform) return

  //const avatarHips = avatarRig?.bindRig?.hips?.node
  //const avatarHipsPosition = avatarHips.position.clone().applyMatrix4(avatarTransform.matrix)
  //const avatarRotation = avatarTransform.rotation

  // get a mapping of landmarks to idealized target positions; this is basically the kalikokit approach
  const changes = {}

  UpdateLandmarkFace(data?.faceLandmarks, changes)
  UpdateLandmarkHands(data?.leftHandLandmarks, data?.rightHandLandmarks, changes)
  UpdateLandmarkPose(data?.za, data?.poseLandmarks, changes)

  // test
  applyChanges(changes, avatarRig)

  // resolve these parts using ik
  //UpdateIkPose(data.za, position, rotation)
}

import { updateRigPosition, updateRigRotation } from './UpdateUtils'

let test = 0

function applyChanges(changes, rig) {
  if (!test) {
    test = 1

    //const Part = rig.vrm.humanoid!.getNormalizedBoneNode(key)
    console.log(rig.vrm.humanoid)
  }

  Object.entries(changes).forEach(([key, args]) => {
    const scratch: any = args
    const dampener = scratch.dampener || 1
    const lerp = scratch.lerp || 1
    if (scratch.euler) {
      updateRigRotation(rig, key, scratch.euler, scratch.dampener, scratch.lerp)
    }
    if (scratch.xyz) {
      updateRigPosition(rig, key, scratch.xyz, scratch.dampener, scratch.lerp)
    }
  })
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

/*

todo aug 2023

- body rotation improve
  it is currently rotating incorrectly; and not even staying upright
  i think the avatar has a root orientation of the rig that is distinct from the hips
  that means that simple pose adjustments to hips should work independently? test

- foot on ground improve
  currently is below ground
  there's a hack for foot on ground estimation
  i think i'd prefer that the ground is at the lowest body part seen in the last while
  this deals with say doing handstands
  it also deals with people jumping in the air
  it could be a sliding average over one or two seconds

- ik from landmark
  i now have the trivial pose estimations available rather than directly writing to rig
  that means i can now choose to use ik instead
  i need to invert the trivial positions to world and test
  test with hips especially because failing to rotate hips truly screws ik if not facing forward

- fingers
  fingers seem slow to update - why? is the dampener / lerp too high? 

- try use newer pose algorithm from mediapipe to see if we get improved z depth

- flip head rotation and also see if we can speed it up a bit? delerp


*/
