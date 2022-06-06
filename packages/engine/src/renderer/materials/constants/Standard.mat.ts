import { Color, MeshStandardMaterial, MeshStandardMaterialParameters, Texture } from 'three'

import { DudTexture, MaterialParms } from '../MaterialParms'
import { formatMaterialArgs as format } from '../Utilities'

export const DefaultArgs: MeshStandardMaterialParameters = {
  aoMap: new Texture(),
  aoMapIntensity: 0.0,
  alphaMap: new Texture(),
  lightMap: new Texture(),
  lightMapIntensity: 0.0,
  normalMap: new Texture(),
  roughnessMap: new Texture(),
  roughness: 0.95,
  metalnessMap: new Texture(),
  metalness: 0.0,
  map: new Texture(),
  transparent: false
}

export default async function Standard(args?: MeshStandardMaterialParameters): Promise<MaterialParms> {
  const mat = new MeshStandardMaterial(args ? { ...format(DefaultArgs), ...args } : format(DefaultArgs))
  return {
    material: mat,
    update: (dt) => {}
  }
}
