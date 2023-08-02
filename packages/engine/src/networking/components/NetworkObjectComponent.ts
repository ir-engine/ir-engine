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

import * as bitecs from 'bitecs'
import { useEffect } from 'react'

import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { Engine } from '../../ecs/classes/Engine'
import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import {
  Component,
  defineComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'

/** ID of last network created. */
let availableNetworkId = 0 as NetworkId

export const NetworkObjectComponent = defineComponent({
  name: 'NetworkObjectComponent',

  schema: {
    networkId: bitecs.Types.ui32
  },

  onInit: (entity) => {
    return {
      /** The user who is authority over this object. */
      ownerId: '' as UserId,
      /** The peer who is authority over this object. */
      authorityPeerID: '' as PeerID,
      /** The network id for this object (this id is only unique per owner) */
      networkId: 0 as NetworkId
    }
  },

  toJSON: (entity, component) => {
    return {
      ownerId: component.ownerId.value,
      authorityPeerID: component.authorityPeerID.value,
      networkId: component.networkId.value
    }
  },

  onSet: (entity, component, json) => {
    if (typeof json?.ownerId === 'string') component.ownerId.set(json.ownerId)
    if (typeof json?.authorityPeerID === 'string') component.authorityPeerID.set(json.authorityPeerID)
    if (typeof json?.networkId === 'number') {
      component.networkId.set(json.networkId)
      NetworkObjectComponent.networkId[entity] = json.networkId
    }
  },

  reactor: function () {
    const entity = useEntityContext()
    const networkObject = useComponent(entity, NetworkObjectComponent)

    useEffect(() => {
      if (networkObject.authorityPeerID.value === Engine.instance.peerID)
        setComponent(entity, NetworkObjectAuthorityTag)
      else removeComponent(entity, NetworkObjectAuthorityTag)
    }, [networkObject.authorityPeerID])

    useEffect(() => {
      if (networkObject.ownerId.value === Engine.instance.userId) setComponent(entity, NetworkObjectOwnedTag)
      else removeComponent(entity, NetworkObjectOwnedTag)
    }, [networkObject.ownerId])

    return null
  },

  /**
   * Get the network objects owned by a given user
   * @param ownerId
   */
  getOwnedNetworkObjects(ownerId: UserId) {
    return networkObjectQuery().filter((eid) => getComponent(eid, NetworkObjectComponent).ownerId === ownerId)
  },

  /**
   * Get a network object by owner and NetworkId
   * @returns
   */
  getNetworkObject(ownerId: UserId, networkId: NetworkId): Entity {
    return (
      networkObjectQuery().find((eid) => {
        const networkObject = getComponent(eid, NetworkObjectComponent)
        return networkObject.networkId === networkId && networkObject.ownerId === ownerId
      }) || UndefinedEntity
    )
  },

  /**
   * Get the user avatar entity (the network object w/ an Avatar component)
   * @param userId
   * @returns
   */
  getUserAvatarEntity(userId: UserId) {
    return NetworkObjectComponent.getOwnedNetworkObjectsWithComponent(userId, AvatarComponent).find((eid) => {
      return getComponent(eid, AvatarComponent).primary
    })!
  },

  /**
   * Get the user entity that has a specific component
   * @param userId
   * @param component
   * @returns
   */
  getOwnedNetworkObjectWithComponent<T, S extends bitecs.ISchema>(userId: UserId, component: Component<T, S>) {
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
  getOwnedNetworkObjectsWithComponent<T, S extends bitecs.ISchema>(userId: UserId, component: Component<T, S>) {
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
