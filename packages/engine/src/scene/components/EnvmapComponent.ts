import { Color } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { EnvMapSourceType, EnvMapTextureType } from '../constants/EnvMapEnum'
import { EnvMapBakeSettings } from '../types/EnvMapBakeSettings'

export type EnvmapComponentType = {
  type: EnvMapSourceType
  envMapTextureType: EnvMapTextureType
  envMapSourceColor: Color
  envMapSourceURL: string
  envMapIntensity: number
  envMapBake: EnvMapBakeSettings
  forModel: boolean
}

export const EnvmapComponent = createMappedComponent<EnvmapComponentType>('EnvmapComponent')
