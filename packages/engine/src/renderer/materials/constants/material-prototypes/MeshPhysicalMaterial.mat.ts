import { MeshPhysicalMaterial as Physical } from 'three'

import { MaterialPrototypeComponentType } from '../../components/MaterialPrototypeComponent'
import { FloatArg, NormalizedFloatArg, TextureArg } from '../DefaultArgs'
import { DefaultArgs as StandardDefaults } from './MeshStandardMaterial.mat'

export const DefaultArgs = {
  ...StandardDefaults,
  clearcoat: { ...NormalizedFloatArg, default: 0.5 },
  clearcoatMap: TextureArg,
  clearcoatNormalMap: TextureArg,
  transmission: FloatArg,
  transmissionMap: TextureArg
}

export const MeshPhysicalMaterial: MaterialPrototypeComponentType = {
  prototypeId: 'MeshPhysicalMaterial',
  baseMaterial: Physical,
  arguments: DefaultArgs,
  src: { type: 'Built In', path: '' }
}

export default MeshPhysicalMaterial
