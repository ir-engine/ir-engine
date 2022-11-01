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
