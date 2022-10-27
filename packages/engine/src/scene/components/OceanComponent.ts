import { Color, Vector2 } from 'three'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'
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

export const OceanComponent = defineComponent({
  name: 'OceanComponent',
  onInit: () => {
    return {
      normalMap: SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.normalMap,
      distortionMap: SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.distortionMap,
      envMap: SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.envMap,
      color: new Color(SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.color),
      opacityRange: new Vector2().copy(SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.opacityRange),
      opacityFadeDistance: SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.opacityFadeDistance,
      shallowToDeepDistance: SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.shallowToDeepDistance,
      shallowWaterColor: new Color(SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.shallowWaterColor),
      waveScale: new Vector2().copy(SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.waveScale),
      waveSpeed: new Vector2().copy(SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.waveSpeed),
      waveTiling: SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.waveTiling,
      waveDistortionTiling: SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.waveDistortionTiling,
      waveDistortionSpeed: new Vector2().copy(SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.waveDistortionSpeed),
      shininess: SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.shininess,
      reflectivity: SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.reflectivity,
      bigWaveHeight: SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.bigWaveHeight,
      bigWaveTiling: new Vector2().copy(SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.bigWaveTiling),
      bigWaveSpeed: new Vector2().copy(SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.bigWaveSpeed),
      foamSpeed: new Vector2().copy(SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.foamSpeed),
      foamTiling: SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.foamTiling,
      foamColor: new Color(SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.foamColor)
    } as OceanComponentType
  },
  toJSON: (entity, component) => {
    return {
      normalMap: component.normalMap.value,
      distortionMap: component.distortionMap.value,
      envMap: component.envMap.value,
      color: component.color.value.getHexString() as any as Color,
      opacityRange: component.opacityRange.value,
      opacityFadeDistance: component.opacityFadeDistance.value,
      shallowToDeepDistance: component.shallowToDeepDistance.value,
      shallowWaterColor: component.shallowWaterColor.value,
      waveScale: component.waveScale.value,
      waveSpeed: component.waveSpeed.value,
      waveTiling: component.waveTiling.value,
      waveDistortionTiling: component.waveDistortionTiling.value,
      waveDistortionSpeed: component.waveDistortionSpeed.value,
      shininess: component.shininess.value,
      reflectivity: component.reflectivity.value,
      bigWaveHeight: component.bigWaveHeight.value,
      bigWaveTiling: component.bigWaveTiling.value,
      bigWaveSpeed: component.bigWaveSpeed.value,
      foamSpeed: component.foamSpeed.value,
      foamTiling: component.foamTiling.value,
      foamColor: component.foamColor.value.getHexString() as any as Color
    }
  },
  errors: ['DISTORTION_MAP_ERROR', 'ENVIRONMENT_MAP_ERROR', 'NORMAL_MAP_ERROR']
})

export const SCENE_COMPONENT_OCEAN = 'ocean'
export const SCENE_COMPONENT_OCEAN_DEFAULT_VALUES = {
  normalMap: '',
  distortionMap: '',
  envMap: '',
  color: 0x2876dd,
  opacityRange: { x: 0.6, y: 0.9 } as Vector2,
  opacityFadeDistance: 0.12,
  shallowToDeepDistance: 0.1,
  shallowWaterColor: 0x30c3dd,
  waveScale: { x: 0.25, y: 0.25 } as Vector2,
  waveSpeed: { x: 0.08, y: 0.0 } as Vector2,
  waveTiling: 12.0,
  waveDistortionTiling: 7.0,
  waveDistortionSpeed: { x: 0.08, y: 0.08 } as Vector2,
  shininess: 40,
  reflectivity: 0.25,
  bigWaveHeight: 0.7,
  bigWaveTiling: { x: 1.5, y: 1.5 } as Vector2,
  bigWaveSpeed: { x: 0.02, y: 0.0 } as Vector2,
  foamSpeed: { x: 0.05, y: 0.0 } as Vector2,
  foamTiling: 2.0,
  foamColor: 0xffffff
}
