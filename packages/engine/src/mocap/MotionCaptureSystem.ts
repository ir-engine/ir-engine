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

import { POSE_LANDMARKS } from '@mediapipe/holistic'
import { decode, encode } from 'msgpackr'
import { useEffect } from 'react'
import { Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { dispatchAction, getState } from '@etherealengine/hyperflux'

import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { RingBuffer } from '../common/classes/RingBuffer'
import { isClient } from '../common/functions/getEnvironment'
import { Engine } from '../ecs/classes/Engine'
import { EngineState } from '../ecs/classes/EngineState'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { removeEntity } from '../ecs/functions/EntityFunctions'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { DataChannelType, Network } from '../networking/classes/Network'
import { addDataChannelHandler, removeDataChannelHandler } from '../networking/NetworkState'
import { UUIDComponent } from '../scene/components/UUIDComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { XRAction } from '../xr/XRState'

export const motionCaptureHeadSuffix = '_motion_capture_head'
export const motionCaptureLeftHandSuffix = '_motion_capture_left_hand'
export const motionCaptureRightHandSuffix = '_motion_capture_right_hand'

export interface NormalizedLandmark {
  x: number
  y: number
  z: number
  visibility?: number
}

export const sendResults = (landmarks: NormalizedLandmark[]) => {
  return encode({
    timestamp: Date.now(),
    peerIndex: Engine.instance.worldNetwork.peerIDToPeerIndex.get(Engine.instance.peerID)!,
    landmarks
  })
}

export const receiveResults = (results: ArrayBuffer) => {
  const { timestamp, peerIndex, landmarks } = decode(new Uint8Array(results)) as {
    timestamp: number
    peerIndex: number
    landmarks: NormalizedLandmark[]
  }
  const peerID = Engine.instance.worldNetwork.peerIndexToPeerID.get(peerIndex)
  return { timestamp, peerID, landmarks }
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
  const { peerID, landmarks } = MotionCaptureFunctions.receiveResults(message as ArrayBuffer)
  if (!peerID) return
  if (!timeSeriesMocapData.has(peerID)) {
    timeSeriesMocapData.set(peerID, new RingBuffer(10))
  }
  timeSeriesMocapData.get(peerID)!.add(landmarks)
}

const timeSeriesMocapData = new Map<PeerID, RingBuffer<NormalizedLandmark[]>>()
const timeSeriesMocapLastSeen = new Map<PeerID, number>()

const objs = [] as Mesh[]
const debug = false

if (debug)
  for (let i = 0; i < 33; i++) {
    objs.push(new Mesh(new SphereGeometry(0.05), new MeshBasicMaterial()))
    Engine.instance.scene.add(objs[i])
  }

const hipsPos = new Vector3()
const headPos = new Vector3()
const leftHandPos = new Vector3()
const rightHandPos = new Vector3()

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

  const userPeers = network?.users?.get(Engine.instance.userId)

  // Stop mocap by removing entities if data doesnt exist
  if (isClient && (!localClientEntity || !userPeers?.find((peerID) => timeSeriesMocapData.has(peerID)))) {
    const headUUID = (Engine.instance.userId + motionCaptureHeadSuffix) as EntityUUID
    const leftHandUUID = (Engine.instance.userId + motionCaptureLeftHandSuffix) as EntityUUID
    const rightHandUUID = (Engine.instance.userId + motionCaptureRightHandSuffix) as EntityUUID

    const ikTargetHead = UUIDComponent.entitiesByUUID[headUUID]
    const ikTargetLeftHand = UUIDComponent.entitiesByUUID[leftHandUUID]
    const ikTargetRightHand = UUIDComponent.entitiesByUUID[rightHandUUID]

    if (ikTargetHead) removeEntity(ikTargetHead)
    if (ikTargetLeftHand) removeEntity(ikTargetLeftHand)
    if (ikTargetRightHand) removeEntity(ikTargetRightHand)
  }

  for (const [peerID, mocapData] of timeSeriesMocapData) {
    const userID = network.peers.get(peerID)!.userId
    const entity = Engine.instance.getUserAvatarEntity(userID)

    if (entity && entity === localClientEntity) {
      const data = mocapData.popLast()
      if (!data) continue

      timeSeriesMocapLastSeen.set(peerID, Date.now())

      const leftHips = data[POSE_LANDMARKS.LEFT_HIP]
      const rightHips = data[POSE_LANDMARKS.RIGHT_HIP]
      const nose = data[POSE_LANDMARKS.NOSE]
      const leftEar = data[POSE_LANDMARKS.LEFT_EAR]
      const rightEar = data[POSE_LANDMARKS.RIGHT_EAR]
      const leftShoulder = data[POSE_LANDMARKS.LEFT_SHOULDER]
      const rightShoulder = data[POSE_LANDMARKS.RIGHT_SHOULDER]
      const leftElbow = data[POSE_LANDMARKS.LEFT_ELBOW]
      const rightElbow = data[POSE_LANDMARKS.RIGHT_ELBOW]
      const rightWrist = data[POSE_LANDMARKS.LEFT_WRIST]
      const leftWrist = data[POSE_LANDMARKS.RIGHT_WRIST]

      const head = !!nose.visibility && nose.visibility > 0.5
      const leftHand = !!leftWrist.visibility && leftWrist.visibility > 0.1
      const rightHand = !!rightWrist.visibility && rightWrist.visibility > 0.1

      const headUUID = (userID + motionCaptureHeadSuffix) as EntityUUID
      const leftHandUUID = (userID + motionCaptureLeftHandSuffix) as EntityUUID
      const rightHandUUID = (userID + motionCaptureRightHandSuffix) as EntityUUID

      const ikTargetHead = UUIDComponent.entitiesByUUID[headUUID]
      const ikTargetLeftHand = UUIDComponent.entitiesByUUID[leftHandUUID]
      const ikTargetRightHand = UUIDComponent.entitiesByUUID[rightHandUUID]

      if (!head && ikTargetHead) removeEntity(ikTargetHead)
      if (!leftHand && ikTargetLeftHand) removeEntity(ikTargetLeftHand)
      if (!rightHand && ikTargetRightHand) removeEntity(ikTargetRightHand)

      if (head && !ikTargetHead) dispatchAction(XRAction.spawnIKTarget({ handedness: 'none', entityUUID: headUUID }))
      if (leftHand && !ikTargetLeftHand)
        dispatchAction(XRAction.spawnIKTarget({ handedness: 'left', entityUUID: leftHandUUID }))
      if (rightHand && !ikTargetRightHand)
        dispatchAction(XRAction.spawnIKTarget({ handedness: 'right', entityUUID: rightHandUUID }))

      const avatarRig = getComponent(entity, AvatarRigComponent)
      const avatarTransform = getComponent(entity, TransformComponent)
      if (!avatarRig) continue

      const avatarHips = avatarRig.rig.Hips
      avatarHips.getWorldPosition(hipsPos)

      if (debug)
        for (let i = 0; i < 33; i++) {
          objs[i].position
            .set(data[i].x, data[i].y, data[i].z)
            .multiplyScalar(-1)
            .applyQuaternion(avatarTransform.rotation)
            .add(hipsPos)
          objs[i].visible = !!data[i].visibility && data[i].visibility! > 0.5
          objs[i].updateMatrixWorld(true)
        }

      if (ikTargetHead) {
        if (!nose.visibility || nose.visibility < 0.1) continue
        if (!nose.x || !nose.y || !nose.z) continue
        const ik = getComponent(ikTargetHead, TransformComponent)
        headPos
          .set((leftEar.x + rightEar.x) / 2, (leftEar.y + rightEar.y) / 2, (leftEar.z + rightEar.z) / 2)
          .multiplyScalar(-1)
          .applyQuaternion(avatarTransform.rotation)
          .add(hipsPos)
        ik.position.copy(headPos)
        // ik.rotation.setFromUnitVectors(
        //   new Vector3(0, 1, 0),
        //   new Vector3(nose.x, -nose.y, nose.z).sub(headPos).normalize()
        // ).multiply(avatarTransform.rotation)
      }

      if (ikTargetLeftHand) {
        if (!leftWrist.visibility || leftWrist.visibility < 0.1) continue
        if (!leftWrist.x || !leftWrist.y || !leftWrist.z) continue
        const ik = getComponent(ikTargetLeftHand, TransformComponent)
        leftHandPos
          .set(leftWrist.x, leftWrist.y, leftWrist.z)
          .multiplyScalar(-1)
          .applyQuaternion(avatarTransform.rotation)
          .add(hipsPos)
        ik.position.lerp(leftHandPos, engineState.deltaSeconds * 10)
        // ik.quaternion.copy()
      }

      if (ikTargetRightHand) {
        if (!rightWrist.visibility || rightWrist.visibility < 0.5) continue
        if (!rightWrist.x || !rightWrist.y || !rightWrist.z) continue
        const ik = getComponent(ikTargetRightHand, TransformComponent)
        rightHandPos
          .set(rightWrist.x, rightWrist.y, rightWrist.z)
          .multiplyScalar(-1)
          .applyQuaternion(avatarTransform.rotation)
          .add(hipsPos)
        ik.position.lerp(rightHandPos, engineState.deltaSeconds * 10)
        // ik.quaternion.copy()
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
