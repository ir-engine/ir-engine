import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type SpawnNetworkObjectComponentType = {
  ownerId: string
  uniqueId: string
  networkId: number
  parameters: any
}

export const SpawnNetworkObjectComponent = createMappedComponent<SpawnNetworkObjectComponentType>()
