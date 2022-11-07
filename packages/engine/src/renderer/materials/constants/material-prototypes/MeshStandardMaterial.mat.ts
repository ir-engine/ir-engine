import { MeshStandardMaterial as Standard } from 'three'

import { MaterialPrototypeComponentType } from '../../components/MaterialPrototypeComponent'
import { SourceType } from '../../components/MaterialSource'
import {
  BasicArgs,
  BumpMapArgs,
  EmissiveMapArgs,
  EnvMapArgs,
  MetalnessMapArgs,
  NormalMapArgs,
  RoughhnessMapArgs
} from '../BasicArgs'
import { ColorArg, FloatArg, NormalizedFloatArg, TextureArg } from '../DefaultArgs'

export const DefaultArgs = {
  ...BasicArgs,
  ...EmissiveMapArgs,
  ...EnvMapArgs,
  ...NormalMapArgs,
  ...BumpMapArgs,
  ...RoughhnessMapArgs,
  ...MetalnessMapArgs
}

export const MeshStandardMaterial: MaterialPrototypeComponentType = {
  prototypeId: 'MeshStandardMaterial',
  baseMaterial: Standard,
  arguments: DefaultArgs,
  src: { type: SourceType.BUILT_IN, path: '' }
}

export default MeshStandardMaterial
