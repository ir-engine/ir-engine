import { Color, MeshMatcapMaterial as Matcap } from 'three'

import { MaterialPrototypeComponentType } from '../../components/MaterialPrototypeComponent'
import { SourceType } from '../../components/MaterialSource'
import { BasicArgs, BumpMapArgs, DisplacementMapArgs, NormalMapArgs } from '../BasicArgs'
import { BoolArg, ColorArg, NormalizedFloatArg, TextureArg } from '../DefaultArgs'

export const DefaultArgs = {
  ...BasicArgs,
  ...BumpMapArgs,
  fog: BoolArg,
  matcap: TextureArg,
  ...NormalMapArgs,
  ...DisplacementMapArgs
}

export const MeshMatcapMaterial: MaterialPrototypeComponentType = {
  prototypeId: 'MeshMatcapMaterial',
  baseMaterial: Matcap,
  arguments: DefaultArgs,
  onBeforeCompile: (shader, renderer) => {
    ;['envMap', 'flipEnvMap', 'reflectivity', 'ior', 'refractionRatio'].map(
      (arg) => (shader.uniforms[arg] = { value: null })
    )
  },
  src: { type: SourceType.BUILT_IN, path: '' }
}

export default MeshMatcapMaterial
