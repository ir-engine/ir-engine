import assert from 'assert'
import { HostUserId, UserId } from '@xrengine/common/src/interfaces/UserId'
import { createWorld } from '../../ecs/classes/World'
import {
  addClientNetworkActionReceptor,
  createIncomingNetworkReceptor,
  removeClientNetworkActionReceptor,
  spawnObjectNetworkActionReceptor
} from './incomingNetworkReceptor'
import { Engine } from '../../ecs/classes/Engine'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { addComponent, defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { applyIncomingActions } from '../../ecs/functions/ActionDispatchSystem'
import { mockProgressWorldForNetworkActions } from '../../../tests/networking/NetworkTestHelpers'
import { NetworkWorldAction } from './NetworkWorldAction'
import { NetworkObjectOwnedTag } from '../components/NetworkObjectOwnedTag'
import { Quaternion, Vector3 } from 'three'

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

  describe('spawnObject', () => {
    it('should spawn object owned by host', () => {
      const world = createWorld()
      Engine.currentWorld = world
      const hostUserId = 'server' as HostUserId
      world.hostId = hostUserId
      const hostIndex = 0
      world.clients.set(hostUserId, { userId: hostUserId, name: 'server', userIndex: hostIndex })

      const userId = 'user id' as UserId
      Engine.userId = userId
      const userName = 'user name'
      const userIndex = 1
      addClientNetworkActionReceptor(world, userId, userName, userIndex)

      const objParams = 123
      const objNetId = 3 as NetworkId
      const objPrefab = 'generic prefab'

      spawnObjectNetworkActionReceptor(world, {
        $from: world.hostId, // from host
        prefab: objPrefab, // generic prefab
        ownerIndex: hostIndex, // owned by server
        parameters: objParams, // arbitrary
        type: 'network.SPAWN_OBJECT', // plain object
        networkId: objNetId,
        $to: 'all',
        $tick: 0,
        $cache: true
      })

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntities = networkObjectQuery(world)
      const networkObjectOwnedEntities = networkObjectOwnedQuery(world)

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 0)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, objNetId)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).ownerId, hostUserId)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).ownerIndex, hostIndex)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).parameters, objParams)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).prefab, objPrefab)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectOwnedTag), false)
    })

    it('should spawn object owned by user', () => {
      const world = createWorld()
      Engine.currentWorld = world

      const userId = 'user id' as UserId
      world.hostId = userId as HostUserId
      Engine.userId = userId
      const userName = 'user name'
      const userIndex = 1
      addClientNetworkActionReceptor(world, userId, userName, userIndex)

      const objParams = 123
      const objNetId = 3 as NetworkId
      const objPrefab = 'generic prefab'

      spawnObjectNetworkActionReceptor(world, {
        $from: userId, // from host
        prefab: objPrefab, // generic prefab
        ownerIndex: userIndex, // owned by server
        parameters: objParams, // arbitrary
        type: 'network.SPAWN_OBJECT', // plain object
        networkId: objNetId,
        $to: 'all',
        $tick: 0,
        $cache: true
      })

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntities = networkObjectQuery(world)
      const networkObjectOwnedEntities = networkObjectOwnedQuery(world)

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 1)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, objNetId)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).ownerId, userId)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).ownerIndex, userIndex)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).parameters, objParams)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).prefab, objPrefab)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectOwnedTag), true)
    })

    it('should spawn avatar owned by other', () => {
      const world = createWorld()
      Engine.currentWorld = world
      const hostUserId = 'server' as HostUserId
      world.hostId = hostUserId
      const hostIndex = 0
      world.clients.set(hostUserId, { userId: hostUserId, name: 'server', userIndex: hostIndex })

      const userId = 'user id' as UserId
      Engine.userId = userId
      const userName = 'user name'
      const userIndex = 1
      addClientNetworkActionReceptor(world, userId, userName, userIndex)

      const userId2 = 'second user id' as UserId
      const userName2 = 'second user name'
      const userIndex2 = 2
      addClientNetworkActionReceptor(world, userId2, userName2, userIndex2)

      const objParams = {
        position: new Vector3(),
        rotation: new Quaternion()
      }
      const objNetId = 3 as NetworkId
      const objPrefab = 'avatar'

      spawnObjectNetworkActionReceptor(world, {
        $from: userId2, // from host
        prefab: objPrefab, // generic prefab
        ownerIndex: userIndex2, // owned by server
        parameters: objParams, // arbitrary
        type: 'network.SPAWN_OBJECT', // plain object
        networkId: objNetId,
        $to: 'all',
        $tick: 0,
        $cache: true
      })

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntities = networkObjectQuery(world)
      const networkObjectOwnedEntities = networkObjectOwnedQuery(world)

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 0)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, objNetId)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).ownerId, userId2)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).ownerIndex, userIndex2)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).parameters, objParams)
      assert.deepStrictEqual(getComponent(networkObjectEntities[0], NetworkObjectComponent).prefab, objPrefab)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectOwnedTag), false)
    })

    it('should spawn avatar owned by user', () => {
      const world = createWorld()
      Engine.currentWorld = world
      world.localClientEntity = createEntity(world)

      const userId = 'user id' as UserId
      world.hostId = userId as HostUserId
      Engine.userId = userId
      const userName = 'user name'
      const userIndex = 1
      addClientNetworkActionReceptor(world, userId, userName, userIndex)

      const objParams = {
        position: new Vector3(),
        rotation: new Quaternion()
      }
      const objNetId = 3 as NetworkId
      const objPrefab = 'avatar'

      spawnObjectNetworkActionReceptor(world, {
        $from: userId, // from host
        prefab: objPrefab, // generic prefab
        ownerIndex: userIndex, // owned by server
        parameters: objParams, // arbitrary
        type: 'network.SPAWN_OBJECT', // plain object
        networkId: objNetId,
        $to: 'all',
        $tick: 0,
        $cache: true
      })

      assert.equal(getComponent(world.localClientEntity, NetworkObjectComponent).networkId, objNetId)
      assert.equal(getComponent(world.localClientEntity, NetworkObjectComponent).ownerId, userId)
      assert.equal(getComponent(world.localClientEntity, NetworkObjectComponent).ownerIndex, userIndex)
      assert.equal(getComponent(world.localClientEntity, NetworkObjectComponent).parameters, objParams)
      assert.deepStrictEqual(getComponent(world.localClientEntity, NetworkObjectComponent).prefab, objPrefab)
      assert.equal(hasComponent(world.localClientEntity, NetworkObjectOwnedTag), true)
    })
  })

  describe('destroyObject', () => {})
})
