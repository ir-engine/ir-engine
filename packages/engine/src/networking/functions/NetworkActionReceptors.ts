import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { NetworkWorldAction } from './NetworkWorldAction'
import matches from 'ts-matches'
import { Engine } from '../../ecs/classes/Engine'
import { NetworkObjectOwnedTag } from '../components/NetworkObjectOwnedTag'
import { dispatchLocal } from './dispatchFrom'
import { isHost } from '../../common/functions/isHost'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { World } from '../../ecs/classes/World'

const removeAllNetworkClients = (world: World, removeSelf = false) => {
  for (const [userId] of world.clients) {
    removeClientNetworkActionReceptor(world, userId, removeSelf)
  }
}

const addClientNetworkActionReceptor = (world: World, userId: UserId, name: string, index: number) => {
  // host adds the client manually during connectToWorld
  if (isHost()) return

  world.clients.set(userId, {
    userId: userId,
    userIndex: index,
    name,
    subscribedChatUpdates: []
  })

  // set utility maps
  world.userIdToUserIndex.set(userId, index)
  world.userIndexToUserId.set(index, userId)
}

const removeClientNetworkActionReceptor = (world: World, userId: UserId, allowRemoveSelf = false) => {
  if (!world.clients.has(userId)) return
  if (allowRemoveSelf && userId === Engine.userId) return

  for (const eid of world.getOwnedNetworkObjects(userId)) {
    const { networkId } = getComponent(eid, NetworkObjectComponent)
    dispatchLocal(NetworkWorldAction.destroyObject({ $from: userId, networkId }))
  }

  const { userIndex } = world.clients.get(userId)!
  world.userIdToUserIndex.delete(userId)
  world.userIndexToUserId.delete(userIndex)
  world.clients.delete(userId)
}

const spawnObjectNetworkActionReceptor = (world: World, action: ReturnType<typeof NetworkWorldAction.spawnObject>) => {
  const isSpawningAvatar = NetworkWorldAction.spawnAvatar.matches.test(action)
  /**
   * When changing location via a portal, the local client entity will be
   * defined when the new world dispatches this action, so ignore it
   */
  if (
    isSpawningAvatar &&
    Engine.userId === action.$from &&
    hasComponent(world.localClientEntity, NetworkObjectComponent)
  ) {
    getComponent(world.localClientEntity, NetworkObjectComponent).networkId = action.networkId
    return
  }
  const params = action.parameters
  const isOwnedByMe = action.$from === Engine.userId
  let entity
  if (isSpawningAvatar && isOwnedByMe) {
    entity = world.localClientEntity
  } else {
    let networkObject = world.getNetworkObject(action.$from, action.networkId)
    if (networkObject) {
      entity = networkObject
    } else if (params?.sceneEntityId) {
      // spawn object from scene data
      const node = world.entityTree.findNodeFromUUID(params.sceneEntityId)
      if (node) entity = node.entity
    } else {
      entity = createEntity()
    }
  }
  if (isOwnedByMe) addComponent(entity, NetworkObjectOwnedTag, {})

  addComponent(entity, NetworkObjectComponent, {
    ownerId: action.$from,
    ownerIndex: action.ownerIndex,
    networkId: action.networkId,
    prefab: action.prefab,
    parameters: action.parameters
  })
}

const destroyObjectNetworkActionReceptor = (
  world: World,
  action: ReturnType<typeof NetworkWorldAction.destroyObject>
) => {
  const entity = world.getNetworkObject(action.$from, action.networkId)
  if (!entity)
    return console.log(
      `Warning - tried to destroy entity belonging to ${action.$from} with ID ${action.networkId}, but it doesn't exist`
    )
  if (entity === world.localClientEntity) return

  const { networkId } = getComponent(entity, NetworkObjectComponent)
  removeEntity(entity)
}

/**
 * @author Gheric Speiginer <github.com/speigg>
 * @author Josh Field <github.com/HexaField>
 */
const createNetworkActionReceptor = (world: World) =>
  world.receptors.push(function NetworkActionReceptor(action) {
    matches(action)
      .when(NetworkWorldAction.createClient.matches, ({ $from, name, index }) =>
        addClientNetworkActionReceptor(world, $from, name, index)
      )
      .when(NetworkWorldAction.destroyClient.matches, ({ $from }) => removeClientNetworkActionReceptor(world, $from))
      .when(NetworkWorldAction.spawnObject.matches, (a) => spawnObjectNetworkActionReceptor(world, a))
      .when(NetworkWorldAction.destroyObject.matches, (a) => destroyObjectNetworkActionReceptor(world, a))
  })

export const NetworkActionReceptors = {
  removeAllNetworkClients,

  addClientNetworkActionReceptor,
  removeClientNetworkActionReceptor,
  spawnObjectNetworkActionReceptor,
  destroyObjectNetworkActionReceptor,

  createNetworkActionReceptor
}
