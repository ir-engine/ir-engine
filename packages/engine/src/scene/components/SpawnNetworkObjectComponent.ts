import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

type SpawnNetworkObjectComponentType = {
  ownerId: string
  uniqueId: string
  networkId: number
  parameters: any
}

export const SpawnNetworkObjectComponent = createMappedComponent<SpawnNetworkObjectComponentType>()