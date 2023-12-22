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
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { getMutableState } from '@etherealengine/hyperflux'
import * as ActionFunctions from '@etherealengine/hyperflux/functions/ActionFunctions'
import { applyIncomingActions, dispatchAction } from '@etherealengine/hyperflux/functions/ActionFunctions'

import { createMockNetwork } from '../../../tests/util/createMockNetwork'
import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { spawnAvatarReceptor } from '../../avatar/functions/spawnAvatarReceptor'
import { AvatarNetworkAction } from '../../avatar/state/AvatarNetworkActions'
import { destroyEngine, Engine } from '../../ecs/classes/Engine'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { defineQuery } from '../../ecs/functions/QueryFunctions'
import { createEngine } from '../../initializeEngine'
import { Physics } from '../../physics/classes/Physics'
import { PhysicsState } from '../../physics/state/PhysicsState'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { Network, NetworkTopics } from '../classes/Network'
import { NetworkObjectComponent, NetworkObjectOwnedTag } from '../components/NetworkObjectComponent'
import { NetworkPeerFunctions } from '../functions/NetworkPeerFunctions'
import { WorldNetworkAction } from '../functions/WorldNetworkAction'
import { NetworkState } from '../NetworkState'

describe('EntityNetworkState', () => {
  beforeEach(async () => {
    createEngine()
    createMockNetwork()
    await Physics.load()
    getMutableState(PhysicsState).physicsWorld.set(Physics.createWorld())
    Engine.instance.store.defaultDispatchDelay = () => 0
    loadEmptyScene()
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('spawnObject', () => {
    it('should spawn object owned by host', () => {
      const hostUserId = 'world' as UserID
      const userId = 'user id' as UserID
      const peerID = Engine.instance.store.peerID
      const peerID2 = 'peer id 2' as PeerID

      Engine.instance.userID = userId
      const network = NetworkState.worldNetwork as Network

      NetworkPeerFunctions.createPeer(network, peerID, 0, hostUserId, 0, 'host')
      NetworkPeerFunctions.createPeer(network, peerID2, 1, userId, 1, 'user name')

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

      const objParams = 123
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

      const objNetId = 3 as NetworkId

      dispatchAction(
        AvatarNetworkAction.spawn({
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
    })

    it('should spawn avatar owned by user', async () => {
      const userId = 'user id' as UserID
      const peerID = Engine.instance.store.peerID

      Engine.instance.userID = userId
      const network = NetworkState.worldNetwork as Network

      NetworkPeerFunctions.createPeer(network, peerID, 1, userId, 1, 'user name')

      dispatchAction(
        AvatarNetworkAction.spawn({
          networkId: 42 as NetworkId,
          $peer: peerID,
          entityUUID: Engine.instance.userID as string as EntityUUID
        })
      )
      applyIncomingActions()

      const entity = UUIDComponent.getEntityByUUID(Engine.instance.userID as any as EntityUUID)

      spawnAvatarReceptor(Engine.instance.userID as string as EntityUUID)

      assert.equal(getComponent(entity, NetworkObjectComponent).networkId, 42)
      assert.equal(getComponent(entity, NetworkObjectComponent).authorityPeerID, peerID)
      assert.equal(hasComponent(entity, NetworkObjectOwnedTag), true)
    })
  })

  describe('destroyObject', () => {})

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

      const objNetId = 3 as NetworkId

      dispatchAction(
        WorldNetworkAction.spawnObject({
          $from: userId,
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
      assert.equal(networkObjectOwnedEntitiesBefore.length, 1)

      assert.equal(getComponent(networkObjectEntitiesBefore[0], NetworkObjectComponent).ownerId, userId)
      assert.equal(getComponent(networkObjectEntitiesBefore[0], NetworkObjectComponent).authorityPeerID, peerID)
      assert.equal(hasComponent(networkObjectEntitiesBefore[0], NetworkObjectOwnedTag), true)

      dispatchAction(
        WorldNetworkAction.requestAuthorityOverObject({
          $from: userId,
          entityUUID: Engine.instance.peerID as any as EntityUUID,
          $topic: NetworkTopics.world,
          newAuthority: peerID2
        })
      )

      ActionFunctions.applyIncomingActions()

      const networkObjectEntitiesAfter = networkObjectQuery()
      const networkObjectOwnedEntitiesAfter = networkObjectOwnedQuery()

      assert.equal(networkObjectEntitiesAfter.length, 1)
      assert.equal(networkObjectOwnedEntitiesAfter.length, 1)

      assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).ownerId, userId) // owner remains same
      assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).authorityPeerID, peerID2) // peer has changed
      assert.equal(hasComponent(networkObjectEntitiesAfter[0], NetworkObjectOwnedTag), true)
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
  })
})
