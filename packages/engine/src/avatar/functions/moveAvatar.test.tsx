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

import { strictEqual } from 'assert'
import { Quaternion, Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'

import '@ir-engine/spatial/src/transform/SpawnPoseState'
import '../state/AvatarNetworkState'

import { Entity, EntityUUID, UUIDComponent } from '@ir-engine/ecs'
import { getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { Engine, createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { UserID, applyIncomingActions, dispatchAction, getMutableState } from '@ir-engine/hyperflux'
import { NetworkTopics } from '@ir-engine/network'
import { createMockNetwork } from '@ir-engine/network/tests/createMockNetwork'
import { initializeSpatialEngine, initializeSpatialViewer } from '@ir-engine/spatial/src/initializeEngine'
import { Physics, PhysicsWorld } from '@ir-engine/spatial/src/physics/classes/Physics'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'

import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarNetworkAction } from '../state/AvatarNetworkActions'
import { applyGamepadInput } from './moveAvatar'

describe('moveAvatar function tests', () => {
  let sceneEntity: Entity
  let physicsWorld: PhysicsWorld
  beforeEach(async () => {
    createEngine()
    initializeSpatialEngine()
    initializeSpatialViewer()
    await Physics.load()
    Engine.instance.store.userID = 'userId' as UserID
    sceneEntity = loadEmptyScene()

    setComponent(sceneEntity, SceneComponent)
    physicsWorld = Physics.createWorld(getComponent(sceneEntity, UUIDComponent))
    physicsWorld.timestep = 1 / 60

    createMockNetwork(NetworkTopics.world, Engine.instance.store.peerID, Engine.instance.store.userID)
  })

  afterEach(() => {
    return destroyEngine()
  })

  const avatarUrl = 'packages/projects/default-project/assets/avatars/male_01.vrm'

  it('should apply world.fixedDelta @ 60 tick to avatar movement, consistent with physics simulation', async () => {
    const ecsState = getMutableState(ECSState)
    ecsState.simulationTimestep.set(1000 / 60)

    const entityUUID = (Engine.instance.store.userID + '_avatar') as EntityUUID

    dispatchAction(
      AvatarNetworkAction.spawn({
        $peer: Engine.instance.store.peerID,
        parentUUID: getComponent(sceneEntity, UUIDComponent),
        position: new Vector3(),
        rotation: new Quaternion(),
        entityUUID: entityUUID,
        avatarURL: avatarUrl,
        name: 'TestAvatar'
      })
    )
    applyIncomingActions()

    const entity = AvatarComponent.getSelfAvatarEntity()

    const velocity = getComponent(entity, RigidBodyComponent).linearVelocity
    const avatar = getComponent(entity, AvatarControllerComponent)

    avatar.gamepadWorldMovement.setZ(-1)

    // velocity starts at 0
    strictEqual(velocity.x, 0)
    strictEqual(velocity.z, 0)

    /* run */
    applyGamepadInput(entity)
  })

  it('should apply world.fixedDelta @ 120 tick to avatar movement, consistent with physics simulation', async () => {
    const ecsState = getMutableState(ECSState)
    ecsState.simulationTimestep.set(1000 / 60)

    dispatchAction(
      AvatarNetworkAction.spawn({
        $peer: Engine.instance.store.peerID,
        parentUUID: getComponent(sceneEntity, UUIDComponent),
        position: new Vector3(),
        rotation: new Quaternion(),
        entityUUID: (Engine.instance.store.userID + '_avatar') as EntityUUID,
        avatarURL: avatarUrl,
        name: 'TestAvatar'
      })
    )
    applyIncomingActions()

    const entity = AvatarComponent.getSelfAvatarEntity()
    const velocity = getComponent(entity, RigidBodyComponent).linearVelocity

    // velocity starts at 0
    strictEqual(velocity.x, 0)
    strictEqual(velocity.z, 0)

    /* run */
    applyGamepadInput(entity)
  })

  it('should take world.physics.timeScale into account when moving avatars, consistent with physics simulation', async () => {
    Engine.instance.store.userID = 'user' as UserID

    const ecsState = getMutableState(ECSState)
    ecsState.simulationTimestep.set(1000 / 60)

    /* mock */
    physicsWorld.timestep = 1 / 2

    dispatchAction(
      AvatarNetworkAction.spawn({
        $peer: Engine.instance.store.peerID,
        parentUUID: getComponent(sceneEntity, UUIDComponent),
        position: new Vector3(),
        rotation: new Quaternion(),
        entityUUID: (Engine.instance.store.userID + '_avatar') as EntityUUID,
        avatarURL: avatarUrl,
        name: 'TestAvatar'
      })
    )
    applyIncomingActions()

    const entity = AvatarComponent.getSelfAvatarEntity()
    const velocity = getComponent(entity, RigidBodyComponent).linearVelocity

    // velocity starts at 0
    strictEqual(velocity.x, 0)
    strictEqual(velocity.z, 0)

    /* run */
    applyGamepadInput(entity)
  })

  it('should not allow velocity to breach a full unit through multiple frames', async () => {
    Engine.instance.store.userID = 'user' as UserID

    const ecsState = getMutableState(ECSState)
    ecsState.simulationTimestep.set(1000 / 60)

    dispatchAction(
      AvatarNetworkAction.spawn({
        $peer: Engine.instance.store.peerID,
        parentUUID: getComponent(sceneEntity, UUIDComponent),
        position: new Vector3(),
        rotation: new Quaternion(),
        entityUUID: (Engine.instance.store.userID + '_avatar') as EntityUUID,
        avatarURL: avatarUrl,
        name: 'TestAvatar'
      })
    )
    applyIncomingActions()

    const entity = AvatarComponent.getSelfAvatarEntity()
    const velocity = getComponent(entity, RigidBodyComponent).linearVelocity

    // velocity starts at 0
    strictEqual(velocity.x, 0)
    strictEqual(velocity.z, 0)

    /* run */
    applyGamepadInput(entity)

    physicsWorld.step()
    applyGamepadInput(entity)
    physicsWorld.step()
    applyGamepadInput(entity)
    physicsWorld.step()
    applyGamepadInput(entity)
    physicsWorld.step()
    applyGamepadInput(entity)
    physicsWorld.step()
    applyGamepadInput(entity)
  })
})
