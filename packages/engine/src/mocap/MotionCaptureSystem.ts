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

import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { VRMHumanBoneList } from '@pixiv/three-vrm'
import { decode, encode } from 'msgpackr'
import { useEffect } from 'react'
import { Quaternion } from 'three'

import { ECSState } from '@ir-engine/ecs'
import { getComponent, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PeerID, getState, isClient } from '@ir-engine/hyperflux'
import {
  DataChannelType,
  Network,
  NetworkState,
  addDataChannelHandler,
  removeDataChannelHandler
} from '@ir-engine/network'
import { RingBuffer } from '@ir-engine/network/src/functions/RingBuffer'

import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '../avatar/components/AvatarComponent'
import { NormalizedBoneComponent } from '../avatar/components/NormalizedBoneComponent'
import { AvatarAnimationSystem } from '../avatar/systems/AvatarAnimationSystem'
import { MotionCaptureRigComponent } from './MotionCaptureRigComponent'
import { solveMotionCapturePose } from './solveMotionCapturePose'

export type MotionCaptureResults = {
  worldLandmarks: NormalizedLandmark[]
  landmarks: NormalizedLandmark[]
}

export const sendResults = (results: MotionCaptureResults) => {
  return encode({
    timestamp: Date.now(),
    results
  })
}

export const receiveResults = (buff: ArrayBuffer) => {
  return decode(new Uint8Array(buff)) as {
    timestamp: number
    results: MotionCaptureResults
  }
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
    network.bufferToAll(dataChannel, fromPeerID, message)
  }
  const results = MotionCaptureFunctions.receiveResults(message as ArrayBuffer)
  if (!timeSeriesMocapData.has(fromPeerID)) {
    timeSeriesMocapData.set(fromPeerID, new RingBuffer(10))
  }
  timeSeriesMocapData.get(fromPeerID)!.add(results)
}

const motionCaptureQuery = defineQuery([MotionCaptureRigComponent, AvatarRigComponent])

export const timeSeriesMocapData = new Map<
  PeerID,
  RingBuffer<{
    timestamp: number
    results: MotionCaptureResults
  }>
>()
const timeSeriesMocapLastSeen = new Map<PeerID, number>()
/**@todo this will be determined by the average delta of incoming landmark data */
const slerpAlphaMultiplier = 25
const execute = () => {
  // for now, it is unnecessary to compute anything on the server
  if (!isClient) return
  const network = NetworkState.worldNetwork
  if (!network) return

  for (const [peerID, mocapData] of timeSeriesMocapData) {
    if (!network.peers[peerID] || timeSeriesMocapLastSeen.get(peerID)! < Date.now() - 1000) {
      timeSeriesMocapData.delete(peerID)
      timeSeriesMocapLastSeen.delete(peerID)
    }
  }
  for (const [peerID, mocapData] of timeSeriesMocapData) {
    const data = mocapData.getFirst()
    const userID = network.peers[peerID]!.userId
    const entity = AvatarComponent.getUserAvatarEntity(userID)
    if (!entity) continue

    timeSeriesMocapLastSeen.set(peerID, Date.now())
    setComponent(entity, MotionCaptureRigComponent)
    solveMotionCapturePose(entity, data?.results.worldLandmarks, data?.results.landmarks)
    mocapData.clear() // TODO: add a predictive filter and remove this
  }

  for (const entity of motionCaptureQuery()) {
    const peers = Object.keys(network.peers).find((peerID: PeerID) => timeSeriesMocapData.has(peerID))
    const rigComponent = getComponent(entity, AvatarRigComponent)
    if (!rigComponent.bonesToEntities.hips) continue
    const worldHipsParent = getComponent(rigComponent.bonesToEntities.hips, NormalizedBoneComponent).parent
    if (!peers) {
      removeComponent(entity, MotionCaptureRigComponent)
      worldHipsParent?.position.setY(0)
      continue
    }
    for (const boneName of VRMHumanBoneList) {
      const normalizedBone = rigComponent.vrm.humanoid.normalizedHumanBones[boneName]?.node
      if (!normalizedBone) continue
      if (
        MotionCaptureRigComponent.rig[boneName].x[entity] === 0 &&
        MotionCaptureRigComponent.rig[boneName].y[entity] === 0 &&
        MotionCaptureRigComponent.rig[boneName].z[entity] === 0 &&
        MotionCaptureRigComponent.rig[boneName].w[entity] === 0
      ) {
        continue
      }

      const slerpedQuat = new Quaternion()
        .set(
          MotionCaptureRigComponent.slerpedRig[boneName].x[entity],
          MotionCaptureRigComponent.slerpedRig[boneName].y[entity],
          MotionCaptureRigComponent.slerpedRig[boneName].z[entity],
          MotionCaptureRigComponent.slerpedRig[boneName].w[entity]
        )
        .normalize()
        .fastSlerp(
          new Quaternion()
            .set(
              MotionCaptureRigComponent.rig[boneName].x[entity],
              MotionCaptureRigComponent.rig[boneName].y[entity],
              MotionCaptureRigComponent.rig[boneName].z[entity],
              MotionCaptureRigComponent.rig[boneName].w[entity]
            )
            .normalize(),
          getState(ECSState).deltaSeconds * slerpAlphaMultiplier
        )

      normalizedBone.quaternion.copy(slerpedQuat)

      MotionCaptureRigComponent.slerpedRig[boneName].x[entity] = slerpedQuat.x
      MotionCaptureRigComponent.slerpedRig[boneName].y[entity] = slerpedQuat.y
      MotionCaptureRigComponent.slerpedRig[boneName].z[entity] = slerpedQuat.z
      MotionCaptureRigComponent.slerpedRig[boneName].w[entity] = slerpedQuat.w
    }

    const hipBone = getComponent(rigComponent.bonesToEntities.hips, NormalizedBoneComponent)
    hipBone.position.set(
      MotionCaptureRigComponent.hipPosition.x[entity],
      MotionCaptureRigComponent.hipPosition.y[entity],
      MotionCaptureRigComponent.hipPosition.z[entity]
    )

    // if (worldHipsParent)
    //   if (MotionCaptureRigComponent.solvingLowerBody[entity])
    //     worldHipsParent.position.setY(
    //       lerp(
    //         worldHipsParent.position.y,
    //         MotionCaptureRigComponent.footOffset[entity],
    //         getState(ECSState).deltaSeconds * 5
    //       )
    //     )
    //   else worldHipsParent.position.setY(0)
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
  insert: { before: AvatarAnimationSystem },
  execute,
  reactor
})
