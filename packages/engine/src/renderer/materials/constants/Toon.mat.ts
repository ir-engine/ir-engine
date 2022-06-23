import { Color, MeshToonMaterial, MeshToonMaterialParameters, Texture } from 'three'

import { MaterialParms } from '../MaterialParms'
import { extractDefaults as format } from '../Utilities'
import { BasicArgs } from './Basic.mat'
import { BoolArg, ColorArg, FloatArg, NormalizedFloatArg, TextureArg } from './DefaultArgs'

export const DefaultArgs = {
  ...BasicArgs,
  displacementBias: FloatArg,
  displacementMap: TextureArg,
  displacementScale: { ...NormalizedFloatArg, default: 0.025 },
  emissive: ColorArg,
  emissiveIntensity: { ...FloatArg, default: 1 },
  emissiveMap: TextureArg,
  fog: BoolArg,
  gradientMap: TextureArg,
  normalMap: TextureArg,
  transparent: BoolArg,
  opacity: { ...NormalizedFloatArg, default: 1 }
}

export default function Toon(args?: MeshToonMaterialParameters): MaterialParms {
  return {
    material: new MeshToonMaterial(args ? { ...format(DefaultArgs), ...args } : format(DefaultArgs)),
    update: (dt) => {}
  }
}
