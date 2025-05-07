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
import { afterEach, beforeEach, describe, it } from 'vitest'

import { createEntity, EntityID, EntityUUID, EntityUUIDPair, SourceID, UUIDComponent } from '@ir-engine/ecs'
import { getComponent, hasComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { createEngine, destroyEngine, Engine } from '@ir-engine/ecs/src/Engine'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { applyIncomingActions, dispatchAction, getMutableState, getState, PeerID, UserID } from '@ir-engine/hyperflux'

import { createMockNetwork } from '../tests/createMockNetwork'
import { Network, NetworkTopics } from './Network'

import './EntityNetworkState'

import { EngineState } from '@ir-engine/ecs'
import { EntityNetworkState } from './EntityNetworkState'
import { WorldNetworkAction } from './functions/WorldNetworkAction'
import { NetworkObjectComponent, NetworkObjectOwnedTag } from './NetworkObjectComponent'
import { NetworkActions, NetworkState, ScenePeer, SceneUser } from './NetworkState'

describe('EntityNetworkState', () => {
  beforeEach(async () => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('should spawn entity', () => {
    it('should spawn object owned by host as host', async () => {
      const hostUserId = 'host user' as UserID
      const hostPeerID = Engine.instance.store.peerID

      createMockNetwork(NetworkTopics.world, hostPeerID, hostUserId)

      getMutableState(EngineState).userID.set(hostUserId)
      const network = NetworkState.worldNetwork as Network

      const parentEntity = createEntity()
      const parentUUID = { entitySourceID: 'source', entityID: 'id' as EntityID } as EntityUUIDPair
      setComponent(parentEntity, UUIDComponent, parentUUID)

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: UUIDComponent.join(parentUUID),
          ownerID: network.hostUserID!,
          $topic: NetworkTopics.world,
          $peer: hostPeerID,
          entityID: 'id' as EntityID,
          entitySourceID: 'entity' as SourceID
        })
      )

      applyIncomingActions()

      await act(() => render(null))

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntities = networkObjectQuery()
      const networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 1)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, 0)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).authorityPeerID, hostPeerID)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectOwnedTag), true)
    })

    it('should spawn object owned by host as other user', async () => {
      const hostUserId = 'host user' as UserID
      const hostPeerID = 'host peer' as PeerID
      const userId = 'user id' as UserID
      const peerID2 = Engine.instance.store.peerID

      createMockNetwork(NetworkTopics.world, hostPeerID, hostUserId)

      getMutableState(EngineState).userID.set(userId)
      const network = NetworkState.worldNetwork as Network

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: peerID2,
          peerIndex: 1,
          userID: userId,
          $network: network.id
        })
      )

      const parentEntity = createEntity()
      const parentUUID = { entitySourceID: 'source', entityID: 'id' as EntityID } as EntityUUIDPair

      setComponent(parentEntity, UUIDComponent, parentUUID)

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: UUIDComponent.join(parentUUID),
          ownerID: network.hostUserID!,
          $topic: NetworkTopics.world,
          $peer: hostPeerID,
          $user: hostUserId,
          entityID: 'id' as EntityID,
          entitySourceID: 'entity' as SourceID
        })
      )

      applyIncomingActions()

      await act(() => render(null))

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntities = networkObjectQuery()
      const networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 0)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, 0)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).authorityPeerID, hostPeerID)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectOwnedTag), false)
    })

    it('should spawn object owned by user as host', async () => {
      const hostUserId = 'host user' as UserID
      const hostPeerID = Engine.instance.store.peerID

      createMockNetwork(NetworkTopics.world, hostPeerID, hostUserId)

      const userId = 'user id' as UserID
      const peerID2 = 'peer id 2' as PeerID

      getMutableState(EngineState).userID.set(hostUserId)
      const network = NetworkState.worldNetwork as Network

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: peerID2,
          peerIndex: 1,
          userID: userId,
          $network: network.id
        })
      )

      const parentEntity = createEntity()
      const parentUUID = { entitySourceID: 'source', entityID: 'id' as EntityID } as EntityUUIDPair
      setComponent(parentEntity, UUIDComponent, parentUUID)

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: UUIDComponent.join(parentUUID),
          ownerID: userId,
          $peer: peerID2,
          $user: userId,
          entityID: 'id' as EntityID,
          entitySourceID: 'entity' as SourceID
        })
      )

      applyIncomingActions()

      await act(() => render(null))

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntities = networkObjectQuery()
      const networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 0)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, 0)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).authorityPeerID, peerID2)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectOwnedTag), false)
    })

    it('should spawn object owned by user as user', async () => {
      const hostUserId = 'host user' as UserID
      const hostPeerID = 'host peer' as PeerID
      const userId = 'user id' as UserID
      const peerID2 = Engine.instance.store.peerID

      createMockNetwork(NetworkTopics.world, hostPeerID, hostUserId)

      getMutableState(EngineState).userID.set(userId)
      const network = NetworkState.worldNetwork as Network
      console.log('TEST')

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: peerID2,
          peerIndex: 1,
          userID: userId,
          $network: network.id
        })
      )

      const parentEntity = createEntity()
      const parentUUID = { entitySourceID: 'source', entityID: 'id' as EntityID } as EntityUUIDPair
      setComponent(parentEntity, UUIDComponent, parentUUID)

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: UUIDComponent.join(parentUUID),
          ownerID: userId,
          $peer: peerID2,
          $user: userId,
          entityID: 'id' as EntityID,
          entitySourceID: 'entity' as SourceID
        })
      )

      applyIncomingActions()

      await act(() => render(null))

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntities = networkObjectQuery()
      console.log({ networkObjectEntities })
      const networkObjectOwnedEntities = networkObjectOwnedQuery()
      console.log({ networkObjectOwnedEntities })

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 1)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, 0)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).authorityPeerID, peerID2)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectOwnedTag), true)
    })

    it('should spawn entity owned by user as other', async () => {
      const hostUserId = 'host user' as UserID
      const hostPeerID = 'host peer' as PeerID

      createMockNetwork(NetworkTopics.world, hostPeerID, hostUserId)

      const userId = 'user id' as UserID
      const userId2 = 'second user id' as UserID
      const peerID = Engine.instance.store.peerID
      const peerID2 = 'peer id 2' as PeerID
      const peerID3 = 'peer id 3' as PeerID

      getMutableState(EngineState).userID.set(userId)
      const network = NetworkState.worldNetwork as Network

      const parentEntity = createEntity()
      const parentUUID = { entitySourceID: 'source', entityID: 'id' as EntityID } as EntityUUIDPair
      setComponent(parentEntity, UUIDComponent, parentUUID)

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: peerID,
          peerIndex: 0,
          userID: hostUserId,
          $network: network.id
        })
      )
      dispatchAction(
        NetworkActions.peerJoined({
          peerID: peerID2,
          peerIndex: 1,
          userID: userId,
          $network: network.id
        })
      )
      dispatchAction(
        NetworkActions.peerJoined({
          peerID: peerID3,
          peerIndex: 2,
          userID: userId2,
          $network: network.id
        })
      )

      applyIncomingActions()

      await act(() => render(null))

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: UUIDComponent.join(parentUUID),
          ownerID: userId2, // from other user
          $peer: peerID3,
          $user: userId2,
          $topic: NetworkTopics.world,
          entityID: peerID3 as string as EntityID,
          entitySourceID: 'entity' as SourceID
        })
      )

      applyIncomingActions()

      await act(() => render(null))

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntities = networkObjectQuery()
      const networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 0)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, 0)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).authorityPeerID, peerID3)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectOwnedTag), false)
    })

    it('should not spawn entity if action sent by non-owner', async () => {
      const hostUserId = 'host user' as UserID
      const hostPeerID = 'host peer' as PeerID

      createMockNetwork(NetworkTopics.world, hostPeerID, hostUserId)

      const userId = 'user id' as UserID
      const peerID = Engine.instance.store.peerID

      const userId2 = 'second user id' as UserID
      const peerID2 = 'peer id 2' as PeerID

      getMutableState(EngineState).userID.set(userId)
      const network = NetworkState.worldNetwork as Network

      const parentEntity = createEntity()
      const parentUUID = { entitySourceID: 'source', entityID: 'id' as EntityID } as EntityUUIDPair
      setComponent(parentEntity, UUIDComponent, parentUUID)

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: peerID,
          peerIndex: 1,
          userID: userId,
          $network: network.id
        })
      )
      dispatchAction(
        NetworkActions.peerJoined({
          peerID: peerID2,
          peerIndex: 2,
          userID: userId2,
          $network: network.id
        })
      )

      applyIncomingActions()

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: UUIDComponent.join(parentUUID),
          ownerID: userId, // from other user
          $peer: peerID2,
          $user: userId2,
          $topic: NetworkTopics.world,
          entityID: 'id' as EntityID,
          entitySourceID: 'entity' as SourceID
        })
      )

      applyIncomingActions()

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntities = networkObjectQuery()
      const networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 0)
      assert.equal(networkObjectOwnedEntities.length, 0)
    })
  })

  describe('should remove entity', () => {
    it('should remove entity owned by host as host', async () => {
      const hostUserId = 'host user' as UserID
      const hostPeerID = Engine.instance.store.peerID

      createMockNetwork(NetworkTopics.world, hostPeerID, hostUserId)

      getMutableState(EngineState).userID.set(hostUserId)
      const network = NetworkState.worldNetwork as Network

      const parentEntity = createEntity()
      const parentUUID = { entitySourceID: 'source', entityID: 'id' as EntityID } as EntityUUIDPair
      setComponent(parentEntity, UUIDComponent, parentUUID)

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: UUIDComponent.join(parentUUID),
          ownerID: network.hostUserID!,
          $topic: NetworkTopics.world,
          $peer: hostPeerID,
          $user: hostUserId,
          entityID: 'id' as EntityID,
          entitySourceID: 'entity' as SourceID
        })
      )

      applyIncomingActions()

      await act(() => render(null))

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      let networkObjectEntities = networkObjectQuery()
      let networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 1)

      dispatchAction(
        WorldNetworkAction.destroyEntity({
          entityUUID: 'entityid' as EntityUUID,
          $topic: NetworkTopics.world
        })
      )

      applyIncomingActions()

      await act(() => render(null))

      networkObjectEntities = networkObjectQuery()
      networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 0)
      assert.equal(networkObjectOwnedEntities.length, 0)
    })

    it('should remove entity owned by host as other user', async () => {
      const hostUserId = 'host user' as UserID
      const hostPeerID = 'host peer' as PeerID

      createMockNetwork(NetworkTopics.world, hostPeerID, hostUserId)

      const userId = 'user id' as UserID
      const peerID2 = Engine.instance.store.peerID

      getMutableState(EngineState).userID.set(userId)
      const network = NetworkState.worldNetwork as Network

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: peerID2,
          peerIndex: 1,
          userID: userId,
          $network: network.id
        })
      )

      const parentEntity = createEntity()
      const parentUUID = { entitySourceID: 'source', entityID: 'id' as EntityID } as EntityUUIDPair
      setComponent(parentEntity, UUIDComponent, parentUUID)

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: UUIDComponent.join(parentUUID),
          ownerID: network.hostUserID!,
          $topic: NetworkTopics.world,
          $peer: hostPeerID,
          $user: hostUserId,
          entityID: 'id' as EntityID,
          entitySourceID: 'entity' as SourceID
        })
      )

      applyIncomingActions()

      await act(() => render(null))

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      let networkObjectEntities = networkObjectQuery()
      let networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 0)

      dispatchAction(
        WorldNetworkAction.destroyEntity({
          entityUUID: 'entityid' as EntityUUID,
          $peer: hostPeerID,
          $user: hostUserId,
          $topic: NetworkTopics.world
        })
      )

      applyIncomingActions()

      await act(() => render(null))

      networkObjectEntities = networkObjectQuery()
      networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 0)
      assert.equal(networkObjectOwnedEntities.length, 0)
    })

    it('should spawn object owner by the scene as host', async () => {
      const hostUserId = 'host user' as UserID
      const hostPeerID = Engine.instance.store.peerID

      createMockNetwork(NetworkTopics.world, hostPeerID, hostUserId)

      getMutableState(EngineState).userID.set(hostUserId)

      const parentEntity = createEntity()
      const parentUUID = { entitySourceID: 'source', entityID: 'id' as EntityID } as EntityUUIDPair
      setComponent(parentEntity, UUIDComponent, parentUUID)

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: UUIDComponent.join(parentUUID),
          ownerID: SceneUser,
          $topic: NetworkTopics.world,
          $peer: ScenePeer,
          $user: SceneUser,
          entityID: 'id' as EntityID,
          entitySourceID: 'entity' as SourceID
        })
      )

      applyIncomingActions()

      await act(() => render(null))

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntities = networkObjectQuery()
      const networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 0)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, 0)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).authorityPeerID, SceneUser)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectOwnedTag), 0)
    })

    it('should spawn object owner by the scene as other user', async () => {
      const hostUserId = 'host user' as UserID
      const hostPeerID = 'host peer' as PeerID

      createMockNetwork(NetworkTopics.world, hostPeerID, hostUserId)

      const userId = 'user id' as UserID
      const peerID2 = Engine.instance.store.peerID

      getMutableState(EngineState).userID.set(userId)

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: peerID2,
          peerIndex: 1,
          userID: userId,
          $network: NetworkState.worldNetwork!.id
        })
      )

      const parentEntity = createEntity()
      const parentUUID = { entitySourceID: 'source', entityID: 'id' as EntityID } as EntityUUIDPair
      setComponent(parentEntity, UUIDComponent, parentUUID)

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: UUIDComponent.join(parentUUID),
          ownerID: SceneUser,
          $topic: NetworkTopics.world,
          $peer: ScenePeer,
          $user: SceneUser,
          entityID: 'id' as EntityID,
          entitySourceID: 'entity' as SourceID
        })
      )

      applyIncomingActions()

      await act(() => render(null))

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntities = networkObjectQuery()
      const networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 0)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, 0)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).authorityPeerID, SceneUser)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectOwnedTag), false)
    })

    it('should not despawn entity if action sent by non-owner', async () => {
      const hostUserId = 'host user' as UserID
      const hostPeerID = 'host peer' as PeerID

      createMockNetwork(NetworkTopics.world, hostPeerID, hostUserId)

      const userId = 'user id' as UserID
      const peerID = Engine.instance.store.peerID

      const userId2 = 'second user id' as UserID
      const peerID2 = 'peer id 2' as PeerID

      getMutableState(EngineState).userID.set(userId)
      const network = NetworkState.worldNetwork as Network

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: peerID,
          peerIndex: 1,
          userID: userId,
          $network: network.id
        })
      )
      dispatchAction(
        NetworkActions.peerJoined({
          peerID: peerID2,
          peerIndex: 2,
          userID: userId2,
          $network: network.id
        })
      )

      applyIncomingActions()

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: 'parent' as EntityUUID,
          ownerID: userId,
          $peer: peerID,
          $user: userId,
          $topic: NetworkTopics.world,
          entityID: 'id' as EntityID,
          entitySourceID: 'entity' as SourceID
        })
      )

      applyIncomingActions()

      await act(() => render(null))

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      let networkObjectEntities = networkObjectQuery()
      let networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 1)

      dispatchAction(
        WorldNetworkAction.destroyEntity({
          entityUUID: 'entityid' as EntityUUID,
          $peer: peerID2,
          $user: userId2,
          $topic: NetworkTopics.world
        })
      )

      applyIncomingActions()

      networkObjectEntities = networkObjectQuery()
      networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 1)
    })
  })

  describe('transfer authority of object', () => {
    it('should transfer authority of object between peers of same user', async () => {
      const hostUserID = 'host user' as UserID
      const hostPeerID = 'host peer id' as PeerID

      createMockNetwork(NetworkTopics.world, hostPeerID, hostUserID)

      const userID = 'user id' as UserID
      const peerID = Engine.instance.store.peerID
      const peerID2 = 'peer id 2' as PeerID

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
      dispatchAction(
        NetworkActions.peerJoined({
          peerID: peerID2,
          peerIndex: 1,
          userID: userID,
          $network: network.id
        })
      )

      applyIncomingActions()

      await act(() => render(null))

      const parentEntity = createEntity()
      const parentUUID = { entitySourceID: 'source', entityID: 'id' as EntityID } as EntityUUIDPair
      setComponent(parentEntity, UUIDComponent, parentUUID)

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: UUIDComponent.join(parentUUID),
          ownerID: userID,
          $topic: NetworkTopics.world,
          $peer: peerID,
          $user: userID,
          entityID: 'id' as EntityID,
          entitySourceID: 'entity' as SourceID
        })
      )

      applyIncomingActions()

      await act(() => render(null))

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntitiesBefore = networkObjectQuery()
      const networkObjectOwnedEntitiesBefore = networkObjectOwnedQuery()

      assert.equal(networkObjectEntitiesBefore.length, 1)
      assert.equal(networkObjectOwnedEntitiesBefore.length, 1)

      assert.equal(getComponent(networkObjectEntitiesBefore[0], NetworkObjectComponent).ownerId, userID)
      assert.equal(getComponent(networkObjectEntitiesBefore[0], NetworkObjectComponent).authorityPeerID, peerID)
      assert.equal(hasComponent(networkObjectEntitiesBefore[0], NetworkObjectOwnedTag), true)

      dispatchAction(
        WorldNetworkAction.requestAuthorityOverObject({
          entityUUID: 'entityid' as EntityUUID,
          $topic: NetworkTopics.world,
          newAuthority: peerID2
        })
      )

      applyIncomingActions()

      await act(() => render(null))

      applyIncomingActions()

      await act(() => render(null))

      const networkObjectEntitiesAfter = networkObjectQuery()
      const networkObjectOwnedEntitiesAfter = networkObjectOwnedQuery()

      assert.equal(networkObjectEntitiesAfter.length, 1)
      assert.equal(networkObjectOwnedEntitiesAfter.length, 1)

      assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).ownerId, userID) // owner remains same
      assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).authorityPeerID, peerID2) // peer has changed
      assert.equal(hasComponent(networkObjectEntitiesAfter[0], NetworkObjectOwnedTag), true)
    })
  })

  it('should transfer authority of object between peers of different users', async () => {
    const hostUserID = 'host user' as UserID
    const hostPeerID = 'host peer id' as PeerID

    createMockNetwork(NetworkTopics.world, hostPeerID, hostUserID)

    const userID = 'user id' as UserID
    const userID2 = 'user id 2' as UserID
    const peerID = Engine.instance.store.peerID
    const peerID2 = 'peer id 2' as PeerID

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
    dispatchAction(
      NetworkActions.peerJoined({
        peerID: peerID2,
        peerIndex: 1,
        userID: userID2,
        $network: network.id
      })
    )

    applyIncomingActions()

    await act(() => render(null))

    const parentEntity = createEntity()
    const parentUUID = { entitySourceID: 'source', entityID: 'id' as EntityID } as EntityUUIDPair
    setComponent(parentEntity, UUIDComponent, parentUUID)

    dispatchAction(
      WorldNetworkAction.spawnEntity({
        parentUUID: UUIDComponent.join(parentUUID),
        ownerID: userID,
        $topic: NetworkTopics.world,
        $peer: peerID,
        $user: userID,
        entityID: 'id' as EntityID,
        entitySourceID: 'entity' as SourceID
      })
    )

    applyIncomingActions()

    await act(() => render(null))

    const networkObjectQuery = defineQuery([NetworkObjectComponent])
    const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

    const networkObjectEntitiesBefore = networkObjectQuery()
    const networkObjectOwnedEntitiesBefore = networkObjectOwnedQuery()

    assert.equal(networkObjectEntitiesBefore.length, 1)
    assert.equal(networkObjectOwnedEntitiesBefore.length, 1)

    assert.equal(getComponent(networkObjectEntitiesBefore[0], NetworkObjectComponent).ownerId, userID)
    assert.equal(getComponent(networkObjectEntitiesBefore[0], NetworkObjectComponent).authorityPeerID, peerID)
    assert.equal(hasComponent(networkObjectEntitiesBefore[0], NetworkObjectOwnedTag), true)

    dispatchAction(
      WorldNetworkAction.requestAuthorityOverObject({
        entityUUID: 'entityid' as EntityUUID,
        $topic: NetworkTopics.world,
        newAuthority: peerID2
      })
    )

    applyIncomingActions()

    await act(() => render(null))

    applyIncomingActions()

    await act(() => render(null))

    const networkObjectEntitiesAfter = networkObjectQuery()
    const networkObjectOwnedEntitiesAfter = networkObjectOwnedQuery()

    assert.equal(networkObjectEntitiesAfter.length, 1)
    assert.equal(networkObjectOwnedEntitiesAfter.length, 1)

    assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).ownerId, userID) // owner remains same
    assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).authorityPeerID, peerID2) // peer has changed
    assert.equal(hasComponent(networkObjectEntitiesAfter[0], NetworkObjectOwnedTag), true)
  })

  it('should not transfer authority if it is not the owner', async () => {
    const hostUserID = 'host user' as UserID
    const hostPeerID = 'host peer id' as PeerID

    createMockNetwork(NetworkTopics.world, hostPeerID, hostUserID)

    const userId = 'user id' as UserID
    const peerID = Engine.instance.store.peerID
    const peerID2 = 'peer id 2' as PeerID

    getMutableState(EngineState).userID.set(userId)
    const network = NetworkState.worldNetwork as Network

    const parentEntity = createEntity()
    const parentUUID = { entitySourceID: 'source', entityID: 'id' as EntityID } as EntityUUIDPair
    setComponent(parentEntity, UUIDComponent, parentUUID)

    dispatchAction(
      NetworkActions.peerJoined({
        peerID: peerID,
        peerIndex: 0,
        userID: userId,
        $network: network.id
      })
    )
    dispatchAction(
      NetworkActions.peerJoined({
        peerID: peerID2,
        peerIndex: 1,
        userID: userId,
        $network: network.id
      })
    )

    applyIncomingActions()

    await act(() => render(null))

    dispatchAction(
      WorldNetworkAction.spawnEntity({
        parentUUID: UUIDComponent.join(parentUUID),
        ownerID: hostUserID, // from  host
        $topic: NetworkTopics.world,
        $peer: Engine.instance.store.peerID,
        $user: hostUserID,
        entityID: 'id' as EntityID,
        entitySourceID: 'entity' as SourceID
      })
    )

    applyIncomingActions()

    await act(() => render(null))

    const networkObjectQuery = defineQuery([NetworkObjectComponent])
    const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

    const networkObjectEntitiesBefore = networkObjectQuery()
    const networkObjectOwnedEntitiesBefore = networkObjectOwnedQuery()

    assert.equal(networkObjectEntitiesBefore.length, 1)
    assert.equal(networkObjectOwnedEntitiesBefore.length, 0)

    assert.equal(getComponent(networkObjectEntitiesBefore[0], NetworkObjectComponent).ownerId, hostUserID)
    assert.equal(getComponent(networkObjectEntitiesBefore[0], NetworkObjectComponent).authorityPeerID, peerID)
    assert.equal(hasComponent(networkObjectEntitiesBefore[0], NetworkObjectOwnedTag), false)

    dispatchAction(
      WorldNetworkAction.requestAuthorityOverObject({
        entityUUID: 'entityid' as EntityUUID,
        $topic: NetworkTopics.world,
        newAuthority: peerID2
      })
    )

    applyIncomingActions()

    await act(() => render(null))
    applyIncomingActions()

    const networkObjectEntitiesAfter = networkObjectQuery()
    const networkObjectOwnedEntitiesAfter = networkObjectOwnedQuery()

    assert.equal(networkObjectEntitiesAfter.length, 1)
    assert.equal(networkObjectOwnedEntitiesAfter.length, 0)

    assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).ownerId, hostUserID) // owner remains same
    assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).authorityPeerID, peerID) // peer remains same
    assert.equal(hasComponent(networkObjectEntitiesAfter[0], NetworkObjectOwnedTag), false)
  })

  it('should increment network id for each entity owner by a particular peer', async () => {
    const hostUserID = 'host user' as UserID
    const hostPeerID = 'host peer id' as PeerID

    createMockNetwork(NetworkTopics.world, hostPeerID, hostUserID)

    const userId = 'user id' as UserID
    const peerID = Engine.instance.store.peerID

    getMutableState(EngineState).userID.set(userId)
    const network = NetworkState.worldNetwork as Network

    const parentEntity = createEntity()
    const parentUUID = { entitySourceID: 'source', entityID: 'id' as EntityID } as EntityUUIDPair
    setComponent(parentEntity, UUIDComponent, parentUUID)

    dispatchAction(
      NetworkActions.peerJoined({
        peerID: peerID,
        peerIndex: 0,
        userID: userId,
        $network: network.id
      })
    )

    const entityUUID = {
      entitySourceID: 'entity' as SourceID,
      entityID: 'id' as EntityID
    } as EntityUUIDPair

    dispatchAction(
      WorldNetworkAction.spawnEntity({
        parentUUID: UUIDComponent.join(parentUUID),
        ownerID: hostUserID,
        $topic: NetworkTopics.world,
        $peer: hostPeerID,
        $user: hostUserID,
        entityID: entityUUID.entityID,
        entitySourceID: entityUUID.entitySourceID
      })
    )

    applyIncomingActions()

    await act(() => render(null))

    const networkObjectQuery = defineQuery([NetworkObjectComponent])

    const networkObjectEntitiesBefore = networkObjectQuery()

    assert.equal(networkObjectEntitiesBefore.length, 1)
    assert.equal(getComponent(networkObjectEntitiesBefore[0], NetworkObjectComponent).networkId, 0)

    const entityUUID2 = {
      entitySourceID: 'entity' as SourceID,
      entityID: 'id2' as EntityID
    } as EntityUUIDPair

    assert.ok(entityUUID2.entityID > entityUUID.entityID)

    dispatchAction(
      WorldNetworkAction.spawnEntity({
        parentUUID: UUIDComponent.join(parentUUID),
        ownerID: hostUserID,
        $topic: NetworkTopics.world,
        $peer: hostPeerID,
        $user: hostUserID,
        entityID: entityUUID2.entityID,
        entitySourceID: entityUUID2.entitySourceID
      })
    )

    applyIncomingActions()

    await act(() => render(null))

    const networkObjectEntitiesAfter = networkObjectQuery()

    assert.equal(networkObjectEntitiesAfter.length, 2)
    assert.equal(getComponent(networkObjectEntitiesAfter[1], NetworkObjectComponent).networkId, 1)

    const otherEntityUUID = {
      entitySourceID: 'other entity' as SourceID,
      entityID: 'id' as EntityID
    } as EntityUUIDPair

    dispatchAction(
      WorldNetworkAction.spawnEntity({
        parentUUID: UUIDComponent.join(parentUUID),
        ownerID: userId,
        $topic: NetworkTopics.world,
        $peer: peerID,
        $user: userId,
        entityID: otherEntityUUID.entityID,
        entitySourceID: otherEntityUUID.entitySourceID
      })
    )

    applyIncomingActions()

    await act(() => render(null))

    const otherEntity = UUIDComponent.getEntityByUUID(UUIDComponent.join(otherEntityUUID))

    assert.ok(otherEntity)
    assert.equal(getComponent(otherEntity, NetworkObjectComponent).networkId, 0)

    const otherEntityUUID2 = {
      entitySourceID: 'other entity' as SourceID,
      entityID: 'id2' as EntityID
    } as EntityUUIDPair
    // ensure network id is incremented via alphabetical order of entityUUIDs
    assert.ok(otherEntityUUID2.entityID > otherEntityUUID.entityID)

    dispatchAction(
      WorldNetworkAction.spawnEntity({
        parentUUID: UUIDComponent.join(parentUUID),
        ownerID: userId,
        $topic: NetworkTopics.world,
        $peer: peerID,
        $user: userId,
        entityID: otherEntityUUID2.entityID,
        entitySourceID: otherEntityUUID2.entitySourceID
      })
    )

    applyIncomingActions()

    await act(() => render(null))

    const otherEntity2 = UUIDComponent.getEntityByUUID(UUIDComponent.join(otherEntityUUID2))

    assert.ok(otherEntity2)
    assert.equal(getComponent(otherEntity2, NetworkObjectComponent).networkId, 1)
  })

  it('should transfer authority of scene object', async () => {
    const hostUserID = 'host user' as UserID
    const hostPeerID = 'host peer id' as PeerID

    createMockNetwork(NetworkTopics.world, hostPeerID, hostUserID)

    const userId = 'user id' as UserID
    const peerID = Engine.instance.store.peerID

    getMutableState(EngineState).userID.set(userId)
    const network = NetworkState.worldNetwork as Network

    const parentEntity = createEntity()
    const parentUUID = { entitySourceID: 'source', entityID: 'id' as EntityID } as EntityUUIDPair
    setComponent(parentEntity, UUIDComponent, parentUUID)

    dispatchAction(
      NetworkActions.peerJoined({
        peerID: peerID,
        peerIndex: 0,
        userID: userId,
        $network: network.id
      })
    )

    applyIncomingActions()

    await act(() => render(null))

    dispatchAction(
      WorldNetworkAction.spawnEntity({
        parentUUID: UUIDComponent.join(parentUUID),
        ownerID: SceneUser,
        $topic: NetworkTopics.world,
        $peer: ScenePeer,
        $user: SceneUser,
        entityID: 'id' as EntityID,
        entitySourceID: 'entity' as SourceID
      })
    )

    applyIncomingActions()

    await act(() => render(null))

    const networkObjectQuery = defineQuery([NetworkObjectComponent])

    const networkObjectEntitiesBefore = networkObjectQuery()

    assert.equal(networkObjectEntitiesBefore.length, 1)
    assert.equal(getComponent(networkObjectEntitiesBefore[0], NetworkObjectComponent).networkId, 0)

    dispatchAction(
      WorldNetworkAction.requestAuthorityOverObject({
        entityUUID: 'entityid' as EntityUUID,
        $topic: NetworkTopics.world,
        newAuthority: peerID
      })
    )

    applyIncomingActions()

    await act(() => render(null))

    assert.equal(getState(EntityNetworkState)['entityid'].requestingPeerId, peerID)

    applyIncomingActions()

    await act(() => render(null))

    const networkObjectEntitiesAfter = networkObjectQuery()

    assert.equal(networkObjectEntitiesAfter.length, 1)
    assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).networkId, 0)
    assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).authorityPeerID, peerID)
  })

  it('should transfer authority of object we own but our other peer disconnects', async () => {
    const hostUserID = 'host user' as UserID
    const hostPeerID = 'host peer id' as PeerID

    createMockNetwork(NetworkTopics.world, hostPeerID, hostUserID)

    const userId = 'user id' as UserID
    const peerID = 'peer id' as PeerID
    const peerID2 = Engine.instance.store.peerID

    getMutableState(EngineState).userID.set(userId)
    const network = NetworkState.worldNetwork as Network

    const parentEntity = createEntity()
    const parentUUID = { entitySourceID: 'source', entityID: 'id' as EntityID } as EntityUUIDPair
    setComponent(parentEntity, UUIDComponent, parentUUID)

    dispatchAction(
      NetworkActions.peerJoined({
        peerID: peerID,
        peerIndex: 0,
        userID: userId,
        $network: network.id
      })
    )
    dispatchAction(
      NetworkActions.peerJoined({
        peerID: peerID2,
        peerIndex: 1,
        userID: userId,
        $network: network.id
      })
    )

    applyIncomingActions()

    await act(() => render(null))

    dispatchAction(
      WorldNetworkAction.spawnEntity({
        parentUUID: UUIDComponent.join(parentUUID),
        ownerID: userId,
        $topic: NetworkTopics.world,
        $peer: peerID,
        $user: userId,
        entityID: 'id' as EntityID,
        entitySourceID: 'entity' as SourceID
      })
    )

    applyIncomingActions()

    await act(() => render(null))

    dispatchAction(
      NetworkActions.peerLeft({
        peerID: peerID,
        userID: userId,
        $network: network.id
      })
    )

    applyIncomingActions()

    await act(() => render(null))

    applyIncomingActions()

    await act(() => render(null))

    assert.equal(getState(EntityNetworkState)['entityid'].authorityPeerId, peerID2)

    const networkObjectQuery = defineQuery([NetworkObjectComponent])

    const networkObjectEntitiesAfter = networkObjectQuery()

    assert.equal(networkObjectEntitiesAfter.length, 1)
    assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).authorityPeerID, peerID2)
  })

  it('should not transfer authority of object we do not own when authority peer disconnects', async () => {
    const hostUserID = 'host user' as UserID
    const hostPeerID = 'host peer id' as PeerID

    createMockNetwork(NetworkTopics.world, hostPeerID, hostUserID)

    const userId = 'user id' as UserID
    const peerID = Engine.instance.store.peerID
    const userId2 = 'user id 2' as UserID
    const peerID2 = 'peer id 2' as PeerID

    getMutableState(EngineState).userID.set(userId)
    const network = NetworkState.worldNetwork as Network

    const parentEntity = createEntity()
    const parentUUID = { entitySourceID: 'source', entityID: 'id' as EntityID } as EntityUUIDPair
    setComponent(parentEntity, UUIDComponent, parentUUID)

    dispatchAction(
      NetworkActions.peerJoined({
        peerID: peerID,
        peerIndex: 0,
        userID: userId,
        $network: network.id
      })
    )
    dispatchAction(
      NetworkActions.peerJoined({
        peerID: peerID2,
        peerIndex: 0,
        userID: userId2,
        $network: network.id
      })
    )

    applyIncomingActions()

    await act(() => render(null))

    dispatchAction(
      WorldNetworkAction.spawnEntity({
        parentUUID: UUIDComponent.join(parentUUID),
        ownerID: userId2,
        $topic: NetworkTopics.world,
        $peer: peerID2,
        $user: userId2,
        entityID: 'id' as EntityID,
        entitySourceID: 'entity' as SourceID
      })
    )

    applyIncomingActions()

    await act(() => render(null))

    dispatchAction(
      NetworkActions.peerLeft({
        peerID: peerID2,
        userID: userId2,
        $network: network.id
      })
    )

    applyIncomingActions()

    await act(() => render(null))

    applyIncomingActions()

    await act(() => render(null))

    assert.equal(getState(EntityNetworkState)['entityid'].authorityPeerId, peerID2)

    const networkObjectQuery = defineQuery([NetworkObjectComponent])

    const networkObjectEntitiesAfter = networkObjectQuery()

    // entity should be removed
    assert.equal(networkObjectEntitiesAfter.length, 0)
  })

  it('should not transfer authority of scene object when authority peer disconnects', async () => {
    const hostUserID = 'host user' as UserID
    const hostPeerID = 'host peer id' as PeerID

    createMockNetwork(NetworkTopics.world, hostPeerID, hostUserID)

    const userId = 'user id' as UserID
    const peerID = Engine.instance.store.peerID
    const userId2 = 'user id 2' as UserID
    const peerID2 = 'peer id 2' as PeerID

    getMutableState(EngineState).userID.set(userId)
    const network = NetworkState.worldNetwork as Network

    const parentEntity = createEntity()
    const parentUUID = { entitySourceID: 'source', entityID: 'id' as EntityID } as EntityUUIDPair
    setComponent(parentEntity, UUIDComponent, parentUUID)

    dispatchAction(
      NetworkActions.peerJoined({
        peerID: peerID,
        peerIndex: 0,
        userID: userId,
        $network: network.id
      })
    )

    dispatchAction(
      NetworkActions.peerJoined({
        peerID: peerID2,
        peerIndex: 0,
        userID: userId2,
        $network: network.id
      })
    )

    applyIncomingActions()

    await act(() => render(null))

    dispatchAction(
      WorldNetworkAction.spawnEntity({
        parentUUID: UUIDComponent.join(parentUUID),
        ownerID: SceneUser,
        authorityPeerId: peerID2,
        $topic: NetworkTopics.world,
        $peer: ScenePeer,
        $user: SceneUser,
        entityID: 'id' as EntityID,
        entitySourceID: 'entity' as SourceID
      })
    )

    applyIncomingActions()

    await act(() => render(null))

    dispatchAction(
      NetworkActions.peerLeft({
        peerID: peerID2,
        userID: userId2,
        $network: network.id
      })
    )

    applyIncomingActions()

    await act(() => render(null))

    applyIncomingActions()

    await act(() => render(null))

    /** @todo we need to handle reverting authority to the scene */
    // assert.equal(getState(EntityNetworkState)['entity'].authorityPeerId, ScenePeer)

    const networkObjectQuery = defineQuery([NetworkObjectComponent])

    const networkObjectEntitiesAfter = networkObjectQuery()

    assert.equal(networkObjectEntitiesAfter.length, 1)
    // assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).authorityPeerID, ScenePeer)
  })

  it.skip('benchmark 1000 entities spawn', async () => {
    const hostUserID = 'host user' as UserID
    const hostPeerID = 'host peer id' as PeerID

    createMockNetwork(NetworkTopics.world, hostPeerID, hostUserID)

    const userId = 'user id' as UserID
    const peerID = Engine.instance.store.peerID
    const peerID2 = 'peer id 2' as PeerID

    getMutableState(EngineState).userID.set(userId)
    const network = NetworkState.worldNetwork as Network

    const parentEntity = createEntity()
    const parentUUID = { entitySourceID: 'source', entityID: 'id' as EntityID } as EntityUUIDPair
    setComponent(parentEntity, UUIDComponent, parentUUID)

    dispatchAction(
      NetworkActions.peerJoined({
        peerID: peerID,
        peerIndex: 0,
        userID: userId,
        $network: network.id
      })
    )
    dispatchAction(
      NetworkActions.peerJoined({
        peerID: peerID2,
        peerIndex: 1,
        userID: userId,
        $network: network.id
      })
    )
    applyIncomingActions()

    await act(() => render(null))

    const start = performance.now()

    const count = 1000

    for (let i = 0; i < count; i++) {
      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: UUIDComponent.join(parentUUID),
          ownerID: hostUserID, // from  host
          $topic: NetworkTopics.world,
          $peer: Engine.instance.store.peerID,
          $user: hostUserID,
          entityID: 'id' as EntityID,
          entitySourceID: 'entity' as SourceID
        })
      )
    }

    applyIncomingActions()

    await act(() => render(null))

    const applyActionsEnd = performance.now()
    console.log(count, 'entities apply action time:', applyActionsEnd - start)

    const reactorEnd = performance.now()

    console.log(count, 'entities reactor time:', reactorEnd - applyActionsEnd)

    const runner1End = performance.now()

    console.log(count, 'entities unchanged runner time:', runner1End - reactorEnd)

    dispatchAction(
      WorldNetworkAction.spawnEntity({
        parentUUID: UUIDComponent.join(parentUUID),
        ownerID: hostUserID, // from  host
        $topic: NetworkTopics.world,
        $peer: Engine.instance.store.peerID,
        $user: hostUserID,
        entityID: 'id' as EntityID,
        entitySourceID: 'entity' as SourceID
      })
    )

    applyIncomingActions()

    await act(() => render(null))

    const runner2End = performance.now()

    console.log(count, 'entities 1 new entity runner time:', runner2End - runner1End)
    console.log(count, 'entities total time:', runner2End - start)
  })
})
