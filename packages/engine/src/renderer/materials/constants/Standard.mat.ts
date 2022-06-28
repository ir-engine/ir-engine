import { Color, MeshStandardMaterial, MeshStandardMaterialParameters, Texture } from 'three'

import { DudTexture, MaterialParms } from '../MaterialParms'
import { extractDefaults as format } from '../Utilities'
import { BasicArgs } from './Basic.mat'
import { ColorArg, FloatArg, NormalizedFloatArg, TextureArg } from './DefaultArgs'

export const DefaultArgs = {
  ...BasicArgs,
  emissive: ColorArg,
  emissiveIntensity: { ...FloatArg, default: 0 },
  emissiveMap: TextureArg,
  envMapIntensity: { ...NormalizedFloatArg, default: 0.1 },
  normalMap: TextureArg,
  bumpMap: TextureArg,
  bumpScale: { ...NormalizedFloatArg, default: 0.025 },
  roughnessMap: TextureArg,
  roughness: { ...NormalizedFloatArg, default: 0.95 },
  metalnessMap: TextureArg,
  metalness: NormalizedFloatArg,
  transparent: false
}

export default function Standard(args?: MeshStandardMaterialParameters): MaterialParms {
  const mat = new MeshStandardMaterial(args ? { ...format(DefaultArgs), ...args } : format(DefaultArgs))
  return {
    material: mat,
    update: (dt) => {}
  }
}
