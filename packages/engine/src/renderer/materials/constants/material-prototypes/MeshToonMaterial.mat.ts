import { Color, MeshToonMaterialParameters, Texture, MeshToonMaterial as Toon } from 'three'

import { MaterialPrototypeComponentType } from '../../components/MaterialPrototypeComponent'
import { extractDefaults as format } from '../../functions/Utilities'
import { MaterialParms } from '../../MaterialParms'
import { BasicArgs } from '../BasicArgs'
import { BoolArg, ColorArg, FloatArg, NormalizedFloatArg, TextureArg } from '../DefaultArgs'

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

export const MeshToonMaterial: MaterialPrototypeComponentType = {
  prototypeId: 'MeshToonMaterial',
  baseMaterial: Toon,
  arguments: DefaultArgs
}

export default MeshToonMaterial
