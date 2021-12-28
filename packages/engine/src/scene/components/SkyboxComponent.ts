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
