import { Quaternion, Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRHand } from '../../xr/XRComponents'
import { getCameraMode, ReferenceSpace, XRState } from '../../xr/XRState'
import {
  AvatarHeadIKComponent,
  AvatarIKTargetsComponent,
  AvatarLeftHandIKComponent,
  AvatarRightHandIKComponent
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
      const cameraTransform = getComponent(world.cameraEntity, TransformComponent)
      ik.target.quaternion.copy(cameraTransform.rotation)
      ik.target.position.copy(cameraTransform.position)
    }

    for (const inputSource of world.inputSources) {
      /** Left Hand */
      if (inputSource.handedness === 'left' && hasComponent(localClientEntity, AvatarLeftHandIKComponent)) {
        const ik = getComponent(localClientEntity, AvatarLeftHandIKComponent)
        const hand = inputSource.hand as XRHand | undefined
        /** detect hand joint pose support */
        if (hand && xrFrame.getJointPose) {
          const wrist = hand.get('wrist')
          if (wrist) {
            const jointPose = xrFrame.getJointPose(wrist, referenceSpace)
            if (jointPose) {
              ik.target.position.copy(jointPose.transform.position as unknown as Vector3)
              ik.target.quaternion.copy(jointPose.transform.orientation as unknown as Quaternion)
              ik.target.quaternion.multiply(_rotYneg90) // @todo look into this
            }
          }
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

      /** Right Hand */
      if (inputSource.handedness === 'right' && hasComponent(localClientEntity, AvatarRightHandIKComponent)) {
        const ik = getComponent(localClientEntity, AvatarRightHandIKComponent)
        const hand = inputSource.hand as XRHand | undefined
        if (hand && xrFrame.getJointPose) {
          const wrist = hand.get('wrist')
          if (wrist) {
            const jointPose = xrFrame.getJointPose(wrist, referenceSpace)
            if (jointPose) {
              ik.target.position.copy(jointPose.transform.position as unknown as Vector3)
              ik.target.quaternion.copy(jointPose.transform.orientation as unknown as Quaternion)
              ik.target.quaternion.multiply(_rotY90) // @todo look into this
            }
          }
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
