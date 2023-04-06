import assert from 'assert'
import { Quaternion, Vector3 } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import * as ActionFunctions from '@etherealengine/hyperflux/functions/ActionFunctions'

import { createMockNetwork } from '../../../tests/util/createMockNetwork'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { spawnAvatarReceptor } from '../../avatar/functions/spawnAvatarReceptor'
import { destroyEngine, Engine } from '../../ecs/classes/Engine'
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
    Engine.instance.store.defaultDispatchDelay = 0
  })

  afterEach(() => {
    return destroyEngine()
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
          $peer: network.peerID,
          uuid: network.peerID as any as EntityUUID
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
          $peer: network.peerID,
          uuid: network.peerID as any as EntityUUID
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
          $topic: NetworkTopics.world,
          uuid: peerID3 as any as EntityUUID
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
        $peer: peerID,
        uuid: userId
      })
      WorldNetworkActionReceptor.receiveSpawnObject(action as any)
      spawnAvatarReceptor(action)

      const entity = Engine.instance.getOwnedNetworkObjectWithComponent(userId, AvatarComponent)

      assert.equal(getComponent(entity, NetworkObjectComponent).networkId, 42)
      assert.equal(getComponent(entity, NetworkObjectComponent).authorityPeerID, peerID)
      assert.equal(hasComponent(entity, NetworkObjectOwnedTag), true)
    })
  })

  describe('destroyObject', () => {})

  describe('transfer authority of object', () => {
    it('should transfer authority of object (and not ownership)', async () => {
      const hostUserId = 'world' as UserId
      const hostPeerId = 'host peer id' as PeerID
      const userId = 'user id' as UserId
      const peerID = 'peer id' as PeerID
      const peerID2 = 'peer id 2' as PeerID

      Engine.instance.userId = userId
      const network = Engine.instance.worldNetwork as Network
      network.peerID = peerID

      NetworkPeerFunctions.createPeer(network, hostPeerId, 0, hostUserId, 0, 'host')
      NetworkPeerFunctions.createPeer(network, peerID, 0, userId, 1, 'user name')
      NetworkPeerFunctions.createPeer(network, peerID2, 1, userId, 1, 'user name')

      const objNetId = 3 as NetworkId
      const objPrefab = 'generic prefab'

      WorldNetworkActionReceptor.receiveSpawnObject(
        WorldNetworkAction.spawnObject({
          $from: userId,
          prefab: objPrefab,
          networkId: objNetId,
          $topic: NetworkTopics.world,
          $peer: network.peerID,
          uuid: network.peerID as any as EntityUUID
        })
      )

      const networkObjectQuery = defineQuery([NetworkObjectComponent])
      const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

      const networkObjectEntitiesBefore = networkObjectQuery()
      const networkObjectOwnedEntitiesBefore = networkObjectOwnedQuery()

      assert.equal(networkObjectEntitiesBefore.length, 1)
      assert.equal(networkObjectOwnedEntitiesBefore.length, 1)

      assert.equal(getComponent(networkObjectEntitiesBefore[0], NetworkObjectComponent).ownerId, userId)
      assert.equal(getComponent(networkObjectEntitiesBefore[0], NetworkObjectComponent).authorityPeerID, peerID)
      assert.equal(hasComponent(networkObjectEntitiesBefore[0], NetworkObjectOwnedTag), true)

      const transferAuthorityOfObjectQueue = ActionFunctions.createActionQueue(
        WorldNetworkAction.transferAuthorityOfObject.matches
      )

      WorldNetworkActionReceptor.receiveRequestAuthorityOverObject(
        WorldNetworkAction.requestAuthorityOverObject({
          $from: userId,
          ownerId: userId,
          networkId: objNetId,
          $topic: NetworkTopics.world,
          newAuthority: peerID2
        })
      )

      ActionFunctions.applyIncomingActions()

      for (const action of transferAuthorityOfObjectQueue())
        WorldNetworkActionReceptor.receiveTransferAuthorityOfObject(action)

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
    const hostUserId = 'world' as UserId
    const hostPeerId = 'host peer id' as PeerID
    const userId = 'user id' as UserId
    const peerID = 'peer id' as PeerID
    const peerID2 = 'peer id 2' as PeerID

    Engine.instance.userId = userId // user being the action dispatcher
    const network = Engine.instance.worldNetwork as Network
    network.peerID = peerID

    NetworkPeerFunctions.createPeer(network, hostPeerId, 0, hostUserId, 0, 'host')
    NetworkPeerFunctions.createPeer(network, peerID, 0, userId, 1, 'user name')
    NetworkPeerFunctions.createPeer(network, peerID2, 1, userId, 1, 'user name')

    const objNetId = 3 as NetworkId
    const objPrefab = 'generic prefab'

    WorldNetworkActionReceptor.receiveSpawnObject(
      WorldNetworkAction.spawnObject({
        $from: hostUserId, // from  host
        prefab: objPrefab, // generic prefab
        networkId: objNetId,
        $topic: NetworkTopics.world,
        $peer: network.peerID,
        uuid: network.peerID as any as EntityUUID
      })
    )

    const networkObjectQuery = defineQuery([NetworkObjectComponent])
    const networkObjectOwnedQuery = defineQuery([NetworkObjectOwnedTag])

    const networkObjectEntitiesBefore = networkObjectQuery()
    const networkObjectOwnedEntitiesBefore = networkObjectOwnedQuery()

    assert.equal(networkObjectEntitiesBefore.length, 1)
    assert.equal(networkObjectOwnedEntitiesBefore.length, 0)

    assert.equal(getComponent(networkObjectEntitiesBefore[0], NetworkObjectComponent).ownerId, hostUserId)
    assert.equal(getComponent(networkObjectEntitiesBefore[0], NetworkObjectComponent).authorityPeerID, peerID)
    assert.equal(hasComponent(networkObjectEntitiesBefore[0], NetworkObjectOwnedTag), false)

    const transferAuthorityOfObjectQueue = ActionFunctions.createActionQueue(
      WorldNetworkAction.transferAuthorityOfObject.matches
    )

    WorldNetworkActionReceptor.receiveRequestAuthorityOverObject(
      WorldNetworkAction.requestAuthorityOverObject({
        $from: userId, // from user
        ownerId: hostUserId,
        networkId: objNetId,
        $topic: NetworkTopics.world,
        newAuthority: peerID2
      })
    )

    ActionFunctions.applyIncomingActions()

    for (const action of transferAuthorityOfObjectQueue())
      WorldNetworkActionReceptor.receiveTransferAuthorityOfObject(action)

    const networkObjectEntitiesAfter = networkObjectQuery()
    const networkObjectOwnedEntitiesAfter = networkObjectOwnedQuery()

    assert.equal(networkObjectEntitiesAfter.length, 1)
    assert.equal(networkObjectOwnedEntitiesAfter.length, 0)

    assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).ownerId, hostUserId) // owner remains same
    assert.equal(getComponent(networkObjectEntitiesAfter[0], NetworkObjectComponent).authorityPeerID, peerID) // peer remains same
    assert.equal(hasComponent(networkObjectEntitiesAfter[0], NetworkObjectOwnedTag), false)
  })
})
