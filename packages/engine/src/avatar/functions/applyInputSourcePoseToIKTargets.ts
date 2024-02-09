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

import { Euler, Quaternion, Vector3 } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { ECS, Engine, Entity } from '@etherealengine/ecs'
import { getState } from '@etherealengine/hyperflux'
import { UUIDComponent } from '@etherealengine/spatial/src/common/UUIDComponent'
import { Q_Y_180 } from '@etherealengine/spatial/src/common/constants/MathConstants'
import { InputSourceComponent } from '@etherealengine/spatial/src/input/components/InputSourceComponent'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { ReferenceSpace, XRControlsState, XRState } from '@etherealengine/spatial/src/xr/XRState'
import { ikTargets } from '../animation/Util'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarIKTargetComponent } from '../components/AvatarIKComponents'

declare global {
  interface XRFrame {
    fillPoses?: (poses: Iterable<XRJointSpace>, baseSpace: XRSpace, output: Float32Array) => void
    fillJointRadii?: (joints: Iterable<XRJointSpace>, output: Float32Array) => void
  }
}

// const handJointPoses = new Float32Array(16 * 25)
// const jointWorld = new Matrix4()
// const parentJointWorldInv = new Matrix4()
// const jointLocal = new Matrix4()
// const jointQuat = new Quaternion()

// /**
//  * Gets world space pose for each joint in the hand and stores the rotation in an XRHandComponent in local space
//  * @param inputSource
//  * @param entity
//  */
// const applyHandPose = (inputSource: XRInputSource, entity: Entity) => {
//   const hand = inputSource.hand!
//   const xrFrame = getState(XRState).xrFrame!

//   if (xrFrame.fillPoses) {
//     xrFrame.fillPoses(hand.values(), inputSource.targetRaySpace, handJointPoses)
//   } else {
//     // use getPose api as fallback
//     for (const joint of hand.values()) {
//       const pose = xrFrame.getPose(joint, inputSource.targetRaySpace)
//       if (pose) {
//         const index = XRJointBones.indexOf(joint.jointName)
//         handJointPoses.set(pose.transform.matrix, index * 16)
//       }
//     }
//   }

//   const HandComponent = inputSource.handedness === 'right' ? XRRightHandComponent : XRHandComponent
//   const rotations = getComponent(entity, HandComponent).rotations

//   // const wristMatrix = new Matrix4().fromArray(
//   //   xrFrame.getPose(inputSource.gripSpace!, ReferenceSpace.origin!)!.transform.matrix
//   // )

//   // start at 1 as we can skip wrist
//   for (let i = 1; i < 25; i++) {
//     const joint = XRJointBones[i]

//     if (joint.includes('tip')) continue

//     const parentJoint = XRJointParentMap[joint]

//     if (!parentJoint) continue

//     // if (!helpers[inputSource.handedness + joint]) {
//     //   helpers[inputSource.handedness + joint] = new AxesHelper(0.05)
//     //   helpers[inputSource.handedness + joint].name = inputSource.handedness + joint + ' helper'
//     //   Engine.instance.scene.add(helpers[inputSource.handedness + joint])
//     // }
//     // helpers[inputSource.handedness + joint].matrixWorld.copy(matrixWorld).premultiply(wristMatrix)

//     const parentIndex = XRJointBones.indexOf(parentJoint)

//     // get local space rotation
//     parentJointWorldInv.fromArray(handJointPoses, parentIndex * 16).invert()
//     jointWorld.fromArray(handJointPoses, i * 16)
//     jointLocal.multiplyMatrices(jointWorld, parentMatrixWorld)

//     jointQuat.setFromRotationMatrix(jointLocal)
//     if (joint === 'thumb-metacarpal')
//       jointQuat.multiply(inputSource.handedness == 'right' ? rightControllerOffset : leftControllerOffset)

//     jointQuat.invert()

//     const boneIndex = Object.keys(XRJointAvatarBoneMap).indexOf(joint)

//     jointQuat.toArray(rotations, boneIndex * 4)
//   }
// }

//set offsets so hands align with controllers.
export const leftControllerOffset = new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0))
export const rightControllerOffset = new Quaternion().setFromEuler(new Euler(0, -Math.PI / 2, 0))
const inputSources = ECS.defineQuery([InputSourceComponent])

/**
 * Pulls pose data from input sources into the ECS
 */
export const applyInputSourcePoseToIKTargets = (localClientEntity: Entity) => {
  const xrFrame = getState(XRState).xrFrame!
  const originSpace = ReferenceSpace.origin

  const uuid = ECS.getComponent(localClientEntity, UUIDComponent)
  const ikTargetLeftHandEid = UUIDComponent.getEntityByUUID((uuid + ikTargets.leftHand) as EntityUUID)
  const ikTargetRightHandEid = UUIDComponent.getEntityByUUID((uuid + ikTargets.rightHand) as EntityUUID)
  const ikTargetHeadEid = UUIDComponent.getEntityByUUID((uuid + ikTargets.head) as EntityUUID)
  const ikTargetLeftFootEid = UUIDComponent.getEntityByUUID((uuid + ikTargets.leftFoot) as EntityUUID)
  const ikTargetRightFootEid = UUIDComponent.getEntityByUUID((uuid + ikTargets.rightFoot) as EntityUUID)

  // reset all IK targets
  if (ikTargetHeadEid) AvatarIKTargetComponent.blendWeight[ikTargetHeadEid] = 0
  if (ikTargetLeftHandEid) AvatarIKTargetComponent.blendWeight[ikTargetLeftHandEid] = 0
  if (ikTargetRightHandEid) AvatarIKTargetComponent.blendWeight[ikTargetRightHandEid] = 0
  if (ikTargetLeftFootEid) AvatarIKTargetComponent.blendWeight[ikTargetLeftFootEid] = 0
  if (ikTargetRightFootEid) AvatarIKTargetComponent.blendWeight[ikTargetRightFootEid] = 0

  const isInXR = xrFrame && originSpace
  if (!isInXR) {
    return
  }

  const { isCameraAttachedToAvatar } = getState(XRControlsState)

  /** Head */
  if (isCameraAttachedToAvatar && ikTargetHeadEid) {
    const cameraTransform = ECS.getComponent(Engine.instance.cameraEntity, TransformComponent)
    const ikTransform = ECS.getComponent(ikTargetHeadEid, TransformComponent)
    ikTransform.position.copy(cameraTransform.position)
    ikTransform.rotation.copy(cameraTransform.rotation).multiply(Q_Y_180)
    AvatarIKTargetComponent.blendWeight[ikTargetHeadEid] = 1
    const rigComponent = ECS.getComponent(localClientEntity, AvatarRigComponent)
    const avatar = ECS.getComponent(localClientEntity, AvatarComponent)
    if (rigComponent) {
      const avatarTransform = ECS.getComponent(localClientEntity, TransformComponent)
      if (cameraTransform.position.y - avatarTransform.position.y < avatar.avatarHeight) {
        AvatarIKTargetComponent.blendWeight[ikTargetLeftFootEid] = 1
        AvatarIKTargetComponent.blendWeight[ikTargetRightFootEid] = 1
      }
    }
  }

  /** In miniature mode, IK doesn't make much sense */
  if (!isCameraAttachedToAvatar) return

  for (const inputSourceEntity of inputSources()) {
    const inputSourceComponent = ECS.getComponent(inputSourceEntity, InputSourceComponent)
    const handedness = inputSourceComponent.source.handedness
    if (handedness === 'none') continue
    const ikTargetEntity = handedness === 'right' ? ikTargetRightHandEid : ikTargetLeftHandEid
    if (ikTargetEntity) {
      const ikTransform = ECS.getComponent(ikTargetEntity, TransformComponent)
      const wristSpace = inputSourceComponent.source.hand?.get('wrist')
      const gripSpace = inputSourceComponent.source.gripSpace
      const targetRaySpace = inputSourceComponent.source.targetRaySpace
      const rotationOffset = handedness === 'right' ? rightControllerOffset : leftControllerOffset

      let pose: XRPose | undefined = wristSpace && xrFrame.getJointPose?.(wristSpace, originSpace)
      if (!pose && gripSpace) {
        pose = xrFrame.getPose(gripSpace, originSpace)
      }
      if (!pose && targetRaySpace) {
        pose = xrFrame.getPose(targetRaySpace, originSpace)
      }

      if (pose) {
        ikTransform.position.copy(pose.transform.position as unknown as Vector3)
        ikTransform.rotation.copy(pose.transform.orientation as unknown as Quaternion).multiply(rotationOffset)

        // TODO: blendwieght should be managed by the animation system
        AvatarIKTargetComponent.blendWeight[ikTargetEntity] = 1
      }
    }
  }
}
