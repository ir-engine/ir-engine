import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type SpawnNetworkObjectComponentType = {
  uniqueId: string
  networkId: number
  parameters: any
}

export const SpawnNetworkObjectComponent = createMappedComponent<SpawnNetworkObjectComponentType>()
