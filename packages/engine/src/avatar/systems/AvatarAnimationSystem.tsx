/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { VRMHumanBoneList } from '@pixiv/three-vrm'
import { useEffect } from 'react'
import { AnimationClip, MathUtils, Matrix4, Quaternion, Vector3 } from 'three'

import {
  defineQuery,
  defineSystem,
  ECSState,
  Entity,
  getComponent,
  getOptionalComponent,
  hasComponent,
  useOptionalComponent,
  useQuery
} from '@ir-engine/ecs'
import { defineState, getMutableState, getState, isClient, useHookstate } from '@ir-engine/hyperflux'
import { NetworkObjectComponent } from '@ir-engine/network'
import {
  createPriorityQueue,
  createSortAndApplyPriorityQueue
} from '@ir-engine/spatial/src/common/functions/PriorityQueue'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { compareDistanceToCamera } from '@ir-engine/spatial/src/transform/components/DistanceComponents'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { TransformSystem } from '@ir-engine/spatial/src/transform/TransformModule'
import { XRLeftHandComponent, XRRightHandComponent } from '@ir-engine/spatial/src/xr/XRComponents'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'

import { SkinnedMeshComponent } from '@ir-engine/spatial/src/renderer/components/SkinnedMeshComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import React from 'react'
import { DomainConfigState } from '../../assets/state/DomainConfigState'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { applyHandRotationFK } from '../animation/applyHandRotationFK'
import { updateAnimationGraph } from '../animation/AvatarAnimationGraph'
import { getArmIKHint } from '../animation/getArmIKHint'
import { blendIKChain, solveTwoBoneIK } from '../animation/TwoBoneIKSolver'
import { ikTargets, preloadedAnimations } from '../animation/Util'
import { AnimationState } from '../AnimationManager'
import { AnimationComponent, useLoadAnimationFromBatchGLTF } from '../components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarIKTargetComponent } from '../components/AvatarIKComponents'
import { setAvatarSpeedFromRootMotion } from '../functions/avatarFunctions'
import { bindAnimationClipFromMixamo, retargetAnimationClip } from '../functions/retargetMixamoRig'
import { updateVRMRetargeting } from '../functions/updateVRMRetargeting'
import { AnimationSystem } from './AnimationSystem'

export const AvatarAnimationState = defineState({
  name: 'AvatarAnimationState',
  initial: () => {
    const accumulationBudget = 100 //isMobileXRHeadset ? 2 : 6

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
const avatarComponentQuery = defineQuery([AvatarComponent, RigidBodyComponent, AvatarAnimationComponent])
const avatarRigQuery = defineQuery([AvatarRigComponent])

const _quat = new Quaternion()
const _quat2 = new Quaternion()
const _vector3 = new Vector3()
const _hint = new Vector3()
const mat4 = new Matrix4()
const hipsForward = new Vector3(0, 0, 1)

const sortAndApplyPriorityQueue = createSortAndApplyPriorityQueue(avatarComponentQuery, compareDistanceToCamera)

const execute = () => {
  const { priorityQueue, sortedTransformEntities, visualizers } = getState(AvatarAnimationState)
  const { elapsedSeconds, deltaSeconds } = getState(ECSState)

  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()

  /** Calculate avatar locomotion animations outside of priority queue */

  for (const entity of avatarComponentQuery()) {
    const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
    const rigidbodyComponent = getComponent(entity, RigidBodyComponent)
    // TODO: use x locomotion for side-stepping when full 2D blending spaces are implemented
    avatarAnimationComponent.locomotion.x = 0
    avatarAnimationComponent.locomotion.y = rigidbodyComponent.linearVelocity.y
    // lerp animated forward animation to smoothly animate to a stop
    avatarAnimationComponent.locomotion.z = MathUtils.lerp(
      avatarAnimationComponent.locomotion.z || 0,
      _vector3.copy(rigidbodyComponent.linearVelocity).setComponent(1, 0).length(),
      10 * deltaSeconds
    )
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
    if (priorityQueue.priorityEntities.has(_entity) || _entity === selfAvatarEntity) {
      avatarAnimationEntities.push(_entity)
    }
  }

  updateAnimationGraph(avatarAnimationEntities)

  for (const entity of avatarAnimationEntities) {
    const rigComponent = getComponent(entity, AvatarRigComponent)
    const avatarComponent = getComponent(entity, AvatarComponent)

    const rawRig = rigComponent.rawRig
    const normalizedRig = rigComponent.normalizedRig

    if (!rawRig?.hips?.node) continue

    const ownerID = getComponent(entity, NetworkObjectComponent).ownerId
    const leftFoot = AvatarIKTargetComponent.getTargetEntity(ownerID, ikTargets.leftFoot)
    const leftFootTransform = getOptionalComponent(leftFoot, TransformComponent)
    const leftFootTargetBlendWeight = AvatarIKTargetComponent.blendWeight[leftFoot]

    const rightFoot = AvatarIKTargetComponent.getTargetEntity(ownerID, ikTargets.rightFoot)
    const rightFootTransform = getOptionalComponent(rightFoot, TransformComponent)
    const rightFootTargetBlendWeight = AvatarIKTargetComponent.blendWeight[rightFoot]

    const leftHand = AvatarIKTargetComponent.getTargetEntity(ownerID, ikTargets.leftHand)
    const leftHandTransform = getOptionalComponent(leftHand, TransformComponent)
    const leftHandTargetBlendWeight = AvatarIKTargetComponent.blendWeight[leftHand]

    const rightHand = AvatarIKTargetComponent.getTargetEntity(ownerID, ikTargets.rightHand)
    const rightHandTransform = getOptionalComponent(rightHand, TransformComponent)
    const rightHandTargetBlendWeight = AvatarIKTargetComponent.blendWeight[rightHand]

    const head = AvatarIKTargetComponent.getTargetEntity(ownerID, ikTargets.head)
    const headTargetBlendWeight = AvatarIKTargetComponent.blendWeight[head]

    const transform = getComponent(entity, TransformComponent)

    const rigidbodyComponent = getComponent(entity, RigidBodyComponent)

    if (headTargetBlendWeight) {
      const headTransform = getComponent(head, TransformComponent)

      normalizedRig.hips.node.position.set(
        headTransform.position.x,
        headTransform.position.y - avatarComponent.torsoLength - 0.125,
        headTransform.position.z
      )

      //offset target forward to account for hips being behind the head
      hipsForward.set(0, 0, 1)
      hipsForward.applyQuaternion(rigidbodyComponent.rotation)
      hipsForward.multiplyScalar(0.125)
      normalizedRig.hips.node.position.sub(hipsForward)

      // convert to local space
      normalizedRig.hips.node.position.applyMatrix4(mat4.copy(transform.matrixWorld).invert())

      _quat2.copy(headTransform.rotation)

      //calculate head look direction and apply to head bone
      //look direction should be set outside of the xr switch
      normalizedRig.head.node.quaternion.multiplyQuaternions(
        normalizedRig.spine.node.getWorldQuaternion(_quat).invert(),
        _quat2
      )

      /** Place normalized rig in world space for ik calculations */
      const newWorldMatrix = transform.matrixWorld.clone()
      newWorldMatrix.elements[13] = rawRig.hips.node.position.y - transform.position.y
      normalizedRig.hips.node.matrix.setPosition(new Vector3())
      normalizedRig.hips.node.matrixWorld.multiplyMatrices(newWorldMatrix, normalizedRig.hips.node.matrix)
      for (const boneName of VRMHumanBoneList) {
        const bone = rigComponent.vrm.humanoid.getNormalizedBoneNode(boneName)
        if (!bone) continue
        bone.scale.setScalar(1)
        bone.updateMatrix()
        if (boneName === 'hips') continue
        bone.updateMatrixWorld()
        const worldMatrix = rawRig[boneName]!.node.matrixWorld.elements
        bone.matrixWorld.elements[13] = worldMatrix[13]
        bone.matrixWorld.elements[12] = worldMatrix[12]
        bone.matrixWorld.elements[14] = worldMatrix[14]
      }
    }

    if (rightHandTargetBlendWeight && rightHandTransform) {
      getArmIKHint(
        entity,
        rightHandTransform.position,
        rightHandTransform.rotation,
        rawRig.rightUpperArm.node.getWorldPosition(_vector3),
        'right',
        _hint
      )

      solveTwoBoneIK(
        normalizedRig.rightUpperArm.node.parent!.matrixWorld,
        rigComponent.ikMatrices.rightUpperArm!,
        rigComponent.ikMatrices.rightLowerArm!,
        rigComponent.ikMatrices.rightHand!,
        rightHandTransform.position,
        rightHandTransform.rotation,
        _hint
      )

      blendIKChain(entity, ['rightUpperArm', 'rightLowerArm', 'rightHand'], rightHandTargetBlendWeight)
    }

    if (leftHandTargetBlendWeight && leftHandTransform) {
      getArmIKHint(
        entity,
        leftHandTransform.position,
        leftHandTransform.rotation,
        rawRig.leftUpperArm.node.getWorldPosition(_vector3),
        'left',
        _hint
      )

      solveTwoBoneIK(
        normalizedRig.leftUpperArm.node.parent!.matrixWorld,
        rigComponent.ikMatrices.leftUpperArm!,
        rigComponent.ikMatrices.leftLowerArm!,
        rigComponent.ikMatrices.leftHand!,
        leftHandTransform.position,
        leftHandTransform.rotation,
        _hint
      )

      blendIKChain(entity, ['leftUpperArm', 'leftLowerArm', 'leftHand'], leftHandTargetBlendWeight)
    }

    if (rightFootTargetBlendWeight && rightFootTransform) {
      _hint
        .set(-avatarComponent.footGap * 1.5, 0, 1)
        .applyQuaternion(transform.rotation)
        .add(transform.position)

      solveTwoBoneIK(
        normalizedRig.hips.node.matrixWorld,
        rigComponent.ikMatrices.rightUpperLeg!,
        rigComponent.ikMatrices.rightLowerLeg!,
        rigComponent.ikMatrices.rightFoot!,
        rightFootTransform.position,
        rightFootTransform.rotation,
        _hint
      )

      blendIKChain(entity, ['rightUpperLeg', 'rightLowerLeg', 'rightFoot'], rightFootTargetBlendWeight)
    }

    if (leftFootTargetBlendWeight && leftFootTransform) {
      _hint
        .set(-avatarComponent.footGap * 1.5, 0, 1)
        .applyQuaternion(transform.rotation)
        .add(transform.position)

      solveTwoBoneIK(
        normalizedRig.hips.node.matrixWorld,
        rigComponent.ikMatrices.leftUpperLeg!,
        rigComponent.ikMatrices.leftLowerLeg!,
        rigComponent.ikMatrices.leftFoot!,
        leftFootTransform.position,
        leftFootTransform.rotation,
        _hint
      )

      blendIKChain(entity, ['leftUpperLeg', 'leftLowerLeg', 'leftFoot'], leftFootTargetBlendWeight)
    }

    if (hasComponent(entity, XRRightHandComponent)) {
      applyHandRotationFK(rigComponent.vrm, 'right', getComponent(entity, XRRightHandComponent).rotations)
    }

    if (hasComponent(entity, XRLeftHandComponent)) {
      applyHandRotationFK(rigComponent.vrm, 'left', getComponent(entity, XRLeftHandComponent).rotations)
    }
  }

  for (const entity of avatarRigQuery()) updateVRMRetargeting(entity)
}

const Reactor = () => {
  const selfAvatarEntity = AvatarComponent.useSelfAvatarEntity()
  const selfAvatarLoaded = useOptionalComponent(selfAvatarEntity, GLTFComponent)?.progress?.value === 100

  useEffect(() => {
    if (!selfAvatarLoaded) {
      XRState.setTrackingSpace()
      return
    }
    const eyeHeight = getComponent(selfAvatarEntity, AvatarComponent).eyeHeight
    getMutableState(XRState).userEyeHeight.set(eyeHeight)
    XRState.setTrackingSpace()
  }, [selfAvatarLoaded])

  return null
}

const AnimationReactor = () => {
  const animations = [preloadedAnimations.locomotion, preloadedAnimations.emotes]

  const loadedAnimations = useLoadAnimationFromBatchGLTF(
    animations.map((animationFile) => {
      return `${
        getState(DomainConfigState).cloudDomain
      }/projects/ir-engine/default-project/assets/animations/${animationFile}.glb`
    }),
    true
  )

  useEffect(() => {
    if (!loadedAnimations.value) return
    let i = 0
    for (const loadedAnimationEntity of loadedAnimations.value as [AnimationClip[] | null, Entity][]) {
      for (const animation of loadedAnimationEntity[0]!) {
        retargetAnimationClip(animation, loadedAnimationEntity[1])
        bindAnimationClipFromMixamo(animation)
      }
      getMutableState(AnimationState).loadedAnimations[animations[i]].set(loadedAnimationEntity[1]!)
      i++
    }
  }, [loadedAnimations])

  const locomotionAnimationState = useHookstate(
    getMutableState(AnimationState).loadedAnimations[preloadedAnimations.locomotion]
  )
  const animationComponent = useOptionalComponent(locomotionAnimationState.value, AnimationComponent)
  useEffect(() => {
    if (!animationComponent) return
    setAvatarSpeedFromRootMotion()
  }, [animationComponent])

  return null
}

export const AvatarAnimationSystem = defineSystem({
  uuid: 'ee.engine.AvatarAnimationSystem',
  insert: { after: AnimationSystem },
  execute,
  reactor: () => {
    if (!isClient || !useQuery([RendererComponent]).length) return null
    return (
      <>
        <Reactor />
        <AnimationReactor />
      </>
    )
  }
})

const skinnedMeshQuery = defineQuery([SkinnedMeshComponent])

const updateSkinnedMeshes = () => {
  for (const entity of skinnedMeshQuery()) {
    const skinnedMesh = getComponent(entity, SkinnedMeshComponent)
    if (skinnedMesh.bindMode === 'attached') {
      skinnedMesh.bindMatrixInverse.copy(skinnedMesh.matrixWorld).invert()
    } else if (skinnedMesh.bindMode === 'detached') {
      skinnedMesh.bindMatrixInverse.copy(skinnedMesh.bindMatrix).invert()
    } else {
      console.warn('THREE.SkinnedMesh: Unrecognized bindMode: ' + skinnedMesh.bindMode)
    }
  }
}

export const SkinnedMeshTransformSystem = defineSystem({
  uuid: 'ee.engine.SkinnedMeshTransformSystem',
  insert: { after: TransformSystem },
  execute: updateSkinnedMeshes
})
