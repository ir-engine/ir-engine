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
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import {
  defineActionQueue,
  defineState,
  dispatchAction,
  getState,
  none,
  receiveActions
} from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { SceneState } from '../../ecs/classes/Scene'
import { getMutableComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { SimulationSystemGroup } from '../../ecs/functions/EngineFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { LocalTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'

export const EntityNetworkState = defineState({
  name: 'ee.engine.avatar.EntityNetworkState',

  initial: {} as Record<
    EntityUUID,
    {
      ownerId: UserID
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

        setComponent(entity, TransformComponent)
        const sceneState = getState(SceneState)
        if (!sceneState.activeScene) {
          throw new Error('Trying to spawn an object with no active scene')
        }

        setComponent(entity, EntityTreeComponent, {
          parentEntity: SceneState.getRootEntity(getState(SceneState).activeScene!)
        })

        const spawnPosition = new Vector3()
        if (action.position) spawnPosition.copy(action.position)

        const spawnRotation = new Quaternion()
        if (action.rotation) spawnRotation.copy(action.rotation)

        setComponent(entity, LocalTransformComponent, { position: spawnPosition, rotation: spawnRotation })

        state[action.entityUUID].merge({
          ownerId: action.$from,
          networkId: action.networkId,
          peerId: action.$peer,
          prefab: action.prefab,
          spawnPosition,
          spawnRotation
        })
      }
    ],

    [
      WorldNetworkAction.destroyObject,
      (state, action: typeof WorldNetworkAction.destroyObject.matches._TYPE) => {
        // removed spawn/destroy cached actions for this entity
        const cachedActions = Engine.instance.store.actions.cached
        const peerCachedActions = cachedActions.filter(
          (cachedAction) =>
            (WorldNetworkAction.spawnObject.matches.test(cachedAction) ||
              WorldNetworkAction.destroyObject.matches.test(cachedAction)) &&
            cachedAction.entityUUID === action.entityUUID
        )
        for (const cachedAction of peerCachedActions) {
          cachedActions.splice(cachedActions.indexOf(cachedAction), 1)
        }

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
  if (Engine.instance.userID !== action.ownerId) return

  const ownerId = action.ownerId
  const entity = NetworkObjectComponent.getNetworkObject(ownerId, action.networkId)
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

  const entity = NetworkObjectComponent.getNetworkObject(action.ownerId, action.networkId)
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
  insert: { with: SimulationSystemGroup },
  execute
})
