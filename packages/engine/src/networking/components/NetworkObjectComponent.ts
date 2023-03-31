import { Types } from 'bitecs'

import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const NetworkObjectComponent = defineComponent({
  name: 'NetworkObjectComponent',

  schema: {
    networkId: Types.ui32
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
  }
})

/**
 * Authority is peer-specific.
 * Ownership is user-specific.
 * An object is owned by one user, having multiple representations across peers as entities, of which only one is the authority.
 * Authority can be transferred to other peer, including those operated by different users.
 */
export const NetworkObjectAuthorityTag = defineComponent({ name: 'NetworkObjectAuthorityTag' })

export const NetworkObjectOwnedTag = defineComponent({ name: 'NetworkObjectOwnedTag' })
