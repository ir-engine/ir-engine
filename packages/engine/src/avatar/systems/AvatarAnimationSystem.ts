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

import {
  defineActionQueue,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  useHookstate
} from '@etherealengine/hyperflux'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { VRMHumanBoneList } from '@pixiv/three-vrm'
import { createPriorityQueue, createSortAndApplyPriorityQueue } from '../../ecs/PriorityQueue'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import {
  defineQuery,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  removeComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { MotionCaptureRigComponent } from '../../mocap/MotionCaptureRigComponent'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { RendererState } from '../../renderer/RendererState'
import { addObjectToGroup } from '../../scene/components/GroupComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { compareDistanceToCamera } from '../../transform/components/DistanceComponents'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRRigComponent } from '../../xr/XRRigComponent'
import { setTrackingSpace } from '../../xr/XRScaleAdjustmentFunctions'
import { XRControlsState, XRState, isMobileXRHeadset } from '../../xr/XRState'
import { AnimationComponent } from '.././components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from '.././components/AvatarAnimationComponent'
import { AvatarHeadDecapComponent, AvatarIKTargetComponent } from '.././components/AvatarIKComponents'
import { applyInputSourcePoseToIKTargets } from '.././functions/applyInputSourcePoseToIKTargets'
import { updateAnimationGraph } from '../animation/AvatarAnimationGraph'
import { solveTwoBoneIK } from '../animation/TwoBoneIKSolver'
import { ikTargets } from '../animation/Util'
import { AvatarComponent } from '../components/AvatarComponent'
import { setIkFootTarget } from '../functions/avatarFootHeuristics'
import { AvatarNetworkAction } from '../state/AvatarNetworkActions'

export const AvatarAnimationState = defineState({
  name: 'AvatarAnimationState',
  initial: () => {
    const accumulationBudget = isMobileXRHeadset ? 2 : 6

    const priorityQueue = createPriorityQueue({
      accumulationBudget
    })

    return {
      priorityQueue,
      sortedTransformEntities: [] as Entity[],
      visualizers: [] as Entity[]
    }
  }
})

const avatarAnimationQuery = defineQuery([AnimationComponent, AvatarAnimationComponent, AvatarRigComponent])
const avatarComponentQuery = defineQuery([AvatarComponent])

const _quat = new Quaternion()
const _vector3 = new Vector3()
const _right = new Vector3()
const _forward = new Vector3()
const hipsForward = new Vector3(0, 0, 1)

const midAxisRestriction = new Euler(0, 0, 0)
const tipAxisRestriction = new Euler(0, 0, 0)

const setVisualizers = () => {
  const { visualizers } = getMutableState(AvatarAnimationState)
  const { physicsDebug } = getMutableState(RendererState)
  if (!physicsDebug.value) {
    //remove visualizers
    for (let i = 0; i < visualizers.length; i++) {
      removeEntity(visualizers[i].value)
    }

    return
  }
  for (let i = 0; i < 11; i++) {
    const e = createEntity()
    setComponent(e, VisibleComponent, true)
    setComponent(e, NameComponent, 'Avatar Debug Visualizer')
    addObjectToGroup(e, new Mesh(new SphereGeometry(0.05)))
    setComponent(e, TransformComponent)
    visualizers[i].set(e)
  }
}

const footRaycastInterval = 0.25
let footRaycastTimer = 0

const avatarXrActions = defineActionQueue(AvatarNetworkAction.setAvatarXrTracking.matches)

const sortAndApplyPriorityQueue = createSortAndApplyPriorityQueue(avatarComponentQuery, compareDistanceToCamera)

const execute = () => {
  const { priorityQueue, sortedTransformEntities, visualizers } = getState(AvatarAnimationState)
  const { elapsedSeconds, deltaSeconds } = getState(EngineState)
  const { avatarDebug } = getState(RendererState)

  for (const action of avatarXrActions()) {
    const entity = UUIDComponent.entitiesByUUID[action.entityUUID]
    if (action.active) setComponent(entity, XRRigComponent)
    else removeComponent(entity, XRRigComponent)
  }

  /**
   * 1 - Sort & apply avatar priority queue
   */
  sortAndApplyPriorityQueue(priorityQueue, sortedTransformEntities, deltaSeconds)

  /**
   * 2 - Apply avatar animations
   */

  const avatarAnimationQueryArr = avatarAnimationQuery()
  const avatarAnimationEntities: Entity[] = []

  for (let i = 0; i < avatarAnimationQueryArr.length; i++) {
    const _entity = avatarAnimationQueryArr[i]
    if (priorityQueue.priorityEntities.has(_entity) || _entity === Engine.instance.localClientEntity) {
      avatarAnimationEntities.push(_entity)
    }
  }

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

    rig.hips.node.position.copy(rigComponent.localRig.hips.node.position)
    for (let i = 0; i < VRMHumanBoneList.length; i++) {
      if (rigComponent.localRig[VRMHumanBoneList[i]]) {
        rigComponent.rig[VRMHumanBoneList[i]]?.node.quaternion.copy(
          rigComponent.localRig[VRMHumanBoneList[i]]!.node.quaternion
        )
      }
    }

    const motionCaptureRigComponent = getOptionalComponent(entity, MotionCaptureRigComponent)

    //right now the only times we want to be using inverse kinematics is when we're in xr mode,
    //or when we're running our own leg calculations for mocap
    if (motionCaptureRigComponent || getOptionalComponent(entity, XRRigComponent)) {
      hipsForward.set(0, 0, 1)

      const uuid = getComponent(entity, UUIDComponent)

      const leftFoot = UUIDComponent.entitiesByUUID[uuid + ikTargets.leftFoot]
      const leftFootTransform = getComponent(leftFoot, TransformComponent)
      const leftFootTarget = getMutableComponent(leftFoot, AvatarIKTargetComponent)

      const rightFoot = UUIDComponent.entitiesByUUID[uuid + ikTargets.rightFoot]
      const rightFootTransform = getComponent(rightFoot, TransformComponent)
      const rightFootTarget = getMutableComponent(rightFoot, AvatarIKTargetComponent)

      const leftHand = UUIDComponent.entitiesByUUID[uuid + ikTargets.leftHand]
      const leftHandTransform = getComponent(leftHand, TransformComponent)
      const leftHandTarget = getMutableComponent(leftHand, AvatarIKTargetComponent)

      const rightHand = UUIDComponent.entitiesByUUID[uuid + ikTargets.rightHand]
      const rightHandTransform = getComponent(rightHand, TransformComponent)
      const rightHandTarget = getMutableComponent(rightHand, AvatarIKTargetComponent)

      const head = UUIDComponent.entitiesByUUID[uuid + ikTargets.head]
      const headTransform = getComponent(head, TransformComponent)
      const headTarget = getMutableComponent(head, AvatarIKTargetComponent)

      if (entity == Engine.instance.localClientEntity) {
        applyInputSourcePoseToIKTargets()
        setIkFootTarget(rigComponent.upperLegLength + rigComponent.lowerLegLength, deltaTime)
      }

      //special case for the head if we're in xr mode
      if (getOptionalComponent(entity, XRRigComponent)) {
        rightHandTarget.blendWeight.set(1)
        leftHandTarget.blendWeight.set(1)
        rightFootTarget.blendWeight.set(1)
        leftFootTarget.blendWeight.set(1)
        headTarget.blendWeight.set(1)

        rig.hips.node.position.copy(
          _vector3.copy(headTransform.position).setY(headTransform.position.y - rigComponent.torsoLength - 0.125)
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
            headTransform.rotation
          )
        )
      } else {
        /**todo: fix foot heuristic function causing ik solve issues */
        //leftFootTarget.blendWeight.set(1)
        //rightFootTarget.blendWeight.set(1)
      }

      const transform = getComponent(entity, TransformComponent)

      const forward = _forward.set(0, 0, 1).applyQuaternion(transform.rotation)
      const right = _right.set(5, 0, 0).applyQuaternion(transform.rotation)

      if (getState(XRState).sessionActive) rig.hips.node.position.applyMatrix4(transform.matrixInverse)

      if (rightHand && rightHandTarget.blendWeight.value > 0) {
        solveTwoBoneIK(
          rig.rightUpperArm.node,
          rig.rightLowerArm.node,
          rig.rightHand.node,
          rightHandTransform.position,
          rightHandTransform.rotation,
          null,
          _vector3.copy(transform.position).sub(right),
          tipAxisRestriction,
          null,
          null,
          rightHandTarget.blendWeight.value,
          rightHandTarget.blendWeight.value
        )
      }

      if (leftHand && leftHandTarget.blendWeight.value > 0) {
        solveTwoBoneIK(
          rig.leftUpperArm.node,
          rig.leftLowerArm.node,
          rig.leftHand.node,
          leftHandTransform.position,
          leftHandTransform.rotation,
          null,
          _vector3.copy(transform.position).add(right),
          tipAxisRestriction,
          null,
          null,
          leftHandTarget.blendWeight.value,
          leftHandTarget.blendWeight.value
        )
      }

      if (footRaycastTimer >= footRaycastInterval) {
        footRaycastTimer = 0
      }

      if (rightFoot && rightFootTarget.blendWeight.value > 0) {
        solveTwoBoneIK(
          rig.rightUpperLeg.node,
          rig.rightLowerLeg.node,
          rig.rightFoot.node,
          rightFootTransform.position,
          rightFootTransform.rotation,
          null,
          _vector3.copy(transform.position).add(forward),
          null,
          midAxisRestriction,
          null,
          rightFootTarget.blendWeight.value,
          rightFootTarget.blendWeight.value
        )
      }

      if (leftFoot && leftFootTarget.blendWeight.value > 0) {
        solveTwoBoneIK(
          rig.leftUpperLeg.node,
          rig.leftLowerLeg.node,
          rig.leftFoot.node,
          leftFootTransform.position,
          leftFootTransform.rotation,
          null,
          _vector3.copy(transform.position).add(forward),
          null,
          midAxisRestriction,
          null,
          leftFootTarget.blendWeight.value,
          leftFootTarget.blendWeight.value
        )
      }
    }
    rigComponent.vrm.update(deltaTime)
  }

  /** Run debug */
  if (avatarDebug) {
    for (const entity of priorityQueue.priorityEntities) {
      const rigComponent = getComponent(entity, AvatarRigComponent)
      if (rigComponent?.helper) {
        rigComponent.rig.hips.node.updateWorldMatrix(true, true)
        rigComponent.helper?.updateMatrixWorld(true)
      }
    }
  }
}

const reactor = () => {
  const xrState = getMutableState(XRState)
  const session = useHookstate(xrState.session)
  const renderState = useHookstate(getMutableState(RendererState))
  const isCameraAttachedToAvatar = useHookstate(getMutableState(XRControlsState).isCameraAttachedToAvatar)
  const userReady = useHookstate(getMutableState(EngineState).userReady)

  useEffect(() => {
    setVisualizers()
  }, [renderState.physicsDebug])

  useEffect(() => {
    if (xrState.sessionMode.value == 'immersive-vr')
      dispatchAction(
        AvatarNetworkAction.setAvatarXrTracking({
          active: xrState.sessionActive.value,
          entityUUID: Engine.instance.userID as any as EntityUUID
        })
      )
  }, [session])

  useEffect(() => {
    if (!session.value) return

    const entity = Engine.instance.localClientEntity
    if (!entity) return

    if (isCameraAttachedToAvatar.value) {
      setComponent(entity, AvatarHeadDecapComponent, true)
    } else {
      removeComponent(entity, AvatarHeadDecapComponent)
    }
  }, [isCameraAttachedToAvatar, session])

  useEffect(() => {
    if (userReady.value) setTrackingSpace()
  }, [userReady])

  return null
}

export const AvatarAnimationSystem = defineSystem({
  uuid: 'ee.engine.AvatarAnimationSystem',
  execute,
  reactor
})
