import assert from 'assert'
import { Quaternion, Vector3 } from 'three'

import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import ActionFunctions from '@xrengine/hyperflux/functions/ActionFunctions'

import { Engine } from '../../ecs/classes/Engine'
import { createWorld } from '../../ecs/classes/World'
import { addComponent, defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { NetworkObjectAuthorityTag } from '../components/NetworkObjectAuthorityTag'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { NetworkActionReceptor } from './NetworkActionReceptor'

describe('NetworkActionReceptors', () => {
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
      NetworkActionReceptor.addClient(world, userId, userName, userIndex)

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
      world.hostId = userId as UserId
      Engine.userId = userId

      NetworkActionReceptor.addClient(world, userId, userName, userIndex)

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
      NetworkActionReceptor.addClient(world, userId, userName, userIndex)

      NetworkActionReceptor.removeClient(world, userId)

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
      NetworkActionReceptor.addClient(world, userId, userName, userIndex)

      const networkId = 2 as NetworkId

      const entity = createEntity()
      addComponent(entity, NetworkObjectComponent, {
        ownerId: userId,
        networkId,
        prefab: 'prefab',
        parameters: {}
      })

      // process remove actions and execute entity removal
      world.store.defaultDispatchDelay = 0
      NetworkActionReceptor.createNetworkActionReceptor(world)
      NetworkActionReceptor.removeClient(world, userId, true)

      ActionFunctions.clearOutgoingActions(world.store)
      ActionFunctions.applyIncomingActions(world.store)
      world.execute(0, 0)

      assert(!world.clients.get(userId))
      assert(!world.userIndexToUserId.get(1))
      assert(!world.userIdToUserIndex.get(userId))

      assert(!world.getNetworkObject(userId, networkId))
    })
  })

  describe('spawnObject', () => {
    it('should spawn object owned by host', () => {
      const hostUserId = 'server' as UserId
      const userId = 'user id' as UserId

      Engine.userId = userId
      const world = (Engine.currentWorld = createWorld())

      world.hostId = hostUserId
      NetworkActionReceptor.addClient(world, hostUserId, 'host', 0)
      NetworkActionReceptor.addClient(world, userId, 'user name', 1)

      const objParams = 123
      const objNetId = 3 as NetworkId
      const objPrefab = 'generic prefab'

      NetworkActionReceptor.spawnObject(world, {
        $from: world.hostId, // from host
        prefab: objPrefab, // generic prefab
        parameters: objParams, // arbitrary
        type: 'network.SPAWN_OBJECT', // plain object
        networkId: objNetId,
        $to: 'all',
        $time: 0,
        $cache: true
      })

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectAuthorityTag])

      const networkObjectEntities = networkObjectQuery(world)
      const networkObjectOwnedEntities = networkObjectOwnedQuery(world)

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 0)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, objNetId)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).ownerId, hostUserId)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).parameters, objParams)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).prefab, objPrefab)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectAuthorityTag), false)
    })

    it('should spawn object owned by user', () => {
      const userId = 'user id' as UserId
      const hostId = 'host' as UserId

      Engine.userId = userId

      const world = createWorld()
      Engine.currentWorld = world

      world.hostId = hostId
      NetworkActionReceptor.addClient(world, hostId, 'host', 0)
      NetworkActionReceptor.addClient(world, userId, 'user name', 1)

      const objParams = 123
      const objNetId = 3 as NetworkId
      const objPrefab = 'generic prefab'

      NetworkActionReceptor.spawnObject(world, {
        $from: userId, // from user
        prefab: objPrefab, // generic prefab
        parameters: objParams, // arbitrary
        type: 'network.SPAWN_OBJECT', // plain object
        networkId: objNetId,
        $to: 'all',
        $time: 0,
        $cache: true
      })

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectAuthorityTag])

      const networkObjectEntities = networkObjectQuery(world)
      const networkObjectOwnedEntities = networkObjectOwnedQuery(world)

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 1)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, objNetId)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).ownerId, userId)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).parameters, objParams)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).prefab, objPrefab)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectAuthorityTag), true)
    })

    it('should spawn avatar owned by other', () => {
      const hostUserId = 'server' as UserId
      const userId = 'user id' as UserId
      const userId2 = 'second user id' as UserId

      Engine.userId = userId
      const world = (Engine.currentWorld = createWorld())

      world.hostId = hostUserId
      NetworkActionReceptor.addClient(world, hostUserId, 'server', 0)
      NetworkActionReceptor.addClient(world, userId, 'user name', 1)
      NetworkActionReceptor.addClient(world, userId2, 'second user name', 2)

      const objParams = {
        position: new Vector3(),
        rotation: new Quaternion()
      }
      const objNetId = 3 as NetworkId
      const objPrefab = 'avatar'

      NetworkActionReceptor.spawnObject(world, {
        $from: userId2, // from other user
        prefab: objPrefab, // generic prefab
        parameters: objParams, // arbitrary
        type: 'network.SPAWN_OBJECT', // plain object
        networkId: objNetId,
        $to: 'all',
        $time: 0,
        $cache: true
      })

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectAuthorityTag])

      const networkObjectEntities = networkObjectQuery(world)
      const networkObjectOwnedEntities = networkObjectOwnedQuery(world)

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 0)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, objNetId)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).ownerId, userId2)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).parameters, objParams)
      assert.deepStrictEqual(getComponent(networkObjectEntities[0], NetworkObjectComponent).prefab, objPrefab)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectAuthorityTag), false)
    })

    it('should spawn avatar owned by user', () => {
      const userId = 'user id' as UserId

      Engine.userId = userId
      const world = (Engine.currentWorld = createWorld())
      world.localClientEntity = createEntity(world)

      NetworkActionReceptor.addClient(world, userId, 'user name', 1)

      const objParams = {
        position: new Vector3(),
        rotation: new Quaternion()
      }
      const objNetId = 3 as NetworkId
      const objPrefab = 'avatar'

      NetworkActionReceptor.spawnObject(world, {
        $from: userId, // from user
        prefab: objPrefab, // generic prefab
        parameters: objParams, // arbitrary
        type: 'network.SPAWN_OBJECT', // plain object
        networkId: objNetId,
        $to: 'all',
        $time: 0,
        $cache: true
      })

      assert.equal(getComponent(world.localClientEntity, NetworkObjectComponent).networkId, objNetId)
      assert.equal(getComponent(world.localClientEntity, NetworkObjectComponent).ownerId, userId)
      assert.equal(getComponent(world.localClientEntity, NetworkObjectComponent).parameters, objParams)
      assert.deepStrictEqual(getComponent(world.localClientEntity, NetworkObjectComponent).prefab, objPrefab)
      assert.equal(hasComponent(world.localClientEntity, NetworkObjectAuthorityTag), true)
    })
  })

  describe('destroyObject', () => {})

  describe('transfer ownership of object', () => {
    it('should transfer ownership of object from host to client', () => {
      const hostUserId = 'server' as UserId
      const userId = 'user id' as UserId

      // Run as host
      Engine.userId = hostUserId
      const world = (Engine.currentWorld = createWorld())

      world.hostId = hostUserId
      world.store.defaultDispatchDelay = 0

      NetworkActionReceptor.addClient(world, hostUserId, 'host', 0)
      NetworkActionReceptor.addClient(world, userId, 'user name', 1)

      const objParams = 123
      const objNetId = 3 as NetworkId
      const objPrefab = 'generic prefab'

      NetworkActionReceptor.spawnObject(world, {
        $from: hostUserId, // from host
        prefab: objPrefab, // generic prefab
        parameters: objParams, // arbitrary
        type: 'network.SPAWN_OBJECT', // plain object
        networkId: objNetId,
        $to: 'all',
        $time: 0,
        $cache: true
      })

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectAuthorityTag])

      const networkObjectEntities = networkObjectQuery(world)
      const networkObjectOwnedEntities = networkObjectOwnedQuery(world)

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 1)

      NetworkActionReceptor.requestAuthorityOverObject(world, {
        $from: userId, // from client
        type: 'network.REQUEST_AUTHORITY_OVER_OBJECT', // plain object
        object: {
          ownerId: hostUserId,
          networkId: objNetId
        },
        requester: userId,
        $to: 'all',
        $time: 0,
        $cache: true
      })

      NetworkActionReceptor.createNetworkActionReceptor(world)

      ActionFunctions.clearOutgoingActions(world.store)
      ActionFunctions.applyIncomingActions(world.store)
      world.execute(0, 0)

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 0)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, objNetId)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).ownerId, hostUserId)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectAuthorityTag), false)
    })

    it('should not transfer authority of object (only host can process authority transfer)', () => {
      // Run as client
      const userId = 'user id' as UserId
      const userName = 'user name'
      const userIndex = 1
      Engine.userId = userId

      const world = createWorld()
      NetworkActionReceptor.addClient(world, userId, userName, userIndex)
      Engine.currentWorld = world

      const hostIndex = 0
      world.clients.set(world.hostId, { userId: world.hostId, name: 'server', userIndex: hostIndex })

      const objParams = 123
      const objNetId = 3 as NetworkId
      const objPrefab = 'generic prefab'

      NetworkActionReceptor.spawnObject(world, {
        $from: world.hostId, // from host
        prefab: objPrefab, // generic prefab
        parameters: objParams, // arbitrary
        type: 'network.SPAWN_OBJECT', // plain object
        networkId: objNetId,
        $to: 'all',
        $time: 0,
        $cache: true
      })

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectAuthorityTag])

      const networkObjectEntities = networkObjectQuery(world)
      const networkObjectOwnedEntities = networkObjectOwnedQuery(world)

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 0)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).ownerId, world.hostId)

      NetworkActionReceptor.requestAuthorityOverObject(world, {
        $from: Engine.userId, // from client
        type: 'network.REQUEST_AUTHORITY_OVER_OBJECT', // plain object
        object: {
          ownerId: world.hostId,
          networkId: objNetId
        },
        requester: Engine.userId,
        $to: 'all',
        $time: 0,
        $cache: true
      })

      NetworkActionReceptor.createNetworkActionReceptor(world)

      ActionFunctions.clearOutgoingActions(world.store)
      ActionFunctions.applyIncomingActions(world.store)
      world.execute(0, 0)

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 0)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, objNetId)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).ownerId, world.hostId)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectAuthorityTag), false)
    })
  })
})
