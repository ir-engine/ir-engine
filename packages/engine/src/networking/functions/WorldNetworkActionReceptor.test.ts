import assert from 'assert'
import { Quaternion, Vector3 } from 'three'

import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'

import { createMockNetwork } from '../../../tests/util/createMockNetwork'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { spawnAvatarReceptor } from '../../avatar/functions/spawnAvatarReceptor'
import { Engine } from '../../ecs/classes/Engine'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEngine } from '../../initializeEngine'
import { Physics } from '../../physics/classes/Physics'
import { Network, NetworkTopics } from '../classes/Network'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { NetworkObjectOwnedTag } from '../components/NetworkObjectComponent'
import WorldNetworkActionSystem from '../systems/WorldNetworkActionSystem'
import { NetworkPeerFunctions } from './NetworkPeerFunctions'
import { WorldNetworkAction } from './WorldNetworkAction'
import { WorldNetworkActionReceptor } from './WorldNetworkActionReceptor'

describe('WorldNetworkActionReceptors', () => {
  beforeEach(async () => {
    createEngine()
    createMockNetwork()
    await Physics.load()
    Engine.instance.physicsWorld = Physics.createWorld()
  })

  describe('spawnObject', () => {
    it('should spawn object owned by host', () => {
      const hostUserId = 'world' as UserId
      const userId = 'user id' as UserId
      const peerID = 'peer id' as PeerID
      const peerID2 = 'peer id 2' as PeerID

      Engine.instance.userId = userId
      const network = Engine.instance.worldNetwork as Network
      network.peerID = peerID

      NetworkPeerFunctions.createPeer(network, peerID, 0, hostUserId, 0, 'host')
      NetworkPeerFunctions.createPeer(network, peerID2, 1, userId, 1, 'user name')

      const objNetId = 3 as NetworkId
      const objPrefab = 'generic prefab'

      WorldNetworkActionReceptor.receiveSpawnObject(
        WorldNetworkAction.spawnObject({
          $from: Engine.instance.worldNetwork.hostId, // from  host
          prefab: objPrefab, // generic prefab
          networkId: objNetId,
          $topic: NetworkTopics.world,
          $peer: network.peerID
        })
      )

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

    it('should spawn object owned by user', () => {
      const userId = 'user id' as UserId
      const hostId = 'host' as UserId
      const peerID = 'peer id' as PeerID
      const peerID2 = 'peer id 2' as PeerID

      Engine.instance.userId = userId

      const network = Engine.instance.worldNetwork as Network
      network.peerID = peerID2

      NetworkPeerFunctions.createPeer(network, peerID, 0, hostId, 0, 'host')
      NetworkPeerFunctions.createPeer(network, peerID2, 1, userId, 1, 'user name')

      const objParams = 123
      const objNetId = 3 as NetworkId
      const objPrefab = 'generic prefab'

      WorldNetworkActionReceptor.receiveSpawnObject(
        WorldNetworkAction.spawnObject({
          $from: userId, // from  user
          prefab: objPrefab, // generic prefab
          networkId: objNetId,
          $peer: network.peerID
        })
      )

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
      const hostUserId = 'world' as UserId
      const userId = 'user id' as UserId
      const userId2 = 'second user id' as UserId
      const peerID = 'peer id' as PeerID
      const peerID2 = 'peer id 2' as PeerID
      const peerID3 = 'peer id 3' as PeerID

      Engine.instance.userId = userId
      const network = Engine.instance.worldNetwork as Network
      network.peerID = peerID

      NetworkPeerFunctions.createPeer(network, peerID, 0, hostUserId, 0, 'world')
      NetworkPeerFunctions.createPeer(network, peerID2, 1, userId, 1, 'user name')
      NetworkPeerFunctions.createPeer(network, peerID3, 2, userId2, 2, 'second user name')

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
          $peer: peerID3,
          $topic: NetworkTopics.world
        })
      )

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
      const userId = 'user id' as UserId
      const peerID = 'peer id' as PeerID

      Engine.instance.userId = userId
      const network = Engine.instance.worldNetwork as Network
      network.peerID = peerID

      NetworkPeerFunctions.createPeer(network, peerID, 1, userId, 1, 'user name')

      const action = WorldNetworkAction.spawnAvatar({
        networkId: 42 as NetworkId,
        $peer: peerID
      })
      WorldNetworkActionReceptor.receiveSpawnObject(action)
      spawnAvatarReceptor(action)

      const entity = Engine.instance.getOwnedNetworkObjectWithComponent(userId, AvatarComponent)

      assert.equal(getComponent(entity, NetworkObjectComponent).networkId, 42)
      assert.equal(getComponent(entity, NetworkObjectComponent).authorityPeerID, peerID)
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
  //     //     const network = Engine.instance.worldNetwork

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
  //     assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).authorityPeerID, hostUserId)
  //     assert.equal(hasComponent(networkObjectEntitiesAfter[0], NetworkObjectOwnedTag), false)
  //   })

  //   it('should not transfer authority of object (only host can process authority transfer)', async () => {
  //     // Run as client
  //     const userId = 'user id' as UserId
  //     const userName = 'user name'
  //     const userIndex = 1
  //     Engine.instance.userId = userId

  //     //     const network = Engine.instance.worldNetwork

  //     NetworkPeerFunctions.createPeer(network, userId, userIndex, userName, world)

  //     const hostIndex = 0

  //     network.peers.set(Engine.instance.worldNetwork.hostId, {
  //       userId: Engine.instance.worldNetwork.hostId,
  //       index: hostIndex
  //     })

  //     const objNetId = 3 as NetworkId
  //     const objPrefab = 'generic prefab'

  //     const action = WorldNetworkAction.spawnObject({
  //       $from: Engine.instance.worldNetwork.hostId, // from host
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
  //       getComponent(networkObjectEntities[0], NetworkObjectComponent).authorityPeerID,
  //       Engine.instance.worldNetwork.hostId
  //     )

  //     WorldNetworkActionReceptor.receiveRequestAuthorityOverObject(
  //       WorldNetworkAction.requestAuthorityOverObject({
  //         $from: userId, // from user
  //         object: {
  //           ownerId: Engine.instance.worldNetwork.hostId,
  //           networkId: objNetId
  //         },
  //         requester: userId,
  //         $topic: NetworkTopics.world
  //       }),
  //       world
  //     )

  //     ActionFunctions.clearOutgoingActions(network.topic)
  //     ActionFunctions.applyIncomingActions()
  //     executeSystems(0)

  //     assert.equal(networkObjectEntities.length, 1)
  //     assert.equal(networkObjectOwnedEntities.length, 0)

  //     assert.equal(getComponent(networkObjectEntities[0], NetworkObjectComponent).networkId, objNetId)
  //     assert.equal(
  //       getComponent(networkObjectEntities[0], NetworkObjectComponent).authorityPeerID,
  //       Engine.instance.worldNetwork.hostId
  //     )
  //     assert.equal(hasComponent(networkObjectEntities[0], NetworkObjectOwnedTag), false)
  //   })
  // })
})
