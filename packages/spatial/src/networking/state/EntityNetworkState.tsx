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

import { defineState, dispatchAction, getMutableState, getState, none, useHookstate } from '@etherealengine/hyperflux'

import { UserID } from '@etherealengine/common/src/schema.type.module'
import { Engine, getOptionalComponent, removeEntity, setComponent } from '@etherealengine/ecs'
import { UUIDComponent } from '@etherealengine/spatial/src/common/UUIDComponent'
import React, { useEffect, useLayoutEffect } from 'react'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { NetworkState, SceneUser } from '../NetworkState'
import { NetworkWorldUserState } from '../NetworkUserState'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'

export const EntityNetworkState = defineState({
  name: 'ee.EntityNetworkState',

  initial: {} as Record<
    EntityUUID,
    {
      ownerId: UserID | typeof SceneUser
      ownerPeer: PeerID
      networkId: NetworkId
      authorityPeerId: PeerID
      requestingPeerId?: PeerID
      spawnPosition: Vector3
      spawnRotation: Quaternion
    }
  >,

  receptors: {
    onSpawnObject: WorldNetworkAction.spawnObject.receive((action) => {
      // const userId = getState(NetworkState).networks[action.$network].peers[action.$peer].userId
      getMutableState(EntityNetworkState)[action.entityUUID].merge({
        ownerId: action.$from,
        networkId: action.networkId,
        authorityPeerId: action.authorityPeerId ?? action.$peer,
        ownerPeer: action.$peer,
        spawnPosition: action.position ? new Vector3().copy(action.position) : new Vector3(),
        spawnRotation: action.rotation ? new Quaternion().copy(action.rotation) : new Quaternion()
      })
    }),

    onRequestAuthorityOverObject: WorldNetworkAction.requestAuthorityOverObject.receive((action) => {
      getMutableState(EntityNetworkState)[action.entityUUID].requestingPeerId.set(action.newAuthority)
    }),

    onTransferAuthorityOfObject: WorldNetworkAction.transferAuthorityOfObject.receive((action) => {
      // const networkState = getState(NetworkState)
      // const fromUserId = networkState.networks[action.$network].peers[action.$peer].userId
      const fromUserId = action.$from
      const state = getMutableState(EntityNetworkState)
      const ownerUserId = state[action.entityUUID].ownerId.value
      if (fromUserId !== ownerUserId) return // Authority transfer can only be initiated by owner
      state[action.entityUUID].authorityPeerId.set(action.newAuthority)
      state[action.entityUUID].requestingPeerId.set(none)
    }),

    onDestroyObject: WorldNetworkAction.destroyObject.receive((action) => {
      getMutableState(EntityNetworkState)[action.entityUUID].set(none)
    })
  },

  reactor: () => {
    const state = useHookstate(getMutableState(EntityNetworkState))
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
  const isOwner = ownerID === Engine.instance.userID
  const userConnected = !!useHookstate(getMutableState(NetworkWorldUserState)[ownerID]).value || isOwner
  const isWorldNetworkConnected = !!useHookstate(NetworkState.worldNetworkState).value

  useLayoutEffect(() => {
    if (!userConnected) return

    const entity = UUIDComponent.getOrCreateEntityByUUID(props.uuid)

    setComponent(entity, TransformComponent, {
      position: state.spawnPosition.value!,
      rotation: state.spawnRotation.value!
    })
    return () => {
      removeEntity(entity)
    }
  }, [userConnected])

  useLayoutEffect(() => {
    if (!userConnected) return
    const entity = UUIDComponent.getEntityByUUID(props.uuid)
    setComponent(entity, NetworkObjectComponent, {
      ownerId:
        ownerID === SceneUser
          ? isWorldNetworkConnected
            ? NetworkState.worldNetwork.hostId
            : Engine.instance.userID
          : ownerID,
      ownerPeer: state.ownerPeer.value,
      authorityPeerID: state.authorityPeerId.value,
      networkId: state.networkId.value
    })
  }, [isWorldNetworkConnected, userConnected, state.ownerId.value, state.authorityPeerId.value, state.networkId.value])

  useLayoutEffect(() => {
    if (!userConnected || !state.requestingPeerId.value) return
    // Authority request can only be processed by owner

    const entity = UUIDComponent.getEntityByUUID(props.uuid)
    const ownerID = getOptionalComponent(entity, NetworkObjectComponent)?.ownerId
    if (!ownerID || ownerID !== Engine.instance.userID) return
    dispatchAction(
      WorldNetworkAction.transferAuthorityOfObject({
        entityUUID: props.uuid,
        newAuthority: state.requestingPeerId.value
      })
    )
  }, [userConnected, state.requestingPeerId.value])

  return <>{isOwner && isWorldNetworkConnected && <OwnerPeerReactor uuid={props.uuid} />}</>
}

const OwnerPeerReactor = (props: { uuid: EntityUUID }) => {
  const state = useHookstate(getMutableState(EntityNetworkState)[props.uuid])
  const ownerPeer = state.ownerPeer.value
  const networkState = useHookstate(NetworkState.worldNetworkState)

  /** If the owner peer does not exist in the network, and we are the owner user, dispatch a spawn action so we take ownership */
  useEffect(() => {
    return () => {
      // ensure reactor isn't completely unmounting
      if (!getState(EntityNetworkState)[props.uuid]) return
      if (ownerPeer !== Engine.instance.store.peerID && Engine.instance.userID === state.ownerId.value) {
        const lowestPeer = [...networkState.users[Engine.instance.userID].value].sort((a, b) => (a > b ? 1 : -1))[0]
        if (lowestPeer !== Engine.instance.store.peerID) return
        dispatchAction(
          WorldNetworkAction.spawnObject({
            entityUUID: props.uuid,
            // if the authority peer is not connected, we need to take authority
            authorityPeerId: networkState.users[Engine.instance.userID].value.includes(ownerPeer)
              ? undefined
              : Engine.instance.store.peerID
          })
        )
      }
    }
  }, [networkState.peers, networkState.users])

  return null
}
