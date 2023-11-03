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

import { defineSystem } from '../ecs/functions/SystemFunctions'
import { Network } from '../networking/classes/Network'
import { NetworkObjectComponent } from '../networking/components/NetworkObjectComponent'

import { NormalizedLandmarkList } from '@mediapipe/pose'

import { addDataChannelHandler, removeDataChannelHandler } from '../networking/systems/DataChannelRegistry'

import { defineState, getState } from '@etherealengine/hyperflux'
import { VRMHumanBoneList, VRMHumanBoneName } from '@pixiv/three-vrm'
import {
  BufferAttribute,
  BufferGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Quaternion,
  SphereGeometry,
  Vector3
} from 'three'
import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { V_010 } from '../common/constants/MathConstants'
import { lerp } from '../common/functions/MathLerpFunctions'
import { isClient } from '../common/functions/getEnvironment'
import { Engine } from '../ecs/classes/Engine'
import { EngineState } from '../ecs/classes/EngineState'
import { defineQuery, getComponent, removeComponent, setComponent } from '../ecs/functions/ComponentFunctions'
import { NetworkState } from '../networking/NetworkState'
import { RendererState } from '../renderer/RendererState'
import { ObjectLayers } from '../scene/constants/ObjectLayers'
import { setObjectLayers } from '../scene/functions/setObjectLayers'
import { MotionCaptureRigComponent } from './MotionCaptureRigComponent'
import { solveMotionCapturePose } from './solveMotionCapturePose'

export type MotionCaptureResults = {
  poseWorldLandmarks: NormalizedLandmarkList
  poseLandmarks: NormalizedLandmarkList
}

export const MotionCaptureState = defineState({
  name: 'MotionCaptureState',
  initial: {
    isCapturePage: false
  }
})

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
    network.transport.bufferToAll(dataChannel, fromPeerID, message)
  }
  const results = MotionCaptureFunctions.receiveResults(message as ArrayBuffer)
  if (!timeSeriesMocapData.has(fromPeerID)) {
    timeSeriesMocapData.set(fromPeerID, new RingBuffer(10))
  }
  timeSeriesMocapData.get(fromPeerID)!.add(results)
}

const motionCaptureQuery = defineQuery([MotionCaptureRigComponent, AvatarRigComponent])

const timeSeriesMocapData = new Map<
  PeerID,
  RingBuffer<{
    timestamp: number
    results: MotionCaptureResults
  }>
>()
const timeSeriesMocapLastSeen = new Map<PeerID, number>()

const execute = () => {
  // for now, it is unnecessary to compute anything on the server
  if (!isClient) return
  const network = NetworkState.worldNetwork
  for (const [peerID, mocapData] of timeSeriesMocapData) {
    if (!network?.peers?.[peerID] || timeSeriesMocapLastSeen.get(peerID)! < Date.now() - 1000) {
      timeSeriesMocapData.delete(peerID)
      timeSeriesMocapLastSeen.delete(peerID)
    }
  }
  for (const [peerID, mocapData] of timeSeriesMocapData) {
    const data = mocapData.getFirst()
    const userID = network.peers[peerID]!.userId
    const entity = NetworkObjectComponent.getUserAvatarEntity(userID)

    timeSeriesMocapLastSeen.set(peerID, Date.now())
    setComponent(entity, MotionCaptureRigComponent)
    solveMotionCapturePose(entity, data?.results.poseWorldLandmarks, data?.results.poseLandmarks)

    mocapData.clear() // TODO: add a predictive filter and remove this
  }

  for (const entity of motionCaptureQuery()) {
    const peers = Object.keys(network.peers).find((peerID: PeerID) => timeSeriesMocapData.has(peerID))
    if (!peers) {
      removeComponent(entity, MotionCaptureRigComponent)
      continue
    }
    const rigComponent = getComponent(entity, AvatarRigComponent)

    for (const boneName of VRMHumanBoneList) {
      const localbone = rigComponent.localRig[boneName]?.node
      if (!localbone) continue
      if (!MotionCaptureRigComponent.solvingLowerBody[entity]) {
        if (
          boneName == VRMHumanBoneName.LeftUpperLeg ||
          boneName == VRMHumanBoneName.RightUpperLeg ||
          boneName == VRMHumanBoneName.LeftLowerLeg ||
          boneName == VRMHumanBoneName.RightLowerLeg ||
          boneName == VRMHumanBoneName.LeftFoot ||
          boneName == VRMHumanBoneName.RightFoot
        )
          continue
      }
      if (
        MotionCaptureRigComponent.rig[boneName].x[entity] === 0 &&
        MotionCaptureRigComponent.rig[boneName].y[entity] === 0 &&
        MotionCaptureRigComponent.rig[boneName].z[entity] === 0 &&
        MotionCaptureRigComponent.rig[boneName].w[entity] === 0
      ) {
        MotionCaptureRigComponent.rig[boneName].w[entity] === 1
      }
      localbone.quaternion.set(
        MotionCaptureRigComponent.rig[boneName].x[entity],
        MotionCaptureRigComponent.rig[boneName].y[entity],
        MotionCaptureRigComponent.rig[boneName].z[entity],
        MotionCaptureRigComponent.rig[boneName].w[entity]
      )

      if (!rigComponent.vrm.humanoid.normalizedRestPose[boneName]) continue
      if (MotionCaptureRigComponent.solvingLowerBody[entity])
        localbone.position.fromArray(rigComponent.vrm.humanoid.normalizedRestPose[boneName]!.position as number[])
      localbone.scale.set(1, 1, 1)
    }

    const hipBone = rigComponent.localRig.hips.node
    if (MotionCaptureRigComponent.solvingLowerBody[entity]) {
      hipBone.position.set(
        MotionCaptureRigComponent.hipPosition.x[entity],
        MotionCaptureRigComponent.hipPosition.y[entity],
        MotionCaptureRigComponent.hipPosition.z[entity]
      )
      hipBone.updateMatrixWorld(true)
    }

    const worldHipsParent = rigComponent.rig.hips.node.parent
    if (worldHipsParent)
      if (MotionCaptureRigComponent.solvingLowerBody[entity])
        worldHipsParent.position.setY(
          lerp(
            worldHipsParent.position.y,
            MotionCaptureRigComponent.footOffset[entity],
            getState(EngineState).deltaSeconds * 5
          )
        )
      else worldHipsParent.position.setY(0)

    const avatarDebug = getState(RendererState).avatarDebug
    helperGroup.visible = avatarDebug
    if (avatarDebug) {
      const rawBones = rigComponent.localRig
      for (const [key, value] of Object.entries(rawBones)) {
        if (!boneHelpers[key]) {
          const mesh = new Mesh(new SphereGeometry(0.01), new MeshBasicMaterial())
          setObjectLayers(mesh, ObjectLayers.AvatarHelper)
          // mesh.add(new AxesHelper(0.1))
          if (key === 'hips') mesh.material.color.setHex(0xff0000)
          if (key === 'spine') mesh.material.color.setHex(0x00ff00)
          if (key === 'chest') mesh.material.color.setHex(0x4488ff)
          if (key === 'upperChest') mesh.material.color.setHex(0x0000ff)
          boneHelpers[key] = mesh
          helperGroup.add(mesh)
          if (!helperGroup.parent) Engine.instance.scene.add(helperGroup)
          setObjectLayers(positionLineSegment, ObjectLayers.AvatarHelper)
        }
        const mesh = boneHelpers[key]
        value.node.getWorldPosition(mesh.position)
        value.node.getWorldQuaternion(mesh.quaternion)
        mesh.updateMatrixWorld(true)
      }

      const bones = Object.values(rigComponent.localRig).filter(
        (bone) => bone.node.parent && !bone.node.name.toLowerCase().includes('hips')
      )

      const posAttr = new BufferAttribute(new Float32Array(bones.length * 2 * 3).fill(0), 3)

      let i = 0
      for (const bone of bones) {
        const pos = bone.node.getWorldPosition(new Vector3())
        posAttr.setXYZ(i, pos.x, pos.y, pos.z)
        const prevPos = bone.node.parent!.getWorldPosition(new Vector3())
        posAttr.setXYZ(i + 1, prevPos.x, prevPos.y, prevPos.z)
        i += 2
      }

      positionLineSegment.geometry.setAttribute('position', posAttr)
    }
    // rotate hips 180 degrees
    hipBone.quaternion.premultiply(rotate180YQuaternion)
  }
}

const rotate180YQuaternion = new Quaternion().setFromAxisAngle(V_010, Math.PI)
const boneHelpers = {} as Record<string, Object3D>
const helperGroup = new Object3D()
const positionLineSegment = new LineSegments(new BufferGeometry(), new LineBasicMaterial({ vertexColors: true }))
positionLineSegment.material.linewidth = 4
helperGroup.add(positionLineSegment)

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
