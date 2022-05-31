import assert from 'assert'
import { Quaternion, Vector3 } from 'three'

import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import ActionFunctions from '@xrengine/hyperflux/functions/ActionFunctions'

import { createMockNetwork } from '../../../tests/util/createMockNetwork'
import { Engine } from '../../ecs/classes/Engine'
import { addComponent, defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { createEngine } from '../../initializeEngine'
import { NetworkObjectAuthorityTag } from '../components/NetworkObjectAuthorityTag'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import WorldNetworkActionSystem from '../systems/WorldNetworkActionSystem'
import { WorldNetworkAction } from './WorldNetworkAction'
import { WorldNetworkActionReceptor } from './WorldNetworkActionReceptor'

describe('WorldNetworkActionReceptors', () => {
  beforeEach(() => {
    createEngine()
    createMockNetwork()
  })

  describe('addClient', () => {
    it('should add client', () => {
      const world = Engine.instance.currentWorld
      const userId = 'user id' as UserId
      const userName = 'user name'
      const userIndex = 1
      WorldNetworkActionReceptor.receiveCreateClient(
        WorldNetworkAction.createClient({ $from: userId, name: userName, index: userIndex }),
        world
      )

      assert(world.clients.get(userId))
      assert.equal(world.clients.get(userId)?.userId, userId)
      assert.equal(world.clients.get(userId)?.index, userIndex)
      assert.equal(world.clients.get(userId)?.name, userName)
      assert.equal(world.userIndexToUserId.get(userIndex), userId)
      assert.equal(world.userIdToUserIndex.get(userId), userIndex)
    })

    it('should not add client if already exists', () => {
      const world = Engine.instance.currentWorld
      const userId = 'user id' as UserId
      const userName = 'user name'
      const userName2 = 'user name 2'
      const userIndex = 1

      WorldNetworkActionReceptor.receiveCreateClient(
        WorldNetworkAction.createClient({ $from: userId, name: userName, index: userIndex }),
        world
      )
      WorldNetworkActionReceptor.receiveCreateClient(
        WorldNetworkAction.createClient({ $from: userId, name: userName2, index: userIndex }),
        world
      )

      assert(world.clients.get(userId)?.name, userName)
    })
  })

  describe('removeClient', () => {
    it('should remove client', () => {
      const world = Engine.instance.currentWorld
      const userId = 'user id' as UserId
      const userName = 'user name'
      const userIndex = 1
      WorldNetworkActionReceptor.receiveCreateClient(
        WorldNetworkAction.createClient({ $from: userId, name: userName, index: userIndex }),
        world
      )

      WorldNetworkActionReceptor.receiveDestroyClient(WorldNetworkAction.destroyClient({ $from: userId }), false, world)

      assert(!world.clients.get(userId))
      assert(!world.userIndexToUserId.get(userIndex))
      assert(!world.userIdToUserIndex.get(userId))
    })

    it('should remove client and owned network objects', () => {
      const world = Engine.instance.currentWorld
      const userId = 'user id' as UserId
      const userName = 'user name'
      const userIndex = 1
      WorldNetworkActionReceptor.receiveCreateClient(
        WorldNetworkAction.createClient({ $from: userId, name: userName, index: userIndex }),
        world
      )

      const topic = 'network'

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
      WorldNetworkActionReceptor.receiveDestroyClient(WorldNetworkAction.destroyClient({ $from: userId }), true, world)

      ActionFunctions.clearOutgoingActions()
      ActionFunctions.applyIncomingActions()
      world.execute(0)

      assert(!world.clients.get(userId))
      assert(!world.userIndexToUserId.get(1))
      assert(!world.userIdToUserIndex.get(userId))

      assert(!world.getNetworkObject(userId, networkId))
    })
  })

  describe('spawnObject', () => {
    it('should spawn object owned by host', () => {
      const hostUserId = 'world' as UserId
      const userId = 'user id' as UserId

      Engine.instance.userId = userId
      const world = Engine.instance.currentWorld

      WorldNetworkActionReceptor.receiveCreateClient(
        WorldNetworkAction.createClient({ $from: hostUserId, name: 'host', index: 0 }),
        world
      )
      WorldNetworkActionReceptor.receiveCreateClient(
        WorldNetworkAction.createClient({ $from: userId, name: 'user name', index: 1 }),
        world
      )

      const objParams = 123
      const objNetId = 3 as NetworkId
      const objPrefab = 'generic prefab'

      WorldNetworkActionReceptor.receiveSpawnObject(
        WorldNetworkAction.spawnObject({
          $from: world.worldNetwork.hostId, // from  host
          prefab: objPrefab, // generic prefab
          parameters: objParams, // arbitrary
          networkId: objNetId
        }),
        world
      )

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

      Engine.instance.userId = userId

      const world = Engine.instance.currentWorld

      WorldNetworkActionReceptor.receiveCreateClient(
        WorldNetworkAction.createClient({ $from: hostId, name: 'world', index: 0 }),
        world
      )
      WorldNetworkActionReceptor.receiveCreateClient(
        WorldNetworkAction.createClient({ $from: userId, name: 'user name', index: 1 }),
        world
      )

      const objParams = 123
      const objNetId = 3 as NetworkId
      const objPrefab = 'generic prefab'

      WorldNetworkActionReceptor.receiveSpawnObject(
        WorldNetworkAction.spawnObject({
          $from: userId, // from  user
          prefab: objPrefab, // generic prefab
          parameters: objParams, // arbitrary
          networkId: objNetId
        }),
        world
      )

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
      const hostUserId = 'world' as UserId
      const userId = 'user id' as UserId
      const userId2 = 'second user id' as UserId

      Engine.instance.userId = userId
      const world = Engine.instance.currentWorld

      WorldNetworkActionReceptor.receiveCreateClient(
        WorldNetworkAction.createClient({ $from: hostUserId, name: 'world', index: 0 }),
        world
      )
      WorldNetworkActionReceptor.receiveCreateClient(
        WorldNetworkAction.createClient({ $from: userId, name: 'user name', index: 1 }),
        world
      )
      WorldNetworkActionReceptor.receiveCreateClient(
        WorldNetworkAction.createClient({ $from: userId2, name: 'second user name', index: 2 }),
        world
      )

      const objParams = {
        position: new Vector3(),
        rotation: new Quaternion()
      }
      const objNetId = 3 as NetworkId
      const objPrefab = 'avatar'

      WorldNetworkActionReceptor.receiveSpawnObject(
        WorldNetworkAction.spawnObject({
          $from: userId2, // from other user
          prefab: objPrefab, // generic prefab
          parameters: objParams, // arbitrary
          networkId: objNetId
        }),
        world
      )

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

      Engine.instance.userId = userId
      const world = Engine.instance.currentWorld
      world.localClientEntity = createEntity(world)

      WorldNetworkActionReceptor.receiveCreateClient(
        WorldNetworkAction.createClient({ $from: userId, name: 'user name', index: 1 }),
        world
      )

      const objParams = {
        position: new Vector3(),
        rotation: new Quaternion()
      }
      const objNetId = 3 as NetworkId
      const objPrefab = 'avatar'

      WorldNetworkActionReceptor.receiveSpawnObject(
        WorldNetworkAction.spawnObject({
          $from: userId, // from user
          prefab: objPrefab, // generic prefab
          parameters: objParams, // arbitrary
          networkId: objNetId
        }),
        world
      )

      assert.equal(getComponent(world.localClientEntity, NetworkObjectComponent).networkId, objNetId)
      assert.equal(getComponent(world.localClientEntity, NetworkObjectComponent).ownerId, userId)
      assert.equal(getComponent(world.localClientEntity, NetworkObjectComponent).parameters, objParams)
      assert.deepStrictEqual(getComponent(world.localClientEntity, NetworkObjectComponent).prefab, objPrefab)
      assert.equal(hasComponent(world.localClientEntity, NetworkObjectAuthorityTag), true)
    })
  })

  describe('destroyObject', () => {})

  describe('transfer ownership of object', () => {
    it('should transfer ownership of object from host to client', async () => {
      const hostUserId = 'world' as UserId
      const userId = 'user id' as UserId

      // Run as host
      Engine.instance.userId = hostUserId
      const world = Engine.instance.currentWorld

      Engine.instance.store.defaultDispatchDelay = 0

      WorldNetworkActionReceptor.receiveCreateClient(
        WorldNetworkAction.createClient({ $from: hostUserId, name: 'world', index: 0 }),
        world
      )
      WorldNetworkActionReceptor.receiveCreateClient(
        WorldNetworkAction.createClient({ $from: userId, name: 'user name', index: 1 }),
        world
      )

      const objParams = 123
      const objNetId = 3 as NetworkId
      const objPrefab = 'generic prefab'

      WorldNetworkActionReceptor.receiveSpawnObject(
        WorldNetworkAction.spawnObject({
          $from: hostUserId, // from host
          prefab: objPrefab, // generic prefab
          parameters: objParams, // arbitrary
          networkId: objNetId
        }),
        world
      )

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectAuthorityTag])

      const networkObjectEntitiesBefore = networkObjectQuery(world)
      const networkObjectOwnedEntitiesBefore = networkObjectOwnedQuery(world)

      assert.equal(networkObjectEntitiesBefore.length, 1)
      assert.equal(networkObjectOwnedEntitiesBefore.length, 1)

      WorldNetworkActionReceptor.receiveRequestAuthorityOverObject(
        WorldNetworkAction.requestAuthorityOverObject({
          $from: userId, // from user
          object: {
            ownerId: hostUserId,
            networkId: objNetId
          },
          requester: userId
        }),
        world
      )

      const system = await WorldNetworkActionSystem()

      ActionFunctions.clearOutgoingActions()
      ActionFunctions.applyIncomingActions()
      system()

      const networkObjectEntitiesAfter = networkObjectQuery(world)
      const networkObjectOwnedEntitiesAfter = networkObjectOwnedQuery(world)

      assert.equal(networkObjectEntitiesAfter.length, 1)
      assert.equal(networkObjectOwnedEntitiesAfter.length, 0)

      assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).networkId, objNetId)
      assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).ownerId, hostUserId)
      assert.equal(hasComponent(networkObjectEntitiesAfter[0], NetworkObjectAuthorityTag), false)
    })

    it('should not transfer authority of object (only host can process authority transfer)', async () => {
      // Run as client
      const userId = 'user id' as UserId
      const userName = 'user name'
      const userIndex = 1
      Engine.instance.userId = userId

      const world = Engine.instance.currentWorld
      WorldNetworkActionReceptor.receiveCreateClient(
        WorldNetworkAction.createClient({ $from: userId, name: userName, index: userIndex }),
        world
      )

      const hostIndex = 0
      world.clients.set(world.worldNetwork.hostId, {
        userId: world.worldNetwork.hostId,
        name: 'world',
        index: hostIndex
      })

      const objParams = 123
      const objNetId = 3 as NetworkId
      const objPrefab = 'generic prefab'

      WorldNetworkActionReceptor.receiveSpawnObject(
        WorldNetworkAction.spawnObject({
          $from: world.worldNetwork.hostId, // from host
          prefab: objPrefab, // generic prefab
          parameters: objParams, // arbitrary
          networkId: objNetId
        }),
        world
      )

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectAuthorityTag])

      const networkObjectEntities = networkObjectQuery(world)
      const networkObjectOwnedEntities = networkObjectOwnedQuery(world)

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 0)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).ownerId, world.worldNetwork.hostId)

      WorldNetworkActionReceptor.receiveRequestAuthorityOverObject(
        WorldNetworkAction.requestAuthorityOverObject({
          $from: userId, // from user
          object: {
            ownerId: world.worldNetwork.hostId,
            networkId: objNetId
          },
          requester: userId
        }),
        world
      )

      ActionFunctions.clearOutgoingActions()
      ActionFunctions.applyIncomingActions()
      world.execute(0)

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 0)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, objNetId)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).ownerId, world.worldNetwork.hostId)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectAuthorityTag), false)
    })
  })
})
