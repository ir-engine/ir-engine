import { Color } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { EnvMapSourceType, EnvMapTextureType } from '../constants/EnvMapEnum'
import { CubemapBakeSettings } from '../types/CubemapBakeSettings'

export type EnvmapComponentType = {
  dirty: boolean
  type: EnvMapSourceType
  envMapTextureType: EnvMapTextureType
  envMapSourceColor: Color
  envMapSourceURL: string
  envMapIntensity: number
  envMapCubemapBake: CubemapBakeSettings
  errorWhileLoading?: boolean
}

export const EnvmapComponent = createMappedComponent<EnvmapComponentType>('EnvmapComponent')
