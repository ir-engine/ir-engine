import { Color, Vector2 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { Ocean } from '../classes/Ocean'

export type OceanComponentType = {
  normalMap: string
  distortionMap: string
  envMap: string
  color: Color
  opacityRange: Vector2
  opacityFadeDistance: number
  shallowToDeepDistance: number
  shallowWaterColor: Color
  waveScale: Vector2
  waveSpeed: Vector2
  waveTiling: number
  waveDistortionTiling: number
  waveDistortionSpeed: Vector2
  shininess: number
  reflectivity: number
  bigWaveHeight: number
  bigWaveTiling: Vector2
  bigWaveSpeed: Vector2
  foamSpeed: Vector2
  foamTiling: number
  foamColor: Color
  ocean?: Ocean
}

export const OceanComponent = createMappedComponent<OceanComponentType>('OceanComponent')

export const SCENE_COMPONENT_OCEAN = 'ocean'
export const SCENE_COMPONENT_OCEAN_DEFAULT_VALUES = {
  normalMap: '',
  distortionMap: '',
  envMap: '',
  color: 0x2876dd,
  opacityRange: { x: 0.6, y: 0.9 },
  opacityFadeDistance: 0.12,
  shallowToDeepDistance: 0.1,
  shallowWaterColor: 0x30c3dd,
  waveScale: { x: 0.25, y: 0.25 },
  waveSpeed: { x: 0.08, y: 0.0 },
  waveTiling: 12.0,
  waveDistortionTiling: 7.0,
  waveDistortionSpeed: { x: 0.08, y: 0.08 },
  shininess: 40,
  reflectivity: 0.25,
  bigWaveHeight: 0.7,
  bigWaveTiling: { x: 1.5, y: 1.5 },
  bigWaveSpeed: { x: 0.02, y: 0.0 },
  foamSpeed: { x: 0.05, y: 0.0 },
  foamTiling: 2.0,
  foamColor: 0xffffff
}
