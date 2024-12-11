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

import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { Entity, EntityUUID, UUIDComponent } from '@ir-engine/ecs'
import { getComponent, hasComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Engine, createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { PeerID, UserID, applyIncomingActions, dispatchAction, getMutableState, getState } from '@ir-engine/hyperflux'
import {
  EntityNetworkState,
  Network,
  NetworkActions,
  NetworkObjectComponent,
  NetworkState,
  NetworkTopics,
  ScenePeer,
  SceneUser,
  WorldNetworkAction
} from '@ir-engine/network'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'

import { createMockNetwork } from '@ir-engine/network/tests/createMockNetwork'
import { initializeSpatialEngine, initializeSpatialViewer } from '@ir-engine/spatial/src/initializeEngine'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { SpawnObjectActions } from '@ir-engine/spatial/src/transform/SpawnObjectActions'
import { loadEmptyScene } from '../../tests/util/loadEmptyScene'
import { AvatarNetworkAction } from '../avatar/state/AvatarNetworkActions'

import { EngineState } from '@ir-engine/spatial/src/EngineState'
import '@ir-engine/spatial/src/transform/SpawnPoseState'
import { act, render } from '@testing-library/react'
import React from 'react'
import '../avatar/state/AvatarNetworkState'
import { GrabbableComponent, GrabbableNetworkAction, GrabbedComponent, GrabberComponent } from './GrabbableComponent'
import { GrabbableState } from './GrabbableState'

describe('GrabbableSystem', () => {
  let sceneEntity: Entity

  beforeEach(async () => {
    createEngine()
    initializeSpatialEngine()
    initializeSpatialViewer()
    await Physics.load()

    sceneEntity = loadEmptyScene()
    setComponent(sceneEntity, SceneComponent)
    const physicsWorld = Physics.createWorld(getComponent(sceneEntity, UUIDComponent))
    physicsWorld.timestep = 1 / 60
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('can grab an object owner by the host as another user', async () => {
    const hostPeerID = 'host peer' as PeerID
    const hostUserID = 'host user' as UserID

    const userID = 'user id' as UserID
    const peerID = Engine.instance.store.peerID

    createMockNetwork(NetworkTopics.world, hostPeerID, hostUserID)

    getMutableState(EngineState).userID.set(userID)
    const network = NetworkState.worldNetwork as Network

    dispatchAction(
      NetworkActions.peerJoined({
        peerID: peerID,
        peerIndex: 0,
        userID: userID,
        $network: network.id
      })
    )

    const avatarEntityUUID = 'avatar' as EntityUUID

    dispatchAction(
      AvatarNetworkAction.spawn({
        parentUUID: getComponent(sceneEntity, UUIDComponent),
        entityUUID: avatarEntityUUID,
        avatarURL: '',
        name: ''
      })
    )

    const grabbableEntityUUID = 'grabbable' as EntityUUID

    dispatchAction(
      SpawnObjectActions.spawnObject({
        parentUUID: getComponent(sceneEntity, UUIDComponent),
        ownerID: network.hostUserID!,
        $topic: NetworkTopics.world,
        $peer: hostPeerID,
        entityUUID: grabbableEntityUUID
      })
    )

    applyIncomingActions()

    const grabbableEntity = UUIDComponent.getEntityByUUID(grabbableEntityUUID)
    setComponent(grabbableEntity, GrabbableComponent)

    const playerEntity = UUIDComponent.getEntityByUUID(avatarEntityUUID)
    assert.ok(hasComponent(playerEntity, GrabberComponent))

    assert.equal(Object.keys(getState(GrabbableState)).length, 0)

    dispatchAction(
      GrabbableNetworkAction.setGrabbedObject({
        entityUUID: grabbableEntityUUID,
        grabbed: true,
        attachmentPoint: 'right',
        grabberEntityUUID: avatarEntityUUID
      })
    )

    applyIncomingActions()

    // assert that the grabbable state has been updated
    assert.equal(Object.keys(getState(GrabbableState)).length, 1)
    assert.equal(getState(GrabbableState)[grabbableEntityUUID].grabberEntityUUID, avatarEntityUUID)
    assert.equal(getState(GrabbableState)[grabbableEntityUUID].attachmentPoint, 'right')

    // should not have authority
    assert.equal(getComponent(grabbableEntity, NetworkObjectComponent).authorityPeerID, hostPeerID)
    assert.equal(hasComponent(grabbableEntity, GrabbedComponent), false)

    applyIncomingActions()

    // ensure we have requested authority
    assert.equal(getState(EntityNetworkState)[grabbableEntityUUID].requestingPeerId, peerID)

    // since we arent the host, we need to manually transfer authority acting as the host
    dispatchAction(
      WorldNetworkAction.transferAuthorityOfObject({
        ownerID: hostUserID,
        entityUUID: grabbableEntityUUID,
        newAuthority: peerID,
        $peer: hostPeerID
      })
    )

    applyIncomingActions()

    // wait for the authority transfer to be processed by the GrabbableState reactor
    const { rerender, unmount } = render(<></>)
    await act(async () => rerender(<></>))

    // should now have authority
    assert.equal(getComponent(grabbableEntity, NetworkObjectComponent).authorityPeerID, peerID)
    assert.ok(hasComponent(grabbableEntity, GrabbedComponent))

    /** @todo test transforms */

    // const grabbableTransform = getComponent(item, TransformComponent)
    // const attachmentPoint = grabbedComponent.attachmentPoint
    // const { position, rotation } = getHandTarget(item, attachmentPoint)!

    // strictEqual(grabbableTransform.position.x, position.x)
    // strictEqual(grabbableTransform.position.y, position.y)
    // strictEqual(grabbableTransform.position.z, position.z)

    // strictEqual(grabbableTransform.rotation.x, rotation.x)
    // strictEqual(grabbableTransform.rotation.y, rotation.y)
    // strictEqual(grabbableTransform.rotation.z, rotation.z)
    // strictEqual(grabbableTransform.rotation.w, rotation.w)

    unmount()
  })

  it('can grab an object owner by the scene as another user', async () => {
    const hostPeerID = 'host peer' as PeerID
    const hostUserID = 'host user' as UserID

    const userID = 'user id' as UserID
    const peerID = Engine.instance.store.peerID

    createMockNetwork(NetworkTopics.world, hostPeerID, hostUserID)

    getMutableState(EngineState).userID.set(userID)
    const network = NetworkState.worldNetwork as Network

    dispatchAction(
      NetworkActions.peerJoined({
        peerID: peerID,
        peerIndex: 0,
        userID: userID,
        $network: network.id
      })
    )

    const avatarEntityUUID = 'avatar' as EntityUUID

    dispatchAction(
      AvatarNetworkAction.spawn({
        parentUUID: getComponent(sceneEntity, UUIDComponent),
        entityUUID: avatarEntityUUID,
        avatarURL: '',
        name: ''
      })
    )

    const grabbableEntityUUID = 'grabbable' as EntityUUID

    dispatchAction(
      SpawnObjectActions.spawnObject({
        parentUUID: getComponent(sceneEntity, UUIDComponent),
        ownerID: SceneUser,
        $peer: ScenePeer,
        $topic: NetworkTopics.world,
        entityUUID: grabbableEntityUUID
      })
    )

    applyIncomingActions()

    const grabbableEntity = UUIDComponent.getEntityByUUID(grabbableEntityUUID)
    setComponent(grabbableEntity, GrabbableComponent)

    const playerEntity = UUIDComponent.getEntityByUUID(avatarEntityUUID)
    assert.ok(hasComponent(playerEntity, GrabberComponent))

    assert.equal(Object.keys(getState(GrabbableState)).length, 0)

    dispatchAction(
      GrabbableNetworkAction.setGrabbedObject({
        entityUUID: grabbableEntityUUID,
        grabbed: true,
        attachmentPoint: 'right',
        grabberEntityUUID: avatarEntityUUID
      })
    )

    applyIncomingActions()

    // assert that the grabbable state has been updated
    assert.equal(Object.keys(getState(GrabbableState)).length, 1)
    assert.equal(getState(GrabbableState)[grabbableEntityUUID].grabberEntityUUID, avatarEntityUUID)
    assert.equal(getState(GrabbableState)[grabbableEntityUUID].attachmentPoint, 'right')

    // should not have authority
    assert.equal(getComponent(grabbableEntity, NetworkObjectComponent).authorityPeerID, ScenePeer)
    assert.equal(hasComponent(grabbableEntity, GrabbedComponent), false)

    applyIncomingActions()

    // ensure we have requested authority
    assert.equal(getState(EntityNetworkState)[grabbableEntityUUID].requestingPeerId, peerID)

    // since we arent the host, we need to manually transfer authority acting as the host
    dispatchAction(
      WorldNetworkAction.transferAuthorityOfObject({
        ownerID: SceneUser,
        entityUUID: grabbableEntityUUID,
        newAuthority: peerID,
        $peer: peerID
      })
    )

    applyIncomingActions()

    // wait for the authority transfer to be processed by the GrabbableState reactor
    const { rerender, unmount } = render(<></>)
    await act(async () => rerender(<></>))

    // should now have authority
    assert.equal(getComponent(grabbableEntity, NetworkObjectComponent).authorityPeerID, peerID)
    assert.ok(hasComponent(grabbableEntity, GrabbedComponent))

    unmount()
  })
})
