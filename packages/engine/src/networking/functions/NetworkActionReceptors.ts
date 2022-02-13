import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { NetworkWorldAction } from './NetworkWorldAction'
import matches from 'ts-matches'
import { Engine } from '../../ecs/classes/Engine'
import { NetworkObjectAuthorityTag } from '../components/NetworkObjectAuthorityTag'
import { dispatchFrom, dispatchLocal } from './dispatchFrom'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { World } from '../../ecs/classes/World'

const removeAllNetworkClients = (world: World, removeSelf = false) => {
  for (const [userId] of world.clients) {
    removeClientNetworkActionReceptor(world, userId, removeSelf)
  }
}

const addClientNetworkActionReceptor = (world: World, userId: UserId, name: string, index: number) => {
  // host adds the client manually during connectToWorld
  if (world.isHosting) return

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
  if (isOwnedByMe) addComponent(entity, NetworkObjectAuthorityTag, {})

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

const requestAuthorityOverObjectNetworkActionReceptor = (
  world: World,
  action: ReturnType<typeof NetworkWorldAction.requestAuthorityOverObject>
) => {
  // Authority request can only be processed by host
  if (Engine.currentWorld.isHosting === false) return

  const ownerId = action.object.ownerId
  const entity = world.getNetworkObject(ownerId, action.object.networkId)
  if (!entity)
    return console.log(
      `Warning - tried to get entity belonging to ${action.object.ownerId} with ID ${action.object.networkId}, but it doesn't exist`
    )

  // If any custom logic is required in future around which client can request authority over which objects, that can be handled here.
  dispatchFrom(Engine.userId, () =>
    NetworkWorldAction.transferAuthorityOfObject({
      object: action.object,
      newAuthor: action.requester
    })
  )
}

const transferAuthorityOfObjectNetworkActionReceptor = (
  world: World,
  action: ReturnType<typeof NetworkWorldAction.transferAuthorityOfObject>
) => {
  // Transfer authority action can only be originated from host
  if (action.$from !== Engine.currentWorld.hostId) return

  const ownerId = action.object.ownerId
  const entity = world.getNetworkObject(ownerId, action.object.networkId)
  if (!entity)
    return console.log(
      `Warning - tried to get entity belonging to ${action.object.ownerId} with ID ${action.object.networkId}, but it doesn't exist`
    )

  if (Engine.userId === action.newAuthor) {
    if (getComponent(entity, NetworkObjectAuthorityTag))
      return console.warn(`Warning - User ${Engine.userId} already has authority over entity ${entity}.`)

    addComponent(entity, NetworkObjectAuthorityTag, {})
  } else {
    removeComponent(entity, NetworkObjectAuthorityTag)
  }
}

const setEquippedObjectNetworkActionReceptor = (
  world: World,
  action: ReturnType<typeof NetworkWorldAction.setEquippedObject>
) => {
  if (Engine.currentWorld.isHosting === false) return

  if (action.equip) {
    dispatchLocal(
      NetworkWorldAction.requestAuthorityOverObject({
        object: action.object,
        requester: action.$from
      })
    )
  } else {
    dispatchLocal(
      NetworkWorldAction.requestAuthorityOverObject({
        object: action.object,
        requester: Engine.currentWorld.hostId
      })
    )
  }
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
      .when(NetworkWorldAction.requestAuthorityOverObject.matches, (a) =>
        requestAuthorityOverObjectNetworkActionReceptor(world, a)
      )
      .when(NetworkWorldAction.transferAuthorityOfObject.matches, (a) =>
        transferAuthorityOfObjectNetworkActionReceptor(world, a)
      )
      .when(NetworkWorldAction.setEquippedObject.matches, (a) => setEquippedObjectNetworkActionReceptor(world, a))
  })

export const NetworkActionReceptors = {
  removeAllNetworkClients,

  addClientNetworkActionReceptor,
  removeClientNetworkActionReceptor,
  spawnObjectNetworkActionReceptor,
  destroyObjectNetworkActionReceptor,
  requestAuthorityOverObjectNetworkActionReceptor,
  transferAuthorityOfObjectNetworkActionReceptor,
  setEquippedObjectNetworkActionReceptor,

  createNetworkActionReceptor
}
