export enum SkyTypeEnum {
  COLOR = 'color',
  CUBEMAP = 'cubemap',
  EQUIRECTANGULAR = 'equirectangular',
  SKYBOX = 'skybox'
}

export type SkyBoxShaderProps = {
  turbidity: number
  rayleigh: number
  luminance: number
  mieCoefficient: number
  mieDirectionalG: number
  inclination: number
  azimuth: number
  backgroundType: SkyTypeEnum
}

export type SceneBackgroundProps = {
  backgroundColor: string
  equirectangularPath: string
  cubemapPath: string
  backgroundType: SkyTypeEnum
  skyboxProps: SkyBoxShaderProps
}

export type SkyboxArgs = SkyBoxShaderProps | SceneBackgroundProps
