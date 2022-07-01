import { Color, MeshMatcapMaterial, MeshMatcapMaterialParameters, Texture } from 'three'

import { MaterialParms } from '../MaterialParms'
import { extractDefaults as format } from '../Utilities'
import { BoolArg, ColorArg, NormalizedFloatArg, TextureArg } from './DefaultArgs'

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

export default function Matcap(args?: MeshMatcapMaterialParameters): MaterialParms {
  const material = new MeshMatcapMaterial(args ? { ...format(DefaultArgs), ...args } : format(DefaultArgs))
  material.onBeforeCompile = (shader, renderer) => {
    ;['envMap', 'flipEnvMap', 'reflectivity', 'ior', 'refractionRatio'].map(
      (arg) => (shader.uniforms[arg] = { value: null })
    )
  }
  return {
    material,
    update: (dt) => {}
  }
}
