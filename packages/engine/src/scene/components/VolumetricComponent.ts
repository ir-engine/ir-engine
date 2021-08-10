import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type VolumetricVideoComponentType = {
  player: any
}

export const VolumetricComponent = createMappedComponent<VolumetricVideoComponentType>()
