import { Color, MeshLambertMaterial as Lambert, MeshLambertMaterialParameters, Texture } from 'three'

import { MaterialPrototypeComponentType } from '../../components/MaterialPrototypeComponent'
import { extractDefaults as format } from '../../functions/Utilities'
import { MaterialParms } from '../../MaterialParms'
import { BasicArgs } from '../BasicArgs'
import { BoolArg, ColorArg, FloatArg, NormalizedFloatArg, TextureArg } from '../DefaultArgs'

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

export const MeshLambertMaterial: MaterialPrototypeComponentType = {
  prototypeId: 'MeshLambertMaterial',
  baseMaterial: Lambert,
  arguments: DefaultArgs
}

export default MeshLambertMaterial
