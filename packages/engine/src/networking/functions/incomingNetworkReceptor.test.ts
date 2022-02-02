import assert from 'assert'
import { HostUserId, UserId } from '@xrengine/common/src/interfaces/UserId'
import { createWorld } from '../../ecs/classes/World'
import {
  addClientNetworkActionReceptor,
  createIncomingNetworkReceptor,
  removeClientNetworkActionReceptor
} from './incomingNetworkReceptor'
import { Engine } from '../../ecs/classes/Engine'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { addComponent, defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { applyIncomingActions } from '../../ecs/functions/ActionDispatchSystem'
import { mockProgressWorldForNetworkActions } from '../../../tests/networking/NetworkTestHelpers'

describe('incomingNetworkReceptor', () => {
  beforeEach(() => {
    Engine.userId = undefined!
    Engine.currentWorld = undefined!
  })

  describe('addClient', () => {
    it('should add client', () => {
      const world = createWorld()
      Engine.currentWorld = world
      const userId = 'user id' as UserId
      const userName = 'user name'
      const userIndex = 1
      addClientNetworkActionReceptor(world, userId, userName, userIndex)

      assert(world.clients.get(userId))
      assert.equal(world.clients.get(userId)?.userId, userId)
      assert.equal(world.clients.get(userId)?.userIndex, userIndex)
      assert.equal(world.clients.get(userId)?.name, userName)
      assert.equal(world.userIndexToUserId.get(userIndex), userId)
      assert.equal(world.userIdToUserIndex.get(userId), userIndex)
    })

    it('should not add client if host', () => {
      const world = createWorld()
      Engine.currentWorld = world
      const userId = 'user id' as UserId
      const userName = 'user name'
      const userIndex = 1
      world.hostId = userId as HostUserId
      Engine.userId = userId

      addClientNetworkActionReceptor(world, userId, userName, userIndex)

      assert(!world.clients.get(userId))
      assert(!world.userIndexToUserId.get(userIndex))
      assert(!world.userIdToUserIndex.get(userId))

      Engine.userId = undefined!
    })
  })

  describe('removeClient', () => {
    it('should remove client', () => {
      const world = createWorld()
      Engine.currentWorld = world
      const userId = 'user id' as UserId
      const userName = 'user name'
      const userIndex = 1
      addClientNetworkActionReceptor(world, userId, userName, userIndex)

      removeClientNetworkActionReceptor(world, userId)

      assert(!world.clients.get(userId))
      assert(!world.userIndexToUserId.get(userIndex))
      assert(!world.userIdToUserIndex.get(userId))
    })

    it('should remove client and owned network objects', () => {
      const world = createWorld()
      Engine.currentWorld = world
      const userId = 'user id' as UserId
      const userName = 'user name'
      const userIndex = 1
      addClientNetworkActionReceptor(world, userId, userName, userIndex)

      const networkId = 2 as NetworkId

      const entity = createEntity()
      addComponent(entity, NetworkObjectComponent, {
        ownerId: userId,
        ownerIndex: userIndex,
        networkId,
        prefab: 'prefab',
        parameters: {}
      })

      removeClientNetworkActionReceptor(world, userId, true)

      // process remove actions and execute entity removal
      createIncomingNetworkReceptor(world)
      mockProgressWorldForNetworkActions(world)
      world.execute(0, 0)

      assert(!world.clients.get(userId))
      assert(!world.userIndexToUserId.get(1))
      assert(!world.userIdToUserIndex.get(userId))

      assert(!world.getNetworkObject(userId, networkId))
    })
  })

  describe('spawnObject', () => {})

  describe('destroyObject', () => {})
})
