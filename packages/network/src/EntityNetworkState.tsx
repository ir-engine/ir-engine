/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useLayoutEffect } from 'react'

import { Engine, EntityUUID, getOptionalComponent, removeEntity, setComponent, UUIDComponent } from '@ir-engine/ecs'
import {
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  none,
  PeerID,
  useHookstate,
  useMutableState,
  UserID
} from '@ir-engine/hyperflux'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'

import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { WorldNetworkAction } from './functions/WorldNetworkAction'
import { NetworkId } from './NetworkId'
import { NetworkObjectComponent } from './NetworkObjectComponent'
import { NetworkPeerState } from './NetworkPeerState'
import { NetworkState, SceneUser } from './NetworkState'

export const EntityNetworkState = defineState({
  name: 'ee.EntityNetworkState',

  initial: {} as Record<
    EntityUUID,
    {
      parentUUID: EntityUUID
      ownerId: UserID | typeof SceneUser
      ownerPeer: PeerID
      authorityPeerId?: PeerID
      requestingPeerId?: PeerID
    }
  >,

  receptors: {
    onSpawnObject: WorldNetworkAction.spawnEntity.receive((action) => {
      getMutableState(EntityNetworkState)[action.entityUUID].merge({
        parentUUID: action.parentUUID,
        ownerId: action.ownerID,
        authorityPeerId: action.authorityPeerId ?? action.$peer,
        ownerPeer: action.$peer
      })
    }),

    onRequestAuthorityOverObject: WorldNetworkAction.requestAuthorityOverObject.receive((action) => {
      getMutableState(EntityNetworkState)[action.entityUUID].requestingPeerId.set(action.newAuthority)
    }),

    onTransferAuthorityOfObject: WorldNetworkAction.transferAuthorityOfObject.receive((action) => {
      const fromUserId = action.ownerID
      const state = getMutableState(EntityNetworkState)
      const ownerUserId = state[action.entityUUID].ownerId.value
      /** @todo move this to validation */
      if (fromUserId !== ownerUserId) return // Authority transfer can only be initiated by owner
      state[action.entityUUID].authorityPeerId.set(action.newAuthority)
      state[action.entityUUID].requestingPeerId.set(none)
    }),

    onDestroyObject: WorldNetworkAction.destroyEntity.receive((action) => {
      getMutableState(EntityNetworkState)[action.entityUUID].set(none)
    })
  },

  reactor: () => {
    const state = useMutableState(EntityNetworkState)
    return (
      <>
        {state.keys.map((uuid: EntityUUID) => (
          <EntityNetworkReactor uuid={uuid} key={uuid} />
        ))}
      </>
    )
  }
})

const EntityNetworkReactor = (props: { uuid: EntityUUID }) => {
  const state = useHookstate(getMutableState(EntityNetworkState)[props.uuid])
  const ownerID = state.ownerId.value
  const userID = useMutableState(EngineState).userID.value
  const isOwner = ownerID === SceneUser || ownerID === userID
  const worldNetwork = useHookstate(NetworkState.worldNetworkState).value
  const networkPeerState = useMutableState(NetworkPeerState).value
  const userHasPeer = !!(worldNetwork && networkPeerState[worldNetwork.id]?.users?.[ownerID])
  const userConnected = userHasPeer || isOwner
  const networkID = useNetworkID(props.uuid)

  useLayoutEffect(() => {
    if (!userConnected) return
    const entity = UUIDComponent.getOrCreateEntityByUUID(props.uuid)
    return () => {
      removeEntity(entity)
    }
  }, [userConnected])

  useLayoutEffect(() => {
    if (!userConnected) return
    const entity = UUIDComponent.getEntityByUUID(props.uuid)
    const parentEntity = UUIDComponent.getEntityByUUID(state.parentUUID.value)
    if (!parentEntity || !entity) return
    setComponent(entity, EntityTreeComponent, { parentEntity })
  }, [userConnected, state.parentUUID])

  useLayoutEffect(() => {
    if (!userConnected) return
    const entity = UUIDComponent.getEntityByUUID(props.uuid)
    if (!entity) return

    setComponent(entity, NetworkObjectComponent, {
      ownerId: ownerID,
      ownerPeer: state.ownerPeer.value,
      authorityPeerID: state.authorityPeerId.value,
      networkId: networkID
    })
  }, [!!worldNetwork, userConnected, state.ownerId.value, state.authorityPeerId.value, networkID])

  useLayoutEffect(() => {
    if (!userConnected || !state.requestingPeerId.value) return
    // Authority request can only be processed by owner

    const entity = UUIDComponent.getEntityByUUID(props.uuid)
    if (!entity) return
    const ownerID = getOptionalComponent(entity, NetworkObjectComponent)?.ownerId
    if ((!ownerID || ownerID !== userID) && ownerID !== SceneUser) return
    dispatchAction(
      WorldNetworkAction.transferAuthorityOfObject({
        ownerID: state.ownerId.value,
        entityUUID: props.uuid,
        newAuthority: state.requestingPeerId.value
      })
    )
  }, [userConnected, state.requestingPeerId.value])

  const authorityPeer = state.authorityPeerId.value ?? state.ownerPeer.value
  const isAuthorInNetwork = !!(worldNetwork && networkPeerState[worldNetwork.id]?.peers[authorityPeer])

  /**
   * If the authority peer does not exist in the network, and we are the owner user,
   * dispatch a spawn action so we take authority over the object
   */
  useLayoutEffect(() => {
    if (!isOwner || !isAuthorInNetwork) return

    return () => {
      // ensure entity still exists
      if (!worldNetwork || !getState(EntityNetworkState)[props.uuid] || !worldNetwork.users?.[userID]?.length) return

      // Use the lowest peer as the new authority
      const lowestPeer = [...worldNetwork.users[userID]].sort((a, b) => (a > b ? 1 : -1))[0]
      if (lowestPeer !== Engine.instance.store.peerID) return

      dispatchAction(
        WorldNetworkAction.transferAuthorityOfObject({
          ownerID: state.ownerId.value,
          entityUUID: props.uuid,
          newAuthority: Engine.instance.store.peerID
        })
      )
    }
  }, [isOwner, isAuthorInNetwork])

  return null
}

/**
 * Get a deterministic network ID scoped to each owner peer
 */
const useNetworkID = (uuid: EntityUUID) => {
  const state = useMutableState(EntityNetworkState)
  const ownerPeer = state[uuid].ownerPeer.value
  const entitiesForPeer = state.keys.filter((key: EntityUUID) => state[key].ownerPeer.value === ownerPeer).sort()
  return entitiesForPeer.indexOf(uuid) as NetworkId
}
