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

import {
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Object3D,
  Plane,
  Quaternion,
  SphereGeometry,
  Vector3
} from 'three'

import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'

import { Mesh, MeshBasicMaterial } from 'three'

import { getState } from '@etherealengine/hyperflux'
import {
  NormalizedLandmark,
  NormalizedLandmarkList,
  POSE_CONNECTIONS,
  POSE_LANDMARKS,
  POSE_LANDMARKS_LEFT,
  POSE_LANDMARKS_RIGHT
} from '@mediapipe/pose'
import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { V_010, V_100, V_111 } from '../common/constants/MathConstants'
import { RendererState } from '../renderer/RendererState'
import { ObjectLayers } from '../scene/constants/ObjectLayers'
import { setObjectLayers } from '../scene/functions/setObjectLayers'
import { MotionCaptureRigComponent } from './MotionCaptureRigComponent'

const grey = new Color(0.5, 0.5, 0.5)

export const drawMocapDebug = () => {
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
        const mesh = new Mesh(new SphereGeometry(0.01), new MeshBasicMaterial({ color }))
        setObjectLayers(mesh, ObjectLayers.AvatarHelper)
        debugMeshes[key] = mesh
        Engine.instance.scene.add(mesh)
      }
      const mesh = debugMeshes[key]
      mesh.material.color.set(color)
      if (key === `${POSE_LANDMARKS_RIGHT.RIGHT_WRIST}`) mesh.material.color.set(0xff0000)
      if (key === `${POSE_LANDMARKS_RIGHT.RIGHT_PINKY}`) mesh.material.color.set(0x00ff00)
      if (key === `${POSE_LANDMARKS_RIGHT.RIGHT_INDEX}`) mesh.material.color.set(0x0000ff)
      mesh.matrixWorld.setPosition(value.x, lowestWorldY - value.y, value.z)
    }

    if (!positionLineSegment.parent) {
      Engine.instance.scene.add(positionLineSegment)
      setObjectLayers(positionLineSegment, ObjectLayers.AvatarHelper)
    }

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

const drawDebug = drawMocapDebug()
const drawDebugScreen = drawMocapDebug()

export const shouldEstimateLowerBody = (landmarks: NormalizedLandmark[], threshold = 0.5) => {
  const hipsVisibility =
    (landmarks[POSE_LANDMARKS.RIGHT_HIP].visibility! + landmarks[POSE_LANDMARKS.LEFT_HIP].visibility!) * 0.5 >
    threshhold
  const feetVisibility =
    (landmarks[POSE_LANDMARKS_LEFT.LEFT_ANKLE].visibility! + landmarks[POSE_LANDMARKS_RIGHT.RIGHT_ANKLE].visibility!) *
      0.5 >
    threshhold
  return hipsVisibility && feetVisibility
}

export function solveMotionCapturePose(landmarks: NormalizedLandmarkList, screenlandmarks, entity) {
  const rig = getComponent(entity, AvatarRigComponent)
  if (!rig || !rig.localRig || !rig.localRig.hips || !rig.localRig.hips.node) {
    return
  }

  if (!landmarks?.length) return

  const avatarDebug = getState(RendererState).avatarDebug

  if (avatarDebug) {
    drawDebug(landmarks)
    drawDebugScreen(screenlandmarks)
  }

  const lowestWorldY = landmarks.reduce((a, b) => (a.y > b.y ? a : b)).y
  const estimatingLowerBody = shouldEstimateLowerBody(landmarks)
  solveSpine(entity, lowestWorldY, landmarks)
  solveLimb(
    entity,
    lowestWorldY,
    landmarks[POSE_LANDMARKS.RIGHT_SHOULDER],
    landmarks[POSE_LANDMARKS.RIGHT_ELBOW],
    landmarks[POSE_LANDMARKS.RIGHT_WRIST],
    new Vector3(1, 0, 0),
    VRMHumanBoneName.Chest,
    VRMHumanBoneName.LeftUpperArm,
    VRMHumanBoneName.LeftLowerArm
  )
  solveLimb(
    entity,
    lowestWorldY,
    landmarks[POSE_LANDMARKS.LEFT_SHOULDER],
    landmarks[POSE_LANDMARKS.LEFT_ELBOW],
    landmarks[POSE_LANDMARKS.LEFT_WRIST],
    new Vector3(-1, 0, 0),
    VRMHumanBoneName.Chest,
    VRMHumanBoneName.RightUpperArm,
    VRMHumanBoneName.RightLowerArm
  )
  if (estimatingLowerBody) {
    solveLimb(
      entity,
      lowestWorldY,
      landmarks[POSE_LANDMARKS_RIGHT.RIGHT_HIP],
      landmarks[POSE_LANDMARKS_RIGHT.RIGHT_KNEE],
      landmarks[POSE_LANDMARKS_RIGHT.RIGHT_ANKLE],
      new Vector3(0, 1, 0),
      VRMHumanBoneName.Hips,
      VRMHumanBoneName.LeftUpperLeg,
      VRMHumanBoneName.LeftLowerLeg
    )
    solveLimb(
      entity,
      lowestWorldY,
      landmarks[POSE_LANDMARKS_LEFT.LEFT_HIP],
      landmarks[POSE_LANDMARKS_LEFT.LEFT_KNEE],
      landmarks[POSE_LANDMARKS_LEFT.LEFT_ANKLE],
      new Vector3(0, 1, 0),
      VRMHumanBoneName.Hips,
      VRMHumanBoneName.RightUpperLeg,
      VRMHumanBoneName.RightLowerLeg
    )
    solveFoot(
      entity,
      lowestWorldY,
      landmarks[POSE_LANDMARKS_LEFT.LEFT_ANKLE],
      landmarks[POSE_LANDMARKS_LEFT.LEFT_HEEL],
      landmarks[POSE_LANDMARKS_LEFT.LEFT_FOOT_INDEX],
      VRMHumanBoneName.RightUpperLeg,
      VRMHumanBoneName.RightFoot
    )
    solveFoot(
      entity,
      lowestWorldY,
      landmarks[POSE_LANDMARKS_RIGHT.RIGHT_ANKLE],
      landmarks[POSE_LANDMARKS_RIGHT.RIGHT_HEEL],
      landmarks[POSE_LANDMARKS_RIGHT.RIGHT_FOOT_INDEX],
      VRMHumanBoneName.LeftUpperLeg,
      VRMHumanBoneName.LeftFoot
    )
    //check state, if we are still not set to track lower body, update that
    if (!MotionCaptureRigComponent.solvingLowerBody[entity]) {
      MotionCaptureRigComponent.solvingLowerBody[entity] = 1
    }
  } else {
    if (MotionCaptureRigComponent.solvingLowerBody[entity]) {
      //quick dirty reset of legs
      resetLimb(entity, VRMHumanBoneName.Hips, VRMHumanBoneName.LeftUpperLeg, VRMHumanBoneName.LeftLowerLeg)
      resetLimb(entity, VRMHumanBoneName.Hips, VRMHumanBoneName.RightUpperLeg, VRMHumanBoneName.RightLowerLeg)
      resetBone(entity, VRMHumanBoneName.LeftFoot)
      resetBone(entity, VRMHumanBoneName.RightFoot)
      resetBone(entity, VRMHumanBoneName.LeftHand)
      resetBone(entity, VRMHumanBoneName.RightHand)
      MotionCaptureRigComponent.solvingLowerBody[entity] = 0
    }
  }

  solveHand(
    entity,
    lowestWorldY,
    landmarks[POSE_LANDMARKS_LEFT.LEFT_WRIST],
    landmarks[POSE_LANDMARKS_LEFT.LEFT_PINKY],
    landmarks[POSE_LANDMARKS_LEFT.LEFT_INDEX],
    false,
    VRMHumanBoneName.RightLowerArm,
    VRMHumanBoneName.RightHand
  )
  solveHand(
    entity,
    lowestWorldY,
    landmarks[POSE_LANDMARKS_RIGHT.RIGHT_WRIST],
    landmarks[POSE_LANDMARKS_RIGHT.RIGHT_PINKY],
    landmarks[POSE_LANDMARKS_RIGHT.RIGHT_INDEX],
    true,
    VRMHumanBoneName.LeftLowerArm,
    VRMHumanBoneName.LeftHand
  )

  solveHead(
    entity,
    landmarks[POSE_LANDMARKS.RIGHT_EAR],
    landmarks[POSE_LANDMARKS.LEFT_EAR],
    landmarks[POSE_LANDMARKS.NOSE]
  )

  // if (!planeHelper1.parent) {
  //   Engine.instance.scene.add(planeHelper1)
  //   Engine.instance.scene.add(planeHelper2)
  // }
}

const threshhold = 0.6

const vec3 = new Vector3()

// const planeHelper1 = new Mesh(
//   new PlaneGeometry(1, 1),
//   new MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.2, side: DoubleSide })
// )
// planeHelper1.add(new AxesHelper())

// const planeHelper2 = new Mesh(
//   new PlaneGeometry(1, 1),
//   new MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.2, side: DoubleSide })
// )
// planeHelper2.add(new AxesHelper())

/**
 * The spine is the joints connecting the hips and shoulders. Given solved hips, we can solve each of the spine bones connecting the hips to the shoulders using the shoulder's position and rotation.
 */

export const solveSpine = (entity: Entity, lowestWorldY, landmarks: NormalizedLandmarkList) => {
  const trackingLowerBody = MotionCaptureRigComponent.solvingLowerBody[entity]
  const rig = getComponent(entity, AvatarRigComponent)

  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP]
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP]

  if (!rightHip || !leftHip) return

  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER]
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER]

  // ignore visibility checks as we always want to set hips
  if (rightShoulder.visibility! < threshhold || leftShoulder.visibility! < threshhold) return

  // ignore visibility checks as we always want to set hips
  // const hips = rightHip.visibility! > threshhold && leftHip.visibility! > threshhold
  // if (!hips) return

  const restSpine = rig.vrm.humanoid.normalizedRestPose[VRMHumanBoneName.Spine]!
  const restChest = rig.vrm.humanoid.normalizedRestPose[VRMHumanBoneName.Chest]!
  const restShoulderLeft = rig.vrm.humanoid.normalizedRestPose[VRMHumanBoneName.LeftUpperArm]!
  const restShoulderRight = rig.vrm.humanoid.normalizedRestPose[VRMHumanBoneName.RightUpperArm]!
  const averageChestToShoulderHeight = (restShoulderLeft.position![1] + restShoulderRight.position![1]) / 2

  const restLegLeft = rig.vrm.humanoid.normalizedRestPose[VRMHumanBoneName.LeftUpperLeg]!
  const restLegRight = rig.vrm.humanoid.normalizedRestPose[VRMHumanBoneName.RightUpperLeg]!
  const averageHipToLegHeight = (restLegLeft.position![1] + restLegRight.position![1]) / 2

  const offset = 0
  const legLength = rig.upperLegLength + rig.lowerLegLength * 2 - offset

  const hipleft = trackingLowerBody
    ? new Vector3(rightHip.x, lowestWorldY - rightHip.y, rightHip.z)
    : new Vector3(0, legLength, 0)
  const hipright = trackingLowerBody
    ? new Vector3(leftHip.x, lowestWorldY - leftHip.y, leftHip.z)
    : new Vector3(0, legLength, 0)
  const hipcenter = trackingLowerBody
    ? new Vector3().copy(hipleft).add(hipright).multiplyScalar(0.5)
    : new Vector3(0, legLength, 0)

  const shoulderLeft = new Vector3(rightShoulder.x, lowestWorldY - rightShoulder.y, rightShoulder.z)
  const shoulderRight = new Vector3(leftShoulder.x, lowestWorldY - leftShoulder.y, leftShoulder.z)

  const shoulderCenter = new Vector3().copy(shoulderLeft).add(shoulderRight).multiplyScalar(0.5)

  const hipToShoulderQuaternion = new Quaternion().setFromUnitVectors(
    V_010,
    vec3.subVectors(shoulderCenter, hipcenter).normalize()
  )

  const shoulderToHipQuaternion = new Quaternion().setFromUnitVectors(
    V_010,
    vec3.subVectors(hipcenter, shoulderCenter).normalize()
  )

  const hipWorldQuaterion = getQuaternionFromPointsAlongPlane(hipright, hipleft, shoulderCenter, new Quaternion(), true)

  // planeHelper1.position.copy(hipcenter)
  // planeHelper1.quaternion.copy(hipWorldQuaterion)
  // planeHelper1.updateMatrixWorld()

  // multiply the hip normal quaternion by the rotation of the hips around this ne
  const hipPositionAlongPlane = new Vector3(0, -averageHipToLegHeight, 0)
    .applyQuaternion(hipToShoulderQuaternion)
    .add(hipcenter)

  MotionCaptureRigComponent.hipPosition.x[entity] = hipPositionAlongPlane.x
  MotionCaptureRigComponent.hipPosition.y[entity] = hipPositionAlongPlane.y
  MotionCaptureRigComponent.hipPosition.z[entity] = hipPositionAlongPlane.z

  // get quaternion that represents the rotation of the shoulders
  const shoulderWorldQuaternion = getQuaternionFromPointsAlongPlane(
    shoulderRight,
    shoulderLeft,
    hipcenter,
    new Quaternion()
  )

  // planeHelper2.position.copy(shoulderCenter)
  // planeHelper2.quaternion.copy(shoulderWorldQuaternion)
  // planeHelper2.updateMatrixWorld()

  // rather than applying shoulderWorldRotation, we need to apply a rotation that moves it towards the hips
  // const shoulderPositionAlongPlane = new Vector3(0, -averageChestToShoulderHeight, 0)
  //   .applyQuaternion(shoulderToHipQuaternion)
  //   .add(shoulderCenter)

  // get ratio of each spine bone, and apply that ratio of rotation such that the shoulders are in the correct position
  hipObject.matrixWorld.compose(hipPositionAlongPlane, hipWorldQuaterion, V_111)
  hipObject.matrixWorld.decompose(hipObject.position, hipObject.quaternion, hipObject.scale)

  spineObject.matrixWorld.compose(
    new Vector3().fromArray(restSpine.position as number[]),
    new Quaternion().fromArray(restSpine.rotation as number[]),
    V_111
  )
  spineObject.matrixWorld.decompose(spineObject.position, spineObject.quaternion, spineObject.scale)

  shoulderObject.matrixWorld.compose(
    new Vector3().fromArray(restChest.position as number[]),
    new Quaternion().fromArray(restChest.rotation as number[]),
    V_111
  )
  shoulderObject.matrixWorld.decompose(shoulderObject.position, shoulderObject.quaternion, shoulderObject.scale)

  if (trackingLowerBody) {
    hipObject.quaternion.copy(shoulderWorldQuaternion)
    spineObject.quaternion.identity()
    shoulderObject.quaternion.identity()
    const hipDirection = new Quaternion().setFromUnitVectors(
      V_100,
      new Vector3().subVectors(hipright, hipleft).setY(0).normalize()
    )
    MotionCaptureRigComponent.hipRotation.x[entity] = hipDirection.x
    MotionCaptureRigComponent.hipRotation.y[entity] = hipDirection.y
    MotionCaptureRigComponent.hipRotation.z[entity] = hipDirection.z
    MotionCaptureRigComponent.hipRotation.w[entity] = hipDirection.w
    console.log(hipObject.quaternion)
  } else {
    hipObject.quaternion.set(
      MotionCaptureRigComponent.hipRotation.x[entity],
      MotionCaptureRigComponent.hipRotation.y[entity],
      MotionCaptureRigComponent.hipRotation.z[entity],
      MotionCaptureRigComponent.hipRotation.w[entity]
    )
    spineObject.quaternion.copy(hipToShoulderQuaternion)
  }

  MotionCaptureRigComponent.rig[VRMHumanBoneName.Hips].x[entity] = hipObject.quaternion.x
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Hips].y[entity] = hipObject.quaternion.y
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Hips].z[entity] = hipObject.quaternion.z
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Hips].w[entity] = hipObject.quaternion.w

  rig.localRig[VRMHumanBoneName.Hips]?.node.quaternion.copy(hipObject.quaternion)

  MotionCaptureRigComponent.rig[VRMHumanBoneName.Spine].x[entity] = spineObject.quaternion.x
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Spine].y[entity] = spineObject.quaternion.y
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Spine].z[entity] = spineObject.quaternion.z
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Spine].w[entity] = spineObject.quaternion.w

  rig.localRig[VRMHumanBoneName.Spine]?.node.quaternion.copy(spineObject.quaternion)

  MotionCaptureRigComponent.rig[VRMHumanBoneName.Chest].x[entity] = shoulderObject.quaternion.x
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Chest].y[entity] = shoulderObject.quaternion.y
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Chest].z[entity] = shoulderObject.quaternion.z
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Chest].w[entity] = shoulderObject.quaternion.w

  rig.localRig[VRMHumanBoneName.Chest]?.node.quaternion.copy(shoulderObject.quaternion)

  rig.localRig[VRMHumanBoneName.Hips]!.node.updateWorldMatrix(false, false)
  rig.localRig[VRMHumanBoneName.Spine]!.node.updateWorldMatrix(false, false)
  rig.localRig[VRMHumanBoneName.Chest]!.node.updateWorldMatrix(false, false)
}

const hipObject = new Object3D()
const spineObject = new Object3D()
hipObject.add(spineObject)
const shoulderObject = new Object3D()
spineObject.add(shoulderObject)

export const solveLimb = (
  entity: Entity,
  lowestWorldY: number,
  start: NormalizedLandmark,
  mid: NormalizedLandmark,
  end: NormalizedLandmark,
  axis: Vector3,
  parentTargetBoneName: VRMHumanBoneName,
  startTargetBoneName: VRMHumanBoneName,
  midTargetBoneName: VRMHumanBoneName
) => {
  if (!start || !mid || !end) return

  // if (start.visibility! < threshhold || mid.visibility! < threshhold || end.visibility! < threshhold) return

  const rig = getComponent(entity, AvatarRigComponent)

  const parentQuaternion = rig.localRig[parentTargetBoneName]!.node.getWorldQuaternion(new Quaternion())

  const startPoint = new Vector3(start.x, lowestWorldY - start.y, start.z)
  const midPoint = new Vector3(mid.x, lowestWorldY - mid.y, mid.z)
  const endPoint = new Vector3(end.x, lowestWorldY - end.y, end.z)

  // get quaternion that represents the rotation of the shoulders or hips

  const startQuaternion = new Quaternion().setFromUnitVectors(axis, vec3.subVectors(startPoint, midPoint).normalize())

  // get quaternion that represents the rotation of the elbow or knee
  const midQuaternion = new Quaternion().setFromUnitVectors(axis, vec3.subVectors(midPoint, endPoint).normalize())

  // convert to local space
  const startLocal = new Quaternion().copy(startQuaternion).premultiply(parentQuaternion.clone().invert())
  const midLocal = new Quaternion().copy(midQuaternion).premultiply(startQuaternion.clone().invert())

  MotionCaptureRigComponent.rig[startTargetBoneName].x[entity] = startLocal.x
  MotionCaptureRigComponent.rig[startTargetBoneName].y[entity] = startLocal.y
  MotionCaptureRigComponent.rig[startTargetBoneName].z[entity] = startLocal.z
  MotionCaptureRigComponent.rig[startTargetBoneName].w[entity] = startLocal.w

  rig.localRig[startTargetBoneName]?.node.quaternion.copy(startLocal)

  MotionCaptureRigComponent.rig[midTargetBoneName].x[entity] = midLocal.x
  MotionCaptureRigComponent.rig[midTargetBoneName].y[entity] = midLocal.y
  MotionCaptureRigComponent.rig[midTargetBoneName].z[entity] = midLocal.z
  MotionCaptureRigComponent.rig[midTargetBoneName].w[entity] = midLocal.w

  rig.localRig[midTargetBoneName]?.node.quaternion.copy(midLocal)

  rig.localRig[startTargetBoneName]!.node.updateWorldMatrix(false, false)
  rig.localRig[midTargetBoneName]!.node.updateWorldMatrix(false, false)
}

export const resetLimb = (
  entity: Entity,
  parentTargetBoneName: VRMHumanBoneName,
  startTargetBoneName: VRMHumanBoneName,
  midTargetBoneName: VRMHumanBoneName
) => {
  // if (start.visibility! < threshhold || mid.visibility! < threshhold || end.visibility! < threshhold) return
  const rig = getComponent(entity, AvatarRigComponent)

  MotionCaptureRigComponent.rig[startTargetBoneName].x[entity] = 0
  MotionCaptureRigComponent.rig[startTargetBoneName].y[entity] = 0
  MotionCaptureRigComponent.rig[startTargetBoneName].z[entity] = 0
  MotionCaptureRigComponent.rig[startTargetBoneName].w[entity] = 1

  rig.localRig[startTargetBoneName]?.node.quaternion.identity()

  MotionCaptureRigComponent.rig[midTargetBoneName].x[entity] = 0
  MotionCaptureRigComponent.rig[midTargetBoneName].y[entity] = 0
  MotionCaptureRigComponent.rig[midTargetBoneName].z[entity] = 0
  MotionCaptureRigComponent.rig[midTargetBoneName].w[entity] = 1

  rig.localRig[midTargetBoneName]?.node.quaternion.identity()

  rig.localRig[startTargetBoneName]!.node.updateWorldMatrix(false, false)
  rig.localRig[midTargetBoneName]!.node.updateWorldMatrix(false, false)
}

export const resetBone = (entity: Entity, boneName: VRMHumanBoneName) => {
  const rig = getComponent(entity, AvatarRigComponent)

  MotionCaptureRigComponent.rig[boneName].x[entity] = 0
  MotionCaptureRigComponent.rig[boneName].y[entity] = 0
  MotionCaptureRigComponent.rig[boneName].z[entity] = 0
  MotionCaptureRigComponent.rig[boneName].w[entity] = 1

  rig.localRig[boneName]?.node.quaternion.identity()
}

export const solveHand = (
  entity: Entity,
  lowestWorldY: number,
  extent: NormalizedLandmark,
  ref1: NormalizedLandmark,
  ref2: NormalizedLandmark,
  invertAxis: boolean,
  parentTargetBoneName: VRMHumanBoneName,
  extentTargetBoneName: VRMHumanBoneName
) => {
  if (!extent || !ref1 || !ref2) return

  // if (extent.visibility! < threshhold || ref1.visibility! < threshhold || ref2.visibility! < threshhold) return

  const rig = getComponent(entity, AvatarRigComponent)

  const parentQuaternion = rig.localRig[parentTargetBoneName]!.node.getWorldQuaternion(new Quaternion())

  const startPoint = new Vector3(extent.x, lowestWorldY - extent.y, extent.z)
  const ref1Point = new Vector3(ref1.x, lowestWorldY - ref1.y, ref1.z)
  const ref2Point = new Vector3(ref2.x, lowestWorldY - ref2.y, ref2.z)

  plane.setFromCoplanarPoints(ref1Point, ref2Point, startPoint)
  directionVector.addVectors(ref1Point, ref2Point).multiplyScalar(0.5).sub(startPoint).normalize()
  const orthogonalVector = plane.normal
  if (invertAxis) {
    directionVector.negate()
    thirdVector.crossVectors(directionVector, orthogonalVector).negate()
    orthogonalVector.negate()
  } else {
    thirdVector.crossVectors(directionVector, orthogonalVector)
  }

  // for the hands, negative x is forward, palm up is negative y, thumb side is positive z on left hand, negative z on right hand
  rotationMatrix.makeBasis(directionVector, orthogonalVector, thirdVector)

  const limbExtentQuaternion = new Quaternion().setFromRotationMatrix(rotationMatrix)

  // planeHelper2.position.copy(startPoint)
  // planeHelper2.quaternion.copy(limbExtentQuaternion)
  // planeHelper2.updateMatrixWorld()

  // convert to local space
  const extentQuaternionLocal = new Quaternion()
    .copy(limbExtentQuaternion)
    .premultiply(parentQuaternion.clone().invert())

  MotionCaptureRigComponent.rig[extentTargetBoneName].x[entity] = extentQuaternionLocal.x
  MotionCaptureRigComponent.rig[extentTargetBoneName].y[entity] = extentQuaternionLocal.y
  MotionCaptureRigComponent.rig[extentTargetBoneName].z[entity] = extentQuaternionLocal.z
  MotionCaptureRigComponent.rig[extentTargetBoneName].w[entity] = extentQuaternionLocal.w

  rig.localRig[extentTargetBoneName]?.node.quaternion.copy(extentQuaternionLocal)

  rig.localRig[extentTargetBoneName]!.node.updateWorldMatrix(false, false)
}

export const solveFoot = (
  entity: Entity,
  lowestWorldY: number,
  extent: NormalizedLandmark,
  ref1: NormalizedLandmark,
  ref2: NormalizedLandmark,
  parentTargetBoneName: VRMHumanBoneName,
  extentTargetBoneName: VRMHumanBoneName
) => {
  if (!extent || !ref1 || !ref2) return

  const rig = getComponent(entity, AvatarRigComponent)

  const parentQuaternion = rig.localRig[parentTargetBoneName]!.node.getWorldQuaternion(new Quaternion())

  const startPoint = new Vector3(extent.x, lowestWorldY - extent.y, extent.z)
  const ref1Point = new Vector3(ref1.x, lowestWorldY - ref1.y, ref1.z)
  const ref2Point = new Vector3(ref2.x, lowestWorldY - ref2.y, ref2.z)

  plane.setFromCoplanarPoints(ref1Point, ref2Point, startPoint)

  directionVector.subVectors(startPoint, ref2Point).normalize()
  const orthogonalVector = plane.normal
  thirdVector.crossVectors(orthogonalVector, directionVector)

  // for the hands, negative x is forward, palm up is negative y, thumb side is positive z on left hand, negative z on right hand
  rotationMatrix.makeBasis(directionVector, orthogonalVector, thirdVector)

  const limbExtentQuaternion = new Quaternion().setFromRotationMatrix(rotationMatrix)

  // convert to local space
  const extentQuaternionLocal = new Quaternion()
    .copy(limbExtentQuaternion)
    .premultiply(parentQuaternion.clone().invert())

  MotionCaptureRigComponent.rig[extentTargetBoneName].x[entity] = extentQuaternionLocal.x
  MotionCaptureRigComponent.rig[extentTargetBoneName].y[entity] = extentQuaternionLocal.y
  MotionCaptureRigComponent.rig[extentTargetBoneName].z[entity] = extentQuaternionLocal.z
  MotionCaptureRigComponent.rig[extentTargetBoneName].w[entity] = extentQuaternionLocal.w

  rig.localRig[extentTargetBoneName]?.node.quaternion.copy(extentQuaternionLocal)

  rig.localRig[extentTargetBoneName]!.node.updateWorldMatrix(false, false)
}

const headRotation = new Quaternion()
const leftEarVec3 = new Vector3()
const rightEarVec3 = new Vector3()
const noseVec3 = new Vector3()
const parentRotation = new Quaternion()

const rotate90degreesAroundXAxis = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2)

export const solveHead = (
  entity: Entity,
  leftEar: NormalizedLandmark,
  rightEar: NormalizedLandmark,
  nose: NormalizedLandmark
) => {
  const rig = getComponent(entity, AvatarRigComponent)

  leftEarVec3.set(leftEar.x, -leftEar.y, leftEar.z)
  rightEarVec3.set(rightEar.x, -rightEar.y, rightEar.z)
  noseVec3.set(nose.x, -nose.y, nose.z)

  getQuaternionFromPointsAlongPlane(rightEarVec3, leftEarVec3, noseVec3, headRotation, false)

  headRotation.multiply(rotate90degreesAroundXAxis)

  rig.localRig[VRMHumanBoneName.Neck]!.node.getWorldQuaternion(parentRotation)
  headRotation.premultiply(parentRotation.invert())

  MotionCaptureRigComponent.rig[VRMHumanBoneName.Head].x[entity] = headRotation.x
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Head].y[entity] = headRotation.y
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Head].z[entity] = headRotation.z
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Head].w[entity] = headRotation.w

  rig.localRig[VRMHumanBoneName.Head]?.node.quaternion.copy(headRotation)
}

const plane = new Plane()
const directionVector = new Vector3()
const thirdVector = new Vector3()
const rotationMatrix = new Matrix4()

const getQuaternionFromPointsAlongPlane = (
  a: Vector3,
  b: Vector3,
  planeRestraint: Vector3,
  target: Quaternion,
  invert = false
) => {
  plane.setFromCoplanarPoints(invert ? b : a, invert ? a : b, planeRestraint)
  const orthogonalVector = plane.normal
  directionVector.subVectors(a, b).normalize()
  thirdVector.crossVectors(orthogonalVector, directionVector)
  rotationMatrix.makeBasis(directionVector, thirdVector, orthogonalVector)
  return target.setFromRotationMatrix(rotationMatrix)
}
