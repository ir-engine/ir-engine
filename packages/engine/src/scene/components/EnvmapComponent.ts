import { Color } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { EnvMapSourceType, EnvMapTextureType } from '../constants/EnvMapEnum'
import { EnvMapBakeSettings } from '../types/EnvMapBakeSettings'

export type EnvmapComponentType = {
  type: typeof EnvMapSourceType[keyof typeof EnvMapSourceType]
  envMapTextureType: typeof EnvMapTextureType[keyof typeof EnvMapTextureType]
  envMapSourceColor: Color
  envMapSourceURL: string
  envMapIntensity: number
  envMapBake: EnvMapBakeSettings
}

export const EnvmapComponent = createMappedComponent<EnvmapComponentType>('EnvmapComponent')
