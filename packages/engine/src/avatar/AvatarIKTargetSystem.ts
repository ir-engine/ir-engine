import { Object3D, Quaternion, Vector3 } from 'three'

import { createActionQueue, getState } from '@xrengine/hyperflux'

import { Axis } from '../common/constants/Axis3D'
import { V_000 } from '../common/constants/MathConstants'
import { isClient } from '../common/functions/isClient'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import {
  addComponent,
  defineQuery,
  getComponent,
  removeComponent,
  removeQuery
} from '../ecs/functions/ComponentFunctions'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
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

/**
 * Setup head-ik for entity
 * @param entity
 * @returns
 */
export function setupHeadIK(entity: Entity) {
  // Add head IK Solver
  addComponent(entity, AvatarHeadIKComponent, {
    camera: new Object3D(),
    rotationClamp: 0.785398
  })
}

export function setupHandIK(entity: Entity) {
  // Hands IK solver
  const leftHint = new Object3D()
  const rightHint = new Object3D()
  const leftOffset = new Object3D()
  const rightOffset = new Object3D()
  const vec = new Vector3()

  const animation = getComponent(entity, AvatarAnimationComponent)

  leftOffset.rotation.set(-Math.PI * 0.5, Math.PI, 0)
  rightOffset.rotation.set(-Math.PI * 0.5, 0, 0)

  // todo: load the avatar & rig on the server
  if (isClient) {
    animation.rig.LeftShoulder.getWorldPosition(leftHint.position)
    animation.rig.LeftArm.getWorldPosition(vec)
    vec.subVectors(vec, leftHint.position).normalize()
    leftHint.position.add(vec)
    animation.rig.LeftShoulder.attach(leftHint)

    animation.rig.RightShoulder.getWorldPosition(rightHint.position)
    animation.rig.RightArm.getWorldPosition(vec)
    vec.subVectors(vec, rightHint.position).normalize()
    rightHint.position.add(vec)
    animation.rig.RightShoulder.attach(rightHint)
  }

  addComponent(entity, AvatarHandsIKComponent, {
    leftTarget: new Object3D(),
    leftHint: leftHint,
    leftTargetOffset: leftOffset,
    leftTargetPosWeight: 1,
    leftTargetRotWeight: 1,
    leftHintWeight: -1,
    rightTarget: new Object3D(),
    rightHint: rightHint,
    rightTargetOffset: rightOffset,
    rightTargetPosWeight: 1,
    rightTargetRotWeight: 1,
    rightHintWeight: -1
  })

  addComponent(entity, AvatarArmsTwistCorrectionComponent, {
    LeftHandBindRotationInv: new Quaternion(),
    LeftArmTwistAmount: 0.6,
    RightHandBindRotationInv: new Quaternion(),
    RightArmTwistAmount: 0.6
  })
}

const _vec = new Vector3()

export default async function AvatarIKTargetSystem(world: World) {
  const vrIKQuery = defineQuery([AvatarHandsIKComponent, AvatarAnimationComponent])
  const localHandsIKQuery = defineQuery([AvatarHandsIKComponent, AvatarControllerComponent])
  const headIKQuery = defineQuery([AvatarHeadIKComponent, AvatarAnimationComponent])
  const localHeadIKQuery = defineQuery([AvatarHeadIKComponent, AvatarControllerComponent])
  const headDecapQuery = defineQuery([AvatarHeadDecapComponent])
  const armsTwistCorrectionQuery = defineQuery([AvatarArmsTwistCorrectionComponent, AvatarAnimationComponent])

  const xrState = getState(XRState)

  const setXRModeQueue = createActionQueue(WorldNetworkAction.setXRMode.matches)

  const execute = () => {
    const inAttachedControlMode = getControlMode() === 'attached'

    for (const action of setXRModeQueue()) {
      const entity = world.getUserAvatarEntity(action.$from)
      if (action.enabled) {
        setupHandIK(entity)
      } else {
        removeComponent(entity, AvatarHeadIKComponent)
        const { leftHint, rightHint } = getComponent(entity, AvatarHandsIKComponent, true)
        leftHint?.removeFromParent()
        rightHint?.removeFromParent()
        removeComponent(entity, AvatarHandsIKComponent)
        removeComponent(entity, AvatarArmsTwistCorrectionComponent)
      }
    }

    /**
     * Copy local xr session input
     */
    if (inAttachedControlMode) {
      for (const entity of localHeadIKQuery()) {
        const ik = getComponent(entity, AvatarHeadIKComponent)
        ik.camera.quaternion.copy(world.camera.quaternion)
        ik.camera.position.copy(world.camera.position)
        ik.camera.updateMatrix()
        ik.camera.updateMatrixWorld(true)
      }
      for (const entity of localHandsIKQuery()) {
        const ik = getComponent(entity, AvatarHandsIKComponent)
        const leftControllerEntity = xrState.leftControllerEntity.value
        if (leftControllerEntity) {
          const { position, rotation } = getComponent(leftControllerEntity, TransformComponent)
          ik.leftTarget.position.copy(position)
          ik.leftTarget.quaternion.copy(rotation)
          ik.leftTarget.updateMatrix()
          ik.leftTarget.updateMatrixWorld(true)
        }
        const rightControllerEntity = xrState.rightControllerEntity.value
        if (rightControllerEntity) {
          const { position, rotation } = getComponent(rightControllerEntity, TransformComponent)
          ik.rightTarget.position.copy(position)
          ik.rightTarget.quaternion.copy(rotation)
          ik.rightTarget.updateMatrix()
          ik.rightTarget.updateMatrixWorld(true)
        }
      }
    }

    /**
     * Head
     */
    for (const entity of headIKQuery(world)) {
      const rig = getComponent(entity, AvatarAnimationComponent).rig
      const ik = getComponent(entity, AvatarHeadIKComponent)
      ik.camera.getWorldDirection(_vec).multiplyScalar(-1)
      solveLookIK(rig.Head, _vec, ik.rotationClamp)
    }

    /**
     * Hands
     */
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
