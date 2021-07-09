import { SkyBoxShaderProps } from '../../editor/nodes/SkyboxNode'

export const enum EnvMapSourceType{
  'Default', 'Texture', 'Color',
}

export const enum EnvMapTextureType{
  'Cubemap', 'Equirectangular',
}

export interface EnvMapProps {
  type: EnvMapSourceType
  envMapIntensity: number
  envMapSourceURL?: string
  envMapTextureType?: EnvMapTextureType
  envMapSourceColor?: string
}
