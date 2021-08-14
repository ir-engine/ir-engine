import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type NetworkObjectOwnerComponentType = {
  networkId: number
}

export const NetworkObjectComponentOwner = createMappedComponent<NetworkObjectOwnerComponentType>()
