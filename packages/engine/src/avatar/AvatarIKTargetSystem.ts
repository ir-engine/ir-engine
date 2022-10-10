import { Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { Axis } from '../common/constants/Axis3D'
import { V_000 } from '../common/constants/MathConstants'
import { World } from '../ecs/classes/World'
import { defineQuery, getComponent, removeQuery } from '../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../transform/components/TransformComponent'
import { getControlMode, XRState } from '../xr/XRState'
import { applyBoneTwist } from './animation/armsTwistCorrection'
import { getForwardVector, solveLookIK } from './animation/LookAtIKSolver'
import { solveTwoBoneIK } from './animation/TwoBoneIKSolver'
import { AvatarAnimationComponent } from './components/AvatarAnimationComponent'
import { AvatarArmsTwistCorrectionComponent } from './components/AvatarArmsTwistCorrectionComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { AvatarHandsIKComponent } from './components/AvatarHandsIKComponent'
import { AvatarHeadDecapComponent } from './components/AvatarHeadDecapComponent'
import { AvatarHeadIKComponent } from './components/AvatarHeadIKComponent'

const forward = new Vector3()
export default async function AvatarIKTargetSystem(world: World) {
  const vrIKQuery = defineQuery([AvatarHandsIKComponent, AvatarAnimationComponent])
  const localHandsIKQuery = defineQuery([AvatarHandsIKComponent, AvatarControllerComponent])
  const headIKQuery = defineQuery([AvatarHeadIKComponent, AvatarAnimationComponent])
  const localHeadIKQuery = defineQuery([AvatarHeadIKComponent, AvatarControllerComponent])
  const headDecapQuery = defineQuery([AvatarHeadDecapComponent])
  const armsTwistCorrectionQuery = defineQuery([AvatarArmsTwistCorrectionComponent, AvatarAnimationComponent])

  const xrState = getState(XRState)

  const execute = () => {
    const inAttachedControlMode = getControlMode() === 'attached'

    /**
     * Head
     */
    if (inAttachedControlMode) {
      for (const entity of localHeadIKQuery()) {
        const { camera } = getComponent(entity, AvatarHeadIKComponent)
        camera.quaternion.copy(world.camera.quaternion)
        camera.position.copy(world.camera.position)
        camera.updateMatrix()
        camera.updateMatrixWorld(true)
      }
    }

    for (const entity of headIKQuery(world)) {
      const rig = getComponent(entity, AvatarAnimationComponent).rig
      const ik = getComponent(entity, AvatarHeadIKComponent)
      getForwardVector(ik.camera.matrixWorld, forward).multiplyScalar(-1)
      solveLookIK(rig.Head, forward, ik.rotationClamp)
    }

    /**
     * Hands
     */
    if (inAttachedControlMode)
      for (const entity of localHandsIKQuery()) {
        const ik = getComponent(entity, AvatarHandsIKComponent)
        const leftControllerEntity = xrState.leftControllerEntity.value
        if (leftControllerEntity) {
          const { position, rotation } = getComponent(leftControllerEntity, TransformComponent)
          ik.leftTarget.position.copy(position)
          ik.leftTarget.quaternion.copy(rotation)
        }
        const rightControllerEntity = xrState.rightControllerEntity.value
        if (rightControllerEntity) {
          const { position, rotation } = getComponent(rightControllerEntity, TransformComponent)
          ik.rightTarget.position.copy(position)
          ik.rightTarget.quaternion.copy(rotation)
        }
      }

    for (const entity of vrIKQuery()) {
      const { rig } = getComponent(entity, AvatarAnimationComponent)
      if (!rig) continue

      const ik = getComponent(entity, AvatarHandsIKComponent)

      // Arms should not be straight for the solver to work properly
      // TODO: Make this configurable

      // TODO: should we break hand IK apart into left and right components?
      // some devices only support one hand controller. How do we handle that?
      // how do we report that tracking is lost or still pending?
      // FOR NOW: we'll assume that we don't have tracking if the target is at exactly (0, 0, 0);
      // we may want to add a flag for this in the future, or to generally allow animations to play even if tracking is available

      if (!ik.leftTarget.position.equals(V_000)) {
        rig.LeftForeArm.quaternion.setFromAxisAngle(Axis.X, Math.PI * -0.25)
        rig.LeftForeArm.updateWorldMatrix(false, true)
        solveTwoBoneIK(
          rig.LeftArm,
          rig.LeftForeArm,
          rig.LeftHand,
          ik.leftTarget,
          ik.leftHint,
          ik.leftTargetOffset,
          ik.leftTargetPosWeight,
          ik.leftTargetRotWeight,
          ik.leftHintWeight
        )
      }

      if (!ik.rightTarget.position.equals(V_000)) {
        rig.RightForeArm.quaternion.setFromAxisAngle(Axis.X, Math.PI * 0.25)
        rig.RightForeArm.updateWorldMatrix(false, true)
        solveTwoBoneIK(
          rig.RightArm,
          rig.RightForeArm,
          rig.RightHand,
          ik.rightTarget,
          ik.rightHint,
          ik.rightTargetOffset,
          ik.rightTargetPosWeight,
          ik.rightTargetRotWeight,
          ik.rightHintWeight
        )
      }
    }

    for (const entity of armsTwistCorrectionQuery.enter()) {
      const { bindRig } = getComponent(entity, AvatarAnimationComponent)
      const twistCorrection = getComponent(entity, AvatarArmsTwistCorrectionComponent)
      twistCorrection.LeftHandBindRotationInv.copy(bindRig.LeftHand.quaternion).invert()
      twistCorrection.RightHandBindRotationInv.copy(bindRig.RightHand.quaternion).invert()
    }

    for (const entity of armsTwistCorrectionQuery()) {
      const { rig, bindRig } = getComponent(entity, AvatarAnimationComponent)
      const twistCorrection = getComponent(entity, AvatarArmsTwistCorrectionComponent)

      if (rig.LeftForeArmTwist) {
        applyBoneTwist(
          twistCorrection.LeftHandBindRotationInv,
          rig.LeftHand.quaternion,
          bindRig.LeftForeArmTwist.quaternion,
          rig.LeftForeArmTwist.quaternion,
          twistCorrection.LeftArmTwistAmount
        )
      }

      if (rig.RightForeArmTwist) {
        applyBoneTwist(
          twistCorrection.RightHandBindRotationInv,
          rig.RightHand.quaternion,
          bindRig.RightForeArmTwist.quaternion,
          rig.RightForeArmTwist.quaternion,
          twistCorrection.RightArmTwistAmount
        )
      }
    }
  }

  const cleanup = async () => {
    removeQuery(world, headDecapQuery)
    removeQuery(world, vrIKQuery)
    removeQuery(world, localHeadIKQuery)
    removeQuery(world, headIKQuery)
    removeQuery(world, armsTwistCorrectionQuery)
  }

  return { execute, cleanup }
}
