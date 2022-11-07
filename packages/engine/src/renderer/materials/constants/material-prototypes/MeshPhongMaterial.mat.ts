import { MeshPhongMaterial as Phong } from 'three'

import { MaterialPrototypeComponentType } from '../../components/MaterialPrototypeComponent'
import { SourceType } from '../../components/MaterialSource'
import { BasicArgs, BumpMapArgs, DisplacementMapArgs, EmissiveMapArgs, EnvMapArgs, NormalMapArgs } from '../BasicArgs'
import { BoolArg, ColorArg, FloatArg, NormalizedFloatArg, TextureArg } from '../DefaultArgs'

export const DefaultArgs = {
  ...BasicArgs,
  ...BumpMapArgs,
  ...DisplacementMapArgs,
  dithering: { ...BoolArg, default: true },
  ...EmissiveMapArgs,
  ...NormalMapArgs,
  fog: BoolArg,
  ...EnvMapArgs,
  shininess: { ...FloatArg, default: 30 }
}

export const MeshPhongMaterial: MaterialPrototypeComponentType = {
  prototypeId: 'MeshPhongMaterial',
  baseMaterial: Phong,
  arguments: DefaultArgs,
  src: { type: SourceType.BUILT_IN, path: '' }
}

export default MeshPhongMaterial
