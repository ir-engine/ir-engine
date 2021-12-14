import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Types } from 'bitecs'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type NetworkObjectComponentType = {
  /** The user who owns this object. */
  ownerId: UserId
  /** The network id for this object (this id is only unique per owner) */
  networkId: NetworkId
  /** All network objects need to be a registered prefab. */
  prefab: string
  /** The parameters by which the prefab was created */
  parameters: any
}

export const NetworkObjectComponent = createMappedComponent<NetworkObjectComponentType>('NetworkObjectComponent', {
  networkId: Types.ui32
})
