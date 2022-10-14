import { Color } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { EnvMapSourceType, EnvMapTextureType } from '../constants/EnvMapEnum'
import { EnvMapBakeComponentType } from './EnvMapBakeComponent'

export type EnvmapComponentType = {
  type: typeof EnvMapSourceType[keyof typeof EnvMapSourceType]
  envMapTextureType: typeof EnvMapTextureType[keyof typeof EnvMapTextureType]
  envMapSourceColor: Color
  envMapSourceURL: string
  envMapIntensity: number
  envMapBake: EnvMapBakeComponentType
}

export const EnvmapComponent = createMappedComponent<EnvmapComponentType>('EnvmapComponent')

export const SCENE_COMPONENT_ENVMAP = 'envmap'
export const SCENE_COMPONENT_ENVMAP_DEFAULT_VALUES = {
  type: EnvMapSourceType.None,
  envMapTextureType: EnvMapTextureType.Equirectangular,
  envMapSourceColor: 0xfff,
  envMapSourceURL: '',
  envMapIntensity: 1,
  envMapBake: {}
}
