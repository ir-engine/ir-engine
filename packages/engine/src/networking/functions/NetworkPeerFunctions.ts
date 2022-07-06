import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { Engine } from '../../ecs/classes/Engine'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { Network } from '../classes/Network'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { WorldNetworkAction } from './WorldNetworkAction'
import { WorldNetworkActionReceptor } from './WorldNetworkActionReceptor'

const createPeer = (
  network: Network,
  userId: UserId,
  index: number,
  name: string,
  world = Engine.instance.currentWorld
) => {
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

const destroyPeer = (
  network: Network,
  userId: UserId,
  allowRemoveSelf = false,
  world = Engine.instance.currentWorld
) => {
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
}

const destroyAllPeers = (network: Network, removeSelf = false, world = Engine.instance.currentWorld) => {
  for (const [userId] of network.peers) NetworkPeerFunctions.destroyPeer(network, userId, removeSelf, world)
}

export const NetworkPeerFunctions = {
  createPeer,
  destroyPeer,
  destroyAllPeers
}
