import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type ClientAuthoritativeComponentType = {
  ownerNetworkId: number
}

export const ClientAuthoritativeComponent = createMappedComponent<ClientAuthoritativeComponentType>()
