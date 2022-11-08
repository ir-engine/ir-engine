import { Types } from 'bitecs'

import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export type NetworkObjectComponentType = {
  /** The user who is authority over this object. */
  ownerId: UserId
  /** The user who is authority over this object. */
  authorityUserId: UserId
  /** The network id for this object (this id is only unique per owner) */
  networkId: NetworkId
}

export const NetworkObjectComponent = defineComponent({
  name: 'NetworkObjectComponent',

  schema: {
    networkId: Types.ui32
  },

  onInit: (entity) => {
    return {
      /** The user who is authority over this object. */
      ownerId: '' as UserId,
      /** The user who is authority over this object. */
      authorityUserId: '' as UserId,
      /** The network id for this object (this id is only unique per owner) */
      networkId: 0 as NetworkId
    }
  },

  toJSON: (entity, component) => {
    return {
      ownerId: component.ownerId.value,
      authorityUserId: component.authorityUserId.value,
      networkId: component.networkId.value
    }
  },

  onSet: (entity, component, json) => {
    if (typeof json?.ownerId === 'string') component.ownerId.set(json.ownerId)
    if (typeof json?.authorityUserId === 'string') component.authorityUserId.set(json.authorityUserId)
    if (typeof json?.networkId === 'number') {
      component.networkId.set(json.networkId)
      NetworkObjectComponent.networkId[entity] = json.networkId
    }
  }
})

/**
 * Authority is device-specific.
 * Ownership is user-specific.
 * An object is owned by one user, having multiple representations across devices as entities, of which only one is the authority.
 * Authority can be transferred to other devices, including those operated by different users.
 */
export const NetworkObjectAuthorityTag = defineComponent({ name: 'NetworkObjectComponent' })

export const NetworkObjectOwnedTag = defineComponent({ name: 'NetworkObjectComponent' })
