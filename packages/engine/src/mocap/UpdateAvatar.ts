/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License") you may not use this file except in compliance
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

import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../transform/components/TransformComponent'

import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  Euler,
  LineBasicMaterial,
  LineSegments,
  Quaternion,
  SphereGeometry,
  Vector3
} from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { AvatarNetworkAction } from '../avatar/state/AvatarNetworkActions'
import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { UUIDComponent } from '../scene/components/UUIDComponent'

import { Mesh, MeshBasicMaterial } from 'three'
import UpdateIkPose from './UpdateIkPose'

import { dispatchAction } from '@etherealengine/hyperflux'
import { NormalizedLandmarkList, POSE_CONNECTIONS, POSE_LANDMARKS } from '@mediapipe/holistic'
import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { V_001, V_010 } from '../common/constants/MathConstants'
import { MotionCaptureRigComponent } from './MotionCaptureRigComponent'
import { MotionCaptureStream } from './MotionCaptureSystem'

/*
///
/// Capture the rest pose, elevation and wingspan at startup, and act as a store for inter-frame state
///

const ensembles = {}
function GetPoseEnsemble(userID, entity) {
  let ensemble = ensembles[userID]
  if (ensemble) {
    return ensemble
  }
  ensemble = ensembles[userID] = {
    lowest: 999,
    rest: {}
  }
  const rig = getComponent(entity, AvatarRigComponent)
  if (!rig || !rig.bindRig || !rig.bindRig.hips || !rig.bindRig.hips.node) {
    console.warn('pose no rig')
    return
  }
  console.log(rig.bindRig)

  //const temp = rig.bindRig.hips.node.getWorldQuaternion(new Quaternion()).invert()
  const temp2 = rig.bindRig.hips.node.getWorldPosition(new Vector3())
  console.log(temp2)

  // @todo actually each piece should be in world space relative to the hips
  Object.entries(VRMHumanBoneName).forEach(([key, key2]) => {
    const part = rig.vrm.humanoid!.getNormalizedBoneNode(key2)
    if (!part) return
    const xyz = part.position
    const quaternion = part.quaternion
    const euler = new Euler().setFromQuaternion(part.quaternion)
    ensemble.rest[key2] = { xyz, quaternion, euler }
    console.log(key, xyz.x, xyz.y, xyz.z)
  })
  return ensemble
}
*/

//const demirror = new Quaternion().setFromEuler(new Euler(0, Math.PI, 0))

const debugmeshes = {}

function ApplyPoseChange(entity: Entity, key, change) {
  const rig = getComponent(entity, AvatarRigComponent)
  if (!rig || !rig.localRig || !rig.localRig.hips || !rig.localRig.hips.node) {
    console.warn('pose change no rig')
    return
  }
  const transform = getComponent(entity, TransformComponent)

  // props we can set on body parts
  let xyz = change.xyz || null
  let quaternion = change.quaternion || null
  //const dampener = change.dampener || 1.0 <- @todo disabled until we have previous joint
  const lerp = change.lerp || 1.0
  const color = change.color || 0x000000
  const ik = change.ik ? true : false
  const shown = change.shown ? true : false
  const euler = change.euler || null
  const debug = false //change.debug || true
  const blendweight = change.blendweight || 1.0

  // get part in question
  const part = rig.vrm.humanoid!.getNormalizedBoneNode(key)
  if (!part) {
    console.warn('cannot set', key)
    return
  }

  /*
  // dampen xyz
  if (xyz) {
    xyz.x *= dampener
    xyz.y *= dampener
    xyz.z *= dampener
  }
  */

  // promote euler to quaternion if any with dampener
  if (euler) {
    quaternion = new Quaternion().setFromEuler(
      new Euler(
        euler?.x || 0, // * dampener,
        euler?.y || 0, // * dampener,
        euler?.z || 0, // * dampener,
        euler?.rotationOrder || 'XYZ'
      )
    )
  }

  // ik part?
  if (ik) {
    // this is how we will get iktargets later on:
    //const target = getComponent(entity, AvatarAnimationComponent).ikTarget[key]

    // for now get a dispatch target
    const entityUUID = `${Engine?.instance?.userID}_mocap_${key}` as EntityUUID
    const target = UUIDComponent.entitiesByUUID[entityUUID]
    if (!target) {
      dispatchAction(AvatarNetworkAction.spawnIKTarget({ entityUUID: entityUUID, name: key as any }))
      return
    }

    // ik requires you to supply an avatar relative position (relative to ground at origin)
    if (!xyz) {
      //xyz = rig.vrm.humanoid.rawRestPose[key].node.getWorldPosition(new Vector3())
      //console.log('bindpose', key, xyz.x.toFixed(3), xyz.y.toFixed(3), xyz.z.toFixed(3))
      console.warn('ik requires xyz')
      return
    }

    // ik requires xyz to be in absolute world position for the absolute world target, so must add avatar current position
    xyz = new Vector3(xyz.x, xyz.y, xyz.z).applyQuaternion(transform.rotation).add(transform.position)

    // @todo - we have to rotate the part to world coordinates also??!

    // if we have a handle on a target then set it
    const targetTransform = getComponent(target, TransformComponent)
    if (xyz) targetTransform?.position.copy(xyz)
    if (quaternion) targetTransform?.rotation.copy(quaternion)
  }

  // directly set joint not using ik
  else {
    if (quaternion) {
      part.quaternion.slerp(quaternion.clone(), lerp)
    }
    if (xyz) {
      part.position.lerp(xyz, lerp)
    }
  }

  // visualize for debugging - can only handle one avatar
  // if (debug) {
  //   let mesh = debugmeshes[key]
  //   if (!mesh) {
  //     debugmeshes[key] = mesh = new Mesh(new BoxGeometry(0.01, 0.4, 0.01), new MeshBasicMaterial({ color }))
  //     const gizmo = new AxesHelper()
  //     gizmo.add(new ArrowHelper(undefined, undefined, undefined, new Color('blue')))
  //     mesh.add(gizmo)
  //     Engine.instance.scene.add(mesh)
  //   }
  //   mesh.material.color.setHex(shown == true ? color : 0x000000)
  //   if (xyz) mesh.position.copy(xyz)
  //   if (quaternion) mesh.rotation.setFromQuaternion(quaternion)
  //   mesh.updateMatrixWorld()
  // }
}

function ApplyPoseChanges(entity: Entity, changes) {
  Object.entries(changes).forEach(([key, change]) => {
    ApplyPoseChange(entity, key, change)
  })
}

///
/// Update Avatar overall; fingers, face, pose, head orientation, hips, feet, ik, non ik...
///

const debug = true
const grey = new Color(0.5, 0.5, 0.5)

const drawDebug = () => {
  const debugMeshes = {} as Record<string, Mesh<SphereGeometry, MeshBasicMaterial>>

  const positionLineSegment = new LineSegments(new BufferGeometry(), new LineBasicMaterial({ vertexColors: true }))
  positionLineSegment.material.linewidth = 4
  const posAttr = new BufferAttribute(new Float32Array(POSE_CONNECTIONS.length * 2 * 3).fill(0), 3)
  positionLineSegment.geometry.setAttribute('position', posAttr)
  const colAttr = new BufferAttribute(new Float32Array(POSE_CONNECTIONS.length * 2 * 4).fill(1), 4)
  positionLineSegment.geometry.setAttribute('color', colAttr)

  return (landmarks: NormalizedLandmarkList) => {
    const lowestWorldY = landmarks.reduce((a, b) => (a.y > b.y ? a : b)).y
    for (const [key, value] of Object.entries(landmarks)) {
      const confidence = value.visibility ?? 0
      const color = new Color().set(1 - confidence, confidence, 0)
      if (!debugMeshes[key]) {
        const mesh = new Mesh(new SphereGeometry(0.02), new MeshBasicMaterial({ color }))
        debugMeshes[key] = mesh
        Engine.instance.scene.add(mesh)
      }
      const mesh = debugMeshes[key]
      mesh.material.color.set(color)
      mesh.matrixWorld.setPosition(value.x, lowestWorldY - value.y, value.z)
    }

    if (!positionLineSegment.parent) Engine.instance.scene.add(positionLineSegment)

    for (let i = 0; i < POSE_CONNECTIONS.length * 2; i += 2) {
      const [first, second] = POSE_CONNECTIONS[i / 2]
      const firstPoint = debugMeshes[first]
      const secondPoint = debugMeshes[second]

      posAttr.setXYZ(
        i,
        firstPoint.matrixWorld.elements[12],
        firstPoint.matrixWorld.elements[13],
        firstPoint.matrixWorld.elements[14]
      )
      posAttr.setXYZ(
        i + 1,
        secondPoint.matrixWorld.elements[12],
        secondPoint.matrixWorld.elements[13],
        secondPoint.matrixWorld.elements[14]
      )
      // todo color doesnt work
      const confident = firstPoint.material.color.g > threshhold && secondPoint.material.color.g > threshhold
      const firstColor = confident ? firstPoint.material.color : grey
      const secondColor = confident ? secondPoint.material.color : grey

      colAttr.setXYZW(i, firstColor.r, firstColor.g, firstColor.b, 1)
      colAttr.setXYZW(i + 1, secondColor.r, secondColor.g, secondColor.b, 1)
    }
    posAttr.needsUpdate = true
    colAttr.needsUpdate = true
  }
}

const debugWorld = drawDebug()
const debugScreen = drawDebug()

export default function UpdateAvatar(data: MotionCaptureStream, userID, entity) {
  // sanity check
  if (!data || !data.za || !data.poseLandmarks) {
    console.warn('no data')
    return
  }

  const rig = getComponent(entity, AvatarRigComponent)
  if (!rig || !rig.localRig || !rig.localRig.hips || !rig.localRig.hips.node) {
    return
  }

  const worldLandmarks = data.za as NormalizedLandmarkList
  const screenLandmarks = data.poseLandmarks as NormalizedLandmarkList

  const normalizedScreenLandmarks = normalizeLandmarks(worldLandmarks, screenLandmarks)

  if (debug) {
    // debugWorld(worldLandmarks)
    // debugScreen(screenLandmarks)
    debugScreen(normalizedScreenLandmarks)
  }

  const DIRECT = true
  if (DIRECT) {
    // use landmarks to directly set head orientation and facial features
    // const changes1 = UpdateLandmarkFace(data?.faceLandmarks)
    // ApplyPoseChanges(entity, changes1)

    // use landmarks to directly set fingers
    // const changes2 = UpdateLandmarkHands(data?.leftHandLandmarks, data?.rightHandLandmarks)
    // ApplyPoseChanges(entity, changes2)

    // use landmarks to set coarse pose
    // const changes3 = UpdateLandmarkPose(data?.za)
    // ApplyPoseChanges(entity, changes3)
    solveHips(entity, worldLandmarks)
    solveSpine(entity, worldLandmarks)
    solveArm(entity, worldLandmarks, 'left')
    solveArm(entity, worldLandmarks, 'right')
  } else {
    // publish ik targets rather than directly setting body parts
    const changes4 = UpdateIkPose(data)
    ApplyPoseChanges(entity, changes4)
  }
}

const bboxWorld = new Box3()
const bboxScreen = new Box3()

export const normalizeLandmarks = (worldLandmarks: NormalizedLandmarkList, screenLandmarks: NormalizedLandmarkList) => {
  // take the head height in world space, and multiiply all screen space landmarks by this to get world space landmarks

  bboxWorld.setFromPoints(worldLandmarks as Vector3[])
  bboxScreen.setFromPoints(screenLandmarks as Vector3[])

  const xRatio = (bboxWorld.max.x - bboxWorld.min.x) / (bboxScreen.max.x - bboxScreen.min.x)
  const yRatio = (bboxWorld.max.y - bboxWorld.min.y) / (bboxScreen.max.y - bboxScreen.min.y)
  const zRatio = (bboxWorld.max.z - bboxWorld.min.z) / (bboxScreen.max.z - bboxScreen.min.z)

  const normalizedScreenLandmarks = screenLandmarks.map((landmark) => ({
    ...landmark,
    x: landmark.x * xRatio,
    y: landmark.y * yRatio,
    z: landmark.z * zRatio
  }))

  const hipCenterX =
    (normalizedScreenLandmarks[POSE_LANDMARKS.LEFT_HIP].x + normalizedScreenLandmarks[POSE_LANDMARKS.RIGHT_HIP].x) / 2
  const hipCenterZ =
    (normalizedScreenLandmarks[POSE_LANDMARKS.LEFT_HIP].z + normalizedScreenLandmarks[POSE_LANDMARKS.RIGHT_HIP].z) / 2

  // translate all landmarks to the origin
  for (const landmark of normalizedScreenLandmarks) {
    landmark.x -= hipCenterX
    landmark.z -= hipCenterZ
  }

  return normalizedScreenLandmarks
}

const threshhold = 0.6
const ninetyDegreeXZTurnQuaternion = new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0))
const rotate180YQuaternion = new Quaternion().setFromAxisAngle(V_010, Math.PI)

const quaternion = new Quaternion()
const quat = new Quaternion()
const vec3 = new Vector3()

const solveHips = (entity: Entity, landmarks: NormalizedLandmarkList) => {
  const rig = getComponent(entity, AvatarRigComponent)

  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP]
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP]

  if (!rightHip || !leftHip) return

  // ignore visibility checks as we always want to set hips
  // const hips = rightHip.visibility! > threshhold && leftHip.visibility! > threshhold
  // if (!hips) return

  const lowestWorldY = landmarks.reduce((a, b) => (a.y > b.y ? a : b)).y

  const hipsBone = rig.vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Hips)! // rig.localRig[VRMHumanBoneName.Hips]?.node!

  const hipleft = new Vector3(rightHip.x, rightHip.y, rightHip.z)
  const hipright = new Vector3(leftHip.x, leftHip.y, leftHip.z)

  hipsBone.position.copy(hipleft).add(hipright).multiplyScalar(0.5).y += lowestWorldY

  // take the rotation of the two hip points around it's center as an XZ rotation
  quaternion
    .setFromUnitVectors(V_001, vec3.set(hipright.x - hipleft.x, 0, hipright.z - hipleft.z).normalize())
    .multiply(ninetyDegreeXZTurnQuaternion)

  MotionCaptureRigComponent.rig[VRMHumanBoneName.Hips].x[entity] = quaternion.x
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Hips].y[entity] = quaternion.y
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Hips].z[entity] = quaternion.z
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Hips].w[entity] = quaternion.w
}

/**
 * The spine is the joints connecting the hips and shoulders. Given solved hips, we can solve each of the spine bones connecting the hips to the shoulders using the shoulder's position and rotation.
 */

const solveSpine = (entity: Entity, landmarks: NormalizedLandmarkList) => {
  const rig = getComponent(entity, AvatarRigComponent)

  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER]
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER]

  if (!rightShoulder || !leftShoulder) return

  // ignore visibility checks as we always want to set hips
  if (rightShoulder.visibility! < threshhold || leftShoulder.visibility! < threshhold) return

  const shoulderLeft = new Vector3(rightShoulder.x, rightShoulder.y, rightShoulder.z)
  const shoulderRight = new Vector3(leftShoulder.x, leftShoulder.y, leftShoulder.z)

  // get quaternion that represents the rotation of the shoulders

  const shoulderQuaternion = new Quaternion()
    .setFromUnitVectors(V_001, vec3.subVectors(shoulderRight, shoulderLeft).normalize())
    .multiply(ninetyDegreeXZTurnQuaternion)

  // get ratio of each spine bone, and apply that ratio of rotation such that the shoulders are in the correct position

  const hipsRotation = new Quaternion(
    MotionCaptureRigComponent.rig[VRMHumanBoneName.Hips].x[entity],
    MotionCaptureRigComponent.rig[VRMHumanBoneName.Hips].y[entity],
    MotionCaptureRigComponent.rig[VRMHumanBoneName.Hips].z[entity],
    MotionCaptureRigComponent.rig[VRMHumanBoneName.Hips].w[entity]
  )
    .multiply(getComponent(entity, TransformComponent).rotation)
    .multiply(rotate180YQuaternion)

  // const hips = rig.vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Hips)! // rig.localRig[VRMHumanBoneName.Hips]?.node!

  // get spine lengths from normalized rest pose data @todo cache this (and all other bones)
  const spine0Length = new Vector3()
    .fromArray(rig.vrm.humanoid.normalizedRestPose[VRMHumanBoneName.Spine]!.position as number[])
    .length()
  const spine1Length = new Vector3()
    .fromArray(rig.vrm.humanoid.normalizedRestPose[VRMHumanBoneName.Chest]!.position as number[])
    .length()

  const totalSpineLength = spine0Length + spine1Length

  const spineRatio = spine0Length / totalSpineLength

  // apply rotation to each spine bone

  // get world space rotation of each segment
  const spine0Quaternion = new Quaternion().copy(hipsRotation).slerp(shoulderQuaternion, spineRatio)

  // get local space rotation of each segment
  const spine0Local = new Quaternion().copy(spine0Quaternion).premultiply(new Quaternion().copy(hipsRotation).invert())
  const spine1Local = new Quaternion().copy(shoulderQuaternion).premultiply(spine0Quaternion.clone().invert())

  MotionCaptureRigComponent.rig[VRMHumanBoneName.Spine].x[entity] = spine0Local.x
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Spine].y[entity] = spine0Local.y
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Spine].z[entity] = spine0Local.z
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Spine].w[entity] = spine0Local.w

  MotionCaptureRigComponent.rig[VRMHumanBoneName.Chest].x[entity] = spine1Local.x
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Chest].y[entity] = spine1Local.y
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Chest].z[entity] = spine1Local.z
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Chest].w[entity] = spine1Local.w
}

export const solveArm = (entity: Entity, landmarks: NormalizedLandmarkList, side: 'left' | 'right') => {
  const rig = getComponent(entity, AvatarRigComponent)

  // todo - why is this backwards?
  const shoulder = landmarks[side === 'right' ? POSE_LANDMARKS.LEFT_SHOULDER : POSE_LANDMARKS.RIGHT_SHOULDER]
  const elbow = landmarks[side === 'right' ? POSE_LANDMARKS.LEFT_ELBOW : POSE_LANDMARKS.RIGHT_ELBOW]
  const wrist = landmarks[side === 'right' ? POSE_LANDMARKS.LEFT_WRIST : POSE_LANDMARKS.RIGHT_WRIST]

  if (!shoulder || !elbow || !wrist) return

  if (shoulder.visibility! < threshhold || elbow.visibility! < threshhold || wrist.visibility! < threshhold) return

  const neckQuaternion = new Quaternion(
    MotionCaptureRigComponent.rig[VRMHumanBoneName.Neck].x[entity],
    MotionCaptureRigComponent.rig[VRMHumanBoneName.Neck].y[entity],
    MotionCaptureRigComponent.rig[VRMHumanBoneName.Neck].z[entity],
    MotionCaptureRigComponent.rig[VRMHumanBoneName.Neck].w[entity]
  )

  const shoulderPoint = new Vector3(shoulder.x, -shoulder.y, shoulder.z)
  const elbowPoint = new Vector3(elbow.x, -elbow.y, elbow.z)
  const wristPoint = new Vector3(wrist.x, -wrist.y, wrist.z)

  // get quaternion that represents the rotation of the shoulders

  const shoulderQuaternion = new Quaternion().setFromUnitVectors(
    new Vector3(side === 'right' ? -1 : 1, 0, 0),
    vec3.subVectors(shoulderPoint, elbowPoint).normalize()
  )

  // get quaternion that represents the rotation of the elbow

  const elbowQuaternion = new Quaternion().setFromUnitVectors(
    new Vector3(side === 'right' ? -1 : 1, 0, 0),
    vec3.subVectors(elbowPoint, wristPoint).normalize()
  )

  // convert to local space
  const shoulderLocal = new Quaternion().copy(shoulderQuaternion).premultiply(neckQuaternion.clone().invert())
  const elbowLocal = new Quaternion().copy(elbowQuaternion).premultiply(shoulderQuaternion.clone().invert())

  MotionCaptureRigComponent.rig[`${side}UpperArm`].x[entity] = shoulderLocal.x
  MotionCaptureRigComponent.rig[`${side}UpperArm`].y[entity] = shoulderLocal.y
  MotionCaptureRigComponent.rig[`${side}UpperArm`].z[entity] = shoulderLocal.z
  MotionCaptureRigComponent.rig[`${side}UpperArm`].w[entity] = shoulderLocal.w

  MotionCaptureRigComponent.rig[`${side}LowerArm`].x[entity] = elbowLocal.x
  MotionCaptureRigComponent.rig[`${side}LowerArm`].y[entity] = elbowLocal.y
  MotionCaptureRigComponent.rig[`${side}LowerArm`].z[entity] = elbowLocal.z
  MotionCaptureRigComponent.rig[`${side}LowerArm`].w[entity] = elbowLocal.w
}
