import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { VolumetricPlayMode } from '../constants/VolumetricPlayMode'

export type VolumetricVideoComponentType = {
  paths: string[]
  playMode: VolumetricPlayMode
}

export const VolumetricComponent = createMappedComponent<VolumetricVideoComponentType>('VolumetricComponent')
