/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import assert from 'assert'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserID } from '@etherealengine/common/src/schema.type.module'
import { getMutableState } from '@etherealengine/hyperflux'
import { applyIncomingActions, dispatchAction } from '@etherealengine/hyperflux/functions/ActionFunctions'

import { getComponent, hasComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine, destroyEngine } from '@etherealengine/ecs/src/Engine'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { UUIDComponent } from '@etherealengine/spatial/src/common/UUIDComponent'
import { createMockNetwork } from '../../../tests/util/createMockNetwork'
import { Physics } from '../../physics/classes/Physics'
import { PhysicsState } from '../../physics/state/PhysicsState'
import { NetworkState } from '../NetworkState'
import { Network, NetworkTopics } from '../classes/Network'
import { NetworkObjectComponent, NetworkObjectOwnedTag } from '../components/NetworkObjectComponent'
import { NetworkPeerFunctions } from '../functions/NetworkPeerFunctions'
import { WorldNetworkAction } from '../functions/WorldNetworkAction'

import { SystemDefinitions } from '@etherealengine/ecs/src/SystemFunctions'
import { createEngine } from '@etherealengine/spatial/src/initializeEngine'
import { act, render } from '@testing-library/react'
import React from 'react'
import { MathUtils } from 'three'
import { NetworkWorldUserStateSystem } from '../NetworkUserState'
import './EntityNetworkState'

describe('EntityNetworkState', () => {
  beforeEach(async () => {
    createEngine()
    createMockNetwork()
    await Physics.load()
    getMutableState(PhysicsState).physicsWorld.set(Physics.createWorld())
    Engine.instance.store.defaultDispatchDelay = () => 0
  })

  afterEach(() => {
    return destroyEngine()
  })

  const NetworkWorldUserStateSystemReactor = SystemDefinitions.get(NetworkWorldUserStateSystem)!.reactor!
  const tag = <NetworkWorldUserStateSystemReactor />

  describe('spawnObject', () => {
    it('should spawn object owned by host', async () => {
      const hostUserId = 'world' as UserID
      const userId = 'user id' as UserID
      const peerID = Engine.instance.store.peerID
      const peerID2 = 'peer id 2' as PeerID

      Engine.instance.userID = userId
      const network = NetworkState.worldNetwork as Network

      NetworkPeerFunctions.createPeer(network, peerID, 0, hostUserId, 0, 'host')
      NetworkPeerFunctions.createPeer(network, peerID2, 1, userId, 1, 'user name')

      const { rerender, unmount } = render(tag)
      await act(() => rerender(tag))

      const objNetId = 3 as NetworkId

      dispatchAction(
        WorldNetworkAction.spawnObject({
          $from: NetworkState.worldNetwork.hostId, // from  host
          networkId: objNetId,
          $topic: NetworkTopics.world,
          $peer: Engine.instance.peerID,
          entityUUID: Engine.instance.peerID as any as EntityUUID
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
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).authorityPeerID, peerID)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectOwnedTag), false)

      unmount()
    })

    it('should spawn object owned by user', async () => {
      const userId = 'user id' as UserID
      const hostId = 'host' as UserID
      const peerID = 'peer id' as PeerID
      const peerID2 = Engine.instance.store.peerID

      Engine.instance.userID = userId

      const network = NetworkState.worldNetwork as Network

      NetworkPeerFunctions.createPeer(network, peerID, 0, hostId, 0, 'host')
      NetworkPeerFunctions.createPeer(network, peerID2, 1, userId, 1, 'user name')

      const { rerender, unmount } = render(tag)
      await act(() => rerender(tag))

      const objNetId = 3 as NetworkId

      dispatchAction(
        WorldNetworkAction.spawnObject({
          $from: userId, // from  user
          networkId: objNetId,
          $peer: Engine.instance.peerID,
          entityUUID: Engine.instance.peerID as any as EntityUUID
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

      unmount()
    })

    it('should spawn avatar owned by other', async () => {
      const hostUserId = 'world' as UserID
      const userId = 'user id' as UserID
      const userId2 = 'second user id' as UserID
      const peerID = Engine.instance.store.peerID
      const peerID2 = 'peer id 2' as PeerID
      const peerID3 = 'peer id 3' as PeerID

      Engine.instance.userID = userId
      const network = NetworkState.worldNetwork as Network

      NetworkPeerFunctions.createPeer(network, peerID, 0, hostUserId, 0, 'world')
      NetworkPeerFunctions.createPeer(network, peerID2, 1, userId, 1, 'user name')
      NetworkPeerFunctions.createPeer(network, peerID3, 2, userId2, 2, 'second user name')

      const { rerender, unmount } = render(tag)
      await act(() => rerender(tag))

      const objNetId = 3 as NetworkId

      dispatchAction(
        WorldNetworkAction.spawnObject({
          $from: userId2, // from other user
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

      unmount()
    })

    it('should spawn avatar owned by user', async () => {
      const userId = 'user id' as UserID
      const peerID = Engine.instance.store.peerID

      Engine.instance.userID = userId
      const network = NetworkState.worldNetwork as Network

      NetworkPeerFunctions.createPeer(network, peerID, 1, userId, 1, 'user name')

      const { rerender, unmount } = render(tag)
      await act(() => rerender(tag))

      dispatchAction(
        WorldNetworkAction.spawnObject({
          networkId: 42 as NetworkId,
          $peer: peerID,
          entityUUID: Engine.instance.userID as string as EntityUUID
        })
      )
      applyIncomingActions()

      const entity = UUIDComponent.getEntityByUUID(Engine.instance.userID as any as EntityUUID)

      assert.equal(getComponent(entity, NetworkObjectComponent).networkId, 42)
      assert.equal(getComponent(entity, NetworkObjectComponent).authorityPeerID, peerID)
      assert.equal(hasComponent(entity, NetworkObjectOwnedTag), true)

      unmount()
    })
  })

  describe('transfer authority of object', () => {
    it('should transfer authority of object (and not ownership)', async () => {
      const hostUserId = 'world' as UserID
      const hostPeerId = 'host peer id' as PeerID
      const userId = 'user id' as UserID
      const peerID = Engine.instance.store.peerID
      const peerID2 = 'peer id 2' as PeerID

      Engine.instance.userID = userId
      const network = NetworkState.worldNetwork as Network

      NetworkPeerFunctions.createPeer(network, hostPeerId, 0, hostUserId, 0, 'host')
      NetworkPeerFunctions.createPeer(network, peerID, 0, userId, 1, 'user name')
      NetworkPeerFunctions.createPeer(network, peerID2, 1, userId, 1, 'user name')

      const { rerender, unmount } = render(tag)
      await act(() => rerender(tag))

      const objNetId = 3 as NetworkId

      dispatchAction(
        WorldNetworkAction.spawnObject({
          $from: userId,
          networkId: objNetId,
          $topic: NetworkTopics.world,
          $peer: peerID,
          entityUUID: peerID as any as EntityUUID
        })
      )
      applyIncomingActions()

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntitiesBefore = networkObjectQuery()
      const networkObjectOwnedEntitiesBefore = networkObjectOwnedQuery()

      assert.equal(networkObjectEntitiesBefore.length, 1)
      assert.equal(networkObjectOwnedEntitiesBefore.length, 1)

      assert.equal(getComponent(networkObjectEntitiesBefore[0], NetworkObjectComponent).ownerId, userId)
      assert.equal(getComponent(networkObjectEntitiesBefore[0], NetworkObjectComponent).authorityPeerID, peerID)
      assert.equal(hasComponent(networkObjectEntitiesBefore[0], NetworkObjectOwnedTag), true)

      dispatchAction(
        WorldNetworkAction.requestAuthorityOverObject({
          $from: userId,
          entityUUID: peerID as any as EntityUUID,
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

      assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).ownerId, userId) // owner remains same
      assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).authorityPeerID, peerID2) // peer has changed
      assert.equal(hasComponent(networkObjectEntitiesAfter[0], NetworkObjectOwnedTag), true)

      unmount()
    })
  })

  it('should not transfer authority if it is not the owner', async () => {
    const hostUserId = 'world' as UserID
    const hostPeerId = 'host peer id' as PeerID
    const userId = 'user id' as UserID
    const peerID = Engine.instance.store.peerID
    const peerID2 = 'peer id 2' as PeerID

    Engine.instance.userID = userId // user being the action dispatcher
    const network = NetworkState.worldNetwork as Network

    NetworkPeerFunctions.createPeer(network, hostPeerId, 0, hostUserId, 0, 'host')
    NetworkPeerFunctions.createPeer(network, peerID, 0, userId, 1, 'user name')
    NetworkPeerFunctions.createPeer(network, peerID2, 1, userId, 1, 'user name')

    const { rerender, unmount } = render(tag)
    await act(() => rerender(tag))

    const objNetId = 3 as NetworkId

    dispatchAction(
      WorldNetworkAction.spawnObject({
        $from: hostUserId, // from  host
        networkId: objNetId,
        $topic: NetworkTopics.world,
        $peer: Engine.instance.peerID,
        entityUUID: Engine.instance.peerID as any as EntityUUID
      })
    )

    applyIncomingActions()

    const networkObjectQuery = defineQuery([NetworkObjectComponent])
    const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

    const networkObjectEntitiesBefore = networkObjectQuery()
    const networkObjectOwnedEntitiesBefore = networkObjectOwnedQuery()

    assert.equal(networkObjectEntitiesBefore.length, 1)
    assert.equal(networkObjectOwnedEntitiesBefore.length, 0)

    assert.equal(getComponent(networkObjectEntitiesBefore[0], NetworkObjectComponent).ownerId, hostUserId)
    assert.equal(getComponent(networkObjectEntitiesBefore[0], NetworkObjectComponent).authorityPeerID, peerID)
    assert.equal(hasComponent(networkObjectEntitiesBefore[0], NetworkObjectOwnedTag), false)

    dispatchAction(
      WorldNetworkAction.requestAuthorityOverObject({
        $from: userId, // from user
        entityUUID: Engine.instance.peerID as any as EntityUUID,
        $topic: NetworkTopics.world,
        newAuthority: peerID2
      })
    )

    applyIncomingActions()

    const networkObjectEntitiesAfter = networkObjectQuery()
    const networkObjectOwnedEntitiesAfter = networkObjectOwnedQuery()

    assert.equal(networkObjectEntitiesAfter.length, 1)
    assert.equal(networkObjectOwnedEntitiesAfter.length, 0)

    assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).ownerId, hostUserId) // owner remains same
    assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).authorityPeerID, peerID) // peer remains same
    assert.equal(hasComponent(networkObjectEntitiesAfter[0], NetworkObjectOwnedTag), false)

    unmount()
  })

  it.skip('benchmark 10000 entities spawn', async () => {
    const hostUserId = 'world' as UserID
    const hostPeerId = 'host peer id' as PeerID
    const userId = 'user id' as UserID
    const peerID = Engine.instance.store.peerID
    const peerID2 = 'peer id 2' as PeerID

    Engine.instance.userID = userId // user being the action dispatcher
    const network = NetworkState.worldNetwork as Network

    NetworkPeerFunctions.createPeer(network, hostPeerId, 0, hostUserId, 0, 'host')
    NetworkPeerFunctions.createPeer(network, peerID, 0, userId, 1, 'user name')
    NetworkPeerFunctions.createPeer(network, peerID2, 1, userId, 1, 'user name')

    const objNetId = 3 as NetworkId

    const { rerender, unmount } = render(tag)
    await act(() => rerender(tag))

    const start = performance.now()

    for (let i = 0; i < 10000; i++) {
      dispatchAction(
        WorldNetworkAction.spawnObject({
          $from: hostUserId, // from  host
          networkId: objNetId,
          $topic: NetworkTopics.world,
          $peer: Engine.instance.peerID,
          entityUUID: MathUtils.generateUUID() as any as EntityUUID
        })
      )
    }

    applyIncomingActions()

    const applyActionsEnd = performance.now()
    console.log('10000 entities apply action time:', applyActionsEnd - start)

    const reactorEnd = performance.now()

    console.log('10000 entities reactor time:', reactorEnd - applyActionsEnd)

    const runner1End = performance.now()

    console.log('10000 entities unchanged runner time:', runner1End - reactorEnd)

    dispatchAction(
      WorldNetworkAction.spawnObject({
        $from: hostUserId, // from  host
        networkId: objNetId,
        $topic: NetworkTopics.world,
        $peer: Engine.instance.peerID,
        entityUUID: MathUtils.generateUUID() as any as EntityUUID
      })
    )

    applyIncomingActions()

    const runner2End = performance.now()

    console.log('10000 entities 1 new entity runner time:', runner2End - runner1End)
    console.log('10000 entities total time:', runner2End - start)

    unmount()
  })
})
