import { useEffect } from 'react'
import { AxesHelper, Bone, Euler, MathUtils, Matrix4, Quaternion, Vector3 } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { insertionSort } from '@etherealengine/common/src/utils/insertionSort'
import { defineActionQueue, defineState, dispatchAction, getState } from '@etherealengine/hyperflux'

import { Axis } from '../common/constants/Axis3D'
import { V_000 } from '../common/constants/MathConstants'
import { proxifyQuaternion } from '../common/proxies/createThreejsProxy'
import { Engine } from '../ecs/classes/Engine'
import { EngineState } from '../ecs/classes/EngineState'
import { Entity } from '../ecs/classes/Entity'
import { defineQuery, getComponent, getOptionalComponent, setComponent } from '../ecs/functions/ComponentFunctions'
import { removeEntity } from '../ecs/functions/EntityFunctions'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { createPriorityQueue } from '../ecs/PriorityQueue'
import { NetworkObjectComponent } from '../networking/components/NetworkObjectComponent'
import { RigidBodyComponent } from '../physics/components/RigidBodyComponent'
import { addObjectToGroup, GroupComponent } from '../scene/components/GroupComponent'
import { NameComponent } from '../scene/components/NameComponent'
import { UUIDComponent } from '../scene/components/UUIDComponent'
import { VisibleComponent } from '../scene/components/VisibleComponent'
import { ObjectLayers } from '../scene/constants/ObjectLayers'
import { setObjectLayers } from '../scene/functions/setObjectLayers'
import {
  compareDistance,
  DistanceFromCameraComponent,
  FrustumCullCameraComponent
} from '../transform/components/DistanceComponents'
import { TransformComponent } from '../transform/components/TransformComponent'
import { updateGroupChildren } from '../transform/systems/TransformSystem'
import { getCameraMode, isMobileXRHeadset, XRAction, XRState } from '../xr/XRState'
import { updateAnimationGraph } from './animation/AnimationGraph'
import { solveHipHeight } from './animation/HipIKSolver'
import { solveLookIK } from './animation/LookAtIKSolver'
import { solveTwoBoneIK } from './animation/TwoBoneIKSolver'
import { AnimationManager } from './AnimationManager'
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
import { AvatarMovementSettingsState } from './state/AvatarMovementSettingsState'

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
const _fwd = new Vector3()

// setComponent(entity, AvatarArmsTwistCorrectionComponent, {
//   LeftHandBindRotationInv: new Quaternion(),
//   LeftArmTwistAmount: 0.6,
//   RightHandBindRotationInv: new Quaternion(),
//   RightArmTwistAmount: 0.6
// })

const loopAnimationQuery = defineQuery([
  VisibleComponent,
  LoopAnimationComponent,
  AnimationComponent,
  AvatarAnimationComponent,
  AvatarRigComponent,
  GroupComponent
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

const leftHandRotation = new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, Math.PI))
const leftHandRotationOffset = new Quaternion().setFromEuler(new Euler(Math.PI * 0.4, -Math.PI * 0.1, 0))

const rightHandRotation = new Quaternion().setFromEuler(new Euler(-Math.PI / 2, 0, 0))
const rightHandRotationOffset = new Quaternion().setFromEuler(new Euler(-Math.PI * 0.4, Math.PI * 0.1, 0))

let avatarSortAccumulator = 0
const _quat = new Quaternion()

const execute = () => {
  const xrState = getState(XRState)
  const { priorityQueue, sortedTransformEntities } = getState(AvatarAnimationState)
  const { localClientEntity, inputSources } = Engine.instance
  const { elapsedSeconds, deltaSeconds } = getState(EngineState)

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
    const entity = Engine.instance.getNetworkObject(action.$from, action.networkId)
    if (!entity) {
      console.warn('Could not find entity for networkId', action.$from, action.networkId)
      continue
    }
    setComponent(entity, NameComponent, action.$from + '_' + action.handedness)
    setComponent(entity, AvatarIKTargetComponent, { handedness: action.handedness })
    const helper = new AxesHelper(0.5)
    setObjectLayers(helper, ObjectLayers.Gizmos)
    addObjectToGroup(entity, helper)
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
      avatarAnimationComponent.locomotion.z = Math.min(
        MathUtils.lerp(
          avatarAnimationComponent.locomotion.z || 0,
          _vector3.copy(rigidbodyComponent.linearVelocity).setComponent(1, 0).length(),
          10 * deltaTime
        ),
        getState(AvatarMovementSettingsState).runSpeed
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
   * 3 - Get IK target pose from WebXR
   */

  applyInputSourcePoseToIKTargets()

  /**
   * 4 - Apply avatar IK
   */
  for (const entity of ikEntities) {
    /** Filter by priority queue */
    const networkObject = getComponent(entity, NetworkObjectComponent)
    const ownerEntity = Engine.instance.getUserAvatarEntity(networkObject.ownerId)
    if (!Engine.instance.priorityAvatarEntities.has(ownerEntity)) continue

    const transformComponent = getComponent(entity, TransformComponent)
    // If data is zeroed out, assume there is no input and do not run IK
    if (transformComponent.position.equals(V_000)) continue

    const { rig, handRadius } = getComponent(ownerEntity, AvatarRigComponent)

    _fwd.set(0, 0, 1).applyQuaternion(transformComponent.rotation)

    const ikComponent = getComponent(entity, AvatarIKTargetComponent)
    if (ikComponent.handedness === 'none') {
      _vec
        .set(
          transformComponent.matrix.elements[8],
          transformComponent.matrix.elements[9],
          transformComponent.matrix.elements[10]
        )
        .normalize() // equivalent to Object3D.getWorldDirection
      solveHipHeight(ownerEntity, transformComponent.position)
      solveLookIK(rig.Head, _vec)
    } else if (ikComponent.handedness === 'left') {
      rig.LeftForeArm.quaternion.setFromAxisAngle(Axis.X, Math.PI * -0.25)
      /** @todo see if this is still necessary */
      rig.LeftForeArm.updateWorldMatrix(true, true)
      solveTwoBoneIK(
        rig.LeftArm,
        rig.LeftForeArm,
        rig.LeftHand,
        _vector3.addVectors(transformComponent.position, _fwd.multiplyScalar(handRadius)),
        _quat.multiplyQuaternions(transformComponent.rotation, leftHandRotation),
        leftHandRotationOffset
      )
    } else if (ikComponent.handedness === 'right') {
      rig.RightForeArm.quaternion.setFromAxisAngle(Axis.X, Math.PI * 0.25)
      /** @todo see if this is still necessary */
      rig.RightForeArm.updateWorldMatrix(true, true)
      solveTwoBoneIK(
        rig.RightArm,
        rig.RightForeArm,
        rig.RightHand,
        _vector3.addVectors(transformComponent.position, _fwd.multiplyScalar(handRadius)),
        _quat.multiplyQuaternions(transformComponent.rotation, rightHandRotation),
        rightHandRotationOffset
      )
    }
  }

  /**
   * Since the scene does not automatically update the matricies for all objects, which updates bones,
   * we need to manually do it for Loop Animation Entities
   */
  for (const entity of loopAnimationEntities) updateGroupChildren(entity)

  /** Run debug */
  for (const entity of Engine.instance.priorityAvatarEntities) {
    const avatarRig = getComponent(entity, AvatarRigComponent)
    if (avatarRig?.helper) {
      avatarRig.rig.Hips.updateWorldMatrix(true, true)
      avatarRig.helper?.updateMatrixWorld(true)
    }
  }

  /** We don't need to ever calculate the matrices for ik targets, so mark them not dirty */
  for (const entity of ikEntities) {
    // delete TransformComponent.dirtyTransforms[entity]
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
