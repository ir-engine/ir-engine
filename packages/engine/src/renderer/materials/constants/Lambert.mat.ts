import { Color, MeshLambertMaterial, MeshLambertMaterialParameters, Texture } from 'three'

import { MaterialParms } from '../MaterialParms'
import { extractDefaults as format } from '../Utilities'
import { BasicArgs } from './Basic.mat'
import { BoolArg, ColorArg, FloatArg, NormalizedFloatArg, TextureArg } from './DefaultArgs'

export const DefaultArgs = {
  ...BasicArgs,
  emissive: ColorArg,
  emissiveIntensity: { ...FloatArg, default: 1 },
  emissiveMap: TextureArg,
  fog: BoolArg,
  opacity: { ...NormalizedFloatArg, default: 1 },
  transparent: BoolArg,
  reflectivity: NormalizedFloatArg,
  refractionRatio: { ...NormalizedFloatArg, default: 0.2 }
}

export default function Lambert(args?: MeshLambertMaterialParameters): MaterialParms {
  return {
    material: new MeshLambertMaterial(args ? { ...format(DefaultArgs), ...args } : format(DefaultArgs)),
    update: (dt) => {}
  }
}
