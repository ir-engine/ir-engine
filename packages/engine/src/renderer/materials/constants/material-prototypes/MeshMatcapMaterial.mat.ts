import { Color, MeshMatcapMaterial as Matcap } from 'three'

import { MaterialPrototypeComponentType } from '../../components/MaterialPrototypeComponent'
import { SourceType } from '../../components/MaterialSource'
import { BoolArg, ColorArg, NormalizedFloatArg, TextureArg } from '../DefaultArgs'

export const DefaultArgs = {
  alphaMap: TextureArg,
  alphaTest: NormalizedFloatArg,
  bumpMap: TextureArg,
  bumpScale: { ...NormalizedFloatArg, default: 0.025 },
  color: { ...ColorArg, default: new Color(1, 1, 1) },
  fog: BoolArg,
  map: TextureArg,
  matcap: TextureArg,
  normalMap: TextureArg,
  transparent: BoolArg,
  opacity: { ...NormalizedFloatArg, default: 1 }
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
