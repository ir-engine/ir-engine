import { POSE_LANDMARKS } from '@mediapipe/pose'
import { decode, encode } from 'msgpackr'
import { Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from 'three'

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { dispatchAction, getMutableState, getState, none } from '@etherealengine/hyperflux'

import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import {
  AvatarHeadIKComponent,
  AvatarIKTargetsComponent,
  AvatarLeftArmIKComponent,
  AvatarRightArmIKComponent
} from '../avatar/components/AvatarIKComponents'
import { RingBuffer } from '../common/classes/RingBuffer'
import { Engine } from '../ecs/classes/Engine'
import { getComponent, hasComponent, removeComponent, setComponent } from '../ecs/functions/ComponentFunctions'
import { DataChannelType, Network } from '../networking/classes/Network'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { addDataChannelHandler, NetworkState, removeDataChannelHandler } from '../networking/NetworkState'
import { TransformComponent } from '../transform/components/TransformComponent'
import { XRState } from '../xr/XRState'

export interface NormalizedLandmark {
  x: number
  y: number
  z: number
  visibility?: number
}

export const sendResults = (landmarks: NormalizedLandmark[]) => {
  return encode({
    timestamp: Date.now(),
    peerIndex: Engine.instance.worldNetwork.peerIDToPeerIndex.get(Engine.instance.worldNetwork.peerID)!,
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

export default async function MotionCaptureSystem() {
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
      timeSeriesMocapData.set(peerID, new RingBuffer(100))
    }
    timeSeriesMocapData.get(peerID)!.add(landmarks)
  }

  addDataChannelHandler(mocapDataChannelType, handleMocapData)

  const timeSeriesMocapData = new Map<PeerID, RingBuffer<NormalizedLandmark[]>>()

  const xrState = getState(XRState)

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
    if (xrState.sessionActive) return

    const network = Engine.instance.worldNetwork
    if (!network) return

    const localClientEntity = Engine.instance.localClientEntity

    for (const [peerID, mocapData] of timeSeriesMocapData) {
      if (!network.peers.has(peerID)) {
        timeSeriesMocapData.delete(peerID)
        continue
      }
      const userID = network.peers.get(peerID)!.userId
      const entity = Engine.instance.getUserAvatarEntity(userID)
      if (!entity) continue

      if (entity === localClientEntity) {
        const data = mocapData.getLast()
        if (!data) continue

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

        const ikTargets = getComponent(entity, AvatarIKTargetsComponent)
        const head = !!nose.visibility && nose.visibility > 0.5
        const leftHand = !!leftWrist.visibility && leftWrist.visibility > 0.5
        const rightHand = !!rightWrist.visibility && rightWrist.visibility > 0.5

        if (!head && ikTargets.head) removeComponent(localClientEntity, AvatarHeadIKComponent)
        if (!leftHand && ikTargets.leftHand) removeComponent(localClientEntity, AvatarLeftArmIKComponent)
        if (!rightHand && ikTargets.rightHand) removeComponent(localClientEntity, AvatarRightArmIKComponent)

        if (head && !ikTargets.head) setComponent(localClientEntity, AvatarHeadIKComponent)
        if (leftHand && !ikTargets.leftHand) setComponent(localClientEntity, AvatarLeftArmIKComponent)
        if (rightHand && !ikTargets.rightHand) setComponent(localClientEntity, AvatarRightArmIKComponent)
        ikTargets.head = head
        ikTargets.leftHand = leftHand
        ikTargets.rightHand = rightHand

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

        if (hasComponent(entity, AvatarHeadIKComponent)) {
          if (!nose.visibility || nose.visibility < 0.5) continue
          if (!nose.x || !nose.y || !nose.z) continue
          const ik = getComponent(entity, AvatarHeadIKComponent)
          headPos
            .set((leftEar.x + rightEar.x) / 2, (leftEar.y + rightEar.y) / 2, (leftEar.z + rightEar.z) / 2)
            .multiplyScalar(-1)
            .applyQuaternion(avatarTransform.rotation)
            .add(hipsPos)
          ik.target.position.copy(headPos)
          // ik.target.quaternion.setFromUnitVectors(
          //   new Vector3(0, 1, 0),
          //   new Vector3(nose.x, -nose.y, nose.z).sub(headPos).normalize()
          // ).multiply(avatarTransform.rotation)
        }

        if (hasComponent(entity, AvatarLeftArmIKComponent)) {
          if (!leftWrist.visibility || leftWrist.visibility < 0.5) continue
          if (!leftWrist.x || !leftWrist.y || !leftWrist.z) continue
          const ik = getComponent(entity, AvatarLeftArmIKComponent)
          leftHandPos
            .set(leftWrist.x, leftWrist.y, leftWrist.z)
            .multiplyScalar(-1)
            .applyQuaternion(avatarTransform.rotation)
            .add(hipsPos)
          ik.target.position.copy(leftHandPos)
          // ik.target.quaternion.copy()
        }

        if (hasComponent(entity, AvatarRightArmIKComponent)) {
          if (!rightWrist.visibility || rightWrist.visibility < 0.5) continue
          if (!rightWrist.x || !rightWrist.y || !rightWrist.z) continue
          const ik = getComponent(entity, AvatarRightArmIKComponent)
          rightHandPos
            .set(rightWrist.x, rightWrist.y, rightWrist.z)
            .multiplyScalar(-1)
            .applyQuaternion(avatarTransform.rotation)
            .add(hipsPos)
          ik.target.position.copy(rightHandPos)
          // ik.target.quaternion.copy()
        }
      }
    }
  }

  const cleanup = async () => {
    removeDataChannelHandler(mocapDataChannelType, handleMocapData)
  }

  return { execute, cleanup }
}
