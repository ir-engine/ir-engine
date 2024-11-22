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

import { EntityUUID, generateEntityUUID, UUIDComponent } from '@ir-engine/ecs'
import { getComponent, hasComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { createEngine, destroyEngine, Engine } from '@ir-engine/ecs/src/Engine'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { applyIncomingActions, dispatchAction, getState, PeerID, UserID } from '@ir-engine/hyperflux'
import { initializeSpatialEngine } from '@ir-engine/spatial/src/initializeEngine'

import { createMockNetwork } from '../tests/createMockNetwork'
import { Network, NetworkTopics } from './Network'

import './EntityNetworkState'

import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { WorldNetworkAction } from './functions/WorldNetworkAction'
import { NetworkId } from './NetworkId'
import { NetworkObjectComponent, NetworkObjectOwnedTag } from './NetworkObjectComponent'
import { NetworkActions, NetworkState } from './NetworkState'

describe('EntityNetworkState', () => {
  beforeEach(async () => {
    createEngine()
    initializeSpatialEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('should spawn entity', () => {
    it('should spawn object owned by host as host', async () => {
      const hostUserId = 'host user' as UserID
      const hostPeerID = Engine.instance.store.peerID

      createMockNetwork(NetworkTopics.world, hostPeerID, hostUserId)

      Engine.instance.store.userID = hostUserId
      const network = NetworkState.worldNetwork as Network

      const objNetId = 3 as NetworkId

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: getComponent(getState(EngineState).originEntity, UUIDComponent),
          ownerID: network.hostUserID!,
          networkId: objNetId,
          $topic: NetworkTopics.world,
          $peer: hostPeerID,
          entityUUID: 'entity' as EntityUUID
        })
      )

      applyIncomingActions()

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntities = networkObjectQuery()
      const networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 1)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, objNetId)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).authorityPeerID, hostPeerID)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectOwnedTag), true)
    })

    it('should spawn object owned by host as other user', async () => {
      const hostUserId = 'host user' as UserID
      const hostPeerID = 'host peer' as PeerID
      const userId = 'user id' as UserID
      const peerID2 = Engine.instance.store.peerID

      createMockNetwork(NetworkTopics.world, hostPeerID, hostUserId)

      Engine.instance.store.userID = userId
      const network = NetworkState.worldNetwork as Network

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: peerID2,
          peerIndex: 1,
          userID: userId,
          $network: network.id
        })
      )

      const objNetId = 3 as NetworkId

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: getComponent(getState(EngineState).originEntity, UUIDComponent),
          ownerID: network.hostUserID!,
          networkId: objNetId,
          $topic: NetworkTopics.world,
          $peer: hostPeerID,
          entityUUID: 'entity' as EntityUUID
        })
      )

      applyIncomingActions()

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntities = networkObjectQuery()
      const networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 0)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, objNetId)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).authorityPeerID, hostPeerID)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectOwnedTag), false)
    })

    it('should spawn object owned by user as host', async () => {
      const hostUserId = 'host user' as UserID
      const hostPeerID = Engine.instance.store.peerID

      createMockNetwork(NetworkTopics.world, hostPeerID, hostUserId)

      const userId = 'user id' as UserID
      const peerID2 = 'peer id 2' as PeerID

      Engine.instance.store.userID = hostUserId
      const network = NetworkState.worldNetwork as Network

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: peerID2,
          peerIndex: 1,
          userID: userId,
          $network: network.id
        })
      )

      const objNetId = 3 as NetworkId

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: getComponent(getState(EngineState).originEntity, UUIDComponent),
          ownerID: userId,
          networkId: objNetId,
          $peer: peerID2,
          entityUUID: 'entity' as EntityUUID
        })
      )

      applyIncomingActions()

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntities = networkObjectQuery()
      const networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 0)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, objNetId)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).authorityPeerID, peerID2)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectOwnedTag), false)
    })

    it('should spawn object owned by user as user', async () => {
      const hostUserId = 'host user' as UserID
      const hostPeerID = 'host peer' as PeerID
      const userId = 'user id' as UserID
      const peerID2 = Engine.instance.store.peerID

      createMockNetwork(NetworkTopics.world, hostPeerID, hostUserId)

      Engine.instance.store.userID = userId
      const network = NetworkState.worldNetwork as Network

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: peerID2,
          peerIndex: 1,
          userID: userId,
          $network: network.id
        })
      )

      const objNetId = 3 as NetworkId

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: getComponent(getState(EngineState).originEntity, UUIDComponent),
          ownerID: userId,
          networkId: objNetId,
          $peer: peerID2,
          entityUUID: 'entity' as EntityUUID
        })
      )

      applyIncomingActions()

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntities = networkObjectQuery()
      const networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 1)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, objNetId)
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

      Engine.instance.store.userID = userId
      const network = NetworkState.worldNetwork as Network

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

      const objNetId = 3 as NetworkId

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
          ownerID: userId2, // from other user
          networkId: objNetId,
          $peer: peerID3,
          $topic: NetworkTopics.world,
          entityUUID: peerID3 as any as EntityUUID
        })
      )

      applyIncomingActions()

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntities = networkObjectQuery()
      const networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 0)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, objNetId)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).authorityPeerID, peerID3)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectOwnedTag), false)
    })
  })

  describe('should remove entity', () => {
    it('should remove entity owned by host as host', async () => {
      const hostUserId = 'host user' as UserID
      const hostPeerID = Engine.instance.store.peerID

      createMockNetwork(NetworkTopics.world, hostPeerID, hostUserId)

      Engine.instance.store.userID = hostUserId
      const network = NetworkState.worldNetwork as Network

      const objNetId = 3 as NetworkId

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: getComponent(getState(EngineState).originEntity, UUIDComponent),
          ownerID: network.hostUserID!,
          networkId: objNetId,
          $topic: NetworkTopics.world,
          $peer: hostPeerID,
          entityUUID: 'entity' as EntityUUID
        })
      )

      applyIncomingActions()

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      let networkObjectEntities = networkObjectQuery()
      let networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 1)

      dispatchAction(
        WorldNetworkAction.destroyEntity({
          entityUUID: 'entity' as EntityUUID,
          $topic: NetworkTopics.world
        })
      )

      applyIncomingActions()

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

      Engine.instance.store.userID = userId
      const network = NetworkState.worldNetwork as Network

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: peerID2,
          peerIndex: 1,
          userID: userId,
          $network: network.id
        })
      )

      const objNetId = 3 as NetworkId

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: getComponent(getState(EngineState).originEntity, UUIDComponent),
          ownerID: network.hostUserID!,
          networkId: objNetId,
          $topic: NetworkTopics.world,
          $peer: hostPeerID,
          entityUUID: 'entity' as EntityUUID
        })
      )

      applyIncomingActions()

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      let networkObjectEntities = networkObjectQuery()
      let networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 0)

      dispatchAction(
        WorldNetworkAction.destroyEntity({
          entityUUID: 'entity' as EntityUUID,
          $topic: NetworkTopics.world
        })
      )

      applyIncomingActions()

      networkObjectEntities = networkObjectQuery()
      networkObjectOwnedEntities = networkObjectOwnedQuery()

      assert.equal(networkObjectEntities.length, 0)
      assert.equal(networkObjectOwnedEntities.length, 0)
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

      Engine.instance.store.userID = userID
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

      const objNetId = 3 as NetworkId

      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: getComponent(getState(EngineState).originEntity, UUIDComponent),
          ownerID: userID,
          networkId: objNetId,
          $topic: NetworkTopics.world,
          $peer: peerID,
          entityUUID: 'entity' as EntityUUID
        })
      )

      applyIncomingActions()

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
          entityUUID: 'entity' as EntityUUID,
          $topic: NetworkTopics.world,
          newAuthority: peerID2
        })
      )

      applyIncomingActions()
      applyIncomingActions()

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

    Engine.instance.store.userID = userID
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

    const objNetId = 3 as NetworkId

    dispatchAction(
      WorldNetworkAction.spawnEntity({
        parentUUID: getComponent(getState(EngineState).originEntity, UUIDComponent),
        ownerID: userID,
        networkId: objNetId,
        $topic: NetworkTopics.world,
        $peer: peerID,
        entityUUID: 'entity' as EntityUUID
      })
    )

    applyIncomingActions()

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
        entityUUID: 'entity' as EntityUUID,
        $topic: NetworkTopics.world,
        newAuthority: peerID2
      })
    )

    applyIncomingActions()
    applyIncomingActions()

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

    Engine.instance.store.userID = userId // user being the action dispatcher
    const network = NetworkState.worldNetwork as Network

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

    const objNetId = 3 as NetworkId

    dispatchAction(
      WorldNetworkAction.spawnEntity({
        parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
        ownerID: hostUserID, // from  host
        networkId: objNetId,
        $topic: NetworkTopics.world,
        $peer: Engine.instance.store.peerID,
        entityUUID: Engine.instance.store.peerID as any as EntityUUID
      })
    )

    applyIncomingActions()

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
        entityUUID: Engine.instance.store.peerID as any as EntityUUID,
        $topic: NetworkTopics.world,
        newAuthority: peerID2
      })
    )

    applyIncomingActions()
    applyIncomingActions()

    const networkObjectEntitiesAfter = networkObjectQuery()
    const networkObjectOwnedEntitiesAfter = networkObjectOwnedQuery()

    assert.equal(networkObjectEntitiesAfter.length, 1)
    assert.equal(networkObjectOwnedEntitiesAfter.length, 0)

    assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).ownerId, hostUserID) // owner remains same
    assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).authorityPeerID, peerID) // peer remains same
    assert.equal(hasComponent(networkObjectEntitiesAfter[0], NetworkObjectOwnedTag), false)
  })

  it.skip('benchmark 1000 entities spawn', async () => {
    const hostUserID = 'host user' as UserID
    const hostPeerID = 'host peer id' as PeerID

    createMockNetwork(NetworkTopics.world, hostPeerID, hostUserID)

    const userId = 'user id' as UserID
    const peerID = Engine.instance.store.peerID
    const peerID2 = 'peer id 2' as PeerID

    Engine.instance.store.userID = userId // user being the action dispatcher
    const network = NetworkState.worldNetwork as Network

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

    const objNetId = 3 as NetworkId

    const start = performance.now()

    const count = 1000

    for (let i = 0; i < count; i++) {
      dispatchAction(
        WorldNetworkAction.spawnEntity({
          parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
          ownerID: hostUserID, // from  host
          networkId: objNetId,
          $topic: NetworkTopics.world,
          $peer: Engine.instance.store.peerID,
          entityUUID: generateEntityUUID()
        })
      )
    }

    applyIncomingActions()

    const applyActionsEnd = performance.now()
    console.log(count, 'entities apply action time:', applyActionsEnd - start)

    const reactorEnd = performance.now()

    console.log(count, 'entities reactor time:', reactorEnd - applyActionsEnd)

    const runner1End = performance.now()

    console.log(count, 'entities unchanged runner time:', runner1End - reactorEnd)

    dispatchAction(
      WorldNetworkAction.spawnEntity({
        parentUUID: getComponent(Engine.instance.originEntity, UUIDComponent),
        ownerID: hostUserID, // from  host
        networkId: objNetId,
        $topic: NetworkTopics.world,
        $peer: Engine.instance.store.peerID,
        entityUUID: generateEntityUUID()
      })
    )

    applyIncomingActions()

    const runner2End = performance.now()

    console.log(count, 'entities 1 new entity runner time:', runner2End - runner1End)
    console.log(count, 'entities total time:', runner2End - start)
  })
})
