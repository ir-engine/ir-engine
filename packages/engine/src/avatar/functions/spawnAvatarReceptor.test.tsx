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

import { act, render } from '@testing-library/react'
import assert from 'assert'
import React from 'react'
import { Quaternion, Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { Entity, EntityUUID, SystemDefinitions, UUIDComponent } from '@ir-engine/ecs'
import { getComponent, hasComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Engine, createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { ReactorReconciler, UserID, applyIncomingActions, dispatchAction } from '@ir-engine/hyperflux'
import { Network, NetworkPeerFunctions, NetworkState, NetworkWorldUserStateSystem } from '@ir-engine/network'
import { createMockNetwork } from '@ir-engine/network/tests/createMockNetwork'
import { initializeSpatialEngine, initializeSpatialViewer } from '@ir-engine/spatial/src/initializeEngine'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import {
  RigidBodyComponent,
  RigidBodyKinematicTagComponent
} from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarNetworkAction } from '../state/AvatarNetworkActions'
import { spawnAvatarReceptor } from './spawnAvatarReceptor'

describe('spawnAvatarReceptor', () => {
  let sceneEntity: Entity
  beforeEach(async () => {
    createEngine()
    initializeSpatialEngine()
    initializeSpatialViewer()
    Engine.instance.store.defaultDispatchDelay = () => 0
    await Physics.load()
    Engine.instance.store.userID = 'user' as UserID
    sceneEntity = loadEmptyScene()

    setComponent(sceneEntity, SceneComponent)
    const physicsWorld = Physics.createWorld(getComponent(sceneEntity, UUIDComponent))
    physicsWorld.timestep = 1 / 60

    createMockNetwork()
  })

  afterEach(() => {
    return destroyEngine()
  })

  const NetworkWorldUserStateSystemReactor = SystemDefinitions.get(NetworkWorldUserStateSystem)!.reactor!
  const tag = <NetworkWorldUserStateSystemReactor />

  it('check the create avatar function', async () => {
    const network = NetworkState.worldNetwork as Network
    NetworkPeerFunctions.createPeer(network, Engine.instance.store.peerID, 0, Engine.instance.userID, 0)

    const { rerender, unmount } = render(tag)
    await act(() => rerender(tag))

    // mock entity to apply incoming unreliable updates to
    dispatchAction(
      AvatarNetworkAction.spawn({
        parentUUID: getComponent(sceneEntity, UUIDComponent),
        position: new Vector3(),
        rotation: new Quaternion(),
        entityUUID: Engine.instance.store.userID as string as EntityUUID,
        avatarURL: '',
        name: ''
      })
    )

    ReactorReconciler.flushSync(() => applyIncomingActions())
    ReactorReconciler.flushSync(() => spawnAvatarReceptor(Engine.instance.userID as string as EntityUUID))

    const entity = AvatarComponent.getUserAvatarEntity(Engine.instance.store.userID)

    assert(hasComponent(entity, TransformComponent))
    assert(hasComponent(entity, AvatarAnimationComponent))
    assert(hasComponent(entity, AvatarControllerComponent))
    assert(hasComponent(entity, RigidBodyComponent))
    assert(hasComponent(entity, RigidBodyKinematicTagComponent))

    unmount()
  })
})
