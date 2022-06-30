import { Color, MeshBasicMaterial, MeshBasicMaterialParameters, Texture } from 'three'

import { MaterialParms } from '../MaterialParms'
import { extractDefaults as format } from '../Utilities'
import { ColorArg, FloatArg, NormalizedFloatArg, TextureArg } from './DefaultArgs'

export const BasicArgs = {
  alphaTest: TextureArg,
  alphaMap: TextureArg,
  aoMap: TextureArg,
  aoMapIntensity: NormalizedFloatArg,
  envMap: TextureArg,
  lightMap: TextureArg,
  lightMapIntensity: FloatArg,
  map: TextureArg,
  color: { ...ColorArg, default: new Color(1, 1, 1) }
}

export const DefaultArgs = {
  ...BasicArgs,
  specularMap: TextureArg
}

export default function Basic(args?: MeshBasicMaterialParameters): MaterialParms {
  const mat = new MeshBasicMaterial(args ? { ...format(DefaultArgs), ...args } : format(DefaultArgs))
  return {
    material: mat,
    update: (dt) => {}
  }
}
