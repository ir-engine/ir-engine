import { Color } from 'three'
import { ComponentName } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { EnvMapSourceType, EnvMapTextureType } from '../constants/EnvMapEnum'
import { CubemapBakeSettings } from '../types/CubemapBakeSettings'

export type EnvmapComponentType = {
  type: EnvMapSourceType
  envMapTextureType: EnvMapTextureType
  envMapSourceColor: Color
  envMapSourceURL: string
  envMapIntensity: number
  envMapCubemapBake: CubemapBakeSettings
  errorWhileLoading?: boolean
}

export const EnvmapComponent = createMappedComponent<EnvmapComponentType>(ComponentName.ENVMAP)
