import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type VolumetricVideoComponentType = {
  player: any
}

export const VolumetricComponent = createMappedComponent<VolumetricVideoComponentType>('VolumetricComponent')
