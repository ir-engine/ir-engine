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

import React, { memo, useEffect } from 'react'
import { Quaternion, Vector3 } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import {
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  none,
  useHookstate,
  useMutableState
} from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { SceneState } from '../../ecs/classes/Scene'
import { setComponent } from '../../ecs/functions/ComponentFunctions'
import { SimulationSystemGroup } from '../../ecs/functions/EngineFunctions'
import { removeEntity } from '../../ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { NetworkState } from '../NetworkState'

export const EntityNetworkState = defineState({
  name: 'ee.EntityNetworkState',

  initial: {} as Record<
    EntityUUID,
    {
      ownerId: UserID
      networkId: NetworkId
      authorityPeerId: PeerID
      requestingPeerId?: PeerID
      spawnPosition: Vector3
      spawnRotation: Quaternion
    }
  >,

  receptors: {
    onSpawnObject: WorldNetworkAction.spawnObject.receive((action) => {
      getMutableState(EntityNetworkState)[action.entityUUID].merge({
        ownerId: action.$from,
        networkId: action.networkId,
        authorityPeerId: action.$peer,
        spawnPosition: action.position ?? new Vector3(),
        spawnRotation: action.rotation ?? new Quaternion()
      })
    }),

    onRequestAuthorityOverObject: WorldNetworkAction.requestAuthorityOverObject.receive((action) => {
      getMutableState(EntityNetworkState)[action.entityUUID].requestingPeerId.set(action.$peer)
    }),

    onTransferAuhtorityOfObject: WorldNetworkAction.transferAuthorityOfObject.receive((action) => {
      const networkState = getState(NetworkState)
      const state = getMutableState(EntityNetworkState)
      const fromUserId = networkState.networks[action.$network].peers[action.$peer].userId
      const ownerUserId = state[action.entityUUID].ownerId.value
      if (fromUserId !== ownerUserId) return // Authority transfer can only be initiated by owner
      state[action.entityUUID].authorityPeerId.set(action.newAuthority)
    }),

    onDestroyObject: WorldNetworkAction.destroyObject.receive((action) => {
      getMutableState(EntityNetworkState)[action.entityUUID].set(none)
    })
  }
})

const EntityNetworkReactor = memo((props: { uuid: EntityUUID }) => {
  const state = useHookstate(getMutableState(EntityNetworkState))[props.uuid]

  useEffect(() => {
    const entity = UUIDComponent.getEntityByUUID(props.uuid)
    const sceneState = getState(SceneState)
    if (!sceneState.activeScene) {
      throw new Error('Trying to spawn an object with no active scene')
    }
    // TODO: get the active scene for each world network
    const activeSceneID = SceneState.getCurrentScene()!.root
    const activeSceneEntity = UUIDComponent.entitiesByUUID[activeSceneID]
    setComponent(entity, EntityTreeComponent, {
      parentEntity: activeSceneEntity
    })
    setComponent(entity, TransformComponent, {
      position: state.spawnPosition.value!,
      rotation: state.spawnRotation.value!
    })
    return () => {
      removeEntity(entity)
    }
  }, [])

  useEffect(() => {
    const entity = UUIDComponent.getEntityByUUID(props.uuid)
    setComponent(entity, NetworkObjectComponent, {
      ownerId: state.ownerId.value,
      authorityPeerID: state.authorityPeerId.value,
      networkId: state.networkId.value
    })
  }, [state])

  useEffect(() => {
    if (!state.requestingPeerId.value) return
    // Authority request can only be processed by owner
    if (state.ownerId.value !== Engine.instance.userID) return
    dispatchAction(
      WorldNetworkAction.transferAuthorityOfObject({
        entityUUID: props.uuid,
        newAuthority: state.requestingPeerId.value
      })
    )
  }, [state.requestingPeerId])

  return null
})

export const EntityNetworkStateSystem = defineSystem({
  uuid: 'ee.networking.EntityNetworkStateSystem',
  reactor: () => {
    const state = useMutableState(EntityNetworkState)
    return (
      <>
        {state.keys.map((uuid: EntityUUID) => (
          <EntityNetworkReactor uuid={uuid} key={uuid} />
        ))}
      </>
    )
  },
  insert: { with: SimulationSystemGroup }
})

EntityNetworkState.receptors.onSpawnObject.beforeHooks.push((action) => {})
