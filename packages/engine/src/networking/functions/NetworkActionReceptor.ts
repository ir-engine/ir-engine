import matches from 'ts-matches'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { addActionReceptor, dispatchAction } from '@xrengine/hyperflux'

// import { generatePhysicsObject } from '@xrengine/projects/default-project/PhysicsSimulationTestSystem'
import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { NetworkObjectAuthorityTag } from '../components/NetworkObjectAuthorityTag'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { NetworkWorldAction } from './NetworkWorldAction'

const removeAllNetworkClients = (world: World, removeSelf = false) => {
  for (const [userId] of world.clients) {
    removeClient(world, userId, removeSelf)
  }
}

const addClient = (world: World, userId: UserId, name: string, index: number) => {
  // host adds the client manually during connectToWorld
  if (world.isHosting) return

  // set utility maps - override if moving through portal
  world.userIdToUserIndex.set(userId, index)
  world.userIndexToUserId.set(index, userId)

  if (world.clients.has(userId))
    return console.log(`[NetworkActionReceptors]: client with id ${userId} and name ${name} already exists. ignoring.`)

  world.clients.set(userId, {
    userId: userId,
    userIndex: index,
    name,
    subscribedChatUpdates: []
  })
}

const removeClient = (world: World, userId: UserId, allowRemoveSelf = false) => {
  if (!world.clients.has(userId))
    return console.warn(`[NetworkActionReceptors]: tried to remove client with userId ${userId} that doesn't exit`)
  if (!allowRemoveSelf && userId === Engine.userId)
    return console.warn(`[NetworkActionReceptors]: tried to remove local client`)

  for (const eid of world.getOwnedNetworkObjects(userId)) {
    const { networkId } = getComponent(eid, NetworkObjectComponent)
    world.store.actions.incoming.push(NetworkWorldAction.destroyObject({ $from: userId, networkId }))
  }

  const { userIndex } = world.clients.get(userId)!
  world.userIdToUserIndex.delete(userId)
  world.userIndexToUserId.delete(userIndex)
  world.clients.delete(userId)
  world.namedEntities.delete(userId)
}

const spawnObject = (world: World, action: ReturnType<typeof NetworkWorldAction.spawnObject>) => {
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
    const networkComponent = getComponent(world.localClientEntity, NetworkObjectComponent)
    console.log(
      `[NetworkActionReceptors]: Successfully updated local client entity's networkId from ${networkComponent.networkId} to ${action.networkId}`
    )
    networkComponent.networkId = action.networkId
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
      const node = world.entityTree.uuidNodeMap.get(params.sceneEntityId)
      if (node) entity = node.entity
    } else {
      entity = createEntity()
    }
  }
  if (isOwnedByMe) addComponent(entity, NetworkObjectAuthorityTag, {})

  addComponent(entity, NetworkObjectComponent, {
    ownerId: action.$from,
    networkId: action.networkId,
    prefab: action.prefab,
    parameters: action.parameters,
    lastTick: 0
  })
}

const spawnDebugPhysicsObject = (
  world: World,
  action: ReturnType<typeof NetworkWorldAction.spawnDebugPhysicsObject>
) => {
  // generatePhysicsObject(action.config, action.config.spawnPosition, true, action.config.spawnScale)
}

const destroyObject = (world: World, action: ReturnType<typeof NetworkWorldAction.destroyObject>) => {
  const entity = world.getNetworkObject(action.$from, action.networkId)
  if (!entity)
    return console.log(
      `Warning - tried to destroy entity belonging to ${action.$from} with ID ${action.networkId}, but it doesn't exist`
    )
  if (entity === world.localClientEntity) return console.warn(`[NetworkActionReceptors]: tried to destroy local client`)
  removeEntity(entity)
}

const requestAuthorityOverObject = (
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
  dispatchAction(
    world.store,
    NetworkWorldAction.transferAuthorityOfObject({
      object: action.object,
      newAuthor: action.requester
    })
  )
}

const transferAuthorityOfObject = (
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

const setEquippedObject = (world: World, action: ReturnType<typeof NetworkWorldAction.setEquippedObject>) => {
  if (Engine.currentWorld.isHosting === false) return

  if (action.equip) {
    dispatchAction(
      Engine.store,
      NetworkWorldAction.requestAuthorityOverObject({
        object: action.object,
        requester: action.$from
      })
    )
  } else {
    dispatchAction(
      Engine.store,
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
  addActionReceptor(world.store, function NetworkActionReceptor(action) {
    matches(action)
      .when(NetworkWorldAction.tickSync.matchesFromUser(world.hostId), ({ tick }) => {
        world.fixedTick = tick
      })
      .when(NetworkWorldAction.createClient.matches, ({ $from, name, index }) => addClient(world, $from, name, index))
      .when(NetworkWorldAction.destroyClient.matches, ({ $from }) => removeClient(world, $from))
      .when(NetworkWorldAction.spawnObject.matches, (a) => spawnObject(world, a))
      .when(NetworkWorldAction.spawnDebugPhysicsObject.matches, (a) => spawnDebugPhysicsObject(world, a))
      .when(NetworkWorldAction.destroyObject.matches, (a) => destroyObject(world, a))
      .when(NetworkWorldAction.requestAuthorityOverObject.matches, (a) => requestAuthorityOverObject(world, a))
      .when(NetworkWorldAction.transferAuthorityOfObject.matches, (a) => transferAuthorityOfObject(world, a))
      .when(NetworkWorldAction.setEquippedObject.matches, (a) => setEquippedObject(world, a))
  })

export const NetworkActionReceptor = {
  removeAllNetworkClients,

  addClient,
  removeClient,
  spawnObject,
  spawnDebugPhysicsObject,
  destroyObject,
  requestAuthorityOverObject,
  transferAuthorityOfObject,
  setEquippedObject,

  createNetworkActionReceptor
}
