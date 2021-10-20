export type SkyBoxShaderProps = {
  turbidity: number
  rayleigh: number
  luminance: number
  mieCoefficient: number
  mieDirectionalG: number
  inclination: number
  azimuth: number
}

export enum SkyTypeEnum {
  'color',
  'cubemap',
  'equirectangular',
  'skybox'
}

export type SceneBackgroundProps = {
  backgroundColor: string
  equirectangularPath: string
  cubemapPath: string
  backgroundType: SkyTypeEnum
  skyboxProps: SkyBoxShaderProps
}
