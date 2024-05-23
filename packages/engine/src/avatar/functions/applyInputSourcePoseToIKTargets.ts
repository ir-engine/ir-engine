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

import { Euler, Matrix4, Quaternion, Vector3 } from 'three'

import { UserID } from '@etherealengine/common/src/schema.type.module'
import { defineQuery } from '@etherealengine/ecs'
import { getComponent, hasComponent, removeComponent, setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { getState } from '@etherealengine/hyperflux'
import { Q_Y_180 } from '@etherealengine/spatial/src/common/constants/MathConstants'
import { InputSourceComponent } from '@etherealengine/spatial/src/input/components/InputSourceComponent'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import {
  XRJointAvatarBoneMap,
  XRJointBones,
  XRJointParentMap,
  XRLeftHandComponent,
  XRRightHandComponent
} from '@etherealengine/spatial/src/xr/XRComponents'
import { ReferenceSpace, XRControlsState, XRState } from '@etherealengine/spatial/src/xr/XRState'

import { ikTargets } from '../animation/Util'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarIKTargetComponent } from '../components/AvatarIKComponents'

const matrixWorld = new Matrix4()
const parentMatrixWorld = new Matrix4()
const localMatrix = new Matrix4()
const quat = new Quaternion()

declare global {
  interface XRFrame {
    fillPoses?: (poses: Iterable<XRJointSpace>, baseSpace: XRSpace, output: Float32Array) => void
    fillJointRadii?: (joints: Iterable<XRJointSpace>, output: Float32Array) => void
  }
}

const helpers = {}
/**
 * Gets world space pose for each joint in the hand and stores the rotation in an XRHandComponent in local space
 * @param inputSource
 * @param entity
 */
const applyHandPose = (inputSource: XRInputSource, entity: Entity) => {
  const hand = inputSource.hand!
  const xrFrame = getState(XRState).xrFrame!
  const poses = new Float32Array(16 * 25)

  xrFrame.fillPoses!(hand.values(), inputSource.gripSpace!, poses)

  const component = inputSource.handedness === 'right' ? XRRightHandComponent : XRLeftHandComponent
  const rotations = getComponent(entity, component).rotations

  // const wristMatrix = new Matrix4().fromArray(
  //   xrFrame.getPose(inputSource.gripSpace!, ReferenceSpace.origin!)!.transform.matrix
  // )

  // start at 1 as we can skip wrist
  for (let i = 1; i < 25; i++) {
    const joint = XRJointBones[i]

    if (joint.includes('tip')) continue

    const parentJoint = XRJointParentMap[joint]

    if (!parentJoint) continue

    // if (!helpers[inputSource.handedness + joint]) {
    //   helpers[inputSource.handedness + joint] = new AxesHelper(0.05)
    //   helpers[inputSource.handedness + joint].name = inputSource.handedness + joint + ' helper'
    //   Engine.instance.scene.add(helpers[inputSource.handedness + joint])
    // }
    // helpers[inputSource.handedness + joint].matrixWorld.copy(matrixWorld).premultiply(wristMatrix)

    const parentIndex = XRJointBones.indexOf(parentJoint)

    // get local space rotation
    parentMatrixWorld.fromArray(poses, parentIndex * 16).invert()
    matrixWorld.fromArray(poses, i * 16)
    localMatrix.multiplyMatrices(matrixWorld, parentMatrixWorld)

    quat.setFromRotationMatrix(localMatrix)
    if (joint === 'thumb-metacarpal')
      quat.multiply(inputSource.handedness == 'right' ? rightControllerOffset : leftControllerOffset)

    quat.invert()

    const boneIndex = Object.keys(XRJointAvatarBoneMap).indexOf(joint)

    quat.toArray(rotations, boneIndex * 4)
  }
}

//set offsets so hands align with controllers.
export const leftControllerOffset = new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0))
export const rightControllerOffset = new Quaternion().setFromEuler(new Euler(0, -Math.PI / 2, 0))

const inputSourceQuery = defineQuery([InputSourceComponent])

/**
 * Pulls pose data from input sources into the ECS
 */
export const applyInputSourcePoseToIKTargets = (userID: UserID) => {
  const xrFrame = getState(XRState).xrFrame!
  const referenceSpace = ReferenceSpace.origin

  const localClientEntity = AvatarComponent.getUserAvatarEntity(userID)

  const ikTargetLeftHand = AvatarIKTargetComponent.getTargetEntity(userID, ikTargets.leftHand)
  const ikTargetRightHand = AvatarIKTargetComponent.getTargetEntity(userID, ikTargets.rightHand)
  const ikTargetHead = AvatarIKTargetComponent.getTargetEntity(userID, ikTargets.head)
  const ikTargetLeftFoot = AvatarIKTargetComponent.getTargetEntity(userID, ikTargets.leftFoot)
  const ikTargetRightFoot = AvatarIKTargetComponent.getTargetEntity(userID, ikTargets.rightFoot)

  // reset all IK targets
  if (ikTargetHead) AvatarIKTargetComponent.blendWeight[ikTargetHead] = 0
  if (ikTargetLeftHand) AvatarIKTargetComponent.blendWeight[ikTargetLeftHand] = 0
  if (ikTargetRightHand) AvatarIKTargetComponent.blendWeight[ikTargetRightHand] = 0
  if (ikTargetLeftFoot) AvatarIKTargetComponent.blendWeight[ikTargetLeftFoot] = 0
  if (ikTargetRightFoot) AvatarIKTargetComponent.blendWeight[ikTargetRightFoot] = 0

  const isInXR = xrFrame && referenceSpace
  if (!isInXR) {
    return
  }

  const { isCameraAttachedToAvatar } = getState(XRControlsState)

  /** Head */
  if (isCameraAttachedToAvatar && ikTargetHead) {
    const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
    const ikTransform = getComponent(ikTargetHead, TransformComponent)
    ikTransform.position.copy(cameraTransform.position)
    ikTransform.rotation.copy(cameraTransform.rotation).multiply(Q_Y_180)
    AvatarIKTargetComponent.blendWeight[ikTargetHead] = 1
    const rigComponent = getComponent(localClientEntity, AvatarRigComponent)
    const avatar = getComponent(localClientEntity, AvatarComponent)
    if (rigComponent) {
      const avatarTransform = getComponent(localClientEntity, TransformComponent)
      if (cameraTransform.position.y - avatarTransform.position.y < avatar.avatarHeight) {
        AvatarIKTargetComponent.blendWeight[ikTargetLeftFoot] = 1
        AvatarIKTargetComponent.blendWeight[ikTargetRightFoot] = 1
      }
    }
  }

  /** In miniature mode, IK doesn't make much sense */
  if (!isCameraAttachedToAvatar) return

  const inverseWorldScale = 1 / XRState.worldScale

  const localClientTransform = getComponent(localClientEntity, TransformComponent)

  for (const inputSourceEntity of inputSourceQuery()) {
    const inputSourceComponent = getComponent(inputSourceEntity, InputSourceComponent)
    const handedness = inputSourceComponent.source.handedness
    if (handedness === 'none') continue

    const entity = handedness === 'right' ? ikTargetRightHand : ikTargetLeftHand
    const XRHandComponent = handedness === 'right' ? XRRightHandComponent : XRLeftHandComponent
    if (entity) {
      const ikTransform = getComponent(entity, TransformComponent)
      const hand = inputSourceComponent.source.hand as XRHand | undefined
      /** detect hand joint pose support */
      if (hand && xrFrame.fillPoses && xrFrame.getJointPose) {
        if (!hasComponent(localClientEntity, XRHandComponent)) {
          setComponent(localClientEntity, XRHandComponent, { hand })
        }
        const wrist = hand.get('wrist')
        if (wrist) {
          const jointPose = xrFrame.getJointPose(wrist, referenceSpace)
          if (jointPose) {
            ikTransform.position.copy(jointPose.transform.position as unknown as Vector3)
            // .sub(localClientTransform.position)
            // .multiplyScalar(inverseWorldScale)
            // .add(localClientTransform.position)
            ikTransform.rotation
              .copy(jointPose.transform.orientation as unknown as Quaternion)
              .multiply(handedness === 'right' ? rightControllerOffset : leftControllerOffset)
          }
        }
        applyHandPose(inputSourceComponent.source, localClientEntity)

        AvatarIKTargetComponent.blendWeight[entity] = 1
      } else {
        removeComponent(localClientEntity, XRHandComponent)
        if (inputSourceComponent.source.gripSpace) {
          const pose = xrFrame.getPose(inputSourceComponent.source.gripSpace, referenceSpace)
          if (pose) {
            ikTransform.position.copy(pose.transform.position as any as Vector3)
            // .sub(localClientTransform.position)
            // .multiplyScalar(inverseWorldScale)
            // .add(localClientTransform.position)
            ikTransform.rotation
              .copy(pose.transform.orientation as any as Quaternion)
              .multiply(handedness === 'right' ? rightControllerOffset : leftControllerOffset)

            AvatarIKTargetComponent.blendWeight[entity] = 1
          }
        } else {
          const pose = xrFrame.getPose(inputSourceComponent.source.targetRaySpace, referenceSpace)
          if (pose) {
            ikTransform.position.copy(pose.transform.position as any as Vector3)
            ikTransform.rotation
              .copy(pose.transform.orientation as any as Quaternion)
              .multiply(handedness === 'right' ? rightControllerOffset : leftControllerOffset)

            AvatarIKTargetComponent.blendWeight[entity] = 1
          }
        }
      }
    }
  }
}
