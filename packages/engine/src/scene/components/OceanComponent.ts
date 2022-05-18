import { Color, Vector2 } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

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
}

export const OceanComponent = createMappedComponent<OceanComponentType>('OceanComponent')
