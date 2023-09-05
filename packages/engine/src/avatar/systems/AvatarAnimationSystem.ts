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

import { useEffect } from 'react'
import { Euler, MathUtils, Mesh, Quaternion, SphereGeometry, Vector3 } from 'three'

import { insertionSort } from '@etherealengine/common/src/utils/insertionSort'
import { defineState, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { V_010 } from '../../common/constants/MathConstants'
import { lerp } from '../../common/functions/MathLerpFunctions'
import { createPriorityQueue } from '../../ecs/PriorityQueue'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { defineQuery, getComponent, getOptionalComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { Physics, RaycastArgs } from '../../physics/classes/Physics'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { PhysicsState } from '../../physics/state/PhysicsState'
import { RaycastHit, SceneQueryType } from '../../physics/types/PhysicsTypes'
import { RendererState } from '../../renderer/RendererState'
import { addObjectToGroup } from '../../scene/components/GroupComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import {
  DistanceFromCameraComponent,
  FrustumCullCameraComponent,
  compareDistanceToCamera
} from '../../transform/components/DistanceComponents'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AnimationComponent } from '.././components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from '.././components/AvatarAnimationComponent'
import { AvatarIKTargetComponent } from '.././components/AvatarIKComponents'
import { applyInputSourcePoseToIKTargets } from '.././functions/applyInputSourcePoseToIKTargets'
import { updateAnimationGraph } from '../animation/AvatarAnimationGraph'
import { solveTwoBoneIK } from '../animation/TwoBoneIKSolver'
import { setIkFootTarget } from '../functions/avatarFootHeuristics'

export const AvatarAnimationState = defineState({
  name: 'AvatarAnimationState',
  initial: () => {
    const accumulationBudget = 100 //isMobileXRHeadset ? 3 : 6

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

const avatarAnimationQuery = defineQuery([AnimationComponent, AvatarAnimationComponent, AvatarRigComponent])

const ikTargetQuery = defineQuery([AvatarIKTargetComponent])

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

const _vector3 = new Vector3()
const _right = new Vector3()
const _forward = new Vector3()
const _hipVector = new Vector3()
const _hipRot = new Quaternion()
const leftLegVector = new Vector3()
const rightLegVector = new Vector3()
const hipsForward = new Vector3(0, 0, 1)

const midAxisRestriction = new Euler(0, 0, 0)
const tipAxisRestriction = new Euler(0, 0, 0)

interface targetTransform {
  position: Vector3
  rotation: Quaternion
  blendWeight: number
}

//stores raw position and rotation of the IK targets in world space
//is set from ecs ik target components that correspond with a given avatar
export const worldSpaceTargets = {
  rightHand: { position: new Vector3(), rotation: new Quaternion(), blendWeight: 1 } as targetTransform,
  leftHand: { position: new Vector3(), rotation: new Quaternion(), blendWeight: 1 } as targetTransform,
  rightFoot: { position: new Vector3(), rotation: new Quaternion(), blendWeight: 1 } as targetTransform,
  leftFoot: { position: new Vector3(), rotation: new Quaternion(), blendWeight: 1 } as targetTransform,
  head: { position: new Vector3(), rotation: new Quaternion(), blendWeight: 1 } as targetTransform,
  hips: { position: new Vector3(), rotation: new Quaternion(), blendWeight: 1 } as targetTransform,

  rightElbowHint: { position: new Vector3(), rotation: new Quaternion(), blendWeight: 1 } as targetTransform,
  leftElbowHint: { position: new Vector3(), rotation: new Quaternion(), blendWeight: 1 } as targetTransform,
  rightKneeHint: { position: new Vector3(), rotation: new Quaternion(), blendWeight: 1 } as targetTransform,
  leftKneeHint: { position: new Vector3(), rotation: new Quaternion(), blendWeight: 1 } as targetTransform,
  headHint: { position: new Vector3(), rotation: new Quaternion(), blendWeight: 1 } as targetTransform,
  hipsHint: { position: new Vector3(), rotation: new Quaternion(), blendWeight: 1 } as targetTransform
}

const setVisualizers = () => {
  const { visualizers } = getMutableState(AvatarAnimationState)
  const { physicsDebug: debugEnable } = getMutableState(RendererState)
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
}
const interactionGroups = getInteractionGroups(CollisionGroups.Avatars, CollisionGroups.Default)
const footRaycastArgs = {
  type: SceneQueryType.Closest,
  origin: new Vector3(),
  direction: new Vector3(0, -1, 0),
  maxDistance: 0,
  groups: interactionGroups
} as RaycastArgs

const lastRayInfo = {} as Record<number, RaycastHit>
const lastLerpPosition = {} as Record<number, number>
const setFootTarget = (
  hipsPos: Vector3,
  footPos: targetTransform,
  legLength: number,
  castRay: boolean,
  index: number
) => {
  footRaycastArgs.origin.set(footPos.position.x, hipsPos.y + legLength, footPos.position.z)
  footRaycastArgs.maxDistance = legLength

  if (castRay) {
    const castedRay = Physics.castRay(getState(PhysicsState).physicsWorld, footRaycastArgs)
    if (castedRay[0]) {
      lastRayInfo[index] = castedRay[0]
    } else {
      delete lastRayInfo[index]
      delete lastLerpPosition[index]
    }
  }

  const castedRay = lastRayInfo[index]
  if (castedRay) {
    if (!lastLerpPosition[index]) lastLerpPosition[index] = footPos.position.y
    lastLerpPosition[index] = lerp(
      lastLerpPosition[index],
      castedRay.position.y,
      getState(EngineState).deltaSeconds * 10
    )
    footPos.position.setY(lastLerpPosition[index])
    //footPos.rotation.copy(new Quaternion().setFromUnitVectors(castedRay.normal as Vector3, new Vector3(0, 1, 0)))
  }
}

const footRaycastInterval = 0.25
let footRaycastTimer = 0

const execute = () => {
  const { priorityQueue, sortedTransformEntities, visualizers } = getState(AvatarAnimationState)
  const { elapsedSeconds, deltaSeconds } = getState(EngineState)
  const { avatarDebug } = getState(RendererState)

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
  const ikEntities = ikTargetQuery()

  footRaycastTimer += deltaSeconds
  updateAnimationGraph(avatarAnimationEntities)

  for (const entity of avatarAnimationEntities) {
    const rigComponent = getComponent(entity, AvatarRigComponent)
    const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)

    const deltaTime = elapsedSeconds - avatarAnimationComponent.deltaAccumulator
    avatarAnimationComponent.deltaAccumulator = elapsedSeconds
    const rig = rigComponent.rig

    if (!rig?.hips?.node) continue

    const rigidbodyComponent = getOptionalComponent(entity, RigidBodyComponent)
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
     * Apply procedural IK based animations or FK animations depending on the animation state
     * First reset targets
     */

    for (const [key, ikBone] of Object.entries(rigComponent.rig)) {
      ikBone.node.quaternion.copy(rigComponent.localRig[key].node.quaternion)
      //todo: lerp this
      rig.hips.node.position.copy(rigComponent.localRig.hips.node.position)
    }

    //clear some data
    for (const [key, value] of Object.entries(worldSpaceTargets)) {
      value.blendWeight = 0
      value.position.set(0, 0, 0)
      value.rotation.identity()
    }

    if (rigComponent.ikOverride != '') {
      hipsForward.set(0, 0, 1)

      //calculate world positions

      const transform = getComponent(entity, TransformComponent)

      applyInputSourcePoseToIKTargets()
      setIkFootTarget(rigComponent.upperLegLength + rigComponent.lowerLegLength, deltaTime)

      for (const ikEntity of ikEntities) {
        if (ikEntities.length <= 1) continue
        const networkObject = getComponent(ikEntity, NetworkObjectComponent)
        const ownerEntity = NetworkObjectComponent.getUserAvatarEntity(networkObject.ownerId)
        if (ownerEntity !== entity) continue

        const rigidbodyComponent = getComponent(ownerEntity, RigidBodyComponent)
        const rigComponent = getComponent(ownerEntity, AvatarRigComponent)

        const ikTargetName = getComponent(ikEntity, NameComponent).split('_').pop()!
        const ikTransform = getComponent(ikEntity, TransformComponent)
        const ikComponent = getComponent(ikEntity, AvatarIKTargetComponent)

        //special case for the head if we're in xr mode
        //todo: automatically infer whether or not we need to set hips position from the head position
        if (rigComponent.ikOverride == 'xr' && ikTargetName == 'head') {
          worldSpaceTargets.head.blendWeight = ikComponent.blendWeight
          rig.hips.node.position.copy(
            _vector3.copy(ikTransform.position).setY(ikTransform.position.y - rigComponent.torsoLength - 0.125)
          )

          //offset target forward to account for hips being behind the head
          hipsForward.applyQuaternion(rigidbodyComponent!.rotation)
          hipsForward.multiplyScalar(0.125)
          rig.hips.node.position.sub(hipsForward)

          //calculate head look direction and apply to head bone
          //look direction should be set outside of the xr switch
          rig.head.node.quaternion.copy(
            _quat.multiplyQuaternions(
              rig.spine.node.getWorldQuaternion(new Quaternion()).invert(),
              ikTransform.rotation
            )
          )
          continue
        }
        //otherwise just set the target position, rotation and blend weight
        worldSpaceTargets[ikTargetName].position.copy(ikTransform.position)
        worldSpaceTargets[ikTargetName].rotation.copy(ikTransform.rotation)
        worldSpaceTargets[ikTargetName].blendWeight = ikComponent.blendWeight
      }

      if (avatarDebug) {
        let i = 0
        for (const [key] of Object.entries(worldSpaceTargets)) {
          //if xr is active, set select targets to xr tracking data
          const visualizerTransform = getComponent(visualizers[i], TransformComponent)
          visualizerTransform.position.copy(worldSpaceTargets[key].position)
          i++
        }
      }

      const leftLegLength =
        leftLegVector.subVectors(rig.hips.node.position, worldSpaceTargets.leftFoot.position).length() +
        rigComponent.footHeight
      const rightLegLength =
        rightLegVector.subVectors(rig.hips.node.position, worldSpaceTargets.rightFoot.position).length() +
        rigComponent.footHeight

      const forward = _forward.set(0, 0, 1).applyQuaternion(transform.rotation)
      const right = _right.set(5, 0, 0).applyQuaternion(transform.rotation)

      //calculate hips to head
      rig.hips.node.position.applyMatrix4(transform.matrixInverse)
      //_hipVector.subVectors(
      //  rigComponent.ikTargetsMap.headTarget.position,
      //  rigComponent.ikTargetsMap.hipsTarget.position
      //)
      rig.hips.node.quaternion
        .setFromUnitVectors(V_010, _hipVector)
        .multiply(_hipRot.setFromEuler(new Euler(0, rigComponent.flipped ? Math.PI : 0)))

      if (worldSpaceTargets.rightHand.blendWeight > 0) {
        solveTwoBoneIK(
          rig.rightUpperArm.node,
          rig.rightLowerArm.node,
          rig.rightHand.node,
          worldSpaceTargets.rightHand.position,
          worldSpaceTargets.rightHand.rotation,
          null,
          worldSpaceTargets.rightElbowHint.blendWeight > 0
            ? worldSpaceTargets.rightElbowHint.position
            : _vector3.copy(transform.position).sub(right),
          tipAxisRestriction,
          midAxisRestriction,
          null,
          worldSpaceTargets.rightHand.blendWeight,
          worldSpaceTargets.rightHand.blendWeight
        )
      }

      if (worldSpaceTargets.leftHand.blendWeight > 0) {
        solveTwoBoneIK(
          rig.leftUpperArm.node,
          rig.leftLowerArm.node,
          rig.leftHand.node,
          worldSpaceTargets.leftHand.position,
          worldSpaceTargets.leftHand.rotation,
          null,
          worldSpaceTargets.leftElbowHint.blendWeight > 0
            ? worldSpaceTargets.leftElbowHint.position
            : _vector3.copy(transform.position).add(right),
          tipAxisRestriction,
          midAxisRestriction,
          null,
          worldSpaceTargets.leftHand.blendWeight,
          worldSpaceTargets.leftHand.blendWeight
        )
      }

      if (footRaycastTimer >= footRaycastInterval) {
        footRaycastTimer = 0
      }

      if (worldSpaceTargets.rightFoot.blendWeight > 0) {
        setFootTarget(
          transform.position,
          worldSpaceTargets.rightFoot,
          rightLegLength,
          footRaycastTimer >= footRaycastInterval,
          0
        )
        solveTwoBoneIK(
          rig.rightUpperLeg.node,
          rig.rightLowerLeg.node,
          rig.rightFoot.node,
          worldSpaceTargets.rightFoot.position,
          worldSpaceTargets.rightFoot.rotation,
          null,
          worldSpaceTargets.rightKneeHint.blendWeight > 0
            ? worldSpaceTargets.rightKneeHint.position
            : _vector3.copy(transform.position).add(forward),
          null,
          midAxisRestriction,
          null,
          worldSpaceTargets.rightFoot.blendWeight,
          worldSpaceTargets.rightFoot.blendWeight
        )
      }

      if (worldSpaceTargets.leftFoot.blendWeight > 0) {
        setFootTarget(
          transform.position,
          worldSpaceTargets.leftFoot,
          leftLegLength,
          footRaycastTimer >= footRaycastInterval,
          1
        )
        solveTwoBoneIK(
          rig.leftUpperLeg.node,
          rig.leftLowerLeg.node,
          rig.leftFoot.node,
          worldSpaceTargets.leftFoot.position,
          worldSpaceTargets.leftFoot.rotation,
          null,
          worldSpaceTargets.leftKneeHint.blendWeight > 0
            ? worldSpaceTargets.leftKneeHint.position
            : _vector3.copy(transform.position).add(forward),
          null,
          midAxisRestriction,
          null,
          worldSpaceTargets.leftFoot.blendWeight,
          worldSpaceTargets.leftFoot.blendWeight
        )
      }
    }

    rigComponent.vrm.update(deltaTime)
  }

  /** Run debug */
  for (const entity of Engine.instance.priorityAvatarEntities) {
    const rigComponent = getComponent(entity, AvatarRigComponent)
    if (rigComponent?.helper) {
      rigComponent.rig.hips.node.updateWorldMatrix(true, true)
      rigComponent.helper?.updateMatrixWorld(true)
    }
  }
}

const reactor = () => {
  const renderState = useHookstate(getMutableState(RendererState))
  useEffect(() => {
    setVisualizers()
  }, [renderState.physicsDebug])
  return null
}

export const AvatarAnimationSystem = defineSystem({
  uuid: 'ee.engine.AvatarAnimationSystem',
  execute,
  reactor
})
