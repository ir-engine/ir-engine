import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { NetworkId, UserId } from '../classes/Network'

export type NetworkObjectComponentType = {
  /** The user who owns this object. */
  userId: UserId
  /** The network id for this object */
  networkId: NetworkId
  /** All network objects need to be a registered prefab. */
  prefab: string
  /** The parameters by which the prefab was created */
  parameters: any
}

export const NetworkObjectComponent = createMappedComponent<NetworkObjectComponentType>('NetworkObjectComponent')
