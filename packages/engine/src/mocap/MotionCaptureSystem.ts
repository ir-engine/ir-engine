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
import { Vector3 } from 'three'

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { getState } from '@etherealengine/hyperflux'

import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { RingBuffer } from '../common/classes/RingBuffer'

import { Engine } from '../ecs/classes/Engine'
import { EngineState } from '../ecs/classes/EngineState'
import { getComponent } from '../ecs/functions/ComponentFunctions'

import { defineSystem } from '../ecs/functions/SystemFunctions'
import { addDataChannelHandler, removeDataChannelHandler } from '../networking/NetworkState'
import { DataChannelType, Network } from '../networking/classes/Network'
import { NetworkObjectComponent } from '../networking/components/NetworkObjectComponent'
import { TransformComponent } from '../transform/components/TransformComponent'

import { Classifications, Landmark, NormalizedLandmark } from '@mediapipe/tasks-vision'
import { TFace, THand, TPose } from 'kalidokit/dist/kalidokit.umd.js'

import UpdateRawFace from './UpdateRawFace'
import UpdateRawHands from './UpdateRawHands'
import UpdateRawPose from './UpdateRawPose'
import UpdateSolvedFace from './UpdateSolvedFace'
import UpdateSolvedHands from './UpdateSolvedHands'
import UpdateSolvedPose from './UpdateSolvedPose'

export interface SolvedHand {
  handSolve?: THand | undefined
  handedness?: string | undefined
}

export interface MotionCaptureStream {
  poses?: NormalizedLandmark[][] | undefined
  posesWorld?: Landmark[][] | undefined
  posesSolved?: TPose[] | undefined
  hands?: NormalizedLandmark[][] | undefined
  handsWorld?: Landmark[][] | undefined
  handsSolved?: SolvedHand[] | undefined
  faces?: Classifications[] | undefined
  facesSolved?: TFace[] | undefined
}

export const sendResults = (results: MotionCaptureStream) => {
  return encode({
    timestamp: Date.now(),
    peerIndex: Engine.instance.worldNetwork.peerIDToPeerIndex.get(Engine.instance.peerID)!,
    results
  })
}

export const receiveResults = (buff: ArrayBuffer) => {
  const { timestamp, peerIndex, results } = decode(new Uint8Array(buff)) as {
    timestamp: number
    peerIndex: number
    results: MotionCaptureStream
  }
  const peerID = Engine.instance.worldNetwork.peerIndexToPeerID.get(peerIndex)
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

const timeSeriesMocapData = new Map<PeerID, RingBuffer<MotionCaptureStream>>()
const timeSeriesMocapLastSeen = new Map<PeerID, number>()

const execute = () => {
  const engineState = getState(EngineState)

  const localClientEntity = Engine.instance.localClientEntity

  const network = Engine.instance.worldNetwork

  for (const [peerID, mocapData] of timeSeriesMocapData) {
    if (!network?.peers?.has(peerID) || timeSeriesMocapLastSeen.get(peerID)! < Date.now() - 1000) {
      timeSeriesMocapData.delete(peerID)
      timeSeriesMocapLastSeen.delete(peerID)
    }
  }

  for (const [peerID, mocapData] of timeSeriesMocapData) {
    const userID = network.peers.get(peerID)!.userId
    const entity = NetworkObjectComponent.getUserAvatarEntity(userID)

    if (entity && entity === localClientEntity) {
      const data = mocapData.popLast()
      if (!data) continue
      // console.log('received mocap data', peerID, data)
      timeSeriesMocapLastSeen.set(peerID, Date.now())

      const avatarRig = getComponent(entity, AvatarRigComponent)
      const avatarTransform = getComponent(entity, TransformComponent)

      if (!avatarRig) continue

      // const avatarHips = avatarRig?.vrm?.humanoid?.getRawBone('hips')?.node
      const avatarHips = avatarRig?.rig?.hips?.node

      const hipsPos = new Vector3()
      avatarHips?.getWorldPosition(hipsPos)

      // Pose
      if (data?.posesSolved) {
        data?.posesSolved.forEach((pose) => {
          UpdateSolvedPose(pose, hipsPos.clone(), avatarRig, avatarTransform)

          if (data?.handsSolved) {
            data?.handsSolved.forEach((hand) => {
              UpdateSolvedHands(hand, pose, avatarRig, avatarTransform)
            })
          }
        })
      } else if (data?.posesWorld) {
        // Hands
        if (data?.handsWorld) {
          data?.handsWorld.forEach((hand) => {
            UpdateRawHands(hand, hipsPos.clone(), avatarRig, avatarTransform)
          })
        }
        if (data?.posesWorld) {
          data?.posesWorld.forEach((pose) => {
            UpdateRawPose(pose, hipsPos.clone(), avatarRig, avatarTransform)
          })
        }
      }

      // Face
      if (data?.facesSolved) {
        data?.facesSolved.forEach((face) => {
          UpdateSolvedFace(face, hipsPos.clone(), avatarRig, avatarTransform)
        })
      } else if (data?.faces) {
        data?.faces.forEach((face) => {
          UpdateRawFace(face, hipsPos.clone(), avatarRig, avatarTransform)
        })
      }
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
