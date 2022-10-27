import { MeshStandardMaterial as Standard } from 'three'

import { MaterialPrototypeComponentType } from '../../components/MaterialPrototypeComponent'
import { SourceType } from '../../components/MaterialSource'
import { BasicArgs } from '../BasicArgs'
import { ColorArg, FloatArg, NormalizedFloatArg, TextureArg } from '../DefaultArgs'

export const DefaultArgs = {
  ...BasicArgs,
  emissive: ColorArg,
  emissiveIntensity: { ...FloatArg, default: 0 },
  emissiveMap: TextureArg,
  envMapIntensity: { ...NormalizedFloatArg, default: 0.1 },
  normalMap: TextureArg,
  bumpMap: TextureArg,
  bumpScale: { ...NormalizedFloatArg, default: 0.025 },
  roughnessMap: TextureArg,
  roughness: { ...NormalizedFloatArg, default: 0.95 },
  metalnessMap: TextureArg,
  metalness: NormalizedFloatArg
}

export const MeshStandardMaterial: MaterialPrototypeComponentType = {
  prototypeId: 'MeshStandardMaterial',
  baseMaterial: Standard,
  arguments: DefaultArgs,
  src: { type: SourceType.BUILT_IN, path: '' }
}

export default MeshStandardMaterial
