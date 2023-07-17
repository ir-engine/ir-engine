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

import { clone } from 'lodash'
import { useEffect } from 'react'
import { AxesHelper, Bone, Euler, MathUtils, Matrix4, Mesh, Quaternion, SphereGeometry, Vector3 } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { insertionSort } from '@etherealengine/common/src/utils/insertionSort'
import {
  defineActionQueue,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  startReactor,
  useHookstate
} from '@etherealengine/hyperflux'

import { Axis } from '../../common/constants/Axis3D'
import { V_000, V_010 } from '../../common/constants/MathConstants'
import { proxifyQuaternion } from '../../common/proxies/createThreejsProxy'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import {
  defineQuery,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { createPriorityQueue } from '../../ecs/PriorityQueue'
import { InputSourceComponent } from '../../input/components/InputSourceComponent'
import { InputState } from '../../input/state/InputState'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { Physics, RaycastArgs } from '../../physics/classes/Physics'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { RaycastHit, SceneQueryType } from '../../physics/types/PhysicsTypes'
import { RendererState } from '../../renderer/RendererState'
import { addObjectToGroup, GroupComponent } from '../../scene/components/GroupComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import {
  compareDistanceToCamera,
  DistanceFromCameraComponent,
  FrustumCullCameraComponent
} from '../../transform/components/DistanceComponents'
import { TransformComponent, TransformComponentType } from '../../transform/components/TransformComponent'
import { updateGroupChildren } from '../../transform/systems/TransformSystem'
import { setTrackingSpace } from '../../xr/XRScaleAdjustmentFunctions'
import { getCameraMode, isMobileXRHeadset, XRAction, XRState } from '../../xr/XRState'
import { updateAnimationGraph } from '.././animation/AnimationGraph'
import { solveHipHeight } from '.././animation/HipIKSolver'
import { solveLookIK } from '.././animation/LookAtIKSolver'
import { solveTwoBoneIK } from '.././animation/TwoBoneIKSolver'
import { AnimationManager } from '.././AnimationManager'
import { AnimationComponent } from '.././components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from '.././components/AvatarAnimationComponent'
import {
  AvatarIKTargetComponent,
  xrTargetHeadSuffix,
  xrTargetLeftHandSuffix,
  xrTargetRightHandSuffix
} from '.././components/AvatarIKComponents'
import { LoopAnimationComponent } from '.././components/LoopAnimationComponent'
import { applyInputSourcePoseToIKTargets } from '.././functions/applyInputSourcePoseToIKTargets'
import { AvatarMovementSettingsState } from '.././state/AvatarMovementSettingsState'
import { setAvatarLocomotionAnimation } from '../animation/AvatarAnimationGraph'
import { interactionGroups } from '../functions/autopilotFunctions'

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
      sortedTransformEntities: [] as Entity[],
      visualizers: [] as Entity[]
    }
  }
})

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

const inputSourceQuery = defineQuery([InputSourceComponent])

const minimumFrustumCullDistanceSqr = 5 * 5 // 5 units

const filterPriorityEntities = (entity: Entity) =>
  Engine.instance.priorityAvatarEntities.has(entity) || entity === Engine.instance.localClientEntity

const filterFrustumCulledEntities = (entity: Entity) =>
  !(
    DistanceFromCameraComponent.squaredDistance[entity] > minimumFrustumCullDistanceSqr &&
    FrustumCullCameraComponent.isCulled[entity]
  )

let avatarSortAccumulator = 0
const _quat = new Quaternion()
const _worldQuat = new Quaternion()

const _vector3 = new Vector3()
const _position = new Vector3()
const _hipVector = new Vector3()
const leftLegVector = new Vector3()
const rightLegVector = new Vector3()

const rightHandOffset = new Quaternion().setFromEuler(new Euler(0, 0, 0))
const leftHandOffset = new Quaternion().setFromEuler(new Euler(0, 0, 0))

const midAxisRestriction = new Euler(-Math.PI / 4, undefined, undefined) // Restrict rotation around the X-axis to 45 degrees

interface targetTransform {
  position: Vector3
  rotation: Quaternion
}

//raw position and rotation of the IK targets in world space
const worldSpaceTargets = {
  rightHandTarget: { position: new Vector3(), rotation: new Quaternion() } as targetTransform,
  leftHandTarget: { position: new Vector3(), rotation: new Quaternion() } as targetTransform,
  rightFootTarget: { position: new Vector3(), rotation: new Quaternion() } as targetTransform,
  leftFootTarget: { position: new Vector3(), rotation: new Quaternion() } as targetTransform,
  headTarget: { position: new Vector3(), rotation: new Quaternion() } as targetTransform,
  hipsTarget: { position: new Vector3(), rotation: new Quaternion() } as targetTransform,

  rightElbowHint: { position: new Vector3(), rotation: new Quaternion() } as targetTransform,
  leftElbowHint: { position: new Vector3(), rotation: new Quaternion() } as targetTransform,
  rightKneeHint: { position: new Vector3(), rotation: new Quaternion() } as targetTransform,
  leftKneeHint: { position: new Vector3(), rotation: new Quaternion() } as targetTransform,
  headHint: { position: new Vector3(), rotation: new Quaternion() } as targetTransform
}

const setVisualizers = () => {
  const { visualizers } = getMutableState(AvatarAnimationState)
  const { debugEnable } = getMutableState(RendererState)
  console.log(debugEnable)
  if (!debugEnable.value) {
    //remove visualizers
    for (let i = 0; i < visualizers.length; i++) {
      removeEntity(visualizers[i].value)
    }

    return
  }
  for (let i = 0; i < 11; i++) {
    const e = createEntity()
    setComponent(e, VisibleComponent, true)
    addObjectToGroup(e, new Mesh(new SphereGeometry(0.05)))
    setComponent(e, TransformComponent)
    visualizers[i].set(e)
  }
  console.log(visualizers)
}

const footRaycastArgs = {
  type: SceneQueryType.Closest,
  origin: new Vector3(),
  direction: new Vector3(0, -1, 0),
  maxDistance: 0,
  groups: interactionGroups
} as RaycastArgs

const lastRayInfo = {} as Record<number, RaycastHit>
const setFootTarget = (
  hipsPos: Vector3,
  footPos: targetTransform,
  legLength: number,
  castRay: boolean,
  index: number
) => {
  footRaycastArgs.origin.set(footPos.position.x, hipsPos.y, footPos.position.z)
  footRaycastArgs.maxDistance = legLength

  if (castRay) {
    const castedRay = Physics.castRay(Engine.instance.physicsWorld, footRaycastArgs)
    if (castedRay[0]) lastRayInfo[index] = castedRay[0]
    else delete lastRayInfo[index]
  }

  const castedRay = lastRayInfo[index]
  if (castedRay) footPos.position.copy(castedRay.position as Vector3)
}

const footRaycastInterval = 0.25
let footRaycastTimer = 0

const execute = () => {
  const xrState = getState(XRState)
  const { priorityQueue, sortedTransformEntities, visualizers } = getState(AvatarAnimationState)
  const { elapsedSeconds, deltaSeconds, localClientEntity } = Engine.instance
  const { debugEnable } = getState(RendererState)

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

    setTrackingSpace()
  }

  // todo - remove ik targets when session ends
  if (xrState.sessionActive && localClientEntity) {
    const sources = inputSourceQuery().map((eid) => getComponent(eid, InputSourceComponent).source)

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

    if (head && !ikTargetHead) dispatchAction(XRAction.spawnIKTarget({ handedness: 'none', entityUUID: headUUID }))
    if (leftHand && !ikTargetLeftHand)
      dispatchAction(XRAction.spawnIKTarget({ handedness: 'left', entityUUID: leftHandUUID }))
    if (rightHand && !ikTargetRightHand)
      dispatchAction(XRAction.spawnIKTarget({ handedness: 'right', entityUUID: rightHandUUID }))
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
    insertionSort(sortedTransformEntities, compareDistanceToCamera)
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

  footRaycastTimer += deltaSeconds

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

    const rigComponent = getComponent(entity, AvatarRigComponent)
    const rig = rigComponent.rig
    const animationState = getState(AnimationManager)

    if (!animationState.targetsAnimation) return

    //calculate world positions

    const transform = getComponent(entity, TransformComponent)

    let i = 0
    for (const [key, value] of Object.entries(rigComponent.ikTargetsMap)) {
      //if xr is active, set select targets to xr tracking data
      worldSpaceTargets[key].position
        .copy(value.position)
        .add(rigComponent.ikOffsetsMap.get(key)!)
        .applyMatrix4(transform.matrix)

      if (debugEnable) {
        const visualizerTransform = getComponent(visualizers[i], TransformComponent)
        visualizerTransform.position.copy(worldSpaceTargets[key].position)
      }
      i++
    }

    applyInputSourcePoseToIKTargets()

    for (const ikEntity of ikEntities) {
      if (ikEntities.length <= 1) continue
      const networkObject = getComponent(ikEntity, NetworkObjectComponent)
      const ownerEntity = Engine.instance.getUserAvatarEntity(networkObject.ownerId)
      if (ownerEntity != entity) continue

      const rigidbodyComponent = getComponent(ownerEntity, RigidBodyComponent)
      const rigComponent = getComponent(ownerEntity, AvatarRigComponent)

      const ikTargetComponent = getComponent(ikEntity, AvatarIKTargetComponent)
      const ikTransform = getComponent(ikEntity, TransformComponent)
      //todo - use a map for this
      switch (ikTargetComponent.handedness) {
        case 'left':
          worldSpaceTargets.leftHandTarget.position.copy(ikTransform.position)
          worldSpaceTargets.leftHandTarget.rotation.copy(ikTransform.rotation)
          break
        case 'right':
          worldSpaceTargets.rightHandTarget.position.copy(ikTransform.position)
          worldSpaceTargets.rightHandTarget.rotation.copy(ikTransform.rotation)
          break
        case 'none':
          worldSpaceTargets.hipsTarget.position.copy(
            _vector3.copy(ikTransform.position).setY(ikTransform.position.y - rigComponent.torsoLength - 0.125)
          )
          //offset target forward to account for hips being behind the head
          const hipsForward = new Vector3(0, 0, 1)
          hipsForward.applyQuaternion(rigidbodyComponent!.rotation)
          hipsForward.multiplyScalar(0.125)
          worldSpaceTargets.hipsTarget.position.sub(hipsForward)

          //calculate head look direction and apply to head bone
          //look direction should be set outside of the xr switch
          rig.head.node.quaternion.copy(
            _quat.multiplyQuaternions(
              rig.spine.node.getWorldQuaternion(new Quaternion()).invert(),
              ikTransform.rotation
            )
          )
          break
      }
    }

    //replace references to this with hips calculation below
    const hipsWorldSpace = new Vector3()
    rig.hips.node.getWorldPosition(hipsWorldSpace)

    const leftLegLength =
      leftLegVector
        .subVectors(worldSpaceTargets.hipsTarget.position, worldSpaceTargets.leftFootTarget.position)
        .length() + rigComponent.footHeight
    const rightLegLength =
      rightLegVector
        .subVectors(worldSpaceTargets.hipsTarget.position, worldSpaceTargets.rightFootTarget.position)
        .length() + rigComponent.footHeight

    //get rotations from ik targets and convert to world space relative to hips
    const rot = new Quaternion()
    rig.hips.node.getWorldQuaternion(rot)

    //calculate hips to head
    rig.hips.node.position.copy(
      rigComponent.vrm.humanoid.normalizedHumanBonesRoot.worldToLocal(worldSpaceTargets.hipsTarget.position)
    )
    _hipVector.subVectors(rigComponent.ikTargetsMap.headTarget.position, rigComponent.ikTargetsMap.hipsTarget.position)
    rig.hips.node.quaternion
      .setFromUnitVectors(V_010, _hipVector)
      .multiply(new Quaternion().setFromEuler(new Euler(0, Math.PI)))

    //right now we only want hand rotation set if we are in xr
    const xrValue = xrState.sessionActive ? 1 : 0

    solveTwoBoneIK(
      rig.rightUpperArm.node,
      rig.rightLowerArm.node,
      rig.rightHand.node,
      worldSpaceTargets.rightHandTarget.position,
      worldSpaceTargets.rightHandTarget.rotation,
      null,
      worldSpaceTargets.rightElbowHint.position,
      null,
      midAxisRestriction,
      null,
      1,
      xrValue
    )

    solveTwoBoneIK(
      rig.leftUpperArm.node,
      rig.leftLowerArm.node,
      rig.leftHand.node,
      worldSpaceTargets.leftHandTarget.position,
      worldSpaceTargets.leftHandTarget.rotation,
      null,
      worldSpaceTargets.leftElbowHint.position,
      null,
      midAxisRestriction,
      null,
      1,
      xrValue
    )

    setFootTarget(worldSpaceTargets.hipsTarget.position, worldSpaceTargets.rightFootTarget, rightLegLength, true, 0)
    setFootTarget(worldSpaceTargets.hipsTarget.position, worldSpaceTargets.leftFootTarget, leftLegLength, true, 1)

    if (footRaycastTimer >= footRaycastInterval) {
      footRaycastTimer = 0
    }

    solveTwoBoneIK(
      rig.rightUpperLeg.node,
      rig.rightLowerLeg.node,
      rig.rightFoot.node,
      worldSpaceTargets.rightFootTarget.position.setY(
        worldSpaceTargets.rightFootTarget.position.y + rigComponent.footHeight
      ),
      worldSpaceTargets.rightFootTarget.rotation,
      null,
      worldSpaceTargets.rightKneeHint.position,
      null,
      midAxisRestriction
    )

    solveTwoBoneIK(
      rig.leftUpperLeg.node,
      rig.leftLowerLeg.node,
      rig.leftFoot.node,
      worldSpaceTargets.leftFootTarget.position.setY(
        worldSpaceTargets.leftFootTarget.position.y + rigComponent.footHeight
      ),
      rot,
      null,
      worldSpaceTargets.leftKneeHint.position,
      null,
      midAxisRestriction
    )
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
    // delete TransformComponent.dirtyTransforms[entity]
  }
}

const reactor = () => {
  const renderState = useHookstate(getMutableState(RendererState))
  useEffect(() => {
    setVisualizers()
    console.log('set')
  }, [renderState.debugEnable])
  return null
}

export const AvatarAnimationSystem = defineSystem({
  uuid: 'ee.engine.AvatarAnimationSystem',
  execute,
  reactor
})
