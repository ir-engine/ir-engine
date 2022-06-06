import { MeshBasicMaterial, MeshBasicMaterialParameters, Texture } from 'three'

import { MaterialParms } from '../MaterialParms'
import { formatMaterialArgs as format } from '../Utilities'

export const DefaultArgs: MeshBasicMaterialParameters = {
  alphaTest: 0.0,
  alphaMap: new Texture(),
  aoMap: new Texture(),
  envMap: new Texture(),
  lightMap: new Texture(),
  specularMap: new Texture(),
  map: new Texture()
}

export default async function Basic(args?: MeshBasicMaterialParameters): Promise<MaterialParms> {
  const mat = new MeshBasicMaterial(args ? { ...format(DefaultArgs), ...args } : format(DefaultArgs))
  return {
    material: mat,
    update: (dt) => {}
  }
}
