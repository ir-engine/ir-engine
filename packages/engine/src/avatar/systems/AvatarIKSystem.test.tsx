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
  EntityID,
  EntityUUIDPair,
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
import { BoneComponent } from '@ir-engine/spatial/src/renderer/components/BoneComponent'
import {
  computeTransformMatrix,
  TransformDirtyCleanupSystem,
  TransformDirtyUpdateSystem,
  TransformSystem
} from '@ir-engine/spatial/src/transform/systems/TransformSystem'
import { Quaternion, Vector3 } from 'three'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockAnimatedAvatar } from '../../../tests/avatar/mockAnimatedAvatar'
import { startEngineReactor } from '../../../tests/startEngineReactor'
import { overrideFileLoaderLoad } from '../../../tests/util/loadGLTFAssetNode'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarIKComponent, AvatarIKTargetComponent, IKMatrixComponent } from '../components/AvatarIKComponents'
import '../state/AvatarIKTargetState'
import { AvatarNetworkAction } from '../state/AvatarNetworkActions'
import { AnimationSystem } from './AnimationSystem'
import { AvatarAnimationSystem } from './AvatarAnimationSystem'
import { AvatarIkReactor, AvatarIKSystem } from './AvatarIKSystem'

const default_url = 'packages/projects/default-project/assets'
describe('AvatarIKSystem', () => {
  overrideFileLoaderLoad()

  beforeEach(async () => {
    createEngine()
    startEngineReactor()
  })

  afterEach(() => {
    destroyEngine()
  })

  it('should solve IK such that every tip joint world position is at the ik target', async () => {
    const avatarUuidPair = { entitySourceID: 'user-id', entityID: 'avatar' } as EntityUUIDPair
    const avatarUuid = UUIDComponent.join(avatarUuidPair)
    let avatarEntity = UndefinedEntity as Entity
    avatarEntity = await mockAnimatedAvatar()
    setComponent(avatarEntity, UUIDComponent, avatarUuidPair)
    setComponent(avatarEntity, AvatarIKComponent)
    startReactor(AvatarIkReactor)
    const rig = getComponent(avatarEntity, AvatarRigComponent)

    // no idea why this is necessary
    for (const entity in rig.entitiesToBones) {
      const bone = getOptionalComponent(entity as unknown as Entity, BoneComponent)
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

    const rightHandId = 'rightHand' as EntityID
    const leftHandId = 'leftHand' as EntityID
    const leftFootId = 'leftFoot' as EntityID
    const rightFootId = 'rightFoot' as EntityID
    const headId = 'head' as EntityID
    dispatchAction(
      AvatarNetworkAction.spawnIKTarget({
        parentUUID: avatarUuid,
        entityID: rightHandId,
        entitySourceID: avatarUuidPair.entitySourceID,
        name: 'rightHand',
        blendWeight: 1
      })
    )
    dispatchAction(
      AvatarNetworkAction.spawnIKTarget({
        parentUUID: avatarUuid,
        entityID: leftHandId,
        entitySourceID: avatarUuidPair.entitySourceID,
        name: 'leftHand',
        blendWeight: 1
      })
    )
    dispatchAction(
      AvatarNetworkAction.spawnIKTarget({
        parentUUID: avatarUuid,
        entityID: leftFootId,
        entitySourceID: avatarUuidPair.entitySourceID,
        name: 'leftFoot',
        blendWeight: 1
      })
    )
    dispatchAction(
      AvatarNetworkAction.spawnIKTarget({
        parentUUID: avatarUuid,
        entityID: rightFootId,
        entitySourceID: avatarUuidPair.entitySourceID,
        name: 'rightFoot',
        blendWeight: 1
      })
    )
    dispatchAction(
      AvatarNetworkAction.spawnIKTarget({
        parentUUID: avatarUuid,
        entityID: headId,
        entitySourceID: avatarUuidPair.entitySourceID,
        name: 'head',
        blendWeight: 1
      })
    )
    applyIncomingActions()

    // Create the concatenated UUIDs
    const rightHandUuid = UUIDComponent.join({
      entitySourceID: avatarUuidPair.entitySourceID,
      entityID: rightHandId
    })
    const leftHandUuid = UUIDComponent.join({
      entitySourceID: avatarUuidPair.entitySourceID,
      entityID: leftHandId
    })
    const leftFootUuid = UUIDComponent.join({
      entitySourceID: avatarUuidPair.entitySourceID,
      entityID: leftFootId
    })
    const rightFootUuid = UUIDComponent.join({
      entitySourceID: avatarUuidPair.entitySourceID,
      entityID: rightFootId
    })
    const headUuid = UUIDComponent.join({ entitySourceID: avatarUuidPair.entitySourceID, entityID: headId })

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
