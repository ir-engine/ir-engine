import type Volumetric from '@xrfoundation/volumetric/player'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type VolumetricComponentType = {
  player: Volumetric
  useLoadingEffect: boolean
}

export const VolumetricComponent = createMappedComponent<VolumetricComponentType>('VolumetricComponent')

export const VolumetricsExtensions = ['drcs', 'uvol']
export const SCENE_COMPONENT_VOLUMETRIC = 'volumetric'
export const SCENE_COMPONENT_VOLUMETRIC_DEFAULT_VALUES = {
  useLoadingEffect: true
}
