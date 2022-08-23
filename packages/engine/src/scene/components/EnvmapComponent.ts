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
  type: EnvMapSourceType.Skybox,
  envMapTextureType: EnvMapTextureType.Cubemap,
  envMapSourceColor: 0x123456,
  envMapSourceURL: '/hdr/cubemap/skyboxsun25deg/',
  envMapIntensity: 1,
  envMapBake: {}
}
