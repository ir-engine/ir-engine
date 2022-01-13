import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { CubemapBakeSettings } from '../types/CubemapBakeSettings'

export type CubemapBakeComponentType = {
  options: CubemapBakeSettings
}

export const CubemapBakeComponent = createMappedComponent<CubemapBakeComponentType>('CubemapBakeComponent')
