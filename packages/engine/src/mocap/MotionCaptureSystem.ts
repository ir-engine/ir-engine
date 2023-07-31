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
import { Mesh, MeshBasicMaterial, Object3D, SphereGeometry, Vector3 } from 'three'

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'

import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { RingBuffer } from '../common/classes/RingBuffer'

import { Engine } from '../ecs/classes/Engine'
import { getComponent } from '../ecs/functions/ComponentFunctions'

import { defineSystem } from '../ecs/functions/SystemFunctions'
import { addDataChannelHandler, removeDataChannelHandler } from '../networking/NetworkState'
import { DataChannelType, Network } from '../networking/classes/Network'
import { NetworkObjectComponent } from '../networking/components/NetworkObjectComponent'
import { TransformComponent } from '../transform/components/TransformComponent'

import { Category, Classifications, Landmark, NormalizedLandmark } from '@mediapipe/tasks-vision'
import { Side, TFace, THand, TPose } from './solvers'

import mediapipePoseNames from './MediapipePoseNames'
import UpdateRawFace from './UpdateRawFace'
import UpdateRawPose from './UpdateRawPose'
import UpdateSolvedFace from './UpdateSolvedFace'
import UpdateSolvedHands from './UpdateSolvedHands'

export interface SolvedHand {
  handSolve?: THand<Side> | undefined
  handedness?: Category | undefined
}

export interface MotionCaptureStream {
  poses?: NormalizedLandmark[][] | undefined
  posesWorld?: Landmark[][] | undefined
  posesSolved?: TPose[] | undefined
  hands?: NormalizedLandmark[][] | undefined
  handednesses?: Category[][] | undefined
  handsWorld?: Landmark[][] | undefined
  handsSolved?: SolvedHand[] | undefined
  faces?: Classifications[] | undefined
  facesSolved?: TFace[] | undefined
}

const debugPoseObjs: Object3D[] = []
const debugHandObjs: Object3D[] = []
const debug = false
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

      const avatarHips = avatarRig?.bindRig?.hips?.node
      const hipsPos = avatarHips.position.clone().applyMatrix4(avatarTransform.matrix)

      // Pose
      if (data?.posesWorld) {
        data?.posesWorld.forEach((pose) => {
          UpdateRawPose(pose, hipsPos.clone(), avatarRig, avatarTransform)
          // UpdateSolvedPose(pose, hipsPos.clone(), avatarRig, avatarTransform)

          if (data?.handsSolved) {
            data?.handsSolved.forEach((hand) => {
              UpdateSolvedHands(hand, pose, avatarRig, avatarTransform)
            })
          }
        })
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

      if (debug) {
        if (data?.posesWorld) {
          data?.posesWorld.forEach((landmarks, idx) => {
            let idxP = landmarks.length * idx
            landmarks.forEach((landmark) => {
              if (debugPoseObjs[idxP] === undefined) {
                const matOptions = {}
                const mesh = new Mesh(new SphereGeometry(0.025), new MeshBasicMaterial(matOptions))
                debugPoseObjs[idxP] = mesh
                Engine?.instance?.scene?.add(mesh)
                idxP++
                console.log('added debug pose obj')
              }
              const newPos = new Vector3(landmark.x, landmark.y, landmark.z)

              debugPoseObjs[idxP]?.position.copy(newPos.clone())
              debugPoseObjs[idxP]?.updateMatrixWorld()
            })
          })
        }
        if (data?.handsWorld) {
          data?.handsWorld.forEach((landmarks, idx) => {
            let idxH = landmarks.length * idx
            landmarks.forEach((landmark, idx2) => {
              if (debugHandObjs[idxH] === undefined) {
                const matOptions = {}
                const mesh = new Mesh(new SphereGeometry(0.025), new MeshBasicMaterial(matOptions))
                debugHandObjs[idxH] = mesh
                Engine?.instance?.scene?.add(mesh)
                idxH++
                console.log('added debug hand obj')
              }
              const newPos = new Vector3(landmark.x, landmark.y, landmark.z)
              newPos.add(
                data?.handednesses![idx][idx2]?.categoryName === 'Left'
                  ? new Vector3(
                      data?.posesWorld![idx][mediapipePoseNames['left wrist']]?.x,
                      data?.posesWorld![idx][mediapipePoseNames['left wrist']]?.y + 1,
                      data?.posesWorld![idx][mediapipePoseNames['left wrist']]?.z
                    )
                  : new Vector3(
                      data?.posesWorld![idx][mediapipePoseNames['right wrist']]?.x,
                      data?.posesWorld![idx][mediapipePoseNames['right wrist']]?.y + 1,
                      data?.posesWorld![idx][mediapipePoseNames['right wrist']]?.z
                    )
              )
              console.log('newPos', newPos)
              debugHandObjs[idxH]?.position.copy(newPos.clone())
              debugHandObjs[idxH]?.updateMatrixWorld()
            })
          })
        }
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
