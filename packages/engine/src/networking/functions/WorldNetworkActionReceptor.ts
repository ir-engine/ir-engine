import { none } from '@speigg/hookstate'

import { dispatchAction } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { getEngineState } from '../../ecs/classes/EngineState'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { generatePhysicsObject } from '../../physics/functions/physicsObjectDebugFunctions'
import { Network } from '../classes/Network'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { NetworkObjectOwnedTag } from '../components/NetworkObjectOwnedTag'
import { WorldNetworkAction } from './WorldNetworkAction'

const removeAllNetworkPeers = (
  removeSelf = false,
  world = Engine.instance.currentWorld,
  network = Engine.instance.currentWorld.worldNetwork
) => {
  for (const [userId] of network.peers) {
    WorldNetworkActionReceptor.receiveDestroyPeers(
      WorldNetworkAction.destroyPeer({ $from: userId, $topic: network.hostId }),
      removeSelf,
      world
    )
  }
}

const receiveCreatePeers = (
  action: typeof WorldNetworkAction.createPeer.matches._TYPE,
  world = Engine.instance.currentWorld
) => {
  const network = world.networks.get(action.$topic)!
  // set utility maps - override if moving through portal
  network.userIdToUserIndex.set(action.$from, action.index)
  network.userIndexToUserId.set(action.index, action.$from)

  if (network.peers.has(action.$from))
    return console.log(
      `[WorldNetworkActionReceptors]: peer with id ${action.$from} and name ${action.name} already exists. ignoring.`
    )

  network.peers.set(action.$from, {
    userId: action.$from,
    index: action.index
  })

  if (!world.users.get(action.$from))
    world.users.set(action.$from, {
      userId: action.$from,
      name: action.name
    })
}

const receiveDestroyPeers = (
  action: typeof WorldNetworkAction.destroyPeer.matches._TYPE,
  allowRemoveSelf = false,
  world = Engine.instance.currentWorld
) => {
  const network = world.networks.get(action.$topic)!
  if (!network.peers.has(action.$from))
    return console.warn(
      `[WorldNetworkActionReceptors]: tried to remove client with userId ${action.$from} that doesn't exit`
    )
  if (!allowRemoveSelf && action.$from === Engine.instance.userId)
    return console.warn(`[WorldNetworkActionReceptors]: tried to remove local client`)

  for (const eid of world.getOwnedNetworkObjects(action.$from)) {
    const { networkId } = getComponent(eid, NetworkObjectComponent)
    const destroyObjectAction = WorldNetworkAction.destroyObject({ $from: action.$from, networkId })
    receiveDestroyObject(destroyObjectAction, world)
  }

  const { index: userIndex } = network.peers.get(action.$from)!
  network.userIdToUserIndex.delete(action.$from)
  network.userIndexToUserId.delete(userIndex)
  network.peers.delete(action.$from)

  Engine.instance.store.actions.cached[action.$topic] = Engine.instance.store.actions.cached[action.$topic].filter(
    (a) => a.$from !== action.$from
  )

  /**
   * if no other connections exist for this user exist, we want to remove them from world.users
   */
  const remainingPeersForDisconnectingUser = Object.entries(world.networks.entries())
    .map(([id, network]: [string, Network]) => {
      return network.peers.has(action.$from)
    })
    .filter((peer) => !!peer)

  if (!remainingPeersForDisconnectingUser.length) {
    world.users.delete(action.$from)
  }
}

const receiveSpawnObject = (
  action: typeof WorldNetworkAction.spawnObject.matches._TYPE,
  world = Engine.instance.currentWorld
) => {
  const isSpawningAvatar = WorldNetworkAction.spawnAvatar.matches.test(action)
  /**
   * When changing location via a portal, the local client entity will be
   * defined when the new world dispatches this action, so ignore it
   */
  if (
    isSpawningAvatar &&
    Engine.instance.userId === action.$from &&
    hasComponent(world.localClientEntity, NetworkObjectComponent)
  ) {
    const networkComponent = getComponent(world.localClientEntity, NetworkObjectComponent)
    console.log(
      `[WorldNetworkActionReceptors]: Successfully updated local client entity's networkId from ${networkComponent.networkId} to ${action.networkId}`
    )
    networkComponent.networkId = action.networkId
    return
  }
  const params = action.parameters
  const isOwnedByMe = action.$from === Engine.instance.userId
  let entity
  if (isSpawningAvatar && isOwnedByMe) {
    entity = world.localClientEntity
  } else {
    let networkObject = world.getNetworkObject(action.$from, action.networkId)
    if (networkObject) {
      entity = networkObject
    } else if (params?.sceneEntityId) {
      // spawn object from scene data
      const node = world.entityTree.uuidNodeMap.get(params.sceneEntityId)
      if (node) entity = node.entity
    } else {
      entity = createEntity()
    }
  }
  if (isOwnedByMe) addComponent(entity, NetworkObjectOwnedTag, {})

  addComponent(entity, NetworkObjectComponent, {
    ownerId: action.$from,
    networkId: action.networkId,
    prefab: action.prefab,
    parameters: action.parameters
  })
}

const receiveSpawnDebugPhysicsObject = (
  action: typeof WorldNetworkAction.spawnDebugPhysicsObject.matches._TYPE,
  world = Engine.instance.currentWorld
) => {
  generatePhysicsObject(action.config, action.config.spawnPosition, true, action.config.spawnScale)
}

const receiveDestroyObject = (
  action: ReturnType<typeof WorldNetworkAction.destroyObject>,
  world = Engine.instance.currentWorld
) => {
  const entity = world.getNetworkObject(action.$from, action.networkId)
  if (!entity)
    return console.log(
      `Warning - tried to destroy entity belonging to ${action.$from} with ID ${action.networkId}, but it doesn't exist`
    )
  if (entity === world.localClientEntity)
    return console.warn(`[WorldNetworkActionReceptors]: tried to destroy local client`)
  removeEntity(entity)
}

const receiveRequestAuthorityOverObject = (
  action: typeof WorldNetworkAction.requestAuthorityOverObject.matches._TYPE,
  world = Engine.instance.currentWorld
) => {
  console.log('requestAuthorityOverObjectReceptor', action)
  // Authority request can only be processed by host
  if (Engine.instance.currentWorld.worldNetwork.isHosting === false) return

  const ownerId = action.object.ownerId
  const entity = world.getNetworkObject(ownerId, action.object.networkId)
  if (!entity)
    return console.log(
      `Warning - tried to get entity belonging to ${action.object.ownerId} with ID ${action.object.networkId}, but it doesn't exist`
    )

  // If any custom logic is required in future around which client can request authority over which objects, that can be handled here.
  dispatchAction(
    WorldNetworkAction.transferAuthorityOfObject({
      object: action.object,
      newAuthor: action.requester
    }),
    Engine.instance.currentWorld.worldNetwork.hostId
  )
}

const receiveTransferAuthorityOfObject = (
  action: typeof WorldNetworkAction.transferAuthorityOfObject.matches._TYPE,
  world = Engine.instance.currentWorld
) => {
  console.log('transferAuthorityOfObjectReceptor', action)
  // Transfer authority action can only be originated from host
  if (action.$from !== Engine.instance.currentWorld.worldNetwork.hostId) return

  const ownerId = action.object.ownerId
  const entity = world.getNetworkObject(ownerId, action.object.networkId)
  if (!entity)
    return console.log(
      `Warning - tried to get entity belonging to ${action.object.ownerId} with ID ${action.object.networkId}, but it doesn't exist`
    )

  if (Engine.instance.userId === action.newAuthor) {
    if (getComponent(entity, NetworkObjectOwnedTag))
      return console.warn(`Warning - User ${Engine.instance.userId} already has authority over entity ${entity}.`)

    addComponent(entity, NetworkObjectOwnedTag, {})
  } else {
    removeComponent(entity, NetworkObjectOwnedTag)
  }
}

const receiveSetEquippedObject = (
  action: typeof WorldNetworkAction.setEquippedObject.matches._TYPE,
  world = Engine.instance.currentWorld
) => {
  if (Engine.instance.currentWorld.worldNetwork.isHosting === false) return

  if (action.equip) {
    dispatchAction(
      WorldNetworkAction.requestAuthorityOverObject({
        object: action.object,
        requester: action.$from
      }),
      Engine.instance.currentWorld.worldNetwork.hostId
    )
  } else {
    dispatchAction(
      WorldNetworkAction.requestAuthorityOverObject({
        object: action.object,
        requester: Engine.instance.currentWorld.worldNetwork.hostId
      }),
      Engine.instance.currentWorld.worldNetwork.hostId
    )
  }
}

const receiveSetUserTyping = (
  action: typeof WorldNetworkAction.setUserTyping.matches._TYPE,
  world = Engine.instance.currentWorld
) => {
  getEngineState().usersTyping[action.$from].set(action.typing ? true : none)
}

export const WorldNetworkActionReceptor = {
  removeAllNetworkPeers,
  receiveCreatePeers,
  receiveDestroyPeers,
  receiveSpawnObject,
  receiveSpawnDebugPhysicsObject,
  receiveDestroyObject,
  receiveRequestAuthorityOverObject,
  receiveTransferAuthorityOfObject,
  receiveSetEquippedObject,
  receiveSetUserTyping
}
