/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License") you may not use this file except in compliance
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

import { NormalizedLandmark, PoseLandmarker } from '@mediapipe/tasks-vision'
import { VRMHumanBoneList, VRMHumanBoneName } from '@pixiv/three-vrm'
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Euler,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Plane,
  Quaternion,
  SphereGeometry,
  Vector3
} from 'three'

import { getComponent, getOptionalComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { createEntity, removeEntity } from '@ir-engine/ecs/src/EntityFunctions'
import { getState } from '@ir-engine/hyperflux'
import { Vector3_Right, Vector3_Up } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { addObjectToGroup, GroupComponent } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { setObjectLayers } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { setVisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '../avatar/components/AvatarComponent'
import { NormalizedBoneComponent } from '../avatar/components/NormalizedBoneComponent'
import { LandmarkIndices } from './MocapConstants'
import { MotionCaptureRigComponent } from './MotionCaptureRigComponent'

const grey = new Color(0.5, 0.5, 0.5)

const rightFootHistory = [] as number[]
const leftFootHistory = [] as number[]
const feetIndices = { rightFoot: 0, leftFoot: 1 }
const feetGrounded = [false, false]
const footAverageDifferenceThreshold = 0.05
const footLevelDifferenceThreshold = 0.035

const worldFilterAlphaMultiplier = 0.5
const screenFilterAlphaMultiplier = 0.2

//get all strings from the list containing 'leg' or 'foot'
const lowerBody = VRMHumanBoneList.filter((bone) => /Leg|Foot|hips/i.test(bone))

/**calculates which feet are grounded. operates on the assumption that the user is on a plane,
 * such that the lowest foot with no vertical motion over the past 10 frames is always the grounded foot.
 */
export const calculateGroundedFeet = (newLandmarks: NormalizedLandmark[]) => {
  //assign right foot y to index 0, left foot y to index 1
  const footVerticalPositions = [
    newLandmarks[LandmarkIndices.RIGHT_ANKLE].y,
    newLandmarks[LandmarkIndices.LEFT_ANKLE].y
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
  Object.entries(Object.entries(LandmarkIndices)).map(([key, value]) => [value, key])
)

const drawMocapDebug = (label: string) => {
  if (!PoseLandmarker.POSE_CONNECTIONS) return () => {}

  const debugEntities = {} as Record<string, Entity>
  let lineSegmentEntity: Entity | null = null

  const positionLineSegment = new LineSegments(new BufferGeometry(), new LineBasicMaterial({ vertexColors: true }))
  positionLineSegment.material.linewidth = 4
  const posAttr = new BufferAttribute(new Float32Array(PoseLandmarker.POSE_CONNECTIONS.length * 2 * 3).fill(0), 3)
  positionLineSegment.geometry.setAttribute('position', posAttr)
  const colAttr = new BufferAttribute(new Float32Array(PoseLandmarker.POSE_CONNECTIONS.length * 2 * 4).fill(1), 4)
  positionLineSegment.geometry.setAttribute('color', colAttr)

  return (landmarks?: NormalizedLandmark[], debugEnabled?: boolean) => {
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
        const entity = createEntity()
        debugEntities[key] = entity
        addObjectToGroup(entity, mesh)
        setVisibleComponent(entity, true)
        setComponent(entity, NameComponent, `Mocap Debug ${label} ${LandmarkNames[key]}`)
        setObjectLayers(mesh, ObjectLayers.AvatarHelper)
      }
      const entity = debugEntities[key]
      const mesh = getComponent(entity, GroupComponent)[0] as any as Mesh<BufferGeometry, MeshBasicMaterial>
      mesh.material.color.set(color)
      if (key === `${LandmarkIndices.RIGHT_WRIST}`) mesh.material.color.set(0xff0000)
      if (key === `${LandmarkIndices.RIGHT_PINKY}`) mesh.material.color.set(0x00ff00)
      if (key === `${LandmarkIndices.RIGHT_INDEX}`) mesh.material.color.set(0x0000ff)

      //debug to show the acurracy of the foot grounded  estimation
      if (key === `${LandmarkIndices.LEFT_ANKLE}`) {
        mesh.material.color.setHex(feetGrounded[1] ? 0x00ff00 : 0xff0000)
      }
      if (key === `${LandmarkIndices.RIGHT_ANKLE}`) {
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

    for (let i = 0; i < PoseLandmarker.POSE_CONNECTIONS.length * 2; i += 2) {
      const { start, end } = PoseLandmarker.POSE_CONNECTIONS[i / 2]
      const firstPoint = getComponent(debugEntities[start], GroupComponent)[0] as any as Mesh<
        BufferGeometry,
        MeshBasicMaterial
      >
      const secondPoint = getComponent(debugEntities[end], GroupComponent)[0] as any as Mesh<
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
    (landmarks[LandmarkIndices.RIGHT_HIP].visibility! + landmarks[LandmarkIndices.LEFT_HIP].visibility!) * 0.5 >
    threshhold
  const kneesVisibility =
    (landmarks[LandmarkIndices.LEFT_KNEE].visibility! + landmarks[LandmarkIndices.RIGHT_KNEE].visibility!) * 0.5 >
    threshhold
  return hipsVisibility && kneesVisibility
}

export function solveMotionCapturePose(
  entity: Entity,
  newLandmarks?: NormalizedLandmark[],
  newScreenlandmarks?: NormalizedLandmark[]
) {
  const keyframeInterpolation = (
    newLandmarks: NormalizedLandmark[],
    prevLandmarks: NormalizedLandmark[],
    alphaMultiplier: number
  ) => {
    if (!prevLandmarks.length) return newLandmarks
    const filteredLandmarks = [] as NormalizedLandmark[]
    const lowPassLandmarks = [] as NormalizedLandmark[]
    for (let i = 0; i < newLandmarks.length; i++) {
      if (newLandmarks[i].visibility! < 0.1) {
        lowPassLandmarks[i] = prevLandmarks[i]
        filteredLandmarks[i] = prevLandmarks[i]
        continue
      }
      const alpha = alphaMultiplier
      lowPassLandmarks[i] = {
        visibility: MathUtils.lerp(prevLandmarks[i].visibility!, newLandmarks[i].visibility!, alpha),
        x: MathUtils.lerp(prevLandmarks[i].x, newLandmarks[i].x, newLandmarks[i].visibility!),
        y: MathUtils.lerp(prevLandmarks[i].y, newLandmarks[i].y, newLandmarks[i].visibility!),
        z: MathUtils.lerp(prevLandmarks[i].z, newLandmarks[i].z, newLandmarks[i].visibility!)
      }
      filteredLandmarks[i] = {
        visibility: MathUtils.lerp(prevLandmarks[i].visibility!, lowPassLandmarks[i].visibility!, alpha),
        x: MathUtils.lerp(prevLandmarks[i].x, lowPassLandmarks[i].x, alpha),
        y: MathUtils.lerp(prevLandmarks[i].y, lowPassLandmarks[i].y, alpha),
        z: MathUtils.lerp(prevLandmarks[i].z, lowPassLandmarks[i].z, alpha)
      }
    }
    return filteredLandmarks
  }

  const rig = getOptionalComponent(entity, AvatarRigComponent)?.bonesToEntities
  if (!rig?.hips) {
    return
  }

  if (!newLandmarks?.length || !newScreenlandmarks) return

  const avatarDebug = getState(RendererState).avatarDebug

  const mocapComponent = getComponent(entity, MotionCaptureRigComponent)

  /**@todo instead of filtering both sets of landmarks create a single mixed world/screen landmark array for filtering */
  if (!mocapComponent.prevWorldLandmarks)
    mocapComponent.prevWorldLandmarks = newLandmarks.map((landmark) => ({ ...landmark }))
  if (!mocapComponent.prevScreenLandmarks)
    mocapComponent.prevScreenLandmarks = newScreenlandmarks.map((landmark) => ({ ...landmark }))

  const worldLandmarks = keyframeInterpolation(
    newLandmarks,
    mocapComponent.prevWorldLandmarks,
    worldFilterAlphaMultiplier
  )
  const screenLandmarks = keyframeInterpolation(
    newScreenlandmarks,
    mocapComponent.prevScreenLandmarks,
    screenFilterAlphaMultiplier
  )

  mocapComponent.prevWorldLandmarks = worldLandmarks
  mocapComponent.prevScreenLandmarks = screenLandmarks

  const lowestWorldY = worldLandmarks.reduce((a, b) => (a.y > b.y ? a : b)).y
  const estimatingLowerBody = shouldEstimateLowerBody(worldLandmarks)
  MotionCaptureRigComponent.solvingLowerBody[entity] = estimatingLowerBody ? 1 : 0
  calculateGroundedFeet(worldLandmarks)

  if (entity === AvatarComponent.getSelfAvatarEntity()) {
    drawDebug(newLandmarks, avatarDebug)
    drawDebugScreen(newScreenlandmarks, !!newScreenlandmarks && avatarDebug)
    drawDebugFinal(worldLandmarks, avatarDebug)
  }

  solveSpine(entity, lowestWorldY, worldLandmarks, estimatingLowerBody)

  solveLimb(
    entity,
    lowestWorldY,
    worldLandmarks[LandmarkIndices.LEFT_SHOULDER],
    worldLandmarks[LandmarkIndices.LEFT_ELBOW],
    worldLandmarks[LandmarkIndices.LEFT_WRIST],
    new Vector3(-1, 0, 0),
    VRMHumanBoneName.Chest,
    VRMHumanBoneName.LeftUpperArm,
    VRMHumanBoneName.LeftLowerArm,
    0.75
  )
  solveLimb(
    entity,
    lowestWorldY,
    worldLandmarks[LandmarkIndices.RIGHT_SHOULDER],
    worldLandmarks[LandmarkIndices.RIGHT_ELBOW],
    worldLandmarks[LandmarkIndices.RIGHT_WRIST],
    new Vector3(1, 0, 0),
    VRMHumanBoneName.Chest,
    VRMHumanBoneName.RightUpperArm,
    VRMHumanBoneName.RightLowerArm,
    0.75
  )
  if (estimatingLowerBody) {
    solveLimb(
      entity,
      lowestWorldY,
      screenLandmarks[LandmarkIndices.LEFT_HIP],
      screenLandmarks[LandmarkIndices.LEFT_KNEE],
      screenLandmarks[LandmarkIndices.LEFT_ANKLE],
      new Vector3(0, 1, 0),
      VRMHumanBoneName.Hips,
      VRMHumanBoneName.LeftUpperLeg,
      VRMHumanBoneName.LeftLowerLeg
    )
    solveLimb(
      entity,
      lowestWorldY,
      screenLandmarks[LandmarkIndices.RIGHT_HIP],
      screenLandmarks[LandmarkIndices.RIGHT_KNEE],
      screenLandmarks[LandmarkIndices.RIGHT_KNEE],
      new Vector3(0, 1, 0),
      VRMHumanBoneName.Hips,
      VRMHumanBoneName.RightUpperLeg,
      VRMHumanBoneName.RightLowerLeg
    )

    //solveFoot(
    //  entity,
    //  lowestWorldY,
    //  screenLandmarks[POSE_LANDMARKS_LEFT.LEFT_ANKLE],
    //  screenLandmarks[POSE_LANDMARKS_LEFT.LEFT_HEEL],
    //  screenLandmarks[POSE_LANDMARKS_LEFT.LEFT_FOOT_INDEX],
    //  VRMHumanBoneName.RightLowerLeg,
    //  VRMHumanBoneName.RightFoot,
    //  feetGrounded[1]
    //)
    //solveFoot(
    //  entity,
    //  lowestWorldY,
    //  screenLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_ANKLE],
    //  screenLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_HEEL],
    //  screenLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_FOOT_INDEX],
    //  VRMHumanBoneName.LeftLowerLeg,
    //  VRMHumanBoneName.LeftFoot,
    //  feetGrounded[0]
    //)

    //check state, if we are still not set to track lower body, update that
    if (!MotionCaptureRigComponent.solvingLowerBody[entity]) {
      MotionCaptureRigComponent.solvingLowerBody[entity] = 1
    }
  } else {
    if (MotionCaptureRigComponent.solvingLowerBody[entity]) {
      MotionCaptureRigComponent.solvingLowerBody[entity] = 0
    }
    //zero bone quats to filter them out in motion capture system
    for (const boneName of lowerBody) {
      //only leg bones
      MotionCaptureRigComponent.rig[boneName].x[entity] = 0
      MotionCaptureRigComponent.rig[boneName].y[entity] = 0
      MotionCaptureRigComponent.rig[boneName].z[entity] = 0
      MotionCaptureRigComponent.rig[boneName].w[entity] = 0
    }
  }

  solveHead(
    entity,
    screenLandmarks[LandmarkIndices.RIGHT_EAR],
    screenLandmarks[LandmarkIndices.LEFT_EAR],
    screenLandmarks[LandmarkIndices.NOSE]
  )

  // solveHand(
  //  entity,
  //  lowestWorldY,
  //  screenLandmarks[POSE_LANDMARKS_LEFT.LEFT_WRIST],
  //  screenLandmarks[POSE_LANDMARKS_LEFT.LEFT_PINKY],
  //  screenLandmarks[POSE_LANDMARKS_LEFT.LEFT_INDEX],
  //  VRMHumanBoneName.RightLowerArm,
  //  VRMHumanBoneName.RightHand
  // )
  // solveHand(
  //  entity,
  //  lowestWorldY,
  //  screenLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_WRIST],
  //  screenLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_PINKY],
  //  screenLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_INDEX],
  //  VRMHumanBoneName.LeftLowerArm,
  //  VRMHumanBoneName.LeftHand
  // )
}

const threshhold = 0.6

const vec3 = new Vector3()

/**
 * The spine is the joints connecting the hips and shoulders. Given solved hips, we can solve each of the spine bones connecting the hips to the shoulders using the shoulder's position and rotation.
 */

const spineRotation = new Quaternion(),
  shoulderRotation = new Quaternion(),
  hipCenter = new Vector3(),
  fallbackShoulderQuaternion = new Quaternion(),
  hipToShoulderQuaternion = new Quaternion()

export const solveSpine = (
  entity: Entity,
  lowestWorldY: number,
  landmarks: NormalizedLandmark[],
  trackingLowerBody: boolean
) => {
  const rig = getComponent(entity, AvatarRigComponent).bonesToEntities
  const avatar = getComponent(entity, AvatarComponent)

  const rightHip = landmarks[LandmarkIndices.RIGHT_HIP]
  const leftHip = landmarks[LandmarkIndices.LEFT_HIP]

  if (!rightHip || !leftHip) return

  const rightShoulder = landmarks[LandmarkIndices.RIGHT_SHOULDER]
  const leftShoulder = landmarks[LandmarkIndices.LEFT_SHOULDER]

  if (rightShoulder.visibility! < threshhold || leftShoulder.visibility! < threshhold) return

  spineRotation.identity()
  shoulderRotation.identity()

  const hipleft = new Vector3(rightHip.x, lowestWorldY - rightHip.y, rightHip.z)
  const hipright = new Vector3(leftHip.x, lowestWorldY - leftHip.y, leftHip.z)

  if (trackingLowerBody) {
    for (let i = 0; i < 2; i++) {
      if (feetGrounded[i]) {
        const footLandmark =
          landmarks[i == feetIndices.rightFoot ? LandmarkIndices.RIGHT_ANKLE : LandmarkIndices.LEFT_ANKLE].y
        const footY = footLandmark * -1 + getComponent(rig.hips, NormalizedBoneComponent).position.y
        MotionCaptureRigComponent.footOffset[entity] = footY
      }
    }
    hipCenter.copy(hipleft).add(hipright).multiplyScalar(0.5)
  } else {
    hipCenter.copy(new Vector3(0, avatar.hipsHeight, 0))
  }

  const shoulderLeft = new Vector3(-rightShoulder.x, lowestWorldY - rightShoulder.y, -rightShoulder.z)
  const shoulderRight = new Vector3(-leftShoulder.x, lowestWorldY - leftShoulder.y, -leftShoulder.z)

  const shoulderCenter = new Vector3().copy(shoulderLeft).add(shoulderRight).multiplyScalar(0.5)
  hipToShoulderQuaternion.setFromUnitVectors(Vector3_Up, vec3.subVectors(shoulderCenter, hipCenter).normalize())

  /**@todo better hips rotation calculation needed */
  const hipWorldQuaterion = getQuaternionFromPointsAlongPlane(
    hipright,
    hipleft,
    shoulderCenter,
    new Quaternion(),
    false
  )
  hipWorldQuaterion.multiply(new Quaternion().setFromEuler(new Euler(0, Math.PI, Math.PI)))

  // const restLegLeft = rig.vrm.humanoid.normalizedRestPose[VRMHumanBoneName.LeftUpperLeg]!
  // const restLegRight = rig.vrm.humanoid.normalizedRestPose[VRMHumanBoneName.RightUpperLeg]!
  // const averageHipToLegHeight = (restLegLeft.position![1] + restLegRight.position![1]) / 2

  // multiply the hip normal quaternion by the rotation of the hips around this ne
  // const hipPositionAlongPlane = new Vector3(0, -averageHipToLegHeight, 0)
  //   .applyQuaternion(hipToShoulderQuaternion)
  //   .add(hipCenter)

  if (trackingLowerBody) {
    MotionCaptureRigComponent.hipRotation.x[entity] = hipWorldQuaterion.x
    MotionCaptureRigComponent.hipRotation.y[entity] = hipWorldQuaterion.y
    MotionCaptureRigComponent.hipRotation.z[entity] = hipWorldQuaterion.z
    MotionCaptureRigComponent.hipRotation.w[entity] = hipWorldQuaterion.w
  } else {
    if (leftHip.visibility! + rightHip.visibility! > 1) spineRotation.copy(hipWorldQuaterion)
    else {
      fallbackShoulderQuaternion.setFromUnitVectors(
        Vector3_Right,
        new Vector3().subVectors(shoulderRight, shoulderLeft)
      )
      spineRotation.copy(fallbackShoulderQuaternion)
    }
  }
  hipWorldQuaterion.set(
    MotionCaptureRigComponent.hipRotation.x[entity],
    MotionCaptureRigComponent.hipRotation.y[entity],
    MotionCaptureRigComponent.hipRotation.z[entity],
    MotionCaptureRigComponent.hipRotation.w[entity]
  )

  MotionCaptureRigComponent.hipPosition.x[entity] = hipCenter.x
  MotionCaptureRigComponent.hipPosition.y[entity] = hipCenter.y
  MotionCaptureRigComponent.hipPosition.z[entity] = hipCenter.z
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Hips].x[entity] = hipWorldQuaterion.x
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Hips].y[entity] = hipWorldQuaterion.y
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Hips].z[entity] = hipWorldQuaterion.z
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Hips].w[entity] = hipWorldQuaterion.w

  MotionCaptureRigComponent.rig[VRMHumanBoneName.Spine].x[entity] = spineRotation.x
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Spine].y[entity] = spineRotation.y
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Spine].z[entity] = spineRotation.z
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Spine].w[entity] = spineRotation.w

  MotionCaptureRigComponent.rig[VRMHumanBoneName.Chest].x[entity] = shoulderRotation.x
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Chest].y[entity] = shoulderRotation.y
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Chest].z[entity] = shoulderRotation.z
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Chest].w[entity] = shoulderRotation.w
}

const startPoint = new Vector3()
const midPoint = new Vector3()
const endPoint = new Vector3()

export const solveLimb = (
  entity: Entity,
  lowestWorldY: number,
  start: NormalizedLandmark,
  mid: NormalizedLandmark,
  end: NormalizedLandmark,
  axis: Vector3,
  parentTargetBoneName = null as VRMHumanBoneName | null,
  startTargetBoneName: VRMHumanBoneName,
  midTargetBoneName: VRMHumanBoneName,
  minimumVisibility = -1
) => {
  if (!start || !mid || !end) return

  if (minimumVisibility > -1 && (start.visibility! + mid.visibility! + end.visibility!) / 3 < minimumVisibility) return

  startPoint.set(start.x, lowestWorldY - start.y, -start.z)
  midPoint.set(mid.x, lowestWorldY - mid.y, -mid.z)
  endPoint.set(end.x, lowestWorldY - end.y, -end.z)

  const startQuaternion = new Quaternion().setFromUnitVectors(axis, vec3.subVectors(startPoint, midPoint).normalize())
  const midQuaternion = new Quaternion().setFromUnitVectors(axis, vec3.subVectors(midPoint, endPoint).normalize())

  // convert to local space
  const startLocal = new Quaternion().copy(startQuaternion)
  if (parentTargetBoneName)
    startLocal.premultiply(
      new Quaternion(
        MotionCaptureRigComponent.rig[parentTargetBoneName].x[entity],
        MotionCaptureRigComponent.rig[parentTargetBoneName].y[entity],
        MotionCaptureRigComponent.rig[parentTargetBoneName].z[entity],
        MotionCaptureRigComponent.rig[parentTargetBoneName].w[entity]
      ).invert()
    )
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

const ref1Point = new Vector3()
const ref2Point = new Vector3()

export const solveHand = (
  entity: Entity,
  lowestWorldY: number,
  extent: NormalizedLandmark,
  ref1: NormalizedLandmark,
  ref2: NormalizedLandmark,
  parentTargetBoneName: VRMHumanBoneName,
  extentTargetBoneName: VRMHumanBoneName
) => {
  if (!extent || !ref1 || !ref2) return

  if (ref1.visibility! + ref2.visibility! + extent.visibility! < 1) return

  const rig = getComponent(entity, AvatarRigComponent)

  const parentQuaternion = getComponent(rig[parentTargetBoneName], NormalizedBoneComponent).getWorldQuaternion(
    new Quaternion()
  )

  startPoint.set(extent.x, lowestWorldY - extent.y, extent.z)
  ref1Point.set(ref1.x, lowestWorldY - ref1.y, ref1.z)
  ref2Point.set(ref2.x, lowestWorldY - ref2.y, ref2.z)

  plane.setFromCoplanarPoints(ref1Point, ref2Point, startPoint)
  directionVector.addVectors(ref1Point, ref2Point).multiplyScalar(0.5).sub(startPoint).normalize() // Calculate direction between wrist and center of tip of hand
  const orthogonalVector = plane.normal
  thirdVector.crossVectors(directionVector, orthogonalVector)

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
  grounded = false
) => {
  if (!extent || !ref1 || !ref2) return

  const rig = getComponent(entity, AvatarRigComponent)

  const parentQuaternion = getComponent(rig[parentTargetBoneName], NormalizedBoneComponent).getWorldQuaternion(
    new Quaternion()
  )

  const targetQuat = new Quaternion()
  if (grounded) {
    targetQuat.premultiply(parentQuaternion.clone().invert())
  } else {
    // const startPoint = new Vector3(extent.x, lowestWorldY - extent.y, extent.z)
    // const ref1Point = new Vector3(ref1.x, lowestWorldY - ref1.y, ref1.z)
    // const ref2Point = new Vector3(ref2.x, lowestWorldY - ref2.y, ref2.z)
    // plane.setFromCoplanarPoints(ref1Point, ref2Point, startPoint)
    // directionVector.subVectors(startPoint, ref2Point).normalize()
    // const orthogonalVector = plane.normal
    // thirdVector.crossVectors(orthogonalVector, directionVector)
    // // for the hands, negative x is forward, palm up is negative y, thumb side is positive z on left hand, negative z on right hand
    // rotationMatrix.makeBasis(directionVector, orthogonalVector, thirdVector)
    // const limbExtentQuaternion = new Quaternion().setFromRotationMatrix(rotationMatrix)
    // convert to local space
    // targetQuat.identity().copy(limbExtentQuaternion).premultiply(parentQuaternion.clone().invert())
  }

  MotionCaptureRigComponent.rig[extentTargetBoneName].x[entity] = targetQuat.x
  MotionCaptureRigComponent.rig[extentTargetBoneName].y[entity] = targetQuat.y
  MotionCaptureRigComponent.rig[extentTargetBoneName].z[entity] = targetQuat.z
  MotionCaptureRigComponent.rig[extentTargetBoneName].w[entity] = targetQuat.w
}

const headRotation = new Quaternion()
const leftEarVec3 = new Vector3()
const rightEarVec3 = new Vector3()
const noseVec3 = new Vector3()

const rotate90degreesAroundXAxis = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2)

export const solveHead = (
  entity: Entity,
  leftEar: NormalizedLandmark,
  rightEar: NormalizedLandmark,
  nose: NormalizedLandmark
) => {
  leftEarVec3.set(-leftEar.x, -leftEar.y, -leftEar.z)
  rightEarVec3.set(-rightEar.x, -rightEar.y, -rightEar.z)
  noseVec3.set(-nose.x, -nose.y, -nose.z)

  getQuaternionFromPointsAlongPlane(leftEarVec3, rightEarVec3, noseVec3, headRotation, true)

  headRotation.multiply(rotate90degreesAroundXAxis)

  MotionCaptureRigComponent.rig[VRMHumanBoneName.Head].x[entity] = headRotation.x
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Head].y[entity] = headRotation.y
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Head].z[entity] = headRotation.z
  MotionCaptureRigComponent.rig[VRMHumanBoneName.Head].w[entity] = headRotation.w
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
  thirdVector.crossVectors(orthogonalVector, invert ? directionVector.reflect(new Vector3(0, 1, 0)) : directionVector)
  rotationMatrix.makeBasis(directionVector, thirdVector, orthogonalVector)
  return target.setFromRotationMatrix(rotationMatrix)
}
