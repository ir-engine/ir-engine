import { Bone, Matrix4, Quaternion, Vector3 } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, hasComponent, removeComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRHand, XRJointBones, XRLeftHandComponent, XRRightHandComponent } from '../../xr/XRComponents'
import { getCameraMode, ReferenceSpace } from '../../xr/XRState'
import { BoneStructure } from '../AvatarBoneMatching'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import {
  AvatarHeadIKComponent,
  AvatarIKTargetsComponent,
  AvatarLeftArmIKComponent,
  AvatarRightArmIKComponent
} from '../components/AvatarIKComponents'

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

type XRFrameWithFillPoses = XRFrame & {
  fillPoses?: (poses: Iterable<XRJointSpace>, baseSpace: XRSpace, output: Float32Array) => void
  fillJointRadii?: (joints: Iterable<XRJointSpace>, output: Float32Array) => void
}

const emptyVec = new Vector3()

const mat4 = new Matrix4()

const applyHandPose = (inputSource: XRInputSource, entity: Entity) => {
  const hand = inputSource.hand as any as XRHand
  const rig = getComponent(entity, AvatarRigComponent)
  const referenceSpace = ReferenceSpace.origin!
  const xrFrame = Engine.instance.xrFrame as XRFrameWithFillPoses
  const poses1 = new Float32Array(16 * 25)
  const radii1 = new Float32Array(25)

  xrFrame.fillPoses!(hand.values(), referenceSpace, poses1)
  // xrFrame.fillJointRadii!(hand.values(), radii1)

  for (let i = 0; i < XRJointBones.length; i++) {
    const joint = XRJointBones[i]
    if (joint === 'wrist') continue
    const bone = getBoneNameFromXRHand(inputSource.handedness, joint, rig.rig)
    if (bone) {
      bone.matrixWorld.fromArray(poses1, i * 16) //.multiply(webxrJointRotation)
      bone.matrix.multiplyMatrices(mat4.copy(bone.parent!.matrixWorld).invert(), bone.matrixWorld)
      bone.matrix.decompose(bone.position, bone.quaternion, emptyVec)
    }
  }
}

export const applyInputSourcePoseToIKTargets = () => {
  const world = Engine.instance.currentWorld
  const { localClientEntity } = world

  const xrFrame = Engine.instance.xrFrame! as XRFrameWithFillPoses

  const inAttachedControlMode = getCameraMode() === 'attached'

  const referenceSpace = ReferenceSpace.origin

  /** Update controller pose input sources from WebXR into the ECS */
  if (xrFrame && referenceSpace && hasComponent(localClientEntity, AvatarIKTargetsComponent)) {
    /** Head */
    if (inAttachedControlMode && hasComponent(localClientEntity, AvatarHeadIKComponent)) {
      const ik = getComponent(localClientEntity, AvatarHeadIKComponent)
      const cameraTransform = getComponent(world.cameraEntity, TransformComponent)
      ik.target.quaternion.copy(cameraTransform.rotation)
      ik.target.position.copy(cameraTransform.position)
    }

    for (const inputSource of world.inputSources) {
      /** Left Hand */
      if (inputSource.handedness === 'left' && hasComponent(localClientEntity, AvatarLeftArmIKComponent)) {
        const ik = getComponent(localClientEntity, AvatarLeftArmIKComponent)
        const hand = inputSource.hand as XRHand | undefined
        /** detect hand joint pose support */
        if (hand && xrFrame.fillPoses && xrFrame.getJointPose) {
          if (!hasComponent(localClientEntity, XRLeftHandComponent)) {
            setComponent(localClientEntity, XRLeftHandComponent, { hand })
          }
          const wrist = hand.get('wrist')
          if (wrist) {
            const jointPose = xrFrame.getJointPose(wrist, referenceSpace)
            if (jointPose) {
              ik.target.position.copy(jointPose.transform.position as unknown as Vector3)
              ik.target.quaternion.copy(jointPose.transform.orientation as unknown as Quaternion)
            }
          }
          // applyHandPose(inputSource, localClientEntity)
        } else {
          if (hasComponent(localClientEntity, XRLeftHandComponent))
            removeComponent(localClientEntity, XRLeftHandComponent)
          if (inputSource.gripSpace) {
            const pose = Engine.instance.xrFrame!.getPose(inputSource.gripSpace, referenceSpace)
            if (pose) {
              ik.target.position.copy(pose.transform.position as any as Vector3)
              ik.target.quaternion.copy(pose.transform.orientation as any as Quaternion)
            }
          } else {
            const pose = Engine.instance.xrFrame!.getPose(inputSource.targetRaySpace, referenceSpace)
            if (pose) {
              ik.target.position.copy(pose.transform.position as any as Vector3)
              ik.target.quaternion.copy(pose.transform.orientation as any as Quaternion)
            }
          }
        }
      }

      /** Right Hand */
      if (inputSource.handedness === 'right' && hasComponent(localClientEntity, AvatarRightArmIKComponent)) {
        const ik = getComponent(localClientEntity, AvatarRightArmIKComponent)
        const hand = inputSource.hand as XRHand | undefined
        if (hand && xrFrame.fillPoses && xrFrame.getJointPose) {
          if (!hasComponent(localClientEntity, XRRightHandComponent)) {
            setComponent(localClientEntity, XRRightHandComponent, { hand })
          }
          const wrist = hand.get('wrist')
          if (wrist) {
            const jointPose = xrFrame.getJointPose(wrist, referenceSpace)
            if (jointPose) {
              ik.target.position.copy(jointPose.transform.position as unknown as Vector3)
              ik.target.quaternion.copy(jointPose.transform.orientation as unknown as Quaternion)
            }
          }
          // applyHandPose(inputSource, localClientEntity)
        } else {
          if (hasComponent(localClientEntity, XRRightHandComponent))
            removeComponent(localClientEntity, XRRightHandComponent)
          if (inputSource.gripSpace) {
            const pose = Engine.instance.xrFrame!.getPose(inputSource.gripSpace, referenceSpace)
            if (pose) {
              ik.target.position.copy(pose.transform.position as any as Vector3)
              ik.target.quaternion.copy(pose.transform.orientation as any as Quaternion)
            }
          } else {
            const pose = Engine.instance.xrFrame!.getPose(inputSource.targetRaySpace, referenceSpace)
            if (pose) {
              ik.target.position.copy(pose.transform.position as any as Vector3)
              ik.target.quaternion.copy(pose.transform.orientation as any as Quaternion)
            }
          }
        }
      }
    }
  }
}
