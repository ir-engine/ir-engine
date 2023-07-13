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

import { Quaternion, Vector3 } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { defineActionQueue, defineState, dispatchAction, none, receiveActions } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { getMutableComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'

export const EntityNetworkState = defineState({
  name: 'ee.engine.avatar.EntityNetworkState',

  initial: {} as Record<
    EntityUUID,
    {
      ownerId: UserId
      networkId: NetworkId
      peerId: PeerID
      prefab: string
      spawnPosition: Vector3
      spawnRotation: Quaternion
    }
  >,

  receptors: [
    [
      WorldNetworkAction.spawnObject,
      (state, action: typeof WorldNetworkAction.spawnObject.matches._TYPE) => {
        const entity = UUIDComponent.entitiesByUUID[action.entityUUID] ?? createEntity()
        setComponent(entity, UUIDComponent, action.entityUUID)
        setComponent(entity, NetworkObjectComponent, {
          ownerId: action.$from,
          authorityPeerID: action.$peer,
          networkId: action.networkId
        })
        setComponent(entity, TransformComponent, { position: action.position!, rotation: action.rotation! })

        state[action.entityUUID].merge({
          ownerId: action.$from,
          networkId: action.networkId,
          peerId: action.$peer,
          prefab: action.prefab,
          spawnPosition: action.position ?? new Vector3(),
          spawnRotation: action.rotation ?? new Quaternion()
        })
      }
    ],

    [
      WorldNetworkAction.destroyObject,
      (state, action: typeof WorldNetworkAction.destroyObject.matches._TYPE) => {
        state[action.entityUUID].set(none)
        const entity = UUIDComponent.entitiesByUUID[action.entityUUID]
        if (!entity) return
        removeEntity(entity)
      }
    ]
  ]
})

export const receiveRequestAuthorityOverObject = (
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

export const receiveTransferAuthorityOfObject = (
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

const requestAuthorityOverObjectQueue = defineActionQueue(WorldNetworkAction.requestAuthorityOverObject.matches)
const transferAuthorityOfObjectQueue = defineActionQueue(WorldNetworkAction.transferAuthorityOfObject.matches)

const execute = () => {
  receiveActions(EntityNetworkState)

  for (const action of requestAuthorityOverObjectQueue()) receiveRequestAuthorityOverObject(action)
  for (const action of transferAuthorityOfObjectQueue()) receiveTransferAuthorityOfObject(action)
}

export const EntityNetworkStateSystem = defineSystem({
  uuid: 'ee.engine.avatar.EntityNetworkStateSystem',
  execute
})
