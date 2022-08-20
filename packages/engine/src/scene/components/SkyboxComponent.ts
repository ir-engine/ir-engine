import { Color } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { Sky } from '../classes/Sky'
import { SkyTypeEnum } from '../constants/SkyTypeEnum'

export type SkyBoxShaderProps = {
  turbidity: number
  rayleigh: number
  luminance: number
  mieCoefficient: number
  mieDirectionalG: number
  inclination: number
  azimuth: number
}

export type SkyboxComponentType = {
  backgroundColor: Color
  equirectangularPath: string
  cubemapPath: string
  backgroundType: SkyTypeEnum
  skyboxProps: SkyBoxShaderProps
  sky?: Sky
}

export const SkyboxComponent = createMappedComponent<SkyboxComponentType>('SkyboxComponent')

export const SCENE_COMPONENT_SKYBOX = 'skybox'
export const SCENE_COMPONENT_SKYBOX_DEFAULT_VALUES = {
  backgroundColor: 0x000000,
  equirectangularPath: '',
  cubemapPath: '/hdr/cubemap/skyboxsun25deg/',
  backgroundType: 1,
  skyboxProps: {
    turbidity: 10,
    rayleigh: 1,
    luminance: 1,
    mieCoefficient: 0.004999999999999893,
    mieDirectionalG: 0.99,
    inclination: 0.10471975511965978,
    azimuth: 0.16666666666666666
  }
}
