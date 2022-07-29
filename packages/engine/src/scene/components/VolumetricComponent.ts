import type Volumetric from '@xrfoundation/volumetric/player'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type VolumetricComponentType = {
  player: Volumetric
  useLoadingEffect: boolean
}

export const VolumetricComponent = createMappedComponent<VolumetricComponentType>('VolumetricComponent')
