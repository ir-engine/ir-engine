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

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { dispatchAction, getMutableState, none } from '@etherealengine/hyperflux'

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
import {
  NetworkObjectAuthorityTag,
  NetworkObjectComponent,
  NetworkObjectOwnedTag
} from '../components/NetworkObjectComponent'
import { WorldNetworkAction } from './WorldNetworkAction'

type SpawnObjectType = {
  $from: UserId
  $peer: PeerID
  entityUUID: EntityUUID
  networkId: NetworkId
  prefab: string
}

const receiveSpawnObject = (args: SpawnObjectType) => {
  console.log('Received spawn object', args)

  const entity = UUIDComponent.entitiesByUUID[args.entityUUID] ?? createEntity()

  setComponent(entity, UUIDComponent, args.entityUUID)

  setComponent(entity, NetworkObjectComponent, {
    ownerId: args.$from,
    authorityPeerID: args.$peer,
    networkId: args.networkId
  })
}

const receiveSpawnDebugPhysicsObject = (action: typeof WorldNetworkAction.spawnDebugPhysicsObject.matches._TYPE) => {
  generatePhysicsObject(action.config, action.config.spawnPosition, true, action.config.spawnScale)
}

const receiveRequestAuthorityOverObject = (
  action: typeof WorldNetworkAction.requestAuthorityOverObject.matches._TYPE
) => {
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
  // Authority request can only be processed by owner
  if (action.$from !== action.ownerId) return

  const entity = Engine.instance.getNetworkObject(action.ownerId, action.networkId)
  if (!entity)
    return console.log(
      `Warning - tried to get entity belonging to ${action.ownerId} with ID ${action.networkId}, but it doesn't exist`
    )

  getMutableComponent(entity, NetworkObjectComponent).authorityPeerID.set(action.newAuthority)
}

export const WorldNetworkActionReceptor = {
  receiveSpawnObject,
  receiveSpawnDebugPhysicsObject,
  receiveRequestAuthorityOverObject,
  receiveTransferAuthorityOfObject
}
