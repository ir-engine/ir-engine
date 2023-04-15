import { useEffect } from 'react'
import React from 'react'
import { Bone, MathUtils, Object3D, Vector3 } from 'three'

import { insertionSort } from '@etherealengine/common/src/utils/insertionSort'
import {
  createActionQueue,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  startReactor,
  useHookstate
} from '@etherealengine/hyperflux'

import { Axis } from '../common/constants/Axis3D'
import { V_000 } from '../common/constants/MathConstants'
import { isClient } from '../common/functions/isClient'
import { proxifyQuaternion, proxifyVector3 } from '../common/proxies/createThreejsProxy'
import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import {
  defineQuery,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  removeQuery,
  setComponent
} from '../ecs/functions/ComponentFunctions'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { createPriorityQueue } from '../ecs/PriorityQueue'
import { RigidBodyComponent } from '../physics/components/RigidBodyComponent'
import { VisibleComponent } from '../scene/components/VisibleComponent'
import {
  compareDistance,
  DistanceFromCameraComponent,
  FrustumCullCameraComponent
} from '../transform/components/DistanceComponents'
import { updateGroupChildren } from '../transform/systems/TransformSystem'
import { XRLeftHandComponent, XRRightHandComponent } from '../xr/XRComponents'
import { getCameraMode, isMobileXRHeadset, ReferenceSpace, XRState } from '../xr/XRState'
import { updateAnimationGraph } from './animation/AnimationGraph'
import { solveHipHeight } from './animation/HipIKSolver'
import { solveLookIK } from './animation/LookAtIKSolver'
import { solveTwoBoneIK } from './animation/TwoBoneIKSolver'
import { AnimationManager } from './AnimationManager'
import { AnimationComponent } from './components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from './components/AvatarAnimationComponent'
import { AvatarArmsTwistCorrectionComponent } from './components/AvatarArmsTwistCorrectionComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import {
  AvatarIKTargetsComponent,
  AvatarLeftArmIKComponent,
  AvatarRightArmIKComponent
} from './components/AvatarIKComponents'
import { AvatarHeadIKComponent } from './components/AvatarIKComponents'
import { LoopAnimationComponent } from './components/LoopAnimationComponent'
import { applyInputSourcePoseToIKTargets } from './functions/applyInputSourcePoseToIKTargets'

export const AvatarAnimationState = defineState({
  name: 'AvatarAnimationState',
  initial: () => {
    const accumulationBudget = isMobileXRHeadset ? 3 : 6

    const priorityQueue = createPriorityQueue({
      accumulationBudget
    })
    Engine.instance.priorityAvatarEntities = priorityQueue.priorityEntities

    return {
      priorityQueue,
      sortedTransformEntities: [] as Entity[]
    }
  }
})

const _vector3 = new Vector3()
const _vec = new Vector3()

// setComponent(entity, AvatarArmsTwistCorrectionComponent, {
//   LeftHandBindRotationInv: new Quaternion(),
//   LeftArmTwistAmount: 0.6,
//   RightHandBindRotationInv: new Quaternion(),
//   RightArmTwistAmount: 0.6
// })

const leftArmQuery = defineQuery([VisibleComponent, AvatarLeftArmIKComponent, AvatarRigComponent])
const rightArmQuery = defineQuery([VisibleComponent, AvatarRightArmIKComponent, AvatarRigComponent])
const leftHandQuery = defineQuery([VisibleComponent, XRLeftHandComponent, AvatarRigComponent])
const rightHandQuery = defineQuery([VisibleComponent, XRRightHandComponent, AvatarRigComponent])
const headIKQuery = defineQuery([VisibleComponent, AvatarHeadIKComponent, AvatarRigComponent])
const localHeadIKQuery = defineQuery([VisibleComponent, AvatarHeadIKComponent, AvatarControllerComponent])
const armsTwistCorrectionQuery = defineQuery([VisibleComponent, AvatarArmsTwistCorrectionComponent, AvatarRigComponent])
const loopAnimationQuery = defineQuery([
  VisibleComponent,
  LoopAnimationComponent,
  AnimationComponent,
  AvatarAnimationComponent,
  AvatarRigComponent
])
const avatarAnimationQuery = defineQuery([AnimationComponent, AvatarAnimationComponent, AvatarRigComponent])

const minimumFrustumCullDistanceSqr = 5 * 5 // 5 units

const filterPriorityEntities = (entity: Entity) =>
  Engine.instance.priorityAvatarEntities.has(entity) || entity === Engine.instance.localClientEntity

const filterFrustumCulledEntities = (entity: Entity) =>
  !(
    DistanceFromCameraComponent.squaredDistance[entity] > minimumFrustumCullDistanceSqr &&
    FrustumCullCameraComponent.isCulled[entity]
  )

let avatarSortAccumulator = 0

const execute = () => {
  const xrState = getState(XRState)
  const { priorityQueue, sortedTransformEntities } = getState(AvatarAnimationState)
  const { elapsedSeconds, deltaSeconds, localClientEntity, inputSources } = Engine.instance

  if (xrState.sessionActive && localClientEntity && hasComponent(localClientEntity, AvatarIKTargetsComponent)) {
    const ikTargets = getComponent(localClientEntity, AvatarIKTargetsComponent)
    const sources = Array.from(inputSources.values())
    const head = getCameraMode() === 'attached'
    const leftHand = !!sources.find((s) => s.handedness === 'left')
    const rightHand = !!sources.find((s) => s.handedness === 'right')

    if (!head && ikTargets.head) removeComponent(localClientEntity, AvatarHeadIKComponent)
    if (!leftHand && ikTargets.leftHand) removeComponent(localClientEntity, AvatarLeftArmIKComponent)
    if (!rightHand && ikTargets.rightHand) removeComponent(localClientEntity, AvatarRightArmIKComponent)

    if (head && !ikTargets.head) setComponent(localClientEntity, AvatarHeadIKComponent)
    if (leftHand && !ikTargets.leftHand) setComponent(localClientEntity, AvatarLeftArmIKComponent)
    if (rightHand && !ikTargets.rightHand) setComponent(localClientEntity, AvatarRightArmIKComponent)

    ikTargets.head = head
    ikTargets.leftHand = leftHand
    ikTargets.rightHand = rightHand
  }

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

  const avatarAnimationEntities = avatarAnimationQuery().filter(filterPriorityEntities)
  const headIKEntities = headIKQuery().filter(filterPriorityEntities)
  const leftArmEntities = leftArmQuery().filter(filterPriorityEntities)
  const rightArmEntities = rightArmQuery().filter(filterPriorityEntities)
  const loopAnimationEntities = loopAnimationQuery().filter(filterPriorityEntities)

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

  applyInputSourcePoseToIKTargets()

  /**
   * Apply head IK
   */
  for (const entity of headIKEntities) {
    const ik = getComponent(entity, AvatarHeadIKComponent)
    if (!ik.target.position.equals(V_000)) {
      ik.target.updateMatrixWorld(true)
      const rig = getComponent(entity, AvatarRigComponent).rig
      ik.target.getWorldDirection(_vec).multiplyScalar(-1)
      solveHipHeight(entity, ik.target)
      solveLookIK(rig.Head, _vec, ik.rotationClamp)
    }
  }

  /**
   * Apply left hand IK
   */
  for (const entity of leftArmEntities) {
    const { rig } = getComponent(entity, AvatarRigComponent)

    const ik = getComponent(entity, AvatarLeftArmIKComponent)

    // If data is zeroed out, assume there is no input and do not run IK
    if (!ik.target.position.equals(V_000)) {
      ik.target.updateMatrixWorld(true)
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
  for (const entity of rightArmEntities) {
    const { rig } = getComponent(entity, AvatarRigComponent)

    const ik = getComponent(entity, AvatarRightArmIKComponent)
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

  /**
   * Since the scene does not automatically update the matricies for all objects,which updates bones,
   * we need to manually do it for Loop Animation Entities
   */
  for (const entity of loopAnimationEntities) updateGroupChildren(entity)

  for (const entity of Engine.instance.priorityAvatarEntities) {
    const avatarRig = getComponent(entity, AvatarRigComponent)
    if (avatarRig) {
      avatarRig.rig.Hips.updateWorldMatrix(true, true)
      avatarRig.helper?.updateMatrixWorld(true)
    }
  }
}

const reactor = () => {
  useEffect(() => {
    AnimationManager.instance.loadDefaultAnimations()
  }, [])
  return null
}

export const AvatarAnimationSystem = defineSystem({
  uuid: 'ee.engine.AvatarAnimationSystem',
  execute,
  reactor
})
