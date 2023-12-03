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
import { UserID, UserName } from '@etherealengine/engine/src/schemas/user/user.schema'
import { applyIncomingActions, getMutableState } from '@etherealengine/hyperflux'

import { createMockNetwork } from '../../../tests/util/createMockNetwork'
import { destroyEngine, Engine } from '../../ecs/classes/Engine'
import { setComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { createEngine } from '../../initializeEngine'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { InstanceID } from '../../schemas/networking/instance.schema'
import { Network } from '../classes/Network'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { WorldState } from '../interfaces/WorldState'
import { NetworkState } from '../NetworkState'
import { NetworkPeerFunctions } from './NetworkPeerFunctions'

describe('NetworkPeerFunctions', () => {
  beforeEach(() => {
    createEngine()
    createMockNetwork()
    Engine.instance.store.defaultDispatchDelay = () => 0
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('addPeers', () => {
    it('should add peer', () => {
      const userId = 'user id' as UserID
      const peerID = Engine.instance.store.peerID
      Engine.instance.userID = 'another user id' as UserID

      const userName = 'user name' as UserName
      const userIndex = 1
      const peerIndex = 2
      const network = NetworkState.worldNetwork as Network

      NetworkPeerFunctions.createPeer(network, peerID, peerIndex, userId, userIndex, userName)

      const worldState = getMutableState(WorldState)

      assert(network.peers[peerID])
      assert.equal(network.peers[peerID]?.userId, userId)
      assert.equal(network.peers[peerID]?.userIndex, userIndex)
      assert.equal(network.peers[peerID]?.peerID, peerID)
      assert.equal(network.peers[peerID]?.peerIndex, peerIndex)
      assert.equal(worldState.userNames[userId]?.value, userName)
      assert.equal(network.userIndexToUserID[userIndex], userId)
      assert.equal(network.userIDToUserIndex[userId], userIndex)
      assert.equal(network.peerIndexToPeerID[peerIndex], peerID)
      assert.equal(network.peerIDToPeerIndex[peerID], peerIndex)
    })

    it('should update peer if it already exists', () => {
      const userId = 'user id' as UserID
      const peerID = Engine.instance.store.peerID
      Engine.instance.userID = 'another user id' as UserID

      const userName = 'user name' as UserName
      const userName2 = 'user name 2' as UserName
      const userIndex = 1
      const userIndex2 = 2
      const peerIndex = 3
      const peerIndex2 = 4
      const network = NetworkState.worldNetwork as Network

      const worldState = getMutableState(WorldState)

      NetworkPeerFunctions.createPeer(network, peerID, peerIndex, userId, userIndex, userName)
      assert.equal(network.peers[peerID]!.userId, userId)
      assert.equal(network.peers[peerID]!.userIndex, userIndex)
      assert.equal(network.peers[peerID]!.peerID, peerID)
      assert.equal(network.peers[peerID]!.peerIndex, peerIndex)
      assert.equal(worldState.userNames[userId].value, userName)

      NetworkPeerFunctions.createPeer(network, peerID, peerIndex2, userId, userIndex2, userName2)
      assert.equal(network.peers[peerID]!.userId, userId)
      assert.equal(network.peers[peerID]!.userIndex, userIndex2)
      assert.equal(network.peers[peerID]!.peerID, peerID)
      assert.equal(network.peers[peerID]!.peerIndex, peerIndex2)
      assert.equal(worldState.userNames[userId].value, userName2)
    })
  })

  describe('removePeer', () => {
    it('should remove peer', () => {
      const userId = 'user id' as UserID
      const peerID = 'peer id' as PeerID
      Engine.instance.userID = 'another user id' as UserID
      const userName = 'user name' as UserName
      const userIndex = 1
      const peerIndex = 2
      const network = NetworkState.worldNetwork as Network

      NetworkPeerFunctions.createPeer(network, peerID, peerIndex, userId, userIndex, userName)
      NetworkPeerFunctions.destroyPeer(network, peerID)

      assert(!network.peers[peerID])

      assert.equal(network.userIndexToUserID[userIndex], undefined)
      assert.equal(network.userIDToUserIndex[userId], undefined)
      assert.equal(network.peerIndexToPeerID[peerIndex], undefined)
      assert.equal(network.peerIDToPeerIndex[peerID], undefined)
    })

    it('should not remove self peer', () => {
      const userId = 'user id' as UserID
      const peerID = Engine.instance.store.peerID
      Engine.instance.userID = 'another user id' as UserID

      const userName = 'user name' as UserName
      const userIndex = 1
      const peerIndex = 2
      const network = NetworkState.worldNetwork as Network

      NetworkPeerFunctions.createPeer(network, peerID, peerIndex, userId, userIndex, userName)
      NetworkPeerFunctions.destroyPeer(network, peerID)

      assert(network.peers[peerID])

      assert.equal(network.userIndexToUserID[userIndex], userId)
      assert.equal(network.userIDToUserIndex[userId], userIndex)
      assert.equal(network.peerIndexToPeerID[peerIndex], peerID)
      assert.equal(network.peerIDToPeerIndex[peerID], peerIndex)
    })

    it('should remove peer and owned network objects', () => {
      const userId = 'world' as UserID & InstanceID
      const anotherPeerID = 'another peer id' as PeerID
      Engine.instance.userID = 'another user id' as UserID
      const userName = 'user name' as UserName
      const userIndex = 1
      const peerIndex = 5
      const network = NetworkState.worldNetwork as Network
      network.hostId = Engine.instance.userID
      getMutableState(NetworkState).hostIds.world.set(userId)

      NetworkPeerFunctions.createPeer(network, anotherPeerID, peerIndex, userId, userIndex, userName)
      const networkId = 2 as NetworkId

      const entity = createEntity()
      setComponent(entity, NetworkObjectComponent, {
        ownerId: userId,
        authorityPeerID: anotherPeerID,
        networkId
      })
      setComponent(entity, UUIDComponent, 'entity_uuid' as EntityUUID)

      // process remove actions and execute entity removal
      Engine.instance.store.defaultDispatchDelay = () => 0
      NetworkPeerFunctions.destroyPeer(network, anotherPeerID)

      applyIncomingActions()

      assert(!NetworkObjectComponent.getNetworkObject(userId, networkId))
    })
  })
})
