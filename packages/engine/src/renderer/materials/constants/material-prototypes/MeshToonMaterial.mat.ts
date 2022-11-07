import { MeshToonMaterial as Toon } from 'three'

import { MaterialPrototypeComponentType } from '../../components/MaterialPrototypeComponent'
import { SourceType } from '../../components/MaterialSource'
import { BasicArgs, DisplacementMapArgs, EmissiveMapArgs, NormalMapArgs } from '../BasicArgs'
import { BoolArg, ColorArg, FloatArg, NormalizedFloatArg, TextureArg } from '../DefaultArgs'

export const DefaultArgs = {
  ...BasicArgs,
  ...DisplacementMapArgs,
  ...EmissiveMapArgs,
  fog: BoolArg,
  gradientMap: TextureArg,
  ...NormalMapArgs
}

export const MeshToonMaterial: MaterialPrototypeComponentType = {
  prototypeId: 'MeshToonMaterial',
  baseMaterial: Toon,
  arguments: DefaultArgs,
  src: { type: SourceType.BUILT_IN, path: '' }
}

export default MeshToonMaterial
