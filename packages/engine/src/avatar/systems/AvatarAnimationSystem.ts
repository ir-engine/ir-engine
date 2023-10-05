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

import { defineState, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { VRMHumanBoneList } from '@pixiv/three-vrm'
import { V_010 } from '../../common/constants/MathConstants'
import { createPriorityQueue, createSortAndApplyPriorityQueue } from '../../ecs/PriorityQueue'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { defineQuery, getComponent, getOptionalComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { RendererState } from '../../renderer/RendererState'
import { addObjectToGroup } from '../../scene/components/GroupComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { compareDistanceToCamera } from '../../transform/components/DistanceComponents'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { setTrackingSpace } from '../../xr/XRScaleAdjustmentFunctions'
import { XRState, isMobileXRHeadset } from '../../xr/XRState'
import { AnimationComponent } from '.././components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from '.././components/AvatarAnimationComponent'
import { AvatarIKTargetComponent } from '.././components/AvatarIKComponents'
import { applyInputSourcePoseToIKTargets } from '.././functions/applyInputSourcePoseToIKTargets'
import { updateAnimationGraph } from '../animation/AvatarAnimationGraph'
import { solveTwoBoneIK } from '../animation/TwoBoneIKSolver'
import { ikTargets } from '../animation/Util'
import { AvatarComponent } from '../components/AvatarComponent'
import { setIkFootTarget } from '../functions/avatarFootHeuristics'

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

const ikTargetQuery = defineQuery([AvatarIKTargetComponent])

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

interface targetTransform {
  position: Vector3
  rotation: Quaternion
  blendWeight: number
}

const ikDataByName = {} as Record<string, targetTransform>

const footRaycastInterval = 0.25
let footRaycastTimer = 0

const sortAndApplyPriorityQueue = createSortAndApplyPriorityQueue(avatarComponentQuery, compareDistanceToCamera)

const execute = () => {
  const { priorityQueue, sortedTransformEntities, visualizers } = getState(AvatarAnimationState)
  const { elapsedSeconds, deltaSeconds } = getState(EngineState)
  const { avatarDebug } = getState(RendererState)

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

    rig.hips.node.position.copy(rigComponent.localRig.hips.node.position)
    for (let i = 0; i < VRMHumanBoneList.length; i++) {
      if (rigComponent.localRig[VRMHumanBoneList[i]]) {
        rigComponent.rig[VRMHumanBoneList[i]]?.node.quaternion.copy(
          rigComponent.localRig[VRMHumanBoneList[i]]!.node.quaternion
        )
      }
    }

    if (rigComponent.ikOverride != '') {
      hipsForward.set(0, 0, 1)

      //calculate world positions

      applyInputSourcePoseToIKTargets()
      setIkFootTarget(rigComponent.upperLegLength + rigComponent.lowerLegLength, deltaTime)

      for (const ikEntity of ikEntities) {
        const networkObject = getComponent(ikEntity, NetworkObjectComponent)
        const ownerEntity = NetworkObjectComponent.getUserAvatarEntity(networkObject.ownerId)
        if (ownerEntity !== entity) continue

        const rigidbodyComponent = getComponent(ownerEntity, RigidBodyComponent)
        const rigComponent = getComponent(ownerEntity, AvatarRigComponent)

        const ikTargetName = getComponent(ikEntity, NameComponent).split('_').pop()!
        const ikTransform = getComponent(ikEntity, TransformComponent)
        const ikComponent = getComponent(ikEntity, AvatarIKTargetComponent)

        ikDataByName[ikTargetName] = {
          position: ikTransform.position,
          rotation: ikTransform.rotation,
          blendWeight: ikComponent.blendWeight
        }

        //special case for the head if we're in xr mode
        //todo: automatically infer whether or not we need to set hips position from the head position
        if (rigComponent.ikOverride == 'xr' && ikTargetName == 'head') {
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
      }

      const transform = getComponent(entity, TransformComponent)

      const leftLegLength =
        leftLegVector.subVectors(rig.hips.node.position, ikDataByName[ikTargets.leftFoot].position).length() +
        rigComponent.footHeight
      const rightLegLength =
        rightLegVector.subVectors(rig.hips.node.position, ikDataByName[ikTargets.rightFoot].position).length() +
        rigComponent.footHeight

      const forward = _forward.set(0, 0, 1).applyQuaternion(transform.rotation)
      const right = _right.set(5, 0, 0).applyQuaternion(transform.rotation)

      //calculate hips to head
      rig.hips.node.position.applyMatrix4(transform.matrixInverse)
      if (ikDataByName[ikTargets.head])
        _hipVector.subVectors(rig.hips.node.position, ikDataByName[ikTargets.head].position)

      if (rigComponent.ikOverride == 'mocap')
        rig.hips.node.quaternion
          .setFromUnitVectors(V_010, _hipVector)
          .multiply(_hipRot.setFromEuler(new Euler(0, rigComponent.flipped ? Math.PI : 0)))

      if (ikDataByName[ikTargets.rightHand]) {
        solveTwoBoneIK(
          rig.rightUpperArm.node,
          rig.rightLowerArm.node,
          rig.rightHand.node,
          ikDataByName[ikTargets.rightHand].position,
          ikDataByName[ikTargets.rightHand].rotation,
          null,
          ikDataByName[ikTargets.rightElbowHint]
            ? ikDataByName[ikTargets.rightElbowHint].position
            : _vector3.copy(transform.position).sub(right),
          tipAxisRestriction,
          null,
          null,
          ikDataByName[ikTargets.rightHand].blendWeight,
          ikDataByName[ikTargets.rightHand].blendWeight
        )
      }

      if (ikDataByName[ikTargets.leftHand]) {
        solveTwoBoneIK(
          rig.leftUpperArm.node,
          rig.leftLowerArm.node,
          rig.leftHand.node,
          ikDataByName[ikTargets.leftHand].position,
          ikDataByName[ikTargets.leftHand].rotation,
          null,
          ikDataByName[ikTargets.leftElbowHint]
            ? ikDataByName[ikTargets.leftElbowHint].position
            : _vector3.copy(transform.position).add(right),
          tipAxisRestriction,
          null,
          null,
          ikDataByName[ikTargets.leftHand].blendWeight,
          ikDataByName[ikTargets.leftHand].blendWeight
        )
      }

      if (footRaycastTimer >= footRaycastInterval) {
        footRaycastTimer = 0
      }

      if (ikDataByName[ikTargets.rightFoot]) {
        solveTwoBoneIK(
          rig.rightUpperLeg.node,
          rig.rightLowerLeg.node,
          rig.rightFoot.node,
          ikDataByName[ikTargets.rightFoot].position,
          ikDataByName[ikTargets.rightFoot].rotation,
          null,
          ikDataByName[ikTargets.rightKneeHint]
            ? ikDataByName[ikTargets.rightKneeHint].position
            : _vector3.copy(transform.position).add(forward),
          null,
          midAxisRestriction,
          null,
          ikDataByName[ikTargets.rightFoot].blendWeight,
          ikDataByName[ikTargets.rightFoot].blendWeight
        )
      }

      if (ikDataByName[ikTargets.leftFoot]) {
        solveTwoBoneIK(
          rig.leftUpperLeg.node,
          rig.leftLowerLeg.node,
          rig.leftFoot.node,
          ikDataByName[ikTargets.leftFoot].position,
          ikDataByName[ikTargets.leftFoot].rotation,
          null,
          ikDataByName[ikTargets.leftKneeHint]
            ? ikDataByName[ikTargets.leftKneeHint].position
            : _vector3.copy(transform.position).add(forward),
          null,
          midAxisRestriction,
          null,
          ikDataByName[ikTargets.leftFoot].blendWeight,
          ikDataByName[ikTargets.leftFoot].blendWeight
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
  const heightDifference = useHookstate(xrState.userAvatarHeightDifference)
  const sessionMode = useHookstate(xrState.sessionMode)
  const pose = useHookstate(xrState.viewerPose)
  useEffect(() => {
    if (xrState.sessionMode.value == 'immersive-vr' && heightDifference.value)
      xrState.sceneScale.set(Math.max(heightDifference.value, 0.5))
  }, [heightDifference, sessionMode])
  useEffect(() => {
    if (xrState.sessionMode.value == 'immersive-vr' && !heightDifference.value) setTrackingSpace()
  }, [pose])
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
