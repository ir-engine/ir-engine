import { MeshLambertMaterial as Lambert } from 'three'

import { MaterialPrototypeComponentType } from '../../components/MaterialPrototypeComponent'
import { SourceType } from '../../components/MaterialSource'
import { BasicArgs, EmissiveMapArgs, EnvMapArgs } from '../BasicArgs'
import { BoolArg, ColorArg, FloatArg, NormalizedFloatArg, TextureArg } from '../DefaultArgs'

export const DefaultArgs = {
  ...BasicArgs,
  ...EmissiveMapArgs,
  ...EnvMapArgs,
  fog: BoolArg
}

export const MeshLambertMaterial: MaterialPrototypeComponentType = {
  prototypeId: 'MeshLambertMaterial',
  baseMaterial: Lambert,
  arguments: DefaultArgs,
  src: { type: SourceType.BUILT_IN, path: '' }
}

export default MeshLambertMaterial
