import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type NetworkObjectOwnerComponentType = {
  networkId: number
}

export const NetworkObjectOwnerComponent = createMappedComponent<NetworkObjectOwnerComponentType>()
