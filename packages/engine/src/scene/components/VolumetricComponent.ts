import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type VolumetricVideoComponentType = {
  player: any
}

export const VolumetricComponent = createMappedComponent<VolumetricVideoComponentType>('VolumetricComponent')
