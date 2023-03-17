import { POSE_LANDMARKS } from '@mediapipe/pose'
import { Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from 'three'

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'

import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import {
  AvatarHeadIKComponent,
  AvatarIKTargetsComponent,
  AvatarLeftArmIKComponent,
  AvatarRightArmIKComponent
} from '../avatar/components/AvatarIKComponents'
import { RingBuffer } from '../common/classes/RingBuffer'
import { Engine } from '../ecs/classes/Engine'
import { getComponent, hasComponent } from '../ecs/functions/ComponentFunctions'
import { DataChannelType, Network } from '../networking/classes/Network'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { NetworkState } from '../networking/NetworkState'
import { TransformComponent } from '../transform/components/TransformComponent'
import { XRState } from '../xr/XRState'

export interface NormalizedLandmark {
  x: number
  y: number
  z: number
  visibility?: number
}

export const sendResults = (results: NormalizedLandmark[]) => {
  const peerIndex = Engine.instance.worldNetwork.peerIDToPeerIndex.get(Engine.instance.worldNetwork.peerID)!
  const resultsData = results.map((val) => [val.x, val.y, val.z, val.visibility ?? 0]).flat()
  const dataBuffer = Float64Array.from([Date.now(), peerIndex, ...resultsData]).buffer
  return dataBuffer
}

export const receiveResults = (results: ArrayBufferLike) => {
  const data = new Float64Array(results)
  // todo - use timestamp
  const timestamp = data[0]
  const peerID = Engine.instance.worldNetwork.peerIndexToPeerID.get(data[1])
  const resultsData = data.slice(2)
  const landmarks = [] as NormalizedLandmark[]
  for (let i = 0; i < resultsData.length; i += 4) {
    landmarks.push({
      x: resultsData[i],
      y: resultsData[i + 1],
      z: resultsData[i + 2],
      visibility: resultsData[i + 3]
    })
  }
  return { peerID, landmarks }
}

export const MotionCaptureFunctions = {
  sendResults,
  receiveResults
}

export const mocapDataChannelType = 'mocap' as DataChannelType

export default async function MotionCaptureSystem() {
  const networkState = getMutableState(NetworkState)

  networkState.dataChannelRegistry.merge({
    [mocapDataChannelType]: (network: Network, fromPeerID: PeerID, message: ArrayBufferLike) => {
      if (network.isHosting) {
        network.transport.bufferToAll(mocapDataChannelType, message)
      }
      const { peerID, landmarks } = MotionCaptureFunctions.receiveResults(message)
      if (!peerID) return
      if (!timeSeriesMocapData.has(peerID)) {
        timeSeriesMocapData.set(peerID, new RingBuffer(100))
      }
      timeSeriesMocapData.get(peerID)!.add(landmarks)
    }
  })

  console.log({ POSE_LANDMARKS })
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
        const head = data[POSE_LANDMARKS.NOSE]
        const leftShoulder = data[POSE_LANDMARKS.LEFT_SHOULDER]
        const rightShoulder = data[POSE_LANDMARKS.RIGHT_SHOULDER]
        const leftElbow = data[POSE_LANDMARKS.LEFT_ELBOW]
        const rightElbow = data[POSE_LANDMARKS.RIGHT_ELBOW]
        const rightHand = data[POSE_LANDMARKS.LEFT_WRIST]
        const leftHand = data[POSE_LANDMARKS.RIGHT_WRIST]

        const ikTargets = getComponent(entity, AvatarIKTargetsComponent)
        const changed =
          ikTargets.head !== !!head || ikTargets.leftHand !== !!leftHand || ikTargets.rightHand !== !!rightHand

        if (changed)
          dispatchAction(
            WorldNetworkAction.avatarIKTargets({ head: !!head, leftHand: !!leftHand, rightHand: !!rightHand })
          )

        const avatarRig = getComponent(entity, AvatarRigComponent)
        if (!avatarRig) continue

        const avatarHips = avatarRig.rig.Hips
        avatarHips.getWorldPosition(hipsPos)
        // console.log(hipsPos)

        if (debug)
          for (let i = 0; i < 33; i++) {
            objs[i].position.set(data[i].x, -data[i].y, data[i].z).add(hipsPos)
            objs[i].visible = !!data[i].visibility && data[i].visibility! > 0.5
            objs[i].updateMatrixWorld(true)
          }

        if (hasComponent(entity, AvatarHeadIKComponent)) {
          if (!head.visibility || head.visibility < 0.5) continue
          if (!head.x || !head.y || !head.z) continue
          const ik = getComponent(localClientEntity, AvatarHeadIKComponent)
          headPos.set(head.x, -head.y, head.z)
          ik.target.position.addVectors(hipsPos, headPos)
          // ik.target.quaternion.copy()
        }

        if (hasComponent(entity, AvatarLeftArmIKComponent)) {
          if (!leftHand.visibility || leftHand.visibility < 0.5) continue
          if (!leftHand.x || !leftHand.y || !leftHand.z) continue
          const ik = getComponent(localClientEntity, AvatarLeftArmIKComponent)
          leftHandPos.set(leftHand.x, -leftHand.y, leftHand.z)
          ik.target.position.addVectors(hipsPos, leftHandPos)
          // ik.target.quaternion.copy()
        }

        if (hasComponent(entity, AvatarRightArmIKComponent)) {
          if (!rightHand.visibility || rightHand.visibility < 0.5) continue
          if (!rightHand.x || !rightHand.y || !rightHand.z) continue
          const ik = getComponent(localClientEntity, AvatarRightArmIKComponent)
          rightHandPos.set(rightHand.x, -rightHand.y, rightHand.z)
          ik.target.position.addVectors(hipsPos, rightHandPos)
          // ik.target.quaternion.copy()
        }
      }
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
