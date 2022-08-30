import { Types } from 'bitecs'

import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type NetworkObjectComponentType = {
  /** The user who is authority over this object. */
  ownerId: UserId
  /** The user who is authority over this object. */
  authorityUserId: UserId
  /** The network id for this object (this id is only unique per owner) */
  networkId: NetworkId
}

const SCHEMA = {
  networkId: Types.ui32
}

export const NetworkObjectComponent = createMappedComponent<NetworkObjectComponentType, typeof SCHEMA>(
  'NetworkObjectComponent',
  SCHEMA
)
