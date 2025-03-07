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
  createEngine,
  destroyEngine,
  Entity,
  EntityUUID,
  getComponent,
  getOptionalComponent,
  hasComponent,
  iterateEntityNode,
  setComponent,
  SystemDefinitions,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import { applyIncomingActions, dispatchAction, startReactor } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import {
  computeTransformMatrix,
  TransformDirtyCleanupSystem,
  TransformDirtyUpdateSystem,
  TransformSystem
} from '@ir-engine/spatial/src/transform/systems/TransformSystem'
import { mockSpatialEngine } from '@ir-engine/spatial/tests/util/mockSpatialEngine'
import { Quaternion, Vector3 } from 'three'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { overrideFileLoaderLoad } from '../../../tests/util/loadGLTFAssetNode'
import { mockAnimatedAvatar } from '../components/AnimationComponent.test'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarIKComponent, AvatarIKTargetComponent, IKMatrixComponent } from '../components/AvatarIKComponents'
import { NormalizedBoneComponent } from '../components/NormalizedBoneComponent'
import '../state/AvatarIKTargetState'
import { AvatarNetworkAction } from '../state/AvatarNetworkActions'
import { AnimationSystem } from './AnimationSystem'
import { AvatarAnimationSystem, AvatarAnimationSystemReactor } from './AvatarAnimationSystem'
import { AvatarIkReactor, AvatarIKSystem } from './AvatarIKSystem'

const default_url = 'packages/projects/default-project/assets'
describe('AvatarIKSystem', () => {
  overrideFileLoaderLoad()

  beforeEach(async () => {
    createEngine()
    mockSpatialEngine()
  })

  afterEach(() => {
    destroyEngine()
  })

  it('should solve IK such that every tip joint world position is at the ik target', async () => {
    const avatarUuid = 'mock-avatar-uuid' as EntityUUID
    let avatarEntity = UndefinedEntity as Entity
    avatarEntity = await mockAnimatedAvatar()
    setComponent(avatarEntity, UUIDComponent, avatarUuid)
    setComponent(avatarEntity, AvatarIKComponent)
    startReactor(AvatarIkReactor)
    startReactor(AvatarAnimationSystemReactor)
    const rig = getComponent(avatarEntity, AvatarRigComponent)

    // no idea why this is necessary
    for (const entity in rig.entitiesToBones) {
      const bone = getOptionalComponent(entity as unknown as Entity, NormalizedBoneComponent)
      if (bone) bone.quaternion.fastSlerp = Quaternion.prototype.fastSlerp
    }

    await vi.waitFor(() => {
      expect(
        getOptionalComponent(rig.bonesToEntities.rightUpperArm, IKMatrixComponent) &&
          getOptionalComponent(rig.bonesToEntities.rightLowerArm, IKMatrixComponent) &&
          getOptionalComponent(rig.bonesToEntities.rightHand, IKMatrixComponent) &&
          getOptionalComponent(rig.bonesToEntities.leftUpperArm, IKMatrixComponent) &&
          getOptionalComponent(rig.bonesToEntities.leftLowerArm, IKMatrixComponent) &&
          getOptionalComponent(rig.bonesToEntities.leftHand, IKMatrixComponent) &&
          getOptionalComponent(rig.bonesToEntities.rightUpperLeg, IKMatrixComponent) &&
          getOptionalComponent(rig.bonesToEntities.rightLowerLeg, IKMatrixComponent) &&
          getOptionalComponent(rig.bonesToEntities.rightFoot, IKMatrixComponent) &&
          getOptionalComponent(rig.bonesToEntities.leftUpperLeg, IKMatrixComponent) &&
          getOptionalComponent(rig.bonesToEntities.leftLowerLeg, IKMatrixComponent) &&
          getOptionalComponent(rig.bonesToEntities.leftFoot, IKMatrixComponent)
      ).toBeTruthy()
    })

    const rightHandUuid = (avatarUuid + 'rightHand') as EntityUUID
    const leftHandUuid = (avatarUuid + 'leftHand') as EntityUUID
    const leftFootUuid = (avatarUuid + 'leftFoot') as EntityUUID
    const rightFootUuid = (avatarUuid + 'rightFoot') as EntityUUID
    const headUuid = (avatarUuid + 'head') as EntityUUID
    dispatchAction(
      AvatarNetworkAction.spawnIKTarget({
        parentUUID: avatarUuid,
        entityUUID: rightHandUuid,
        name: 'rightHand',
        blendWeight: 1
      })
    )
    dispatchAction(
      AvatarNetworkAction.spawnIKTarget({
        parentUUID: avatarUuid,
        entityUUID: leftHandUuid,
        name: 'leftHand',
        blendWeight: 1
      })
    )
    dispatchAction(
      AvatarNetworkAction.spawnIKTarget({
        parentUUID: avatarUuid,
        entityUUID: leftFootUuid,
        name: 'leftFoot',
        blendWeight: 1
      })
    )
    dispatchAction(
      AvatarNetworkAction.spawnIKTarget({
        parentUUID: avatarUuid,
        entityUUID: rightFootUuid,
        name: 'rightFoot',
        blendWeight: 1
      })
    )
    dispatchAction(
      AvatarNetworkAction.spawnIKTarget({
        parentUUID: avatarUuid,
        entityUUID: headUuid,
        name: 'head',
        blendWeight: 1
      })
    )
    applyIncomingActions()
    await vi.waitUntil(() => {
      return (
        UUIDComponent.getEntityByUUID(rightHandUuid) &&
        UUIDComponent.getEntityByUUID(headUuid) &&
        UUIDComponent.getEntityByUUID(leftHandUuid)
      )
    })

    const headEntity = UUIDComponent.getEntityByUUID(headUuid)
    const headPosition = getComponent(headEntity, TransformComponent).position
    headPosition.set(0, 1.8, 0)

    const rightHandEntity = UUIDComponent.getEntityByUUID(rightHandUuid)
    const rightHandPosition = getComponent(rightHandEntity, TransformComponent).position
    rightHandPosition.set(-0.2, 1, 0)

    const leftHandEntity = UUIDComponent.getEntityByUUID(leftHandUuid)
    const leftHandPosition = getComponent(leftHandEntity, TransformComponent).position
    leftHandPosition.set(0.2, 1, 0)

    const leftFootEntity = UUIDComponent.getEntityByUUID(leftFootUuid)
    const leftFootPosition = getComponent(leftFootEntity, TransformComponent).position
    leftFootPosition.set(-0.1, 0.1, 0)

    const rightFootEntity = UUIDComponent.getEntityByUUID(rightFootUuid)
    const rightFootPosition = getComponent(rightFootEntity, TransformComponent).position
    rightFootPosition.set(-0.1, 0.1, 0)

    AvatarIKTargetComponent.blendWeight[headEntity] = 1
    AvatarIKTargetComponent.blendWeight[rightHandEntity] = 1
    AvatarIKTargetComponent.blendWeight[leftHandEntity] = 1
    AvatarIKTargetComponent.blendWeight[leftFootEntity] = 1
    AvatarIKTargetComponent.blendWeight[rightFootEntity] = 1

    await vi.waitUntil(() => {
      SystemDefinitions.get(TransformDirtyUpdateSystem)?.execute()
      SystemDefinitions.get(TransformSystem)?.execute()
      SystemDefinitions.get(TransformDirtyCleanupSystem)?.execute()
      SystemDefinitions.get(AvatarIKSystem)?.execute()
      SystemDefinitions.get(AnimationSystem)?.execute()
      SystemDefinitions.get(AvatarAnimationSystem)?.execute()

      iterateEntityNode(avatarEntity, computeTransformMatrix, (e) => hasComponent(e, TransformComponent))

      const rightHandIkPos = TransformComponent.getWorldPosition(
        getComponent(avatarEntity, AvatarRigComponent).bonesToEntities.rightHand,
        new Vector3()
      )
      const leftHandIkPos = TransformComponent.getWorldPosition(
        getComponent(avatarEntity, AvatarRigComponent).bonesToEntities.leftHand,
        new Vector3()
      )
      const leftFootIkPos = TransformComponent.getWorldPosition(
        getComponent(avatarEntity, AvatarRigComponent).bonesToEntities.leftFoot,
        new Vector3()
      )
      const rightFootIkPos = TransformComponent.getWorldPosition(
        getComponent(avatarEntity, AvatarRigComponent).bonesToEntities.rightFoot,
        new Vector3()
      )

      return (
        rightHandIkPos.distanceTo(rightHandPosition) < 0.1 &&
        leftHandIkPos.distanceTo(leftHandPosition) < 0.1 &&
        leftFootIkPos.distanceTo(leftFootPosition) < 0.1 &&
        rightFootIkPos.distanceTo(rightFootPosition) < 0.1
      )
    }, 1000)
  })
})
