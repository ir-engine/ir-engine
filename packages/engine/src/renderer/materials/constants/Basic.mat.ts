import { Color, MeshBasicMaterial, MeshBasicMaterialParameters, Texture } from 'three'

import { MaterialParms } from '../MaterialParms'
import { formatMaterialArgs as format } from '../Utilities'

export const BasicArgs = {
  alphaTest: 0.0,
  alphaMap: new Texture(),
  aoMap: new Texture(),
  aoMapIntensity: 0.0,
  envMap: new Texture(),
  lightMap: new Texture(),
  lightMapIntensity: 1.0,
  map: new Texture(),
  color: new Color(1, 1, 1)
}

export const DefaultArgs: MeshBasicMaterialParameters = {
  ...BasicArgs,
  specularMap: new Texture()
}

export default function Basic(args?: MeshBasicMaterialParameters): MaterialParms {
  const mat = new MeshBasicMaterial(args ? { ...format(DefaultArgs), ...args } : format(DefaultArgs))
  return {
    material: mat,
    update: (dt) => {}
  }
}
