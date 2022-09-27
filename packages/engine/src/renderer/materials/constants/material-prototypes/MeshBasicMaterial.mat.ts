import { MeshBasicMaterial as Basic, Color } from 'three'

import { MaterialPrototypeComponentType } from '../../components/MaterialPrototypeComponent'
import { BasicArgs } from '../BasicArgs'
import { ColorArg, FloatArg, NormalizedFloatArg, TextureArg } from '../DefaultArgs'

export const DefaultArgs = {
  ...BasicArgs,
  specularMap: TextureArg
}

export const MeshBasicMaterial: MaterialPrototypeComponentType = {
  prototypeId: 'MeshBasicMaterial',
  baseMaterial: Basic,
  arguments: DefaultArgs,
  src: { type: 'Built In', path: '' }
}

export default MeshBasicMaterial
