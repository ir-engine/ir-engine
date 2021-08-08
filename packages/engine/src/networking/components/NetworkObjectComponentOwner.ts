import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

type NetworkObjectOwnerComponentType = {
  networkId: number
}

export const NetworkObjectComponentOwner = createMappedComponent<NetworkObjectOwnerComponentType>()