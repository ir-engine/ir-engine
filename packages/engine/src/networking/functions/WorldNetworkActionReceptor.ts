import { none } from '@hookstate/core'

import { dispatchAction } from '@xrengine/hyperflux'

import { createQuaternionProxy, createVector3Proxy } from '../../common/proxies/three'
import { Engine } from '../../ecs/classes/Engine'
import { getEngineState } from '../../ecs/classes/EngineState'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { generatePhysicsObject } from '../../physics/functions/physicsObjectDebugFunctions'
import { setTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { Network, NetworkTopics } from '../classes/Network'
import { NetworkObjectAuthorityTag } from '../components/NetworkObjectAuthorityTag'
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
    authorityUserId: action.$from,
    networkId: action.networkId
  })

  const isOwnedByMe = action.$from === Engine.instance.userId
  if (isOwnedByMe) {
    addComponent(entity, NetworkObjectOwnedTag, true)
    addComponent(entity, NetworkObjectAuthorityTag, true)
  }

  const transform = setTransformComponent(entity)
  action.position && transform.position.copy(action.position)
  action.rotation && transform.rotation.copy(action.rotation)
  transform.scale.setScalar(1)

  // set cached action refs to the new components so they stay up to date with future movements
  action.position = transform.position
  action.rotation = transform.rotation
}

const receiveRegisterSceneObject = (
  action: typeof WorldNetworkAction.registerSceneObject.matches._TYPE,
  world = Engine.instance.currentWorld
) => {
  const entity = world.entityTree.uuidNodeMap.get(action.objectUuid)?.entity!

  addComponent(entity, NetworkObjectComponent, {
    ownerId: action.$from,
    authorityUserId: action.$from,
    networkId: action.networkId
  })

  const isOwnedByMe = action.$from === Engine.instance.userId
  if (isOwnedByMe) {
    addComponent(entity, NetworkObjectOwnedTag, true)
    addComponent(entity, NetworkObjectAuthorityTag, true)
  }
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
  // Authority request can only be processed by owner
  if (Engine.instance.userId !== action.ownerId) return

  const ownerId = action.ownerId
  const entity = world.getNetworkObject(ownerId, action.networkId)
  if (!entity)
    return console.log(
      `Warning - tried to get entity belonging to ${action.ownerId} with ID ${action.networkId}, but it doesn't exist`
    )

  /**
   * Custom logic for disallowing transfer goes here
   */

  dispatchAction(
    WorldNetworkAction.transferAuthorityOfObject({
      ownerId: action.ownerId,
      networkId: action.networkId,
      newAuthority: action.newAuthority
    })
  )
}

const receiveTransferAuthorityOfObject = (
  action: typeof WorldNetworkAction.transferAuthorityOfObject.matches._TYPE,
  world = Engine.instance.currentWorld
) => {
  // Authority request can only be processed by owner
  if (action.$from !== action.ownerId) return

  const ownerId = action.ownerId
  const entity = world.getNetworkObject(ownerId, action.networkId)
  if (!entity)
    return console.log(
      `Warning - tried to get entity belonging to ${action.ownerId} with ID ${action.networkId}, but it doesn't exist`
    )

  getComponent(entity, NetworkObjectComponent).authorityUserId = action.newAuthority

  if (Engine.instance.userId === action.newAuthority) {
    if (hasComponent(entity, NetworkObjectAuthorityTag))
      return console.warn(`Warning - User ${Engine.instance.userId} already has authority over entity ${entity}.`)

    addComponent(entity, NetworkObjectAuthorityTag, true)
  } else {
    if (hasComponent(entity, NetworkObjectAuthorityTag)) removeComponent(entity, NetworkObjectAuthorityTag)
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
  receiveRegisterSceneObject,
  receiveSpawnDebugPhysicsObject,
  receiveDestroyObject,
  receiveRequestAuthorityOverObject,
  receiveTransferAuthorityOfObject,
  receiveSetUserTyping
}
