/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { none } from '@hookstate/core'
import { Quaternion, Vector3 } from 'three'

import { dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import {
  getMutableComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { generatePhysicsObject } from '../../physics/functions/physicsObjectDebugFunctions'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import {
  NetworkObjectAuthorityTag,
  NetworkObjectComponent,
  NetworkObjectOwnedTag
} from '../components/NetworkObjectComponent'
import { WorldNetworkAction } from './WorldNetworkAction'

const receiveSpawnObject = (action: typeof WorldNetworkAction.spawnObject.matches._TYPE) => {
  if (UUIDComponent.entitiesByUUID[action.entityUUID]) return

  console.log('Received spawn object', action)

  const entity = createEntity()
  setComponent(entity, UUIDComponent, action.entityUUID)

  setComponent(entity, NetworkObjectComponent, {
    ownerId: action.$from,
    authorityPeerID: action.$peer,
    networkId: action.networkId
  })

  const isAuthoritativePeer = action.$peer === Engine.instance.peerID

  if (isAuthoritativePeer) {
    dispatchAction(
      WorldNetworkAction.transferAuthorityOfObject({
        ownerId: action.$from,
        networkId: action.networkId,
        newAuthority: Engine.instance.peerID
      })
    )
  }

  const isOwnedByMe = action.$from === Engine.instance.userId
  if (isOwnedByMe) {
    setComponent(entity, NetworkObjectOwnedTag)
  }

  const position = new Vector3()
  const rotation = new Quaternion()

  if (action.position) position.copy(action.position)
  if (action.rotation) rotation.copy(action.rotation)

  setComponent(entity, TransformComponent, { position, rotation })
}

const receiveRegisterSceneObject = (action: typeof WorldNetworkAction.registerSceneObject.matches._TYPE) => {
  const entity = UUIDComponent.entitiesByUUID[action.objectUuid]

  if (!entity) return console.warn('[WorldNetworkAction] Tried to register a scene entity that does not exist', action)

  setComponent(entity, NetworkObjectComponent, {
    ownerId: action.$from,
    authorityPeerID: action.$peer ?? Engine.instance.peerID,
    networkId: action.networkId
  })

  const isOwnedByMe = action.$from === Engine.instance.userId
  if (isOwnedByMe) {
    setComponent(entity, NetworkObjectOwnedTag)
    setComponent(entity, NetworkObjectAuthorityTag)
  } else {
    if (hasComponent(entity, NetworkObjectOwnedTag)) removeComponent(entity, NetworkObjectOwnedTag)
    if (hasComponent(entity, NetworkObjectAuthorityTag)) removeComponent(entity, NetworkObjectAuthorityTag)
  }
}

const receiveSpawnDebugPhysicsObject = (action: typeof WorldNetworkAction.spawnDebugPhysicsObject.matches._TYPE) => {
  generatePhysicsObject(action.config, action.config.spawnPosition, true, action.config.spawnScale)
}

const receiveDestroyObject = (action: ReturnType<typeof WorldNetworkAction.destroyObject>) => {
  const entity = UUIDComponent.entitiesByUUID[action.entityUUID]
  if (!entity) return
  removeEntity(entity)
  const idx = Engine.instance.store.actions.cached.findIndex(
    (a) => WorldNetworkAction.spawnObject.matches.test(a) && a.entityUUID === action.entityUUID
  )
  if (idx !== -1) Engine.instance.store.actions.cached.splice(idx, 1)
}

const receiveRequestAuthorityOverObject = (
  action: typeof WorldNetworkAction.requestAuthorityOverObject.matches._TYPE
) => {
  console.log('receiveRequestAuthorityOverObject', action, Engine.instance.userId)
  // Authority request can only be processed by owner
  if (Engine.instance.userId !== action.ownerId) return

  const ownerId = action.ownerId
  const entity = Engine.instance.getNetworkObject(ownerId, action.networkId)
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
  action: typeof WorldNetworkAction.transferAuthorityOfObject.matches._TYPE
) => {
  console.log('receiveTransferAuthorityOfObject', action)
  // Authority request can only be processed by owner
  if (action.$from !== action.ownerId) return

  const ownerId = action.ownerId
  const entity = Engine.instance.getNetworkObject(ownerId, action.networkId)
  if (!entity)
    return console.log(
      `Warning - tried to get entity belonging to ${action.ownerId} with ID ${action.networkId}, but it doesn't exist`
    )

  getMutableComponent(entity, NetworkObjectComponent).authorityPeerID.set(action.newAuthority)

  if (Engine.instance.peerID === action.newAuthority) {
    if (hasComponent(entity, NetworkObjectAuthorityTag))
      return console.warn(`Warning - User ${Engine.instance.userId} already has authority over entity ${entity}.`)

    setComponent(entity, NetworkObjectAuthorityTag)
  } else {
    if (hasComponent(entity, NetworkObjectAuthorityTag)) removeComponent(entity, NetworkObjectAuthorityTag)
  }
}

const receiveSetUserTyping = (action: typeof WorldNetworkAction.setUserTyping.matches._TYPE) => {
  getMutableState(EngineState).usersTyping[action.$from].set(action.typing ? true : none)
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
