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
  EntityTreeComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  setComponent,
  useComponent,
  useQuery,
  UUIDComponent
} from '@ir-engine/ecs'
import { defineState, getMutableState, getState, none } from '@ir-engine/hyperflux'
import { NetworkState } from '@ir-engine/network'
import { TransformComponent } from '@ir-engine/spatial'
import { Axis } from '@ir-engine/spatial/src/common/constants/MathConstants'
import {
  createPriorityQueue,
  createSortAndApplyPriorityQueue
} from '@ir-engine/spatial/src/common/functions/PriorityQueue'
import { BoneComponent } from '@ir-engine/spatial/src/renderer/components/BoneComponent'
import { compareDistanceToCamera } from '@ir-engine/spatial/src/transform/components/DistanceComponents'
import { XRLeftHandComponent, XRRightHandComponent } from '@ir-engine/spatial/src/xr/XRComponents'
import { VRMHumanBoneList } from '@pixiv/three-vrm'
import React, { useEffect } from 'react'
import { Euler, Matrix4, Quaternion, Vector3 } from 'three'
import { applyHandRotationFK } from '../animation/applyHandRotationFK'
import { getArmIKHint } from '../animation/getArmIKHint'
import { blendIKChain, solveTwoBoneIK } from '../animation/TwoBoneIKSolver'
import { ikTargets } from '../animation/Util'
import { AvatarRigComponent, shoulderAngle } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarIKComponent, AvatarIKTargetComponent, IKMatrixComponent } from '../components/AvatarIKComponents'
import { NormalizedBoneComponent } from '../components/NormalizedBoneComponent'
import { IKSerialization } from '../IKSerialization'
import { AvatarAnimationSystem } from './AvatarAnimationSystem'

const _quat = new Quaternion()
const _quat2 = new Quaternion()
const _vector3 = new Vector3()
const _hint = new Vector3()
const mat4 = new Matrix4()
const hipsForward = new Vector3(0, 0, 1)
const _worldRot = new Quaternion()

const avatarIkQuery = defineQuery([AvatarIKComponent, AvatarRigComponent])

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
    const avatarComponent = getComponent(entity, AvatarComponent)

    const rig = rigComponent.bonesToEntities

    if (!rig.hips) continue

    const ownerID = getComponent(entity, UUIDComponent)
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

    const worldRotation = TransformComponent.getWorldRotation(entity, _worldRot)

    if (headTargetBlendWeight) {
      const headTransform = getComponent(head, TransformComponent)
      const worldTransform = TransformComponent.getWorldPosition(entity, _vector3)
      const normalizedHips = getComponent(rig.hips, NormalizedBoneComponent)

      normalizedHips.position.set(
        headTransform.position.x,
        headTransform.position.y - avatarComponent.torsoLength - 0.125,
        headTransform.position.z
      )

      //offset target forward to account for hips being behind the head
      hipsForward.set(0, 0, 1)
      hipsForward.applyQuaternion(worldRotation)
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
      normalizedHips.matrix.setPosition(new Vector3())
      normalizedHips.matrixWorld.multiplyMatrices(newWorldMatrix, normalizedHips.matrix)
      normalizedHips.matrixWorld.elements[13] = hips.position.y + worldTransform.y
      normalizedHips.matrixWorld.elements[12] = hips.position.x + worldTransform.x
      normalizedHips.matrixWorld.elements[14] = hips.position.z + worldTransform.z

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
        TransformComponent.getWorldPosition(rig.rightUpperArm, _vector3),
        'right',
        _hint
      )

      getComponent(rig.rightUpperArm, NormalizedBoneComponent).quaternion.setFromAxisAngle(Axis.X, Math.PI * 0.25)

      const upperArmEntity = getComponent(rig.rightUpperArm, EntityTreeComponent).parentEntity
      solveTwoBoneIK(
        getComponent(upperArmEntity, NormalizedBoneComponent).matrixWorld,
        getComponent(rig.rightUpperArm, IKMatrixComponent),
        getComponent(rig.rightLowerArm, IKMatrixComponent),
        getComponent(rig.rightHand, IKMatrixComponent),
        rightHandTransform.position,
        rightHandTransform.rotation,
        _hint
      )

      blendIKChain([rig.rightUpperArm, rig.rightLowerArm, rig.rightHand], rightHandTargetBlendWeight)
    }

    if (leftHandTargetBlendWeight && leftHandTransform) {
      getArmIKHint(
        entity,
        leftHandTransform.position,
        leftHandTransform.rotation,
        TransformComponent.getWorldPosition(rig.rightUpperArm, _vector3),
        'left',
        _hint
      )

      const upperArmEntity = getComponent(rig.leftUpperArm, EntityTreeComponent).parentEntity
      solveTwoBoneIK(
        getComponent(upperArmEntity, NormalizedBoneComponent).matrixWorld,
        getComponent(rig.leftUpperArm, IKMatrixComponent),
        getComponent(rig.leftLowerArm, IKMatrixComponent),
        getComponent(rig.leftHand, IKMatrixComponent),
        leftHandTransform.position,
        leftHandTransform.rotation,
        _hint
      )

      blendIKChain([rig.leftUpperArm, rig.leftLowerArm, rig.leftHand], leftHandTargetBlendWeight)
    }

    if (rightFootTargetBlendWeight && rightFootTransform) {
      _hint
        .set(-avatarComponent.footGap * 1.5, 0, 1)
        .applyQuaternion(TransformComponent.getWorldRotation(entity, _quat))
        .add(TransformComponent.getWorldPosition(entity, _vector3).sub(hipsForward))

      solveTwoBoneIK(
        getComponent(rig.hips, NormalizedBoneComponent).matrixWorld,
        getComponent(rig.rightUpperLeg, IKMatrixComponent),
        getComponent(rig.rightLowerLeg, IKMatrixComponent),
        getComponent(rig.rightFoot, IKMatrixComponent),
        rightFootTransform.position,
        rightFootTransform.rotation,
        _hint
      )

      blendIKChain([rig.rightUpperLeg, rig.rightLowerLeg, rig.rightFoot], rightFootTargetBlendWeight)
    }

    if (leftFootTargetBlendWeight && leftFootTransform) {
      _hint
        .set(-avatarComponent.footGap * 1.5, 0, 1)
        .applyQuaternion(TransformComponent.getWorldRotation(entity, _quat))
        .add(TransformComponent.getWorldPosition(entity, _vector3).sub(hipsForward))

      solveTwoBoneIK(
        getComponent(rig.hips, NormalizedBoneComponent).matrixWorld,
        getComponent(rig.leftUpperLeg, IKMatrixComponent),
        getComponent(rig.leftLowerLeg, IKMatrixComponent),
        getComponent(rig.leftFoot, IKMatrixComponent),
        leftFootTransform.position,
        leftFootTransform.rotation,
        _hint
      )

      blendIKChain([rig.leftUpperLeg, rig.leftLowerLeg, rig.leftFoot], leftFootTargetBlendWeight)
    }

    if (hasComponent(entity, XRRightHandComponent)) {
      applyHandRotationFK(entity, 'right', getComponent(entity, XRRightHandComponent).rotations)
    }

    if (hasComponent(entity, XRLeftHandComponent)) {
      applyHandRotationFK(entity, 'left', getComponent(entity, XRLeftHandComponent).rotations)
    }
  }
}

const difference = new Matrix4(),
  rootRotationInverse = new Matrix4(),
  toOrigin = new Matrix4(),
  back = new Matrix4(),
  rightShoulderMatrix = new Matrix4().makeRotationFromEuler(shoulderAngle.rightShoulderAngle),
  leftShoulderMatrix = new Matrix4().makeRotationFromEuler(shoulderAngle.leftShoulderAngle),
  armMatrix = new Matrix4().makeRotationFromEuler(new Euler(Math.PI * -0.5, 0, 0)),
  legMatrix = new Matrix4().makeRotationFromEuler(new Euler(Math.PI * 0.5, 0, 0))

const SetupIkMatrices = (props: { avatarEntity: Entity }) => {
  const rigComponent = useComponent(props.avatarEntity, AvatarRigComponent)
  useEffect(() => {
    if (!rigComponent.vrm.value) return
    const rootEntity = props.avatarEntity

    const rig = rigComponent.bonesToEntities.value

    // get list of bone names for arms and legs
    const boneNames = VRMHumanBoneList.filter(
      (bone) => bone.includes('Arm') || bone.includes('Leg') || bone.includes('Foot') || bone.includes('Hand')
    )

    const transform = getComponent(rootEntity, TransformComponent)
    const rootMatrix = getComponent(rootEntity, TransformComponent).matrixWorld
    rootRotationInverse.makeRotationFromQuaternion(transform.rotation).invert()
    toOrigin.identity()
    back.identity().multiply(rootRotationInverse)

    for (const bone of boneNames) {
      const worldMatrix = getComponent(rig[bone], TransformComponent).matrixWorld
      const parentMatrix = getComponent(
        getComponent(rig[bone], EntityTreeComponent).parentEntity,
        TransformComponent
      ).matrixWorld

      // get difference in world position, relative to the root, between the bone and its parent
      difference.elements[12] =
        worldMatrix.elements[12] - rootMatrix.elements[12] - (parentMatrix.elements[12] - rootMatrix.elements[12])
      difference.elements[13] =
        worldMatrix.elements[13] - rootMatrix.elements[13] - (parentMatrix.elements[13] - rootMatrix.elements[13])
      difference.elements[14] =
        worldMatrix.elements[14] - rootMatrix.elements[14] - (parentMatrix.elements[14] - rootMatrix.elements[14])

      // undo the parent rotation
      const local = new Matrix4().copy(back).multiply(toOrigin).multiply(difference)

      // keep only the position data from the above transformation
      local.elements[0] = 1
      local.elements[1] = 0
      local.elements[2] = 0
      local.elements[3] = 0
      local.elements[4] = 0
      local.elements[5] = 1
      local.elements[6] = 0
      local.elements[7] = 0
      local.elements[8] = 0
      local.elements[9] = 0
      local.elements[10] = 1
      local.elements[11] = 0
      local.elements[15] = 1

      // quick dirty bone rotations for the ik solve to start relative to
      if (bone.includes('Arm') || bone.includes('Hand')) {
        if (bone.includes('left')) local.multiply(rightShoulderMatrix)
        else local.multiply(leftShoulderMatrix)
      }
      if (bone.includes('Arm')) local.multiply(armMatrix)
      if (bone.includes('Leg')) local.multiply(legMatrix)

      setComponent(rig[bone], IKMatrixComponent, {
        world: new Matrix4(),
        local
      })
    }
  }, [rigComponent.vrm])

  return null
}

export const AvatarIkReactor = () => {
  const ikQuery = useQuery([AvatarRigComponent, AvatarIKComponent])

  useEffect(() => {
    const networkState = getMutableState(NetworkState)

    networkState.networkSchema[IKSerialization.ID].set({
      read: IKSerialization.readBlendWeight,
      write: IKSerialization.writeBlendWeight
    })

    return () => {
      networkState.networkSchema[IKSerialization.ID].set(none)
    }
  }, [])

  return (
    <>
      {ikQuery.map((entity) => (
        <SetupIkMatrices key={entity} avatarEntity={entity} />
      ))}
    </>
  )
}

export const AvatarIKSystem = defineSystem({
  uuid: 'ir.engine.AvatarIKSystem',
  insert: { before: AvatarAnimationSystem },
  reactor: AvatarIkReactor,
  execute
})
