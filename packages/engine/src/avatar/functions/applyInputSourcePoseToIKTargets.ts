import { Bone, Quaternion, Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { getComponent, hasComponent, removeComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { XRHand, XRJointParentMap, XRLeftHandComponent } from '../../xr/XRComponents'
import { getCameraMode, ReferenceSpace, XRState } from '../../xr/XRState'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import {
  AvatarHeadIKComponent,
  AvatarIKTargetsComponent,
  AvatarLeftArmIKComponent,
  AvatarRightArmIKComponent
} from '../components/AvatarIKComponents'

const _rotY90 = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2)
const _rotYneg90 = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), -Math.PI / 2)

export const applyInputSourcePoseToIKTargets = () => {
  const world = Engine.instance.currentWorld
  const { localClientEntity } = world

  const xrFrame = Engine.instance.xrFrame!

  const inAttachedControlMode = getCameraMode() === 'attached'

  const referenceSpace = ReferenceSpace.origin

  /** Update controller pose input sources from WebXR into the ECS */
  if (xrFrame && referenceSpace && hasComponent(localClientEntity, AvatarIKTargetsComponent)) {
    /** Head */
    if (inAttachedControlMode && hasComponent(localClientEntity, AvatarHeadIKComponent)) {
      const ik = getComponent(localClientEntity, AvatarHeadIKComponent)
      const viewerPose = xrFrame.getViewerPose(referenceSpace)
      if (viewerPose) {
        ik.target.quaternion.copy(viewerPose.transform.orientation as any)
        ik.target.position.copy(viewerPose.transform.position as any)
      }
    }

    for (const inputSource of world.inputSources) {
      /** Left Hand */
      if (inputSource.handedness === 'left' && hasComponent(localClientEntity, AvatarLeftArmIKComponent)) {
        const ik = getComponent(localClientEntity, AvatarLeftArmIKComponent)
        const hand = inputSource.hand as XRHand | undefined
        /** detect hand joint pose support */
        if (hand && xrFrame.getJointPose) {
          if (!hasComponent(localClientEntity, XRLeftHandComponent)) {
            setComponent(localClientEntity, XRLeftHandComponent, { hand })
          }

          /** @todo this is all in local space, we should eventually get this in world space once we migrate to dual quaternions */
          for (const joint of hand.values()) {
            const jointName = joint.jointName
            const parentJoint = hand.get(XRJointParentMap[jointName])!
            const jointPose = xrFrame.getJointPose(joint, parentJoint)
            if (jointPose) {
              const position = jointPose.transform.position
              XRLeftHandComponent[jointName].position.x[localClientEntity] = position.x
              XRLeftHandComponent[jointName].position.y[localClientEntity] = position.y
              XRLeftHandComponent[jointName].position.z[localClientEntity] = position.z
              const orientation = jointPose.transform.orientation
              XRLeftHandComponent[jointName].quaternion.x[localClientEntity] = orientation.x
              XRLeftHandComponent[jointName].quaternion.y[localClientEntity] = orientation.y
              XRLeftHandComponent[jointName].quaternion.z[localClientEntity] = orientation.z
              XRLeftHandComponent[jointName].quaternion.w[localClientEntity] = orientation.w
            }
          }
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
        if (hand && xrFrame.getJointPose) {
          // handled in XRRightHandComponent
        } else if (inputSource.gripSpace) {
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
