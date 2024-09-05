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

import type { ISchema } from 'bitecs'
import { useLayoutEffect } from 'react'

import ECS, {
  Component,
  defineComponent,
  defineQuery,
  Engine,
  Entity,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent,
  UndefinedEntity,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { matches, PeerID, UserID, Validator } from '@ir-engine/hyperflux'
import { NetworkId } from '@ir-engine/network/src/NetworkId'

/** ID of last network created. */
let availableNetworkId = 0 as NetworkId

export const NetworkObjectComponent = defineComponent({
  name: 'NetworkObjectComponent',

  schema: {
    networkId: ECS.Types.ui32
  },

  onInit: (entity) => {
    return {
      /** The user who is authority over this object. */
      ownerId: '' as UserID,
      ownerPeer: '' as PeerID,
      /** The peer who is authority over this object. */
      authorityPeerID: '' as PeerID,
      /** The network id for this object (this id is only unique per owner) */
      networkId: 0 as NetworkId
    }
  },

  toJSON: (entity, component) => {
    return {
      ownerId: component.ownerId.value,
      ownerPeer: component.ownerPeer.value,
      authorityPeerID: component.authorityPeerID.value,
      networkId: component.networkId.value
    }
  },

  onSet: (entity, component, json) => {
    if (typeof json?.ownerId === 'string') component.ownerId.set(json.ownerId)
    if (typeof json?.ownerPeer === 'string') component.ownerPeer.set(json.ownerPeer)
    if (typeof json?.authorityPeerID === 'string') component.authorityPeerID.set(json.authorityPeerID)
    if (typeof json?.networkId === 'number') {
      component.networkId.set(json.networkId)
      NetworkObjectComponent.networkId[entity] = json.networkId
    }
  },

  reactor: function () {
    const entity = useEntityContext()
    const networkObject = useComponent(entity, NetworkObjectComponent)

    useLayoutEffect(() => {
      if (networkObject.authorityPeerID.value === Engine.instance.store.peerID)
        setComponent(entity, NetworkObjectAuthorityTag)
      else removeComponent(entity, NetworkObjectAuthorityTag)
    }, [networkObject.authorityPeerID])

    useLayoutEffect(() => {
      if (networkObject.ownerId.value === Engine.instance.userID) setComponent(entity, NetworkObjectOwnedTag)
      else removeComponent(entity, NetworkObjectOwnedTag)
    }, [networkObject.ownerId])

    return null
  },

  /**
   * Get the network objects owned by a given user
   * @param ownerId
   */
  getOwnedNetworkObjects(ownerId: UserID) {
    return networkObjectQuery().filter((eid) => getComponent(eid, NetworkObjectComponent).ownerId === ownerId)
  },

  /**
   * Get a network object by ownerPeer and NetworkId
   * @returns
   */
  getNetworkObject(ownerPeer: PeerID, networkId: NetworkId): Entity {
    return (
      networkObjectQuery().find((eid) => {
        const networkObject = getComponent(eid, NetworkObjectComponent)
        return networkObject.networkId === networkId && networkObject.ownerPeer === ownerPeer
      }) || UndefinedEntity
    )
  },

  /**
   * Get the user entity that has a specific component
   * @param userId
   * @param component
   * @returns
   */
  getOwnedNetworkObjectWithComponent<T, S extends ISchema>(userId: UserID, component: Component<T, S>) {
    return (
      NetworkObjectComponent.getOwnedNetworkObjects(userId).find((eid) => {
        return hasComponent(eid, component)
      }) || UndefinedEntity
    )
  },

  /**
   * Get the user entity that has a specific component
   * @param userId
   * @param component
   * @returns
   */
  getOwnedNetworkObjectsWithComponent<T, S extends ISchema>(userId: UserID, component: Component<T, S>) {
    return NetworkObjectComponent.getOwnedNetworkObjects(userId).filter((eid) => {
      return hasComponent(eid, component)
    })
  },

  /** Get next network id. */
  createNetworkId(): NetworkId {
    return ++availableNetworkId as NetworkId
  }
})

/**
 * Network object query
 */
const networkObjectQuery = defineQuery([NetworkObjectComponent])

/**
 * Authority is peer-specific.
 * Ownership is user-specific.
 * An object is owned by one user, having multiple representations across peers as entities, of which only one is the authority.
 * Authority can be transferred to other peer, including those operated by different users.
 */
export const NetworkObjectAuthorityTag = defineComponent({ name: 'NetworkObjectAuthorityTag' })

export const NetworkObjectOwnedTag = defineComponent({ name: 'NetworkObjectOwnedTag' })

export const NetworkObjectSendPeriodicUpdatesTag = defineComponent({ name: 'NetworkObjectSendPeriodicUpdatesTag' })

export const matchesNetworkId = matches.number as Validator<unknown, NetworkId>
