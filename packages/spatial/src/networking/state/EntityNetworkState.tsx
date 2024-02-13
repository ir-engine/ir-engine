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

import { Runner, defineState, dispatchAction, getMutableState, getState, none } from '@etherealengine/hyperflux'

import { UserID } from '@etherealengine/common/src/schema.type.module'
import { Engine, getOptionalComponent, removeComponent, removeEntity, setComponent } from '@etherealengine/ecs'
import { UUIDComponent } from '@etherealengine/spatial/src/common/UUIDComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { NetworkState, SceneUser } from '../NetworkState'
import { NetworkWorldUserState } from '../NetworkUserState'
import {
  NetworkObjectAuthorityTag,
  NetworkObjectComponent,
  NetworkObjectOwnedTag
} from '../components/NetworkObjectComponent'

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
        spawnPosition: action.position ?? new Vector3(),
        spawnRotation: action.rotation ?? new Quaternion()
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

  onEventSourcing: () => {
    Runner.runContext(EntityNetworkState.name, entityNetworkContext)
  }
})

const entityNetworkContext = () => {
  const keys = Object.keys(getState(EntityNetworkState))
  console.log('entityNetworkContext', keys)
  Runner.runGroup(keys, entityNetwork)
}

const entityNetwork = (uuid: EntityUUID) => {
  const state = getState(EntityNetworkState)[uuid]
  const ownerID = state.ownerId
  const isOwner = ownerID === Engine.instance.userID
  const userConnected = !!getState(NetworkWorldUserState)[ownerID]
  const isWorldNetworkConnected = !!NetworkState.worldNetwork

  Runner.runEffect(() => {
    if (!userConnected) return

    const entity = UUIDComponent.getOrCreateEntityByUUID(uuid)

    setComponent(entity, TransformComponent, {
      position: state.spawnPosition,
      rotation: state.spawnRotation
    })
    return () => {
      removeEntity(entity)
    }
  }, [userConnected])

  Runner.runEffect(() => {
    if (!userConnected) return
    const entity = UUIDComponent.getEntityByUUID(uuid)

    const ownerId =
      ownerID === SceneUser
        ? isWorldNetworkConnected
          ? NetworkState.worldNetwork.hostId
          : Engine.instance.userID
        : ownerID

    setComponent(entity, NetworkObjectComponent, {
      ownerId,
      ownerPeer: state.ownerPeer,
      authorityPeerID: state.authorityPeerId,
      networkId: state.networkId
    })

    if (state.authorityPeerId === Engine.instance.peerID) setComponent(entity, NetworkObjectAuthorityTag)
    else removeComponent(entity, NetworkObjectAuthorityTag)

    if (ownerId === Engine.instance.userID) setComponent(entity, NetworkObjectOwnedTag)
    else removeComponent(entity, NetworkObjectOwnedTag)
  }, [isWorldNetworkConnected, userConnected, state.ownerId, state.authorityPeerId, state.networkId])

  Runner.runEffect(() => {
    if (!userConnected || !state.requestingPeerId) return
    // Authority request can only be processed by owner

    const entity = UUIDComponent.getEntityByUUID(uuid)
    const ownerID = getOptionalComponent(entity, NetworkObjectComponent)?.ownerId
    if (!ownerID || ownerID !== Engine.instance.userID) return
    dispatchAction(
      WorldNetworkAction.transferAuthorityOfObject({
        entityUUID: uuid,
        newAuthority: state.requestingPeerId
      })
    )
  }, [userConnected, state.requestingPeerId])

  const ownerExists = isOwner && isWorldNetworkConnected
  Runner.runGroup(ownerExists ? [uuid] : [], ownerPeer)
}

const ownerPeer = (uuid: EntityUUID) => {
  const state = getState(EntityNetworkState)[uuid]
  const ownerPeer = state.ownerPeer
  const networkState = NetworkState.worldNetwork

  /** If the owner peer does not exist in the network, and we are the owner user, dispatch a spawn action so we take ownership */
  Runner.runEffect(() => {
    return () => {
      // ensure reactor isn't completely unmounting
      if (!getState(EntityNetworkState)[uuid]) return
      if (ownerPeer !== Engine.instance.store.peerID && Engine.instance.userID === state.ownerId) {
        const lowestPeer = [...networkState.users[Engine.instance.userID]].sort((a, b) => (a > b ? 1 : -1))[0]
        if (lowestPeer !== Engine.instance.store.peerID) return
        dispatchAction(
          WorldNetworkAction.spawnObject({
            entityUUID: uuid,
            // if the authority peer is not connected, we need to take authority
            authorityPeerId: networkState.users[Engine.instance.userID].includes(ownerPeer)
              ? undefined
              : Engine.instance.store.peerID
          })
        )
      }
    }
  }, [networkState.peers, networkState.users])
}
