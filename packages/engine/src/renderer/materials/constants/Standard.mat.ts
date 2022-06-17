import { Color, MeshStandardMaterial, MeshStandardMaterialParameters, Texture } from 'three'

import { DudTexture, MaterialParms } from '../MaterialParms'
import { formatMaterialArgs as format } from '../Utilities'
import { BasicArgs } from './Basic.mat'

export const DefaultArgs: MeshStandardMaterialParameters = {
  ...BasicArgs,
  emissive: new Color(0, 0, 0),
  emissiveIntensity: 1.0,
  emissiveMap: new Texture(),
  envMapIntensity: 0.1,
  normalMap: new Texture(),
  bumpMap: new Texture(),
  bumpScale: 0.025,
  roughnessMap: new Texture(),
  roughness: 0.95,
  metalnessMap: new Texture(),
  metalness: 0.0,
  transparent: false
}

export default function Standard(args?: MeshStandardMaterialParameters): MaterialParms {
  const mat = new MeshStandardMaterial(args ? { ...format(DefaultArgs), ...args } : format(DefaultArgs))
  return {
    material: mat,
    update: (dt) => {}
  }
}
