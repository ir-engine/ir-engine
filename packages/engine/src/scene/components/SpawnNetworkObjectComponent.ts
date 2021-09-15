import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type SpawnNetworkObjectComponentType = {
  uniqueId: string
  networkId: number
  parameters: any
}

export const SpawnNetworkObjectComponent =
  createMappedComponent<SpawnNetworkObjectComponentType>('SpawnNetworkObjectComponent')
