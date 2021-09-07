import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type NetworkObjectComponentType = {
  /** Network id of the object. */
  networkId: number
  /** Entity unique Id from editor scene. */
  uniqueId: string
}

export const NetworkObjectComponent = createMappedComponent<NetworkObjectComponentType>()
