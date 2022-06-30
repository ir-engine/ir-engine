import { Color, MeshPhongMaterial, MeshPhongMaterialParameters, Texture } from 'three'

import { MaterialParms } from '../MaterialParms'
import { extractDefaults as format } from '../Utilities'
import { BasicArgs } from './Basic.mat'
import { BoolArg, ColorArg, FloatArg, NormalizedFloatArg, TextureArg } from './DefaultArgs'

export const DefaultArgs = {
  ...BasicArgs,
  bumpMap: TextureArg,
  bumpScale: { ...NormalizedFloatArg, default: 0.025 },
  displacementBias: NormalizedFloatArg,
  displacementMap: TextureArg,
  displacementScale: { ...FloatArg, default: 0.025 },
  dithering: { ...BoolArg, default: true },
  emissive: ColorArg,
  emissiveIntensity: { ...FloatArg, default: 1 },
  emissiveMap: TextureArg,
  normalMap: TextureArg,
  fog: BoolArg,
  opacity: { ...NormalizedFloatArg, default: 1 },
  transparent: BoolArg,
  reflectivity: NormalizedFloatArg,
  refractionRatio: { ...NormalizedFloatArg, default: 0.2 },
  shininess: { ...NormalizedFloatArg, default: 0.2 }
}

export default function Phong(args?: MeshPhongMaterialParameters): MaterialParms {
  const _args = args ? { ...format(DefaultArgs), ...args } : format(DefaultArgs)
  return {
    material: new MeshPhongMaterial(_args),
    update: (dt) => {}
  }
}
