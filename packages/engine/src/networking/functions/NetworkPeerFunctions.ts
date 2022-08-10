import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { getState } from '@xrengine/hyperflux'
import { Action } from '@xrengine/hyperflux/functions/ActionFunctions'
import { none } from '@xrengine/hyperflux/functions/StateFunctions'

import { Engine } from '../../ecs/classes/Engine'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { removeEntity } from '../../ecs/functions/EntityFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Network } from '../classes/Network'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { WorldState } from '../interfaces/WorldState'
import { WorldNetworkAction } from './WorldNetworkAction'
import { WorldNetworkActionReceptor } from './WorldNetworkActionReceptor'

function createPeer(
  network: Network,
  userId: UserId,
  index: number,
  name: string,
  world = Engine.instance.currentWorld
) {
  console.log('[Network]: Create Peer', network.topic, userId, index, name)

  network.userIdToUserIndex.set(userId, index)
  network.userIndexToUserId.set(index, userId)

  network.peers.set(userId, {
    userId: userId,
    index: index
  })

  const worldState = getState(WorldState)
  worldState.userNames[userId].set(name)
}

function destroyPeer(network: Network, userId: UserId, world = Engine.instance.currentWorld) {
  console.log('[Network]: Destroy Peer', network.topic, userId)
  if (!network.peers.has(userId))
    return console.warn(`[WorldNetworkActionReceptors]: tried to remove client with userId ${userId} that doesn't exit`)
  if (userId === Engine.instance.userId)
    return console.warn(`[WorldNetworkActionReceptors]: tried to remove local client`)

  network.peers.delete(userId)

  /**
   * if no other connections exist for this user, and this action is occurring on the world network,
   * we want to remove them from world.users
   */
  if (network.topic === 'world') {
    const remainingPeersForDisconnectingUser = Object.entries(world.networks.entries())
      .map(([id, network]: [string, Network]) => {
        return network.peers.has(userId)
      })
      .filter((peer) => !!peer)

    if (!remainingPeersForDisconnectingUser.length) {
      Engine.instance.store.actions.cached = Engine.instance.store.actions.cached.filter((a) => a.$from !== userId)
      for (const eid of world.getOwnedNetworkObjects(userId)) removeEntity(eid)
    }

    clearCachedActionsForUser(network, userId)
    clearActionsHistoryForUser(userId)
  }
}

const destroyAllPeers = (network: Network, world = Engine.instance.currentWorld) => {
  for (const [userId] of network.peers) NetworkPeerFunctions.destroyPeer(network, userId, world)
}

function clearActionsHistoryForUser(userId: UserId) {
  for (const action of Engine.instance.store.actions.history) {
    if (action.$from === userId) {
      Engine.instance.store.actions.knownUUIDs.delete(action.$uuid)
    }
  }
}

function clearCachedActionsForUser(network: Network, userId: UserId) {
  const cached = Engine.instance.store.actions.cached
  for (const action of [...cached]) {
    if (action.$from === userId) {
      const idx = cached.indexOf(action)
      cached.splice(idx, 1)
    }
  }
}

function getCachedActionsForUser(network: Network, toUserId: UserId) {
  // send all cached and outgoing actions to joining user
  const cachedActions = [] as Required<Action>[]
  for (const action of Engine.instance.store.actions.cached as Array<
    ReturnType<typeof WorldNetworkAction.spawnAvatar>
  >) {
    if (action.$from === toUserId) continue
    if (action.$to === 'all' || action.$to === toUserId) cachedActions.push({ ...action, $stack: undefined! })
  }

  return cachedActions
}

export const NetworkPeerFunctions = {
  createPeer,
  destroyPeer,
  destroyAllPeers,
  clearCachedActionsForUser,
  getCachedActionsForUser
}
