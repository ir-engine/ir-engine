import { CubemapBakeSettings } from '@xrengine/engine/src/scene/types/CubemapBakeSettings'

export const enum EnvMapSourceType {
  'Default',
  'Texture',
  'Color'
}

export const enum EnvMapTextureType {
  'Cubemap',
  'Equirectangular'
}

export type EnvMapProps = {
  type: EnvMapSourceType
  envMapIntensity: number
  envMapSourceURL?: string
  envMapTextureType?: EnvMapTextureType
  envMapSourceColor?: string
  envMapCubemapBake?: CubemapBakeSettings
}
