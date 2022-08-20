import { Color, Shader } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { FogType } from '../constants/FogType'

export type FogComponentType = {
  type: FogType
  color: Color
  density: number
  near: number
  far: number
  height: number
  timeScale: number
  shaders?: Shader[]
}

export const FogComponent = createMappedComponent<FogComponentType>('FogComponent')

export const SCENE_COMPONENT_FOG = 'fog'
export const SCENE_COMPONENT_FOG_DEFAULT_VALUES = {
  type: FogType.Linear,
  color: '#FFFFFF',
  density: 0.005,
  near: 1,
  far: 1000,
  timeScale: 1,
  height: 0.05
}
