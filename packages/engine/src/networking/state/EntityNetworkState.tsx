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

import React, { useEffect, useLayoutEffect } from 'react'
import { Quaternion, Vector3 } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import {
  defineActionQueue,
  defineState,
  getMutableState,
  none,
  receiveActions,
  useHookstate,
  useState
} from '@etherealengine/hyperflux'

import { setComponent } from '../../ecs/functions/ComponentFunctions'
import { removeEntity } from '../../ecs/functions/EntityFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { WorldNetworkActionReceptor } from '../functions/WorldNetworkActionReceptor'

export const EntityNetworkState = defineState({
  name: 'ee.engine.avatar.EntityNetworkState',

  initial: {} as Record<
    EntityUUID,
    {
      ownerId: UserId
      networkId: NetworkId
      peerId: PeerID
      prefab: string
    }
  >,

  receptors: [
    [
      WorldNetworkAction.spawnObject,
      (state, action: typeof WorldNetworkAction.spawnObject.matches._TYPE) => {
        state[action.entityUUID].merge({
          ownerId: action.$from,
          networkId: action.networkId,
          peerId: action.$peer,
          prefab: action.prefab
        })
      }
    ],

    [
      WorldNetworkAction.destroyObject,
      (state, action: typeof WorldNetworkAction.destroyObject.matches._TYPE) => {
        state[action.entityUUID].set(none)
      }
    ]
  ]
})

const EntityNetworkReactor = React.memo(({ entityUUID }: { entityUUID: EntityUUID }) => {
  const state = useHookstate(getMutableState(EntityNetworkState)[entityUUID])

  useEffect(() => {
    WorldNetworkActionReceptor.receiveSpawnObject({
      entityUUID,
      $from: state.ownerId.value,
      networkId: state.networkId.value,
      $peer: state.peerId.value,
      prefab: state.prefab.value
    })

    return () => {
      const entity = UUIDComponent.entitiesByUUID[entityUUID]
      if (!entity) return
      removeEntity(entity)
    }
  }, [])

  return null
})

export const EntityNetworkStateReactor = () => {
  const entityNetworkState = useState(getMutableState(EntityNetworkState))
  return (
    <>
      {entityNetworkState.keys.map((entityUUID: EntityUUID) => {
        return <EntityNetworkReactor key={entityUUID} entityUUID={entityUUID} />
      })}
    </>
  )
}

export const applySpawnObjectPose = (action: typeof WorldNetworkAction.spawnObject.matches._TYPE) => {
  const entity = UUIDComponent.entitiesByUUID[action.entityUUID]

  const position = new Vector3()
  const rotation = new Quaternion()

  if (action.position) position.copy(action.position)
  if (action.rotation) rotation.copy(action.rotation)

  setComponent(entity, TransformComponent, { position, rotation })
}

const spawnObjectQueue = defineActionQueue(WorldNetworkAction.spawnObject.matches)

export const EntityNetworkStateSystem = defineSystem({
  uuid: 'ee.engine.avatar.EntityNetworkStateSystem',
  execute: () => {
    receiveActions(EntityNetworkState)

    for (const action of spawnObjectQueue()) applySpawnObjectPose(action)
  },
  reactor: () => {
    return <EntityNetworkStateReactor />
  }
})
