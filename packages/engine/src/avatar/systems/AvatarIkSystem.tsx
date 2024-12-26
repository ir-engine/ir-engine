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

import {
  defineQuery,
  defineSystem,
  ECSState,
  Entity,
  getComponent,
  getOptionalComponent,
  hasComponent,
  useComponent,
  useQuery
} from '@ir-engine/ecs'
import { defineState, getState } from '@ir-engine/hyperflux'
import { NetworkObjectComponent } from '@ir-engine/network'
import { TransformComponent } from '@ir-engine/spatial'
import {
  createPriorityQueue,
  createSortAndApplyPriorityQueue
} from '@ir-engine/spatial/src/common/functions/PriorityQueue'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { BoneComponent } from '@ir-engine/spatial/src/renderer/components/BoneComponent'
import { compareDistanceToCamera } from '@ir-engine/spatial/src/transform/components/DistanceComponents'
import { EntityTreeComponent, iterateEntityNode } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { computeTransformMatrix } from '@ir-engine/spatial/src/transform/systems/TransformSystem'
import { XRLeftHandComponent, XRRightHandComponent } from '@ir-engine/spatial/src/xr/XRComponents'
import { VRMHumanBoneList } from '@pixiv/three-vrm'
import React, { useEffect } from 'react'
import { Matrix4, Quaternion, Vector3 } from 'three'
import { applyHandRotationFK } from '../animation/applyHandRotationFK'
import { getArmIKHint } from '../animation/getArmIKHint'
import { blendIKChain, solveTwoBoneIK } from '../animation/TwoBoneIKSolver'
import { ikTargets } from '../animation/Util'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarIkComponent, AvatarIKTargetComponent } from '../components/AvatarIKComponents'
import { NormalizedBoneComponent } from '../components/NormalizedBoneComponent'
import { AvatarAnimationSystem } from './AvatarAnimationSystem'

const _quat = new Quaternion()
const _quat2 = new Quaternion()
const _vector3 = new Vector3()
const _hint = new Vector3()
const mat4 = new Matrix4()
const hipsForward = new Vector3(0, 0, 1)

const avatarIkQuery = defineQuery([AvatarIkComponent, AvatarRigComponent])

export const AvatarIkPriorityQueueState = defineState({
  name: 'AvatarIkPriorityQueueState',
  initial: () => {
    const accumulationBudget = 100

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

const sortAndApplyPriorityQueue = createSortAndApplyPriorityQueue(avatarIkQuery, compareDistanceToCamera)

const execute = () => {
  const { priorityQueue, sortedTransformEntities, visualizers } = getState(AvatarIkPriorityQueueState)
  const { deltaSeconds } = getState(ECSState)
  sortAndApplyPriorityQueue(priorityQueue, sortedTransformEntities, deltaSeconds)

  const ikAvatarQuery = avatarIkQuery()
  const ikAvatars: Entity[] = []
  for (let i = 0; i < ikAvatarQuery.length; i++) {
    const _entity = ikAvatarQuery[i]
    if (priorityQueue.priorityEntities.has(_entity) || _entity === AvatarComponent.getSelfAvatarEntity()) {
      ikAvatars.push(_entity)
    }
  }
  for (const entity of ikAvatars) {
    const rigComponent = getComponent(entity, AvatarRigComponent)
    const ikComponent = getComponent(entity, AvatarIkComponent)
    const avatarComponent = getComponent(entity, AvatarComponent)

    const rig = rigComponent.bonesToEntities

    if (!rig.hips) continue

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
      const normalizedHips = getComponent(rig.hips, NormalizedBoneComponent)

      normalizedHips.position.set(
        headTransform.position.x,
        headTransform.position.y - avatarComponent.torsoLength - 0.125,
        headTransform.position.z
      )

      //offset target forward to account for hips being behind the head
      hipsForward.set(0, 0, 1)
      hipsForward.applyQuaternion(rigidbodyComponent.rotation)
      hipsForward.multiplyScalar(0.125)
      normalizedHips.position.sub(hipsForward)

      // convert to local space
      normalizedHips.position.applyMatrix4(mat4.copy(transform.matrixWorld).invert())

      _quat2.copy(headTransform.rotation)

      //calculate head look direction and apply to head bone
      //look direction should be set outside of the xr switch
      getComponent(rig.head, NormalizedBoneComponent).quaternion.multiplyQuaternions(
        getComponent(rig.spine, NormalizedBoneComponent).getWorldQuaternion(_quat).invert(),
        _quat2
      )

      const hips = getComponent(rig.hips, TransformComponent)
      /** Place normalized rig in world space for ik calculations */
      const newWorldMatrix = transform.matrixWorld.clone()
      newWorldMatrix.elements[13] = hips.position.y + transform.position.y
      newWorldMatrix.elements[12] = hips.position.x + transform.position.x
      newWorldMatrix.elements[14] = hips.position.z + transform.position.z
      normalizedHips.matrix.setPosition(new Vector3())
      normalizedHips.matrixWorld.multiplyMatrices(newWorldMatrix, normalizedHips.matrix)

      for (const boneName of VRMHumanBoneList) {
        const bone = getOptionalComponent(rigComponent.bonesToEntities[boneName], NormalizedBoneComponent)
        if (!bone) continue
        bone.scale.setScalar(1)

        bone.updateMatrix()
        if (boneName === 'hips') continue
        bone.updateMatrixWorld()
        const worldMatrix = getComponent(rig[boneName], BoneComponent).matrixWorld.elements
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
        getComponent(rig.rightUpperArm, BoneComponent).getWorldPosition(_vector3),
        'right',
        _hint
      )

      const upperArmEntity = getComponent(rig.rightUpperArm, EntityTreeComponent).parentEntity
      solveTwoBoneIK(
        getComponent(upperArmEntity, NormalizedBoneComponent).matrixWorld,
        ikComponent.ikMatrices.rightUpperArm!,
        ikComponent.ikMatrices.rightLowerArm!,
        ikComponent.ikMatrices.rightHand!,
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
        getComponent(rig.leftUpperArm, BoneComponent).getWorldPosition(_vector3),
        'left',
        _hint
      )

      const upperArmEntity = getComponent(rig.leftUpperArm, EntityTreeComponent).parentEntity
      solveTwoBoneIK(
        getComponent(upperArmEntity, NormalizedBoneComponent).matrixWorld,
        ikComponent.ikMatrices.leftUpperArm!,
        ikComponent.ikMatrices.leftLowerArm!,
        ikComponent.ikMatrices.leftHand!,
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
        getComponent(rig.hips, NormalizedBoneComponent).matrixWorld,
        ikComponent.ikMatrices.rightUpperLeg!,
        ikComponent.ikMatrices.rightLowerLeg!,
        ikComponent.ikMatrices.rightFoot!,
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
        getComponent(rig.hips, NormalizedBoneComponent).matrixWorld,
        ikComponent.ikMatrices.leftUpperLeg!,
        ikComponent.ikMatrices.leftLowerLeg!,
        ikComponent.ikMatrices.leftFoot!,
        leftFootTransform.position,
        leftFootTransform.rotation,
        _hint
      )

      blendIKChain(entity, ['leftUpperLeg', 'leftLowerLeg', 'leftFoot'], leftFootTargetBlendWeight)
    }

    if (hasComponent(entity, XRRightHandComponent)) {
      applyHandRotationFK(entity, 'right', getComponent(entity, XRRightHandComponent).rotations)
    }

    if (hasComponent(entity, XRLeftHandComponent)) {
      applyHandRotationFK(entity, 'left', getComponent(entity, XRLeftHandComponent).rotations)
    }
  }
}

const SetupIkMatrices = (props: { avatarEntity: Entity }) => {
  const ikComponent = useComponent(props.avatarEntity, AvatarIkComponent)
  const rigComponent = useComponent(props.avatarEntity, AvatarRigComponent)
  useEffect(() => {
    if (!rigComponent.bonesToEntities.hips.value) return
    const rootEntity = props.avatarEntity

    iterateEntityNode(rootEntity, computeTransformMatrix, (e) => hasComponent(e, TransformComponent))

    // sets up ik matrices for blending into the normalized rig
    const rig = rigComponent.bonesToEntities.value
    // get list of bone names for arms and legs
    const boneNames = VRMHumanBoneList.filter(
      (bone) => bone.includes('Arm') || bone.includes('Leg') || bone.includes('Foot') || bone.includes('Hand')
    )
    for (const bone of boneNames) {
      const worldMatrix = getComponent(rig[bone], TransformComponent).matrixWorld.clone()
      const parentMatrix = getComponent(
        getComponent(rig[bone], EntityTreeComponent).parentEntity,
        TransformComponent
      ).matrixWorld
      const ikLocalMatrix = new Matrix4()
      ikLocalMatrix.elements[12] = worldMatrix.elements[12] - parentMatrix.elements[12]
      ikLocalMatrix.elements[13] = worldMatrix.elements[13] - parentMatrix.elements[13]
      ikLocalMatrix.elements[14] = worldMatrix.elements[14] - parentMatrix.elements[14]

      ikComponent.ikMatrices[bone].set({
        world: new Matrix4(),
        local: ikLocalMatrix
      })
    }
  }, [rigComponent.bonesToEntities])

  return null
}

const AvatarIkReactor = () => {
  const ikQuery = useQuery([AvatarIkComponent, AvatarRigComponent])
  return (
    <>
      {ikQuery.map((entity) => (
        <SetupIkMatrices key={entity} avatarEntity={entity} />
      ))}
    </>
  )
}

export const AvatarIkSystem = defineSystem({
  uuid: 'ir.engine.AvatarIkSystem',
  insert: { before: AvatarAnimationSystem },
  reactor: AvatarIkReactor,
  execute
})
