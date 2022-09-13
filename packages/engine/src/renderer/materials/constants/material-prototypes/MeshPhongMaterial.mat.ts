import { Color, MeshPhongMaterialParameters, MeshPhongMaterial as Phong, Texture } from 'three'

import { MaterialPrototypeComponentType } from '../../components/MaterialPrototypeComponent'
import { extractDefaults as format } from '../../functions/Utilities'
import { MaterialParms } from '../../MaterialParms'
import { BasicArgs } from '../BasicArgs'
import { BoolArg, ColorArg, FloatArg, NormalizedFloatArg, TextureArg } from '../DefaultArgs'

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

export const MeshPhongMaterial: MaterialPrototypeComponentType = {
  prototypeId: 'MeshPhongMaterial',
  baseMaterial: Phong,
  arguments: DefaultArgs
}

export default MeshPhongMaterial
