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

import { Bone, Euler, Matrix4, Quaternion, Vector3 } from 'three'

import { getState } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, hasComponent, removeComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { InputSourceComponent } from '../../input/components/InputSourceComponent'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRHand, XRLeftHandComponent, XRRightHandComponent } from '../../xr/XRComponents'
import { ReferenceSpace, XRControlsState, XRState } from '../../xr/XRState'
import { BoneStructure } from '../AvatarBoneMatching'
import { ikTargets } from '../animation/Util'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarIKTargetComponent } from '../components/AvatarIKComponents'

// rotate +90 around rig finger's X axis
// rotate +90 around rig finger's Z axis
const webxrJointRotation = new Matrix4().makeRotationFromQuaternion(
  new Quaternion()
    .setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2)
    .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2))
)

/**
 * Returns the bone name for a given XRHandJoint
 * - Gracefully degrades to fewer bones if the rig doesn't have them
 *
 * @param joint
 * @param rig
 */
export const getBoneNameFromXRHand = (side: XRHandedness, joint: XRHandJoint, rig: BoneStructure): Bone | undefined => {
  const handedness = side.slice(0, 1).toUpperCase() + side.slice(1)

  if (joint.includes('wrist')) return rig[`${handedness}Hand`]

  if (joint.includes('thumb')) {
    const thumbCount = [
      rig[`${handedness}HandThumb1`],
      rig[`${handedness}HandThumb2`],
      rig[`${handedness}HandThumb3`],
      rig[`${handedness}HandThumb4`]
    ].filter((bone) => bone).length

    if (!thumbCount) return
    if (thumbCount === 1) return rig[`${handedness}HandThumb1`]
    if (thumbCount === 2)
      return joint === 'thumb-tip' || joint === 'thumb-phalanx-distal'
        ? rig[`${handedness}HandThumb2`]
        : rig[`${handedness}HandThumb1`]

    switch (joint) {
      case 'thumb-metacarpal':
        return rig[`${handedness}HandThumb${thumbCount - 3}`]
      case 'thumb-phalanx-proximal':
        return rig[`${handedness}HandThumb${thumbCount - 2}`]
      case 'thumb-phalanx-distal':
        return rig[`${handedness}HandThumb${thumbCount - 1}`]
      case 'thumb-tip':
        return rig[`${handedness}HandThumb${thumbCount}`]
    }
  }

  if (joint.includes('index')) {
    const indexFingerCount = [
      rig[`${handedness}HandIndex1`],
      rig[`${handedness}HandIndex2`],
      rig[`${handedness}HandIndex3`],
      rig[`${handedness}HandIndex4`],
      rig[`${handedness}HandIndex5`]
    ].filter((bone) => bone).length

    if (!indexFingerCount) return
    if (indexFingerCount === 1) return rig[`${handedness}HandIndex1`]
    if (indexFingerCount === 2)
      return joint === 'index-finger-tip' || joint === 'index-finger-phalanx-distal'
        ? rig[`${handedness}HandIndex2`]
        : rig[`${handedness}HandIndex1`]

    switch (joint) {
      case 'index-finger-metacarpal':
        return rig[`${handedness}HandIndex${indexFingerCount - 4}`]
      case 'index-finger-phalanx-proximal':
        return rig[`${handedness}HandIndex${indexFingerCount - 3}`]
      case 'index-finger-phalanx-intermediate':
        return rig[`${handedness}HandIndex${indexFingerCount - 2}`]
      case 'index-finger-phalanx-distal':
        return rig[`${handedness}HandIndex${indexFingerCount - 1}`]
      case 'index-finger-tip':
        return rig[`${handedness}HandIndex${indexFingerCount}`]
    }
  }

  if (joint.includes('middle')) {
    const middleFingerCount = [
      rig[`${handedness}HandMiddle1`],
      rig[`${handedness}HandMiddle2`],
      rig[`${handedness}HandMiddle3`],
      rig[`${handedness}HandMiddle4`],
      rig[`${handedness}HandMiddle5`]
    ].filter((bone) => bone).length

    if (!middleFingerCount) return
    if (middleFingerCount === 1) return rig[`${handedness}HandMiddle1`]
    if (middleFingerCount === 2)
      return joint === 'middle-finger-tip' || joint === 'middle-finger-phalanx-distal'
        ? rig[`${handedness}HandMiddle2`]
        : rig[`${handedness}HandMiddle1`]

    switch (joint) {
      case 'middle-finger-metacarpal':
        return rig[`${handedness}HandMiddle${middleFingerCount - 4}`]
      case 'middle-finger-phalanx-proximal':
        return rig[`${handedness}HandMiddle${middleFingerCount - 3}`]
      case 'middle-finger-phalanx-intermediate':
        return rig[`${handedness}HandMiddle${middleFingerCount - 2}`]
      case 'middle-finger-phalanx-distal':
        return rig[`${handedness}HandMiddle${middleFingerCount - 1}`]
      case 'middle-finger-tip':
        return rig[`${handedness}HandMiddle${middleFingerCount}`]
    }
  }

  if (joint.includes('ring')) {
    const ringFingerCount = [
      rig[`${handedness}HandRing1`],
      rig[`${handedness}HandRing2`],
      rig[`${handedness}HandRing3`],
      rig[`${handedness}HandRing4`],
      rig[`${handedness}HandRing5`]
    ].filter((bone) => bone).length

    if (!ringFingerCount) return
    if (ringFingerCount === 1) return rig[`${handedness}HandRing1`]
    if (ringFingerCount === 2)
      return joint === 'ring-finger-tip' || joint === 'ring-finger-phalanx-distal'
        ? rig[`${handedness}HandRing2`]
        : rig[`${handedness}HandRing1`]

    switch (joint) {
      case 'ring-finger-metacarpal':
        return rig[`${handedness}HandRing${ringFingerCount - 4}`]
      case 'ring-finger-phalanx-proximal':
        return rig[`${handedness}HandRing${ringFingerCount - 3}`]
      case 'ring-finger-phalanx-intermediate':
        return rig[`${handedness}HandRing${ringFingerCount - 2}`]
      case 'ring-finger-phalanx-distal':
        return rig[`${handedness}HandRing${ringFingerCount - 1}`]
      case 'ring-finger-tip':
        return rig[`${handedness}HandRing${ringFingerCount}`]
    }
  }

  if (joint.includes('pinky')) {
    const pinkyFingerCount = [
      rig[`${handedness}HandPinky1`],
      rig[`${handedness}HandPinky2`],
      rig[`${handedness}HandPinky3`],
      rig[`${handedness}HandPinky4`],
      rig[`${handedness}HandPinky5`]
    ].filter((bone) => bone).length

    if (!pinkyFingerCount) return
    if (pinkyFingerCount === 1) return rig[`${handedness}HandPinky1`]
    if (pinkyFingerCount === 2)
      return joint === 'pinky-finger-tip' || joint === 'pinky-finger-phalanx-distal'
        ? rig[`${handedness}HandPinky2`]
        : rig[`${handedness}HandPinky1`]

    switch (joint) {
      case 'pinky-finger-metacarpal':
        return rig[`${handedness}HandPinky${pinkyFingerCount - 4}`]
      case 'pinky-finger-phalanx-proximal':
        return rig[`${handedness}HandPinky${pinkyFingerCount - 3}`]
      case 'pinky-finger-phalanx-intermediate':
        return rig[`${handedness}HandPinky${pinkyFingerCount - 2}`]
      case 'pinky-finger-phalanx-distal':
        return rig[`${handedness}HandPinky${pinkyFingerCount - 1}`]
      case 'pinky-finger-tip':
        return rig[`${handedness}HandPinky${pinkyFingerCount}`]
    }
  }
}

const emptyVec = new Vector3()
const mat4 = new Matrix4()

const matrixWorld = new Matrix4()
const matrix = new Matrix4()

const thumbOffsetRadians = -Math.PI / 2
const offsetMatrix = new Matrix4()

const applyHandPose = (inputSource: XRInputSource, entity: Entity) => {
  const rig = getComponent(entity, AvatarRigComponent)

  /*  const hand = inputSource.hand as any as XRHand
  const rig = getComponent(entity, AvatarRigComponent)
  const referenceSpace = ReferenceSpace.origin!
  const xrFrame = getState(XRState).xrFrame!
  const poses1 = new Float32Array(16 * 25)

  xrFrame.fillPoses!(hand.values(), referenceSpace, poses1)

  for (let i = 0; i < XRJointBones.length; i++) {
    const joint = XRJointBones[i]

    if (joint === 'wrist') continue
    const bone = getBoneNameFromXRHand(inputSource.handedness, joint, rig.rig)
    if (bone) {
      matrixWorld.fromArray(poses1, i * 16)

      matrix.multiplyMatrices(mat4.copy(bone.parent!.matrixWorld).invert(), matrixWorld)

      offsetMatrix.identity()
      //Needs branching code to account for joint offsets / misalignment in the current avatar rig
      if (joint.startsWith('thumb-')) {
        offsetMatrix.makeRotationY(thumbOffsetRadians)
        matrix.multiply(offsetMatrix)
      } else {
        offsetMatrix.makeRotationX(thumbOffsetRadians)
        matrix.multiply(offsetMatrix)
      }

      matrix.decompose(emptyVec, bone.quaternion, emptyVec)
    }
  }
*/
}

const handOffsetRadians = Math.PI / 2.5
const rightHandOffset = new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0))
const leftHandOffset = new Quaternion().setFromEuler(new Euler(0, -Math.PI / 2, 0))

const footBlendTransitionMultiplier = 0.5

//set offsets so hands align with controllers. Multiplying two quaternions because gimbal lock in euler angles prevents setting the offset in one quaternion
const leftControllerOffset = new Quaternion()
  .setFromEuler(new Euler(0, -Math.PI / 2, 0))
  .multiply(new Quaternion().setFromEuler(new Euler(Math.PI / 4, 0, 0)))
const rightControllerOffset = new Quaternion()
  .setFromEuler(new Euler(0, Math.PI / 2, 0))
  .multiply(new Quaternion().setFromEuler(new Euler(Math.PI / 4, 0, 0)))

/**
 * Pulls pose data from input sources into the ECS
 */
export const applyInputSourcePoseToIKTargets = (localClientEntity: Entity) => {
  const xrFrame = getState(XRState).xrFrame!
  const referenceSpace = ReferenceSpace.origin

  const uuid = getComponent(localClientEntity, UUIDComponent)
  const ikTargetLeftHand = UUIDComponent.entitiesByUUID[uuid + ikTargets.leftHand]
  const ikTargetRightHand = UUIDComponent.entitiesByUUID[uuid + ikTargets.rightHand]
  const ikTargetHead = UUIDComponent.entitiesByUUID[uuid + ikTargets.head]
  const ikTargetLeftFoot = UUIDComponent.entitiesByUUID[uuid + ikTargets.leftFoot]
  const ikTargetRightFoot = UUIDComponent.entitiesByUUID[uuid + ikTargets.rightFoot]

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
    ikTransform.rotation.copy(cameraTransform.rotation)
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

  const inverseWorldScale = 1 / XRState.worldScale

  const localClientTransform = getComponent(localClientEntity, TransformComponent)
  const nonCapturedInputSourceEntities = InputSourceComponent.nonCapturedInputSourceQuery()

  for (const inputSourceEntity of nonCapturedInputSourceEntities) {
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
            ikTransform.position
              .copy(jointPose.transform.position as unknown as Vector3)
              .sub(localClientTransform.position)
              .multiplyScalar(inverseWorldScale)
              .add(localClientTransform.position)
            ikTransform.rotation.copy(jointPose.transform.orientation as unknown as Quaternion)
            ikTransform.rotation.multiply(handedness === 'right' ? rightHandOffset : leftHandOffset)
          }
        }
        applyHandPose(inputSourceComponent.source, localClientEntity)

        AvatarIKTargetComponent.blendWeight[entity] = 1
      } else {
        removeComponent(localClientEntity, XRHandComponent)
        if (inputSourceComponent.source.gripSpace) {
          const pose = xrFrame.getPose(inputSourceComponent.source.gripSpace, referenceSpace)
          if (pose) {
            ikTransform.position
              .copy(pose.transform.position as any as Vector3)
              .sub(localClientTransform.position)
              .multiplyScalar(inverseWorldScale)
              .add(localClientTransform.position)
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
