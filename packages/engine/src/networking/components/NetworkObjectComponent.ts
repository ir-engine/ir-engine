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

  onAdd: (entity, json) => {
    NetworkObjectComponent.networkId[entity] = json.networkId
    return json as NetworkObjectComponentType
  },

  toJSON: (entity, component) => {
    return component
  }
})
