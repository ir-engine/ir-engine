import assert from 'assert'
import { Quaternion, Vector3 } from 'three'

import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import ActionFunctions from '@xrengine/hyperflux/functions/ActionFunctions'

import { createMockNetwork } from '../../../tests/util/createMockNetwork'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { createAvatar } from '../../avatar/functions/createAvatar'
import { Engine } from '../../ecs/classes/Engine'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEngine } from '../../initializeEngine'
import { Physics } from '../../physics/classes/Physics'
import { NetworkTopics } from '../classes/Network'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { NetworkObjectOwnedTag } from '../components/NetworkObjectOwnedTag'
import WorldNetworkActionSystem from '../systems/WorldNetworkActionSystem'
import { NetworkPeerFunctions } from './NetworkPeerFunctions'
import { WorldNetworkAction } from './WorldNetworkAction'
import { WorldNetworkActionReceptor } from './WorldNetworkActionReceptor'

describe('WorldNetworkActionReceptors', () => {
  beforeEach(async () => {
    createEngine()
    createMockNetwork()
    await Physics.load()
    Engine.instance.currentWorld.physicsWorld = Physics.createWorld()
  })

  describe('spawnObject', () => {
    it('should spawn object owned by host', () => {
      const hostUserId = 'world' as UserId
      const userId = 'user id' as UserId

      Engine.instance.userId = userId
      const world = Engine.instance.currentWorld
      const network = world.worldNetwork

      NetworkPeerFunctions.createPeer(network, hostUserId, 0, 'host', world)
      NetworkPeerFunctions.createPeer(network, userId, 1, 'user name', world)

      const objNetId = 3 as NetworkId
      const objPrefab = 'generic prefab'

      WorldNetworkActionReceptor.receiveSpawnObject(
        WorldNetworkAction.spawnObject({
          $from: world.worldNetwork.hostId, // from  host
          prefab: objPrefab, // generic prefab
          networkId: objNetId,
          $topic: NetworkTopics.world
        }),
        world
      )

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntities = networkObjectQuery(world)
      const networkObjectOwnedEntities = networkObjectOwnedQuery(world)

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 0)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, objNetId)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).authorityUserId, hostUserId)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectOwnedTag), false)
    })

    it('should spawn object owned by user', () => {
      const userId = 'user id' as UserId
      const hostId = 'host' as UserId

      Engine.instance.userId = userId

      const world = Engine.instance.currentWorld
      const network = world.worldNetwork

      NetworkPeerFunctions.createPeer(network, hostId, 0, 'host', world)
      NetworkPeerFunctions.createPeer(network, userId, 1, 'user name', world)

      const objParams = 123
      const objNetId = 3 as NetworkId
      const objPrefab = 'generic prefab'

      WorldNetworkActionReceptor.receiveSpawnObject(
        WorldNetworkAction.spawnObject({
          $from: userId, // from  user
          prefab: objPrefab, // generic prefab
          networkId: objNetId
        })
      )

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntities = networkObjectQuery(world)
      const networkObjectOwnedEntities = networkObjectOwnedQuery(world)

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 1)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, objNetId)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).authorityUserId, userId)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectOwnedTag), true)
    })

    it('should spawn avatar owned by other', async () => {
      const hostUserId = 'world' as UserId
      const userId = 'user id' as UserId
      const userId2 = 'second user id' as UserId

      Engine.instance.userId = userId
      const world = Engine.instance.currentWorld
      const network = world.worldNetwork

      NetworkPeerFunctions.createPeer(network, hostUserId, 0, 'world', world)
      NetworkPeerFunctions.createPeer(network, userId, 1, 'user name', world)
      NetworkPeerFunctions.createPeer(network, userId2, 2, 'second user name', world)

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
          networkId: objNetId,
          $topic: NetworkTopics.world
        }),
        world
      )

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntities = networkObjectQuery(world)
      const networkObjectOwnedEntities = networkObjectOwnedQuery(world)

      assert.equal(networkObjectEntities.length, 1)
      assert.equal(networkObjectOwnedEntities.length, 0)

      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, objNetId)
      assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).authorityUserId, userId2)
      assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectOwnedTag), false)
    })

    it('should spawn avatar owned by user', async () => {
      const userId = 'user id' as UserId

      Engine.instance.userId = userId
      const world = Engine.instance.currentWorld
      const network = world.worldNetwork

      NetworkPeerFunctions.createPeer(network, userId, 1, 'user name', world)

      const action = WorldNetworkAction.spawnAvatar({ networkId: 42 as NetworkId })
      WorldNetworkActionReceptor.receiveSpawnObject(action)
      createAvatar(action)

      const entity = world.getOwnedNetworkObjectWithComponent(userId, AvatarComponent)

      assert.equal(getComponent(entity, NetworkObjectComponent).networkId, 42)
      assert.equal(getComponent(entity, NetworkObjectComponent).authorityUserId, userId)
      assert.equal(hasComponent(entity, NetworkObjectOwnedTag), true)
    })
  })

  describe('destroyObject', () => {})

  // describe.skip('transfer ownership of object', () => {
  //   it('should transfer ownership of object from host to client', async () => {
  //     const hostUserId = 'world' as UserId
  //     const userId = 'user id' as UserId

  //     // Run as host
  //     Engine.instance.userId = hostUserId
  //     const world = Engine.instance.currentWorld
  //     const network = world.worldNetwork

  //     Engine.instance.store.defaultDispatchDelay = 0

  //     NetworkPeerFunctions.createPeer(network, hostUserId, 0, 'world', world)
  //     NetworkPeerFunctions.createPeer(network, userId, 1, 'user name', world)

  //     const objParams = 123
  //     const objNetId = 3 as NetworkId
  //     const objPrefab = 'generic prefab'

  //     WorldNetworkActionReceptor.receiveSpawnObject(
  //       WorldNetworkAction.spawnObject({
  //         $from: hostUserId, // from host
  //         prefab: objPrefab, // generic prefab
  //         networkId: objNetId,
  //         $topic: NetworkTopics.world
  //       }),
  //       world
  //     )

  //     const networkObjectQuery = defineQuery([NetworkObjectComponent])
  //     const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

  //     const networkObjectEntitiesBefore = networkObjectQuery(world)
  //     const networkObjectOwnedEntitiesBefore = networkObjectOwnedQuery(world)

  //     assert.equal(networkObjectEntitiesBefore.length, 1)
  //     assert.equal(networkObjectOwnedEntitiesBefore.length, 1)

  //     WorldNetworkActionReceptor.receiveRequestAuthorityOverObject(
  //       WorldNetworkAction.requestAuthorityOverObject({
  //         $from: userId, // from user
  //         object: {
  //           ownerId: hostUserId,
  //           networkId: objNetId
  //         },
  //         requester: userId,
  //         $topic: NetworkTopics.world
  //       }),
  //       world
  //     )

  //     const system = await WorldNetworkActionSystem()

  //     ActionFunctions.clearOutgoingActions(network.topic)
  //     ActionFunctions.applyIncomingActions()
  //     system()

  //     const networkObjectEntitiesAfter = networkObjectQuery(world)
  //     const networkObjectOwnedEntitiesAfter = networkObjectOwnedQuery(world)

  //     assert.equal(networkObjectEntitiesAfter.length, 1)
  //     assert.equal(networkObjectOwnedEntitiesAfter.length, 0)

  //     assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).networkId, objNetId)
  //     assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).authorityUserId, hostUserId)
  //     assert.equal(hasComponent(networkObjectEntitiesAfter[0], NetworkObjectOwnedTag), false)
  //   })

  //   it('should not transfer authority of object (only host can process authority transfer)', async () => {
  //     // Run as client
  //     const userId = 'user id' as UserId
  //     const userName = 'user name'
  //     const userIndex = 1
  //     Engine.instance.userId = userId

  //     const world = Engine.instance.currentWorld
  //     const network = world.worldNetwork

  //     NetworkPeerFunctions.createPeer(network, userId, userIndex, userName, world)

  //     const hostIndex = 0

  //     network.peers.set(world.worldNetwork.hostId, {
  //       userId: world.worldNetwork.hostId,
  //       index: hostIndex
  //     })

  //     const objNetId = 3 as NetworkId
  //     const objPrefab = 'generic prefab'

  //     const action = WorldNetworkAction.spawnObject({
  //       $from: world.worldNetwork.hostId, // from host
  //       prefab: objPrefab, // generic prefab
  //       networkId: objNetId
  //     })

  //     WorldNetworkActionReceptor.receiveSpawnObject(action)
  //     createAvatar(action)

  //     const networkObjectQuery = defineQuery([NetworkObjectComponent])
  //     const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

  //     const networkObjectEntities = networkObjectQuery(world)
  //     const networkObjectOwnedEntities = networkObjectOwnedQuery(world)

  //     assert.equal(networkObjectEntities.length, 1)
  //     assert.equal(networkObjectOwnedEntities.length, 0)
  //     assert.equal(
  //       getComponent(networkObjectEntities[0], NetworkObjectComponent).authorityUserId,
  //       world.worldNetwork.hostId
  //     )

  //     WorldNetworkActionReceptor.receiveRequestAuthorityOverObject(
  //       WorldNetworkAction.requestAuthorityOverObject({
  //         $from: userId, // from user
  //         object: {
  //           ownerId: world.worldNetwork.hostId,
  //           networkId: objNetId
  //         },
  //         requester: userId,
  //         $topic: NetworkTopics.world
  //       }),
  //       world
  //     )

  //     ActionFunctions.clearOutgoingActions(network.topic)
  //     ActionFunctions.applyIncomingActions()
  //     world.execute(0)

  //     assert.equal(networkObjectEntities.length, 1)
  //     assert.equal(networkObjectOwnedEntities.length, 0)

  //     assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, objNetId)
  //     assert.equal(
  //       getComponent(networkObjectEntities[0], NetworkObjectComponent).authorityUserId,
  //       world.worldNetwork.hostId
  //     )
  //     assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectOwnedTag), false)
  //   })
  // })
})
