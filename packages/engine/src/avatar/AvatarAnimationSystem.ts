import { useEffect } from 'react'
import { Bone, MathUtils, Vector3 } from 'three'

import { insertionSort } from '@xrengine/common/src/utils/insertionSort'
import { defineState, getState, startReactor, useHookstate } from '@xrengine/hyperflux'

import { Axis } from '../common/constants/Axis3D'
import { V_000 } from '../common/constants/MathConstants'
import { isHMD } from '../common/functions/isMobile'
import { EngineState } from '../ecs/classes/EngineState'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import { defineQuery, getComponent, getOptionalComponent, removeQuery } from '../ecs/functions/ComponentFunctions'
import { createPriorityQueue } from '../ecs/PriorityQueue'
import { RigidBodyComponent } from '../physics/components/RigidBodyComponent'
import { VisibleComponent } from '../scene/components/VisibleComponent'
import {
  compareDistance,
  DistanceFromCameraComponent,
  FrustumCullCameraComponent
} from '../transform/components/DistanceComponents'
import { updateGroupChildren } from '../transform/systems/TransformSystem'
import { updateAnimationGraph } from './animation/AnimationGraph'
import { solveHipHeight } from './animation/HipIKSolver'
import { solveLookIK } from './animation/LookAtIKSolver'
import { solveTwoBoneIK } from './animation/TwoBoneIKSolver'
import { AnimationManager } from './AnimationManager'
import { AnimationComponent } from './components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from './components/AvatarAnimationComponent'
import { AvatarArmsTwistCorrectionComponent } from './components/AvatarArmsTwistCorrectionComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { AvatarLeftHandIKComponent, AvatarRightHandIKComponent } from './components/AvatarIKComponents'
import { AvatarHeadDecapComponent } from './components/AvatarIKComponents'
import { AvatarHeadIKComponent } from './components/AvatarIKComponents'
import { LoopAnimationComponent } from './components/LoopAnimationComponent'
import { applyInputSourcePoseToIKTargets } from './functions/applyInputSourcePoseToIKTargets'

export const AvatarAnimationState = defineState({
  name: 'AvatarAnimationState',
  initial: {
    accumulationBudget: isHMD ? 2 : 5
  }
})

const _vector3 = new Vector3()
const _vec = new Vector3()

export default async function AvatarAnimationSystem(world: World) {
  await AnimationManager.instance.loadDefaultAnimations()

  const leftHandQuery = defineQuery([VisibleComponent, AvatarLeftHandIKComponent, AvatarRigComponent])
  const rightHandQuery = defineQuery([VisibleComponent, AvatarRightHandIKComponent, AvatarRigComponent])
  const headIKQuery = defineQuery([VisibleComponent, AvatarHeadIKComponent, AvatarRigComponent])
  const localHeadIKQuery = defineQuery([VisibleComponent, AvatarHeadIKComponent, AvatarControllerComponent])
  const headDecapQuery = defineQuery([VisibleComponent, AvatarHeadDecapComponent])
  const armsTwistCorrectionQuery = defineQuery([
    VisibleComponent,
    AvatarArmsTwistCorrectionComponent,
    AvatarRigComponent
  ])
  const loopAnimationQuery = defineQuery([
    VisibleComponent,
    LoopAnimationComponent,
    AnimationComponent,
    AvatarAnimationComponent,
    AvatarRigComponent
  ])
  const avatarAnimationQuery = defineQuery([AnimationComponent, AvatarAnimationComponent, AvatarRigComponent])

  const reactor = startReactor(() => {
    const state = useHookstate(getState(AvatarAnimationState))

    useEffect(() => {
      priorityQueue.accumulationBudget = state.accumulationBudget.value
    }, [state.accumulationBudget])

    return null
  })

  const engineState = getState(EngineState)

  const minimumFrustumCullDistanceSqr = 5 * 5 // 5 units
  const priorityQueue = createPriorityQueue({
    accumulationBudget: getState(AvatarAnimationState).accumulationBudget.value
  })

  world.priorityAvatarEntities = priorityQueue.priorityEntities
  const filterPriorityEntities = (entity: Entity) =>
    world.priorityAvatarEntities.has(entity) || entity === world.localClientEntity

  const filterFrustumCulledEntities = (entity: Entity) =>
    !(
      DistanceFromCameraComponent.squaredDistance[entity] > minimumFrustumCullDistanceSqr &&
      FrustumCullCameraComponent.isCulled[entity]
    )

  let avatarSortAccumulator = 0

  let sortedTransformEntities = [] as Entity[]

  const execute = () => {
    const { elapsedSeconds, deltaSeconds, localClientEntity } = world

    /**
     * 1 - Sort & apply avatar priority queue
     */

    let needsSorting = false
    avatarSortAccumulator += deltaSeconds
    if (avatarSortAccumulator > 1) {
      needsSorting = true
      avatarSortAccumulator = 0
    }

    for (const entity of avatarAnimationQuery.enter()) {
      sortedTransformEntities.push(entity)
      needsSorting = true
    }

    for (const entity of avatarAnimationQuery.exit()) {
      const idx = sortedTransformEntities.indexOf(entity)
      idx > -1 && sortedTransformEntities.splice(idx, 1)
      needsSorting = true
      priorityQueue.removeEntity(entity)
    }

    if (needsSorting) {
      insertionSort(sortedTransformEntities, compareDistance)
    }

    const filteredSortedTransformEntities = sortedTransformEntities.filter(filterFrustumCulledEntities)

    for (let i = 0; i < filteredSortedTransformEntities.length; i++) {
      const entity = filteredSortedTransformEntities[i]
      const accumulation = Math.min(Math.exp(1 / (i + 1)) / 3, 1)
      priorityQueue.addPriority(entity, accumulation * accumulation)
    }

    priorityQueue.update()

    /**
     * 2 - Apply avatar animations
     */

    const avatarAnimationEntities = avatarAnimationQuery(world).filter(filterPriorityEntities)
    const headIKEntities = headIKQuery(world).filter(filterPriorityEntities)
    const leftHandEntities = leftHandQuery(world).filter(filterPriorityEntities)
    const rightHandEntities = rightHandQuery(world).filter(filterPriorityEntities)
    const loopAnimationEntities = loopAnimationQuery(world).filter(filterPriorityEntities)

    applyInputSourcePoseToIKTargets()

    for (const entity of avatarAnimationEntities) {
      /**
       * Apply motion to velocity controlled animations
       */
      const animationComponent = getComponent(entity, AnimationComponent)
      const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
      const rigidbodyComponent = getOptionalComponent(entity, RigidBodyComponent)

      const delta = elapsedSeconds - avatarAnimationComponent.deltaAccumulator
      const deltaTime = delta * animationComponent.animationSpeed
      avatarAnimationComponent.deltaAccumulator = elapsedSeconds

      if (rigidbodyComponent) {
        // TODO: use x locomotion for side-stepping when full 2D blending spaces are implemented
        avatarAnimationComponent.locomotion.x = 0
        avatarAnimationComponent.locomotion.y = rigidbodyComponent.linearVelocity.y
        // lerp animated forward animation to smoothly animate to a stop
        avatarAnimationComponent.locomotion.z = MathUtils.lerp(
          avatarAnimationComponent.locomotion.z || 0,
          _vector3.copy(rigidbodyComponent.linearVelocity).setComponent(1, 0).length(),
          10 * deltaTime
        )
      } else {
        avatarAnimationComponent.locomotion.setScalar(0)
      }

      /**
       * Update animation graph
       */
      updateAnimationGraph(avatarAnimationComponent.animationGraph, deltaTime)

      /**
       * Apply retargeting
       */
      const rootBone = animationComponent.mixer.getRoot() as Bone
      const avatarRigComponent = getComponent(entity, AvatarRigComponent)
      const rig = avatarRigComponent.rig

      rootBone.traverse((bone: Bone) => {
        if (!bone.isBone) return

        const targetBone = rig[bone.name]
        if (!targetBone) {
          return
        }

        targetBone.quaternion.copy(bone.quaternion)

        // Only copy the root position
        if (targetBone === rig.Hips) {
          targetBone.position.copy(bone.position)
          targetBone.position.y *= avatarAnimationComponent.rootYRatio
        }
      })

      // TODO: Find a more elegant way to handle root motion
      const rootPos = AnimationManager.instance._defaultRootBone.position
      rig.Hips.position.setX(rootPos.x).setZ(rootPos.z)
    }

    /**
     * 3 - Apply avatar IK
     */

    /**
     * Apply head IK
     */
    for (const entity of headIKEntities) {
      const ik = getComponent(entity, AvatarHeadIKComponent)
      ik.target.updateMatrixWorld(true)
      const rig = getComponent(entity, AvatarRigComponent).rig
      ik.target.getWorldDirection(_vec).multiplyScalar(-1)
      solveHipHeight(entity, ik.target)
      solveLookIK(rig.Head, _vec, ik.rotationClamp)
    }

    /**
     * Apply left hand IK
     */
    for (const entity of leftHandEntities) {
      const { rig } = getComponent(entity, AvatarRigComponent)

      const ik = getComponent(entity, AvatarLeftHandIKComponent)
      ik.target.updateMatrixWorld(true)

      // Arms should not be straight for the solver to work properly
      // TODO: Make this configurable

      // TODO: should we break hand IK apart into left and right components?
      // some devices only support one hand controller. How do we handle that?
      // how do we report that tracking is lost or still pending?
      // FOR NOW: we'll assume that we don't have tracking if the target is at exactly (0, 0, 0);
      // we may want to add a flag for this in the future, or to generally allow animations to play even if tracking is available

      if (!ik.target.position.equals(V_000)) {
        rig.LeftForeArm.quaternion.setFromAxisAngle(Axis.X, Math.PI * -0.25)
        /** @todo see if this is still necessary */
        rig.LeftForeArm.updateWorldMatrix(false, true)
        solveTwoBoneIK(
          rig.LeftArm,
          rig.LeftForeArm,
          rig.LeftHand,
          ik.target,
          ik.hint,
          ik.targetOffset,
          ik.targetPosWeight,
          ik.targetRotWeight,
          ik.hintWeight
        )
      }
    }

    /**
     * Apply right hand IK
     */
    for (const entity of rightHandEntities) {
      const { rig } = getComponent(entity, AvatarRigComponent)

      const ik = getComponent(entity, AvatarRightHandIKComponent)
      ik.target.updateMatrixWorld(true)

      if (!ik.target.position.equals(V_000)) {
        rig.RightForeArm.quaternion.setFromAxisAngle(Axis.X, Math.PI * 0.25)
        /** @todo see if this is still necessary */
        rig.RightForeArm.updateWorldMatrix(false, true)
        solveTwoBoneIK(
          rig.RightArm,
          rig.RightForeArm,
          rig.RightHand,
          ik.target,
          ik.hint,
          ik.targetOffset,
          ik.targetPosWeight,
          ik.targetRotWeight,
          ik.hintWeight
        )
      }
    }

    // for (const entity of armsTwistCorrectionQuery.enter()) {
    //   const { bindRig } = getComponent(entity, AvatarRigComponent)
    //   const twistCorrection = getComponent(entity, AvatarArmsTwistCorrectionComponent)
    //   twistCorrection.LeftHandBindRotationInv.copy(bindRig.LeftHand.quaternion).invert()
    //   twistCorrection.RightHandBindRotationInv.copy(bindRig.RightHand.quaternion).invert()
    // }

    // for (const entity of armsTwistCorrectionQuery()) {
    //   const { rig, bindRig } = getComponent(entity, AvatarRigComponent)
    //   const twistCorrection = getComponent(entity, AvatarArmsTwistCorrectionComponent)

    //   if (rig.LeftForeArmTwist) {
    //     applyBoneTwist(
    //       twistCorrection.LeftHandBindRotationInv,
    //       rig.LeftHand.quaternion,
    //       bindRig.LeftForeArmTwist.quaternion,
    //       rig.LeftForeArmTwist.quaternion,
    //       twistCorrection.LeftArmTwistAmount
    //     )
    //   }

    //   if (rig.RightForeArmTwist) {
    //     applyBoneTwist(
    //       twistCorrection.RightHandBindRotationInv,
    //       rig.RightHand.quaternion,
    //       bindRig.RightForeArmTwist.quaternion,
    //       rig.RightForeArmTwist.quaternion,
    //       twistCorrection.RightArmTwistAmount
    //     )
    //   }
    // }

    /**
     * Since the scene does not automatically update the matricies for all objects,which updates bones,
     * we need to manually do it for Loop Animation Entities
     */
    for (const entity of loopAnimationEntities) updateGroupChildren(entity)

    for (const entity of world.priorityAvatarEntities) {
      const avatarRig = getComponent(entity, AvatarRigComponent)
      avatarRig?.rig.Hips.updateWorldMatrix(true, true)
      avatarRig?.helper?.updateMatrixWorld(true)
    }
  }

  const cleanup = async () => {
    removeQuery(world, headDecapQuery)
    removeQuery(world, leftHandQuery)
    removeQuery(world, rightHandQuery)
    removeQuery(world, localHeadIKQuery)
    removeQuery(world, headIKQuery)
    removeQuery(world, armsTwistCorrectionQuery)
    removeQuery(world, avatarAnimationQuery)
    reactor.stop()
  }

  return { execute, cleanup }
}
