import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Action } from '@xrengine/hyperflux/functions/ActionFunctions'

import { Engine } from '../../ecs/classes/Engine'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Network } from '../classes/Network'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { WorldNetworkAction } from './WorldNetworkAction'
import { WorldNetworkActionReceptor } from './WorldNetworkActionReceptor'

function createPeer(
  network: Network,
  userId: UserId,
  index: number,
  name: string,
  world = Engine.instance.currentWorld
) {
  if (network.peers.has(userId))
    return console.log(
      `[WorldNetworkActionReceptors]: peer with id ${userId} and name ${name} already exists. ignoring.`
    )

  network.userIdToUserIndex.set(userId, index)
  network.userIndexToUserId.set(index, userId)

  network.peers.set(userId, {
    userId: userId,
    index: index
  })

  if (!world.users.get(userId))
    world.users.set(userId, {
      userId: userId,
      name: name
    })
}

function destroyPeer(network: Network, userId: UserId, allowRemoveSelf = false, world = Engine.instance.currentWorld) {
  if (!network.peers.has(userId))
    return console.warn(`[WorldNetworkActionReceptors]: tried to remove client with userId ${userId} that doesn't exit`)
  if (!allowRemoveSelf && userId === Engine.instance.userId)
    return console.warn(`[WorldNetworkActionReceptors]: tried to remove local client`)

  for (const eid of world.getOwnedNetworkObjects(userId)) {
    const { networkId } = getComponent(eid, NetworkObjectComponent)
    const destroyObjectAction = WorldNetworkAction.destroyObject({ $from: userId, networkId })
    WorldNetworkActionReceptor.receiveDestroyObject(destroyObjectAction, world)
  }

  const { index: userIndex } = network.peers.get(userId)!
  network.userIdToUserIndex.delete(userId)
  network.userIndexToUserId.delete(userIndex)
  network.peers.delete(userId)

  Engine.instance.store.actions.cached[network.topic] = Engine.instance.store.actions.cached[network.topic].filter(
    (a) => a.$from !== userId
  )

  /**
   * if no other connections exist for this user exist, we want to remove them from world.users
   */
  const remainingPeersForDisconnectingUser = Object.entries(world.networks.entries())
    .map(([id, network]: [string, Network]) => {
      return network.peers.has(userId)
    })
    .filter((peer) => !!peer)

  if (!remainingPeersForDisconnectingUser.length) {
    world.users.delete(userId)
  }

  clearCachedActionsForUser(network, userId)
  clearActionsHistoryForUser(userId)
}

const destroyAllPeers = (network: Network, removeSelf = false, world = Engine.instance.currentWorld) => {
  for (const [userId] of network.peers) NetworkPeerFunctions.destroyPeer(network, userId, removeSelf, world)
}

function clearActionsHistoryForUser(userId: UserId) {
  for (const [uuid, action] of Engine.instance.store.actions.incomingHistory) {
    if (action.$from === userId) {
      Engine.instance.store.actions.incomingHistory.delete(uuid)
      Engine.instance.store.actions.incomingHistoryUUIDs.delete(action.$uuid)
    }
  }
}

function clearCachedActionsForUser(network: Network, userId: UserId) {
  const cached = Engine.instance.store.actions.cached[network.topic]
  for (const action of [...cached]) {
    if (action.$from === userId) {
      const idx = cached.indexOf(action)
      cached.splice(idx, 1)
    }
  }
}

function getCachedActions(network: Network, joinedUserId: UserId) {
  const world = Engine.instance.currentWorld

  // send all cached and outgoing actions to joining user
  const cachedActions = [] as Required<Action>[]
  for (const action of Engine.instance.store.actions.cached[network.topic] as Array<
    ReturnType<typeof WorldNetworkAction.spawnAvatar>
  >) {
    // we may have a need to remove the check for the prefab type to enable this to work for networked objects too
    if (action.type === 'network.SPAWN_OBJECT' && action.prefab === 'avatar') {
      const ownerId = action.$from
      if (ownerId) {
        const entity = world.getNetworkObject(ownerId, action.networkId)
        if (typeof entity !== 'undefined') {
          const transform = getComponent(entity, TransformComponent)
          action.parameters.position = transform.position
          action.parameters.rotation = transform.rotation
        }
      }
    }
    if (action.$to === 'all' || action.$to === joinedUserId) cachedActions.push({ ...action, $stack: undefined! })
  }

  return cachedActions
}

export const NetworkPeerFunctions = {
  createPeer,
  destroyPeer,
  destroyAllPeers,
  clearCachedActionsForUser,
  getCachedActions
}
