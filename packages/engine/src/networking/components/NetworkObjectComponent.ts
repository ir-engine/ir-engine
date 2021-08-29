import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type NetworkObjectComponentType = {
  /** Network id of the object. */
  networkId: number
  /** Entity unique Id from editor scene. */
  uniqueId: string
  /** Snapshot time of the object. */
  snapShotTime: number
}

export const NetworkObjectComponent = createMappedComponent<NetworkObjectComponentType>()
