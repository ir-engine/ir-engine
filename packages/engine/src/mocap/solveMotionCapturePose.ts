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
import { getComponent, setComponent } from '../ecs/functions/ComponentFunctions'

import {
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Matrix4,
  Plane,
  Quaternion,
  SphereGeometry,
  Vector3
} from 'three'

import { Entity } from '../ecs/classes/Entity'

import { Mesh, MeshBasicMaterial } from 'three'

import { smootheLerpAlpha } from '@etherealengine/common/src/utils/smootheLerpAlpha'
import { getState } from '@etherealengine/hyperflux'
import {
  NormalizedLandmark,
  NormalizedLandmarkList,
  POSE_CONNECTIONS,
  POSE_LANDMARKS,
  POSE_LANDMARKS_LEFT,
  POSE_LANDMARKS_NEUTRAL,
  POSE_LANDMARKS_RIGHT
} from '@mediapipe/pose'
import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { V_001, V_010, V_100 } from '../common/constants/MathConstants'
import { EngineState } from '../ecs/classes/EngineState'
import { createEntity, removeEntity } from '../ecs/functions/EntityFunctions'
import { RendererState } from '../renderer/RendererState'
import { GroupComponent, addObjectToGroup } from '../scene/components/GroupComponent'
import { NameComponent } from '../scene/components/NameComponent'
import { setVisibleComponent } from '../scene/components/VisibleComponent'
import { ObjectLayers } from '../scene/constants/ObjectLayers'
import { setObjectLayers } from '../scene/functions/setObjectLayers'
import { TransformComponent } from '../transform/components/TransformComponent'
import { MotionCaptureRigComponent } from './MotionCaptureRigComponent'

const grey = new Color(0.5, 0.5, 0.5)

const rightFootHistory = [] as number[]
const leftFootHistory = [] as number[]
const feetIndices = { rightFoot: 0, leftFoot: 1 }
const feetGrounded = [false, false]
const footAverageDifferenceThreshold = 0.05
const footLevelDifferenceThreshold = 0.035
/**calculates which feet are grounded. operates on the assumption that the user is on a plane,
 * such that the lowest foot with no vertical motion over the past 10 frames is always the grounded foot.
 */
export const calculateGroundedFeet = (newLandmarks: NormalizedLandmark[]) => {
  //assign right foot y to index 0, left foot y to index 1
  const footVerticalPositions = [
    newLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_ANKLE].y,
    newLandmarks[POSE_LANDMARKS_LEFT.LEFT_ANKLE].y
  ]

  if (!footVerticalPositions[0] || !footVerticalPositions[1]) return

  //average history
  const footAverages = [
    rightFootHistory.reduce((a, b) => a + b, 0) / rightFootHistory.length,
    leftFootHistory.reduce((a, b) => a + b, 0) / leftFootHistory.length
  ]

  //then update history
  rightFootHistory.push(footVerticalPositions[0])
  leftFootHistory.push(footVerticalPositions[1])
  if (rightFootHistory.length > 10) rightFootHistory.shift()
  if (leftFootHistory.length > 10) leftFootHistory.shift()

  //determine if grounded for each foot
  for (let i = 0; i < 2; i++) {
    //difference between current landmark y and average y from history
    const footMoving = Math.abs(footVerticalPositions[i] - footAverages[i]) > footAverageDifferenceThreshold
    //compare foot level for right and left foot
    const footLevel =
      Math.abs(footVerticalPositions[i] - footVerticalPositions[i == 0 ? 1 : 0]) < footLevelDifferenceThreshold
    const isLowestFoot = footVerticalPositions[i] > footVerticalPositions[i == 0 ? 1 : 0]
    if (feetGrounded[i]) {
      if (footMoving && !footLevel) {
        feetGrounded[i] = false
      }
    } else {
      if ((isLowestFoot || footLevel) && !footMoving) feetGrounded[i] = true
    }
  }

  return feetGrounded
}

const LandmarkNames = Object.fromEntries(
  Object.entries({
    ...POSE_LANDMARKS,
    ...POSE_LANDMARKS_LEFT,
    ...POSE_LANDMARKS_RIGHT,
    ...POSE_LANDMARKS_NEUTRAL
  }).map(([key, value]) => [value, key])
)

const drawMocapDebug = (label: string) => {
  if (!POSE_CONNECTIONS) return () => {}

  const debugEntities = {} as Record<string, Entity>
  let lineSegmentEntity: Entity | null = null

  const positionLineSegment = new LineSegments(new BufferGeometry(), new LineBasicMaterial({ vertexColors: true }))
  positionLineSegment.material.linewidth = 4
  const posAttr = new BufferAttribute(new Float32Array(POSE_CONNECTIONS.length * 2 * 3).fill(0), 3)
  positionLineSegment.geometry.setAttribute('position', posAttr)
  const colAttr = new BufferAttribute(new Float32Array(POSE_CONNECTIONS.length * 2 * 4).fill(1), 4)
  positionLineSegment.geometry.setAttribute('color', colAttr)

  return (landmarks?: NormalizedLandmarkList, debugEnabled?: boolean) => {
    if (!debugEnabled) {
      for (const [key, entity] of Object.entries(debugEntities)) {
        delete debugEntities[key]
        removeEntity(entity)
      }
      if (lineSegmentEntity) {
        removeEntity(lineSegmentEntity)
        lineSegmentEntity = null
      }
      return
    }

    if (!landmarks) return

    const lowestWorldY = landmarks.reduce((a, b) => (a.y > b.y ? a : b)).y
    for (const [key, value] of Object.entries(landmarks)) {
      const confidence = value.visibility ?? 0
      const color = new Color().set(1 - confidence, confidence, 0)
      if (!debugEntities[key]) {
        const mesh = new Mesh(new SphereGeometry(0.01), new MeshBasicMaterial({ color }))
        setObjectLayers(mesh, ObjectLayers.AvatarHelper)
        const entity = createEntity()
        debugEntities[key] = entity
        addObjectToGroup(entity, mesh)
        setVisibleComponent(entity, true)
        setComponent(entity, NameComponent, `Mocap Debug ${label} ${LandmarkNames[key]}`)
      }
      const entity = debugEntities[key]
      const mesh = getComponent(entity, GroupComponent)[0] as any as Mesh<BufferGeometry, MeshBasicMaterial>
      mesh.material.color.set(color)
      if (key === `${POSE_LANDMARKS_RIGHT.RIGHT_WRIST}`) mesh.material.color.set(0xff0000)
      if (key === `${POSE_LANDMARKS_RIGHT.RIGHT_PINKY}`) mesh.material.color.set(0x00ff00)
      if (key === `${POSE_LANDMARKS_RIGHT.RIGHT_INDEX}`) mesh.material.color.set(0x0000ff)

      //debug to show the acurracy of the foot grounded  estimation
      if (key === `${POSE_LANDMARKS_LEFT.LEFT_ANKLE}`) {
        mesh.material.color.setHex(feetGrounded[1] ? 0x00ff00 : 0xff0000)
      }
      if (key === `${POSE_LANDMARKS_RIGHT.RIGHT_ANKLE}`) {
        mesh.material.color.setHex(feetGrounded[0] ? 0x00ff00 : 0xff0000)
      }
      getComponent(entity, TransformComponent).matrix.setPosition(value.x, lowestWorldY - value.y, value.z)
    }

    if (!lineSegmentEntity) {
      lineSegmentEntity = createEntity()
      addObjectToGroup(lineSegmentEntity, positionLineSegment)
      setVisibleComponent(lineSegmentEntity, true)
      setComponent(lineSegmentEntity, NameComponent, 'Mocap Debug Line Segment ' + label)
      setObjectLayers(positionLineSegment, ObjectLayers.AvatarHelper)
    }

    for (let i = 0; i < POSE_CONNECTIONS.length * 2; i += 2) {
      const [first, second] = POSE_CONNECTIONS[i / 2]
      const firstPoint = getComponent(debugEntities[first], GroupComponent)[0] as any as Mesh<
        BufferGeometry,
        MeshBasicMaterial
      >
      const secondPoint = getComponent(debugEntities[second], GroupComponent)[0] as any as Mesh<
        BufferGeometry,
        MeshBasicMaterial
      >

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

const drawDebug = drawMocapDebug('Raw')
const drawDebugScreen = drawMocapDebug('Screen')
const drawDebugFinal = drawMocapDebug('Final')

const shouldEstimateLowerBody = (landmarks: NormalizedLandmark[], threshold = 0.5) => {
  const hipsVisibility =
    (landmarks[POSE_LANDMARKS.RIGHT_HIP].visibility! + landmarks[POSE_LANDMARKS.LEFT_HIP].visibility!) * 0.5 >
    threshhold
  const feetVisibility =
    (landmarks[POSE_LANDMARKS_LEFT.LEFT_ANKLE].visibility! + landmarks[POSE_LANDMARKS_RIGHT.RIGHT_ANKLE].visibility!) *
      0.5 >
    threshhold
  return hipsVisibility && feetVisibility
}
let prevWorldLandmarks: NormalizedLandmarkList
let prevScreenLandmarks: NormalizedLandmarkList
export function solveMotionCapturePose(
  entity: Entity,
  newLandmarks?: NormalizedLandmarkList,
  newScreenlandmarks?: NormalizedLandmarkList
) {
  const keyframeInterpolation = (newLandmarks: NormalizedLandmarkList, prevLandmarks: NormalizedLandmarkList) => {
    const filteredLandmarks = [] as NormalizedLandmarkList
    for (let i = 0; i < newLandmarks.length; i++) {
      if (newLandmarks[i].visibility! < 0.1) {
        filteredLandmarks[i] = prevLandmarks[i]
        continue
      }
      const visibility = ((newLandmarks[i].visibility ?? 0) + (prevLandmarks[i].visibility ?? 0)) / 2
      const deltaSeconds = getState(EngineState).deltaSeconds
      const alpha = smootheLerpAlpha(15, deltaSeconds)
      filteredLandmarks[i] = {
        visibility,
        x: MathUtils.lerp(prevLandmarks[i].x, newLandmarks[i].x, alpha),
        y: MathUtils.lerp(prevLandmarks[i].y, newLandmarks[i].y, alpha),
        z: MathUtils.lerp(prevLandmarks[i].z, newLandmarks[i].z, alpha)
      }
    }
    return filteredLandmarks
  }

  const rig = getComponent(entity, AvatarRigComponent)
  if (!rig || !rig.normalizedRig || !rig.normalizedRig.hips || !rig.normalizedRig.hips.node) {
    return
  }

  if (!newLandmarks?.length || !newScreenlandmarks) return

  const avatarDebug = getState(RendererState).avatarDebug

  /**@todo instead of filtering both sets of landmarks create a single mixed world/screen landmark array for filtering */
  if (!prevWorldLandmarks) prevWorldLandmarks = newLandmarks.map((landmark) => ({ ...landmark }))
  if (!prevScreenLandmarks) prevScreenLandmarks = newScreenlandmarks.map((landmark) => ({ ...landmark }))

  const worldLandmarks = keyframeInterpolation(newLandmarks, prevWorldLandmarks)
  const screenLandmarks = keyframeInterpolation(newScreenlandmarks, prevScreenLandmarks)

  prevWorldLandmarks = worldLandmarks
  prevScreenLandmarks = screenLandmarks

  drawDebug(newLandmarks, avatarDebug)
  drawDebugScreen(newScreenlandmarks, !!newScreenlandmarks && avatarDebug)
  drawDebugFinal(worldLandmarks, avatarDebug)

  const userData = (rig.vrm as any).userData

  const lowestWorldY = worldLandmarks.reduce((a, b) => (a.y > b.y ? a : b)).y
  const estimatingLowerBody = shouldEstimateLowerBody(worldLandmarks)
  solveSpine(entity, lowestWorldY, worldLandmarks, !userData.flipped)
  solveLimb(
    entity,
    lowestWorldY,
    worldLandmarks[POSE_LANDMARKS.RIGHT_SHOULDER],
    worldLandmarks[POSE_LANDMARKS.RIGHT_ELBOW],
    worldLandmarks[POSE_LANDMARKS.RIGHT_WRIST],
    new Vector3(userData.flipped ? 1 : -1, 0, 0),
    VRMHumanBoneName.Chest,
    VRMHumanBoneName.LeftUpperArm,
    VRMHumanBoneName.LeftLowerArm,
    !userData.flipped
  )
  solveLimb(
    entity,
    lowestWorldY,
    worldLandmarks[POSE_LANDMARKS.LEFT_SHOULDER],
    worldLandmarks[POSE_LANDMARKS.LEFT_ELBOW],
    worldLandmarks[POSE_LANDMARKS.LEFT_WRIST],
    new Vector3(userData.flipped ? -1 : 1, 0, 0),
    VRMHumanBoneName.Chest,
    VRMHumanBoneName.RightUpperArm,
    VRMHumanBoneName.RightLowerArm,
    !userData.flipped
  )
  if (estimatingLowerBody) {
    calculateGroundedFeet(worldLandmarks)
    solveLimb(
      entity,
      lowestWorldY,
      screenLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_HIP],
      screenLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_KNEE],
      screenLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_ANKLE],
      new Vector3(0, 1, 0),
      VRMHumanBoneName.Hips,
      VRMHumanBoneName.LeftUpperLeg,
      VRMHumanBoneName.LeftLowerLeg,
      false
    )
    solveLimb(
      entity,
      lowestWorldY,
      screenLandmarks[POSE_LANDMARKS_LEFT.LEFT_HIP],
      screenLandmarks[POSE_LANDMARKS_LEFT.LEFT_KNEE],
      screenLandmarks[POSE_LANDMARKS_LEFT.LEFT_ANKLE],
      new Vector3(0, 1, 0),
      VRMHumanBoneName.Hips,
      VRMHumanBoneName.RightUpperLeg,
      VRMHumanBoneName.RightLowerLeg,
      !userData.flipped
    )
    /**todo: figure out why we get bad foot quaternions when using solveFoot */
    solveFoot(
      entity,
      lowestWorldY,
      screenLandmarks[POSE_LANDMARKS_LEFT.LEFT_ANKLE],
      screenLandmarks[POSE_LANDMARKS_LEFT.LEFT_HEEL],
      screenLandmarks[POSE_LANDMARKS_LEFT.LEFT_FOOT_INDEX],
      VRMHumanBoneName.RightLowerLeg,
      VRMHumanBoneName.RightFoot,
      !userData.flipped,
      feetGrounded[1]
    )
    solveFoot(
      entity,
      lowestWorldY,
      screenLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_ANKLE],
      screenLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_HEEL],
      screenLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_FOOT_INDEX],
      VRMHumanBoneName.LeftLowerLeg,
      VRMHumanBoneName.LeftFoot,
      !userData.flipped,
      feetGrounded[0]
    )

    //check state, if we are still not set to track lower body, update that
    if (!MotionCaptureRigComponent.solvingLowerBody[entity]) {
      MotionCaptureRigComponent.solvingLowerBody[entity] = 1
    }
  } else {
    if (MotionCaptureRigComponent.solvingLowerBody[entity]) {
      MotionCaptureRigComponent.solvingLowerBody[entity] = 0
    }
  }

  solveHead(
    entity,
    screenLandmarks[POSE_LANDMARKS.RIGHT_EAR],
    screenLandmarks[POSE_LANDMARKS.LEFT_EAR],
    screenLandmarks[POSE_LANDMARKS.NOSE]
  )

  if (!newScreenlandmarks) return
  solveHand(
    entity,
    lowestWorldY,
    screenLandmarks[POSE_LANDMARKS_LEFT.LEFT_WRIST],
    screenLandmarks[POSE_LANDMARKS_LEFT.LEFT_PINKY],
    screenLandmarks[POSE_LANDMARKS_LEFT.LEFT_INDEX],
    !userData.flipped,
    VRMHumanBoneName.RightLowerArm,
    VRMHumanBoneName.RightHand,
    !userData.flipped
  )
  solveHand(
    entity,
    lowestWorldY,
    screenLandmarks![POSE_LANDMARKS_RIGHT.RIGHT_WRIST],
    screenLandmarks![POSE_LANDMARKS_RIGHT.RIGHT_PINKY],
    screenLandmarks![POSE_LANDMARKS_RIGHT.RIGHT_INDEX],
    userData.flipped,
    VRMHumanBoneName.LeftLowerArm,
    VRMHumanBoneName.LeftHand,
    !userData.flipped
  )
}

const threshhold = 0.6

const vec3 = new Vector3()
const quat = new Quaternion()

/**
 * The spine is the joints connecting the hips and shoulders. Given solved hips, we can solve each of the spine bones connecting the hips to the shoulders using the shoulder's position and rotation.
 */

const spineRotation = new Quaternion(),
  shoulderRotation = new Quaternion(),
  hipCenter = new Vector3(),
  fallbackShoulderQuaternion = new Quaternion(),
  hipToShoulderQuaternion = new Quaternion(),
  hipDirection = new Quaternion()

export const solveSpine = (entity: Entity, lowestWorldY, landmarks: NormalizedLandmarkList, needsFlipping = false) => {
  const trackingLowerBody = MotionCaptureRigComponent.solvingLowerBody[entity]
  const rig = getComponent(entity, AvatarRigComponent)

  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP]
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP]

  if (!rightHip || !leftHip) return

  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER]
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER]

  if (rightShoulder.visibility! < threshhold || leftShoulder.visibility! < threshhold) return

  spineRotation.identity()
  shoulderRotation.identity()

  const restLegLeft = rig.vrm.humanoid.normalizedRestPose[VRMHumanBoneName.LeftUpperLeg]!
  const restLegRight = rig.vrm.humanoid.normalizedRestPose[VRMHumanBoneName.RightUpperLeg]!
  const averageHipToLegHeight = (restLegLeft.position![1] + restLegRight.position![1]) / 2

  const legLength = rig.upperLegLength + rig.lowerLegLength * 2

  const hipleft = new Vector3(rightHip.x, lowestWorldY - rightHip.y, rightHip.z)
  const hipright = new Vector3(leftHip.x, lowestWorldY - leftHip.y, leftHip.z)

  if (trackingLowerBody) {
    for (let i = 0; i < 2; i++) {
      if (feetGrounded[i]) {
        const footLandmark =
          landmarks[i == feetIndices.rightFoot ? POSE_LANDMARKS_RIGHT.RIGHT_ANKLE : POSE_LANDMARKS_LEFT.LEFT_ANKLE].y
        const footY = footLandmark * -1 + rig.normalizedRig.hips.node.position.y
        MotionCaptureRigComponent.footOffset[entity] = footY
      }
    }
    hipCenter.copy(hipleft).add(hipright).multiplyScalar(0.5)
  } else {
    hipCenter.copy(new Vector3(0, legLength, 0))
  }

  const shoulderLeft = new Vector3(rightShoulder.x, lowestWorldY - rightShoulder.y, rightShoulder.z)
  const shoulderRight = new Vector3(leftShoulder.x, lowestWorldY - leftShoulder.y, leftShoulder.z)

  const shoulderCenter = new Vector3().copy(shoulderLeft).add(shoulderRight).multiplyScalar(0.5)
  vec3.subVectors(shoulderCenter, hipCenter)

  hipToShoulderQuaternion.setFromUnitVectors(V_010, vec3)

  getQuaternionFromPointsAlongPlane(
    hipright,
    hipleft,
    shoulderCenter,
    hipToShoulderQuaternion,
    true,
    needsFlipping || (!needsFlipping && trackingLowerBody > 0)
  )

  // multiply the hip normal quaternion by the rotation of the hips around this ne
  const hipPositionAlongPlane = new Vector3(0, -averageHipToLegHeight, 0)
    .applyQuaternion(hipToShoulderQuaternion)
    .add(hipCenter)

  MotionCaptureRigComponent.hipPosition.x[entity] = hipPositionAlongPlane.x
  MotionCaptureRigComponent.hipPosition.y[entity] = hipPositionAlongPlane.y
  MotionCaptureRigComponent.hipPosition.z[entity] = hipPositionAlongPlane.z

  if (trackingLowerBody) {
    hipDirection.setFromUnitVectors(V_100, new Vector3().subVectors(hipright, hipleft).setY(0))
    MotionCaptureRigComponent.hipRotation.x[entity] = hipDirection.y
    MotionCaptureRigComponent.hipRotation.z[entity] = hipDirection.x
    MotionCaptureRigComponent.hipRotation.y[entity] = hipDirection.z
    MotionCaptureRigComponent.hipRotation.w[entity] = hipDirection.w
  } else {
    if (leftHip.visibility! + rightHip.visibility! > 1) {
      spineRotation.copy(hipToShoulderQuaternion)
    } else {
      spineRotation.identity()
      fallbackShoulderQuaternion.setFromUnitVectors(
        new Vector3(needsFlipping ? -1 : 1, 0, 0),
        new Vector3().subVectors(shoulderRight, shoulderLeft)
      )
      spineRotation.copy(fallbackShoulderQuaternion)
    }
    hipToShoulderQuaternion.set(
      MotionCaptureRigComponent.hipRotation.x[entity],
      MotionCaptureRigComponent.hipRotation.y[entity],
      MotionCaptureRigComponent.hipRotation.z[entity],
      MotionCaptureRigComponent.hipRotation.w[entity]
    )
  }

  if (!needsFlipping) hipToShoulderQuaternion.multiply(new Quaternion().setFromAxisAngle(V_010, Math.PI))
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Hips].x[entity] = hipToShoulderQuaternion.x
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Hips].y[entity] = hipToShoulderQuaternion.y
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Hips].z[entity] = hipToShoulderQuaternion.z
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Hips].w[entity] = hipToShoulderQuaternion.w

  MotionCaptureRigComponent.rig[VRMHumanBoneName.Spine].x[entity] = spineRotation.x
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Spine].y[entity] = spineRotation.y
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Spine].z[entity] = spineRotation.z
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Spine].w[entity] = spineRotation.w

  MotionCaptureRigComponent.rig[VRMHumanBoneName.Chest].x[entity] = shoulderRotation.x
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Chest].y[entity] = shoulderRotation.y
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Chest].z[entity] = shoulderRotation.z
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Chest].w[entity] = shoulderRotation.w
}

export const solveLimb = (
  entity: Entity,
  lowestWorldY: number,
  start: NormalizedLandmark,
  mid: NormalizedLandmark,
  end: NormalizedLandmark,
  axis: Vector3,
  parentTargetBoneName: VRMHumanBoneName,
  startTargetBoneName: VRMHumanBoneName,
  midTargetBoneName: VRMHumanBoneName,
  needsFlipping = false
) => {
  if (!start || !mid || !end) return

  const rig = getComponent(entity, AvatarRigComponent)

  const parentQuaternion = rig.normalizedRig[parentTargetBoneName]!.node.getWorldQuaternion(new Quaternion())

  const startPoint = new Vector3(start.x, lowestWorldY - start.y, start.z)
  const midPoint = new Vector3(mid.x, lowestWorldY - mid.y, mid.z)
  const endPoint = new Vector3(end.x, lowestWorldY - end.y, end.z)

  quat.identity()

  // optional base quaternion calculation for flipping, start with start-to-mid quaternion
  vec3.subVectors(startPoint, midPoint).normalize()
  if (needsFlipping) {
    quat.setFromAxisAngle(vec3, Math.PI)
  }

  const startQuaternion = quat.clone().multiply(new Quaternion().setFromUnitVectors(axis, vec3))

  //now calculate flip for mid-to-end quaternion
  vec3.subVectors(midPoint, endPoint).normalize()
  if (needsFlipping) {
    quat.setFromAxisAngle(vec3, Math.PI)
  }

  const midQuaternion = quat.clone().multiply(new Quaternion().setFromUnitVectors(axis, vec3))

  // convert to local space
  const startLocal = new Quaternion().copy(startQuaternion).premultiply(parentQuaternion.clone().invert())
  const midLocal = new Quaternion().copy(midQuaternion).premultiply(startQuaternion.clone().invert())

  MotionCaptureRigComponent.rig[startTargetBoneName].x[entity] = startLocal.x
  MotionCaptureRigComponent.rig[startTargetBoneName].y[entity] = startLocal.y
  MotionCaptureRigComponent.rig[startTargetBoneName].z[entity] = startLocal.z
  MotionCaptureRigComponent.rig[startTargetBoneName].w[entity] = startLocal.w

  MotionCaptureRigComponent.rig[midTargetBoneName].x[entity] = midLocal.x
  MotionCaptureRigComponent.rig[midTargetBoneName].y[entity] = midLocal.y
  MotionCaptureRigComponent.rig[midTargetBoneName].z[entity] = midLocal.z
  MotionCaptureRigComponent.rig[midTargetBoneName].w[entity] = midLocal.w
}

export const solveHand = (
  entity: Entity,
  lowestWorldY: number,
  extent: NormalizedLandmark,
  ref1: NormalizedLandmark,
  ref2: NormalizedLandmark,
  invertAxis: boolean,
  parentTargetBoneName: VRMHumanBoneName,
  extentTargetBoneName: VRMHumanBoneName,
  needsFlipping = false
) => {
  if (!extent || !ref1 || !ref2) return

  if (ref1.visibility! + ref2.visibility! + extent.visibility! < 1) return

  const rig = getComponent(entity, AvatarRigComponent)

  const parentQuaternion = rig.normalizedRig[parentTargetBoneName]!.node.getWorldQuaternion(new Quaternion())

  const startPoint = new Vector3(extent.x, lowestWorldY - extent.y, extent.z)
  const ref1Point = new Vector3(ref1.x, lowestWorldY - ref1.y, ref1.z)
  const ref2Point = new Vector3(ref2.x, lowestWorldY - ref2.y, ref2.z)

  plane.setFromCoplanarPoints(ref1Point, ref2Point, startPoint)
  directionVector.addVectors(ref1Point, ref2Point).multiplyScalar(0.5).sub(startPoint).normalize() // Calculate direction between wrist and center of tip of hand
  const orthogonalVector = plane.normal
  if (needsFlipping) {
    directionVector.reflect(V_001)
    orthogonalVector.reflect(V_001)
  }
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

  // convert to local space
  const extentQuaternionLocal = new Quaternion()
    .copy(limbExtentQuaternion)
    .premultiply(parentQuaternion.clone().invert())

  MotionCaptureRigComponent.rig[extentTargetBoneName].x[entity] = extentQuaternionLocal.x
  MotionCaptureRigComponent.rig[extentTargetBoneName].y[entity] = extentQuaternionLocal.y
  MotionCaptureRigComponent.rig[extentTargetBoneName].z[entity] = extentQuaternionLocal.z
  MotionCaptureRigComponent.rig[extentTargetBoneName].w[entity] = extentQuaternionLocal.w
}

export const solveFoot = (
  entity: Entity,
  lowestWorldY: number,
  extent: NormalizedLandmark,
  ref1: NormalizedLandmark,
  ref2: NormalizedLandmark,
  parentTargetBoneName: VRMHumanBoneName,
  extentTargetBoneName: VRMHumanBoneName,
  needsFlipping = false,
  grounded = false
) => {
  if (!extent || !ref1 || !ref2) return

  const rig = getComponent(entity, AvatarRigComponent)

  const parentQuaternion = rig.normalizedRig[parentTargetBoneName]!.node.getWorldQuaternion(new Quaternion())

  const targetQuat = new Quaternion()
  //if(grounded) {
  //  if(needsFlipping) targetQuat.copy(new Quaternion().setFromAxisAngle(V_010, Math.PI))
  //  targetQuat.premultiply(parentQuaternion.clone().invert())
  //  return
  //}

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
  targetQuat.identity().copy(limbExtentQuaternion).premultiply(parentQuaternion.clone().invert())

  MotionCaptureRigComponent.rig[extentTargetBoneName].x[entity] = targetQuat.x
  MotionCaptureRigComponent.rig[extentTargetBoneName].y[entity] = targetQuat.y
  MotionCaptureRigComponent.rig[extentTargetBoneName].z[entity] = targetQuat.z
  MotionCaptureRigComponent.rig[extentTargetBoneName].w[entity] = targetQuat.w

  rig.normalizedRig[extentTargetBoneName]?.node.quaternion.copy(targetQuat)

  rig.normalizedRig[extentTargetBoneName]!.node.updateWorldMatrix(false, false)
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

  MotionCaptureRigComponent.rig[VRMHumanBoneName.Head].x[entity] = headRotation.x
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Head].y[entity] = headRotation.y
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Head].z[entity] = headRotation.z
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Head].w[entity] = headRotation.w

  rig.normalizedRig[VRMHumanBoneName.Head]?.node.quaternion.copy(headRotation)
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
  invert = false,
  mirror = false
) => {
  plane.setFromCoplanarPoints(invert ? b : a, invert ? a : b, planeRestraint)
  const orthogonalVector = plane.normal
  directionVector.subVectors(a, b).normalize()
  if (mirror) {
    orthogonalVector.reflect(V_010)
    directionVector.reflect(V_010)
  }
  thirdVector.crossVectors(orthogonalVector, directionVector)
  rotationMatrix.makeBasis(directionVector, thirdVector, orthogonalVector)
  return target.setFromRotationMatrix(rotationMatrix)
}
