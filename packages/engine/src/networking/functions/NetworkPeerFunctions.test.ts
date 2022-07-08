import assert from 'assert'

import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import ActionFunctions from '@xrengine/hyperflux/functions/ActionFunctions'

import { createMockNetwork } from '../../../tests/util/createMockNetwork'
import { Engine } from '../../ecs/classes/Engine'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { createEngine } from '../../initializeEngine'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { NetworkPeerFunctions } from './NetworkPeerFunctions'

describe('NetworkPeerFunctions', () => {
  beforeEach(() => {
    createEngine()
    createMockNetwork()
  })

  describe('addPeers', () => {
    it('should add peer', () => {
      const world = Engine.instance.currentWorld
      const userId = 'user id' as UserId
      Engine.instance.userId = 'another user id' as UserId
      const userName = 'user name'
      const userIndex = 1
      const network = world.worldNetwork

      NetworkPeerFunctions.createPeer(network, userId, userIndex, userName, world)

      assert(network.peers.get(userId))
      assert.equal(network.peers.get(userId)?.userId, userId)
      assert.equal(network.peers.get(userId)?.index, userIndex)
      assert.equal(world.users.get(userId)?.name, userName)
      assert.equal(world.users.get(userId)?.userId, userId)
      assert.equal(network.userIndexToUserId.get(userIndex), userId)
      assert.equal(network.userIdToUserIndex.get(userId), userIndex)
    })

    it('should not add peer if already exists', () => {
      const world = Engine.instance.currentWorld
      const userId = 'user id' as UserId
      Engine.instance.userId = 'another user id' as UserId
      const userName = 'user name'
      const userName2 = 'user name 2'
      const userIndex = 1
      const network = world.worldNetwork

      NetworkPeerFunctions.createPeer(network, userId, userIndex, userName, world)
      NetworkPeerFunctions.createPeer(network, userId, userIndex, userName2, world)

      assert.equal(network.peers.get(userId)?.userId, userId)
      assert.equal(world.users.get(userId)?.name, userName)
    })
  })

  describe('removePeer', () => {
    it('should remove peer', () => {
      const world = Engine.instance.currentWorld
      const userId = 'user id' as UserId
      Engine.instance.userId = 'another user id' as UserId
      const userName = 'user name'
      const userIndex = 1
      const network = world.worldNetwork

      NetworkPeerFunctions.createPeer(network, userId, userIndex, userName, world)
      NetworkPeerFunctions.destroyPeer(network, userId, world)

      assert(!world.users.get(userId))
      assert(!network.peers.get(userId))
      assert(!network.userIndexToUserId.get(userIndex))
      assert(!network.userIdToUserIndex.get(userId))
    })

    it('should remove peer and owned network objects', () => {
      const world = Engine.instance.currentWorld
      const userId = 'user id' as UserId
      Engine.instance.userId = 'another user id' as UserId
      const userName = 'user name'
      const userIndex = 1
      const network = world.worldNetwork

      NetworkPeerFunctions.createPeer(network, userId, userIndex, userName, world)
      const networkId = 2 as NetworkId

      const entity = createEntity()
      addComponent(entity, NetworkObjectComponent, {
        ownerId: userId,
        networkId,
        prefab: 'prefab',
        parameters: {}
      })

      // process remove actions and execute entity removal
      Engine.instance.store.defaultDispatchDelay = 0
      NetworkPeerFunctions.destroyPeer(network, userId, world)

      ActionFunctions.clearOutgoingActions()
      ActionFunctions.applyIncomingActions()
      world.execute(0)

      assert(!world.users.get(userId))
      assert(!network.peers.get(userId))
      assert(!network.userIndexToUserId.get(1))
      assert(!network.userIdToUserIndex.get(userId))

      assert(!world.getNetworkObject(userId, networkId))
    })
  })
})
