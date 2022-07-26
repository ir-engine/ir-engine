import { none } from '@speigg/hookstate'

import { dispatchAction } from '@xrengine/hyperflux'

import { createQuaternionProxy, createVector3Proxy } from '../../common/proxies/three'
import { Engine } from '../../ecs/classes/Engine'
import { getEngineState } from '../../ecs/classes/EngineState'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { generatePhysicsObject } from '../../physics/functions/physicsObjectDebugFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Network, NetworkTopics } from '../classes/Network'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { NetworkObjectOwnedTag } from '../components/NetworkObjectOwnedTag'
import { WorldNetworkAction } from './WorldNetworkAction'

const receiveSpawnObject = (
  action: typeof WorldNetworkAction.spawnObject.matches._TYPE,
  world = Engine.instance.currentWorld
) => {
  const entity = createEntity()

  addComponent(entity, NetworkObjectComponent, {
    ownerId: action.$from,
    networkId: action.networkId
  })

  const isOwnedByMe = action.$from === Engine.instance.userId
  if (isOwnedByMe) addComponent(entity, NetworkObjectOwnedTag, {})

  const position = createVector3Proxy(TransformComponent.position, entity)
  const rotation = createQuaternionProxy(TransformComponent.rotation, entity)
  const scale = createVector3Proxy(TransformComponent.scale, entity)

  const transform = addComponent(entity, TransformComponent, { position, rotation, scale })
  action.position && transform.position.copy(action.position)
  action.rotation && transform.rotation.copy(action.rotation)
  transform.scale.setScalar(1)

  // set cached action refs to the new components so they stay up to date with future movements
  action.position = position
  action.rotation = rotation
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
    })
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
      })
    )
  } else {
    dispatchAction(
      WorldNetworkAction.requestAuthorityOverObject({
        object: action.object,
        requester: Engine.instance.currentWorld.worldNetwork.hostId
      })
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
  receiveSpawnObject,
  receiveSpawnDebugPhysicsObject,
  receiveDestroyObject,
  receiveRequestAuthorityOverObject,
  receiveTransferAuthorityOfObject,
  receiveSetEquippedObject,
  receiveSetUserTyping
}
