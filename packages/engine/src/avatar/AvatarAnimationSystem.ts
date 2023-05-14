import { VRMHumanBone, VRMHumanBoneName, VRMHumanBones } from '@pixiv/three-vrm'
import * as VRMSchema from '@pixiv/types-vrmc-vrm-1.0'
import { useEffect } from 'react'
import { AxesHelper, Bone, Euler, MathUtils, Matrix4, Object3D, Quaternion, Raycaster, Vector3 } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { insertionSort } from '@etherealengine/common/src/utils/insertionSort'
import { defineActionQueue, defineState, dispatchAction, getState } from '@etherealengine/hyperflux'

import { Axis } from '../common/constants/Axis3D'
import { V_000 } from '../common/constants/MathConstants'
import { Object3DUtils } from '../common/functions/Object3DUtils'
import { proxifyQuaternion } from '../common/proxies/createThreejsProxy'
import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { defineQuery, getComponent, getOptionalComponent, setComponent } from '../ecs/functions/ComponentFunctions'
import { removeEntity } from '../ecs/functions/EntityFunctions'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { createPriorityQueue } from '../ecs/PriorityQueue'
import { NetworkObjectComponent } from '../networking/components/NetworkObjectComponent'
import { Physics, RaycastArgs } from '../physics/classes/Physics'
import { RigidBodyComponent } from '../physics/components/RigidBodyComponent'
import { SceneQueryType } from '../physics/types/PhysicsTypes'
import { addObjectToGroup } from '../scene/components/GroupComponent'
import { NameComponent } from '../scene/components/NameComponent'
import { UUIDComponent } from '../scene/components/UUIDComponent'
import { VisibleComponent } from '../scene/components/VisibleComponent'
import {
  compareDistance,
  DistanceFromCameraComponent,
  FrustumCullCameraComponent
} from '../transform/components/DistanceComponents'
import { TransformComponent } from '../transform/components/TransformComponent'
import { updateGroupChildren } from '../transform/systems/TransformSystem'
import { getCameraMode, isMobileXRHeadset, XRAction, XRState } from '../xr/XRState'
import { updateAnimationGraph } from './animation/AnimationGraph'
import { setAvatarLocomotionAnimation } from './animation/AvatarAnimationGraph'
import { solveHipHeight } from './animation/HipIKSolver'
import { solveLookIK } from './animation/LookAtIKSolver'
import { solveTwoBoneIK } from './animation/TwoBoneIKSolver'
import { animationManager } from './AnimationManager'
import { AnimationComponent } from './components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from './components/AvatarAnimationComponent'
import {
  AvatarIKTargetComponent,
  xrTargetHeadSuffix,
  xrTargetLeftHandSuffix,
  xrTargetRightHandSuffix
} from './components/AvatarIKComponents'
import { LoopAnimationComponent } from './components/LoopAnimationComponent'
import { applyInputSourcePoseToIKTargets } from './functions/applyInputSourcePoseToIKTargets'
import { interactionGroups } from './functions/autopilotFunctions'

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

// setComponent(entity, AvatarArmsTwistCorrectionComponent, {
//   LeftHandBindRotationInv: new Quaternion(),
//   LeftArmTwistAmount: 0.6,
//   RightHandBindRotationInv: new Quaternion(),
//   rightUpperArmTwistAmount: 0.6
// })

const loopAnimationQuery = defineQuery([
  VisibleComponent,
  LoopAnimationComponent,
  AnimationComponent,
  AvatarAnimationComponent,
  AvatarRigComponent
])
const avatarAnimationQuery = defineQuery([AnimationComponent, AvatarAnimationComponent, AvatarRigComponent])
const ikTargetSpawnQueue = defineActionQueue(XRAction.spawnIKTarget.matches)
const sessionChangedQueue = defineActionQueue(XRAction.sessionChanged.matches)

const ikTargetQuery = defineQuery([AvatarIKTargetComponent])

const minimumFrustumCullDistanceSqr = 5 * 5 // 5 units

const filterPriorityEntities = (entity: Entity) =>
  Engine.instance.priorityAvatarEntities.has(entity) || entity === Engine.instance.localClientEntity

const filterFrustumCulledEntities = (entity: Entity) =>
  !(
    DistanceFromCameraComponent.squaredDistance[entity] > minimumFrustumCullDistanceSqr &&
    FrustumCullCameraComponent.isCulled[entity]
  )

const hipsRotationoffset = new Quaternion().setFromEuler(new Euler(0, Math.PI, 0))

let avatarSortAccumulator = 0

const _vector3 = new Vector3()
const _vec = new Vector3()

const rightHandRot = new Quaternion()
const leftHandRot = new Quaternion()

const execute = () => {
  const xrState = getState(XRState)
  const { priorityQueue, sortedTransformEntities } = getState(AvatarAnimationState)
  const { elapsedSeconds, deltaSeconds, localClientEntity, inputSources } = Engine.instance

  for (const action of sessionChangedQueue()) {
    if (!localClientEntity) continue

    const headUUID = (Engine.instance.userId + xrTargetHeadSuffix) as EntityUUID
    const leftHandUUID = (Engine.instance.userId + xrTargetLeftHandSuffix) as EntityUUID
    const rightHandUUID = (Engine.instance.userId + xrTargetRightHandSuffix) as EntityUUID

    const ikTargetHead = UUIDComponent.entitiesByUUID[headUUID]
    const ikTargetLeftHand = UUIDComponent.entitiesByUUID[leftHandUUID]
    const ikTargetRightHand = UUIDComponent.entitiesByUUID[rightHandUUID]

    if (ikTargetHead) removeEntity(ikTargetHead)
    if (ikTargetLeftHand) removeEntity(ikTargetLeftHand)
    if (ikTargetRightHand) removeEntity(ikTargetRightHand)
  }

  for (const action of ikTargetSpawnQueue()) {
    const entity = Engine.instance.getNetworkObject(action.$from, action.networkId)!
    setComponent(entity, NameComponent, action.$from + '_' + action.handedness)
    setComponent(entity, AvatarIKTargetComponent, { handedness: action.handedness })
    // addObjectToGroup(entity, new AxesHelper(0.5))
    setComponent(entity, VisibleComponent)
  }

  // todo - remove ik targets when session ends
  if (xrState.sessionActive && localClientEntity) {
    const sources = Array.from(inputSources.values())
    const head = getCameraMode() === 'attached'
    const leftHand = !!sources.find((s) => s.handedness === 'left')
    const rightHand = !!sources.find((s) => s.handedness === 'right')

    const headUUID = (Engine.instance.userId + xrTargetHeadSuffix) as EntityUUID
    const leftHandUUID = (Engine.instance.userId + xrTargetLeftHandSuffix) as EntityUUID
    const rightHandUUID = (Engine.instance.userId + xrTargetRightHandSuffix) as EntityUUID

    const ikTargetHead = UUIDComponent.entitiesByUUID[headUUID]
    const ikTargetLeftHand = UUIDComponent.entitiesByUUID[leftHandUUID]
    const ikTargetRightHand = UUIDComponent.entitiesByUUID[rightHandUUID]

    if (!head && ikTargetHead) removeEntity(ikTargetHead)
    if (!leftHand && ikTargetLeftHand) removeEntity(ikTargetLeftHand)
    if (!rightHand && ikTargetRightHand) removeEntity(ikTargetRightHand)

    if (head && !ikTargetHead) dispatchAction(XRAction.spawnIKTarget({ handedness: 'none', uuid: headUUID }))
    if (leftHand && !ikTargetLeftHand)
      dispatchAction(XRAction.spawnIKTarget({ handedness: 'left', uuid: leftHandUUID }))
    if (rightHand && !ikTargetRightHand)
      dispatchAction(XRAction.spawnIKTarget({ handedness: 'right', uuid: rightHandUUID }))
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
  const loopAnimationEntities = loopAnimationQuery().filter(filterPriorityEntities)
  const ikEntities = ikTargetQuery()

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

    setAvatarLocomotionAnimation(entity)

    /**
     * Apply IK
     */

    const avatarRigComponent = getComponent(entity, AvatarRigComponent)
    const rig = avatarRigComponent.rig
    const transform = getComponent(entity, TransformComponent)
    const animationState = getState(animationManager)

    //to do: get world space in a better way  -  can be proxified / use transform component?
    const worldSpaceRightHand = rig.hips.node.localToWorld(animationState.ikTargetsMap.rightHandTarget.position)
    const worldSpaceLeftHand = rig.hips.node.localToWorld(animationState.ikTargetsMap.leftHandTarget.position)
    const worldSpaceRightFoot = rig.hips.node.localToWorld(animationState.ikTargetsMap.rightFootTarget.position)
    const worldSpaceLeftFoot = rig.hips.node.localToWorld(animationState.ikTargetsMap.leftFootTarget.position)
    const hipsWorldSpace = new Vector3()
    rig.hips.node.getWorldPosition(hipsWorldSpace)

    //to do: get leg length of avatar in world space
    const legLength = 0.9
    //to do: get arm length of avatar in world space
    const armLength = 0.75
    //to do: get height of avatar in world space
    const height = 1.8

    //get rotations from ik targets and convert to world space relative to hips
    const rot = new Quaternion()
    rig.hips.node.getWorldQuaternion(rot)

    rightHandRot.multiplyQuaternions(rot, animationState.ikTargetsMap.rightHandTarget.quaternion)
    leftHandRot.multiplyQuaternions(rot, animationState.ikTargetsMap.leftHandTarget.quaternion)

    solveTwoBoneIK(
      rig.rightUpperArm.node,
      rig.rightLowerArm.node,
      rig.rightHand.node,
      worldSpaceRightHand,
      rightHandRot
    )
    solveTwoBoneIK(rig.leftUpperArm.node, rig.leftLowerArm.node, rig.leftHand.node, worldSpaceLeftHand, leftHandRot)

    //cast ray for right foot, starting at hips y position and foot x/z
    const footRaycastArgs = {
      type: SceneQueryType.Closest,
      origin: new Vector3(worldSpaceRightFoot.x, hipsWorldSpace.y, worldSpaceRightFoot.z),
      direction: new Vector3(0, -1, 0),
      maxDistance: legLength,
      groups: interactionGroups
    } as RaycastArgs

    const rightCastedRay = Physics.castRay(Engine.instance.physicsWorld, footRaycastArgs)
    if (rightCastedRay[0]) worldSpaceRightFoot.copy(rightCastedRay[0].position as Vector3)
    solveTwoBoneIK(
      rig.rightUpperLeg.node,
      rig.rightLowerLeg.node,
      rig.rightFoot.node,
      worldSpaceRightFoot.setY(worldSpaceRightFoot.y + 0.1),
      rot
    )

    //reuse raycast args object, cast ray for left foot
    footRaycastArgs.origin.set(worldSpaceLeftFoot.x, hipsWorldSpace.y, worldSpaceLeftFoot.z)
    const leftCastedRay = Physics.castRay(Engine.instance.physicsWorld, footRaycastArgs)
    if (leftCastedRay[0]) worldSpaceLeftFoot.copy(leftCastedRay[0].position as Vector3)
    solveTwoBoneIK(
      rig.leftUpperLeg.node,
      rig.leftLowerLeg.node,
      rig.leftFoot.node,
      worldSpaceLeftFoot.setY(worldSpaceLeftFoot.y + 0.1),
      rot
    )

    rig.hips.node.quaternion.copy(hipsRotationoffset)
  }

  /**
   * 3 - Get IK target pose from WebXR
   */

  // applyInputSourcePoseToIKTargets()

  /**
   * 4 - Apply avatar IK
   */
  // for (const entity of ikEntities) {
  //   /** Filter by priority queue */
  //   const networkObject = getComponent(entity, NetworkObjectComponent)
  //   const ownerEntity = Engine.instance.getUserAvatarEntity(networkObject.ownerId)
  //   if (!Engine.instance.priorityAvatarEntities.has(ownerEntity)) continue

  //   const transformComponent = getComponent(entity, TransformComponent)
  //   // If data is zeroed out, assume there is no input and do not run IK
  //   if (transformComponent.position.equals(V_000)) continue

  //   const { rig } = getComponent(ownerEntity, AvatarRigComponent)

  //   const ikComponent = getComponent(entity, AvatarIKTargetComponent)
  //   if (ikComponent.handedness === 'none') {
  //     _vec
  //       .set(
  //         transformComponent.matrix.elements[8],
  //         transformComponent.matrix.elements[9],
  //         transformComponent.matrix.elements[10]
  //       )
  //       .normalize() // equivalent to Object3D.getWorldDirection
  //     solveHipHeight(ownerEntity, transformComponent.position)

  //     solveLookIK(rig.head.node, _vec)
  //   } else if (ikComponent.handedness === 'left') {
  //     rig.leftLowerArm.node.quaternion.setFromAxisAngle(Axis.X, Math.PI * -0.25)
  //     /** @todo see if this is still necessary */
  //     rig.leftLowerArm.node.updateWorldMatrix(false, true)
  //     solveTwoBoneIK(
  //       rig.leftUpperArm.node,
  //       rig.leftLowerArm.node,
  //       rig.leftHand.node,
  //       transformComponent.position,
  //       transformComponent.rotation.multiply(leftHandRotation),
  //       leftHandRotationOffset
  //     )
  //   } else if (ikComponent.handedness === 'right') {
  //     rig.rightLowerArm.node.quaternion.setFromAxisAngle(Axis.X, Math.PI * 0.25)
  //     /** @todo see if this is still necessary */
  //     rig.rightLowerArm.node.updateWorldMatrix(false, true)
  //     solveTwoBoneIK(
  //       rig.rightUpperArm.node,
  //       rig.rightLowerArm.node,
  //       rig.rightHand.node,
  //       transformComponent.position,
  //       transformComponent.rotation.multiply(rightHandRotation),
  //       rightHandRotationOffset
  //     )
  //   }
  // }

  /**
   * Since the scene does not automatically update the matricies for all objects, which updates bones,
   * we need to manually do it for Loop Animation Entities
   */
  for (const entity of loopAnimationEntities) updateGroupChildren(entity)

  /** Run debug */
  for (const entity of Engine.instance.priorityAvatarEntities) {
    const avatarRig = getComponent(entity, AvatarRigComponent)
    if (avatarRig?.helper) {
      avatarRig.rig.hips.node.updateWorldMatrix(true, true)
      avatarRig.helper?.updateMatrixWorld(true)
    }
  }

  /** We don't need to ever calculate the matrices for ik targets, so mark them not dirty */
  for (const entity of ikEntities) {
    delete TransformComponent.dirtyTransforms[entity]
  }
}

const reactor = () => {
  useEffect(() => {
    //AnimationManager.instance.loadDefaultAnimations()
  }, [])
  return null
}

export const AvatarAnimationSystem = defineSystem({
  uuid: 'ee.engine.AvatarAnimationSystem',
  execute,
  reactor
})
