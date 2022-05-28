import { none } from '@speigg/hookstate'

import { createActionQueue, dispatchAction } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { useEngineState } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { generatePhysicsObject } from '../../physics/functions/physicsObjectDebugFunctions'
import { NetworkObjectAuthorityTag } from '../components/NetworkObjectAuthorityTag'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { NetworkWorldAction } from './NetworkWorldAction'

const removeAllNetworkClients = (removeSelf = false, world = Engine.instance.currentWorld) => {
  for (const [userId] of world.clients) {
    destroyClientReceptor(NetworkWorldAction.destroyClient({ $from: userId }), removeSelf, world)
  }
}

const createClientReceptor = (
  action: typeof NetworkWorldAction.createClient.matches._TYPE,
  world = Engine.instance.currentWorld
) => {
  // set utility maps - override if moving through portal
  world.userIdToUserIndex.set(action.$from, action.index)
  world.userIndexToUserId.set(action.index, action.$from)

  if (world.clients.has(action.$from))
    return console.log(
      `[NetworkActionReceptors]: client with id ${action.$from} and name ${action.name} already exists. ignoring.`
    )

  world.clients.set(action.$from, {
    userId: action.$from,
    index: action.index,
    name: action.name,
    subscribedChatUpdates: []
  })
}

const destroyClientReceptor = (
  action: typeof NetworkWorldAction.destroyClient.matches._TYPE,
  allowRemoveSelf = false,
  world = Engine.instance.currentWorld
) => {
  if (!world.clients.has(action.$from))
    return console.warn(
      `[NetworkActionReceptors]: tried to remove client with userId ${action.$from} that doesn't exit`
    )
  if (!allowRemoveSelf && action.$from === Engine.instance.userId)
    return console.warn(`[NetworkActionReceptors]: tried to remove local client`)

  for (const eid of world.getOwnedNetworkObjects(action.$from)) {
    const { networkId } = getComponent(eid, NetworkObjectComponent)
    const destroyObjectAction = NetworkWorldAction.destroyObject({ $from: action.$from, networkId })
    destroyObjectReceptor(destroyObjectAction, world)
  }

  const { index: userIndex } = world.clients.get(action.$from)!
  world.userIdToUserIndex.delete(action.$from)
  world.userIndexToUserId.delete(userIndex)
  world.clients.delete(action.$from)
  for (const topic of Object.keys(Engine.instance.store.actions.cached)) {
    Engine.instance.store.actions.cached[topic] = Engine.instance.store.actions.cached[topic].filter(
      (a) => a.$from !== action.$from
    )
  }
}

const spawnObjectReceptor = (
  action: typeof NetworkWorldAction.spawnObject.matches._TYPE,
  world = Engine.instance.currentWorld
) => {
  const isSpawningAvatar = NetworkWorldAction.spawnAvatar.matches.test(action)
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
      `[NetworkActionReceptors]: Successfully updated local client entity's networkId from ${networkComponent.networkId} to ${action.networkId}`
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
  if (isOwnedByMe) addComponent(entity, NetworkObjectAuthorityTag, {})

  addComponent(entity, NetworkObjectComponent, {
    ownerId: action.$from,
    networkId: action.networkId,
    prefab: action.prefab,
    parameters: action.parameters
  })
}

const spawnDebugPhysicsObjectReceptor = (
  action: typeof NetworkWorldAction.spawnDebugPhysicsObject.matches._TYPE,
  world = Engine.instance.currentWorld
) => {
  generatePhysicsObject(action.config, action.config.spawnPosition, true, action.config.spawnScale)
}

const destroyObjectReceptor = (
  action: ReturnType<typeof NetworkWorldAction.destroyObject>,
  world = Engine.instance.currentWorld
) => {
  const entity = world.getNetworkObject(action.$from, action.networkId)
  if (!entity)
    return console.log(
      `Warning - tried to destroy entity belonging to ${action.$from} with ID ${action.networkId}, but it doesn't exist`
    )
  if (entity === world.localClientEntity) return console.warn(`[NetworkActionReceptors]: tried to destroy local client`)
  removeEntity(entity)
}

const requestAuthorityOverObjectReceptor = (
  action: typeof NetworkWorldAction.requestAuthorityOverObject.matches._TYPE,
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
    NetworkWorldAction.transferAuthorityOfObject({
      object: action.object,
      newAuthor: action.requester
    }),
    [Engine.instance.currentWorld.worldNetwork.hostId]
  )
}

const transferAuthorityOfObjectReceptor = (
  action: typeof NetworkWorldAction.transferAuthorityOfObject.matches._TYPE,
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
    if (getComponent(entity, NetworkObjectAuthorityTag))
      return console.warn(`Warning - User ${Engine.instance.userId} already has authority over entity ${entity}.`)

    addComponent(entity, NetworkObjectAuthorityTag, {})
  } else {
    removeComponent(entity, NetworkObjectAuthorityTag)
  }
}

const setEquippedObjectReceptor = (
  action: typeof NetworkWorldAction.setEquippedObject.matches._TYPE,
  world = Engine.instance.currentWorld
) => {
  if (Engine.instance.currentWorld.worldNetwork.isHosting === false) return

  if (action.equip) {
    dispatchAction(
      NetworkWorldAction.requestAuthorityOverObject({
        object: action.object,
        requester: action.$from
      }),
      [Engine.instance.currentWorld.worldNetwork.hostId]
    )
  } else {
    dispatchAction(
      NetworkWorldAction.requestAuthorityOverObject({
        object: action.object,
        requester: Engine.instance.currentWorld.worldNetwork.hostId
      }),
      [Engine.instance.currentWorld.worldNetwork.hostId]
    )
  }
}

const setUserTypingReceptor = (
  action: typeof NetworkWorldAction.setUserTyping.matches._TYPE,
  world = Engine.instance.currentWorld
) => {
  useEngineState().usersTyping[action.$from].set(action.typing ? true : none)
}

/**
 * @author Gheric Speiginer <github.com/speigg>
 * @author Josh Field <github.com/HexaField>
 */
const createNetworkActionReceptor = (world: World) => {
  const createClientQueue = createActionQueue(NetworkWorldAction.createClient.matches)
  const destroyClientQueue = createActionQueue(NetworkWorldAction.destroyClient.matches)
  const spawnObjectQueue = createActionQueue(NetworkWorldAction.spawnObject.matches)
  const spawnDebugPhysicsObjectQueue = createActionQueue(NetworkWorldAction.spawnDebugPhysicsObject.matches)
  const destroyObjectQueue = createActionQueue(NetworkWorldAction.destroyObject.matches)
  const requestAuthorityOverObjectQueue = createActionQueue(NetworkWorldAction.requestAuthorityOverObject.matches)
  const transferAuthorityOfObjectQueue = createActionQueue(NetworkWorldAction.transferAuthorityOfObject.matches)
  const setEquippedObjectQueue = createActionQueue(NetworkWorldAction.setEquippedObject.matches)
  const setUserTypingQueue = createActionQueue(NetworkWorldAction.setUserTyping.matches)

  return () => {
    for (const action of createClientQueue()) createClientReceptor(action)
    for (const action of destroyClientQueue()) destroyClientReceptor(action)
    for (const action of spawnObjectQueue()) spawnObjectReceptor(action)
    for (const action of spawnDebugPhysicsObjectQueue()) spawnDebugPhysicsObjectReceptor(action)
    for (const action of destroyObjectQueue()) destroyObjectReceptor(action)
    for (const action of requestAuthorityOverObjectQueue()) requestAuthorityOverObjectReceptor(action)
    for (const action of transferAuthorityOfObjectQueue()) transferAuthorityOfObjectReceptor(action)
    for (const action of setEquippedObjectQueue()) setEquippedObjectReceptor(action)
    for (const action of setUserTypingQueue()) setUserTypingReceptor(action)
  }
}

export const NetworkActionReceptor = {
  removeAllNetworkClients,
  createClientReceptor,
  destroyClientReceptor,
  spawnObjectReceptor,
  spawnDebugPhysicsObjectReceptor,
  destroyObjectReceptor,
  requestAuthorityOverObjectReceptor,
  transferAuthorityOfObjectReceptor,
  setEquippedObjectReceptor,
  setUserTypingReceptor,
  createNetworkActionReceptor
}
