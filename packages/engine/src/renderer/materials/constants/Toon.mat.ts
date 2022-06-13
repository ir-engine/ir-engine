import { Color, MeshToonMaterial, MeshToonMaterialParameters, Texture } from 'three'

import { MaterialParms } from '../MaterialParms'
import { formatMaterialArgs as format } from '../Utilities'
import { BasicArgs } from './Basic.mat'

export const DefaultArgs: MeshToonMaterialParameters = {
  ...BasicArgs,
  displacementBias: 0,
  displacementMap: new Texture(),
  displacementScale: 0.025,
  emissive: new Color(0, 0, 0),
  emissiveIntensity: 1.0,
  emissiveMap: new Texture(),
  fog: false,
  gradientMap: new Texture(),
  normalMap: new Texture(),
  transparent: false,
  opacity: 1.0
}

export default async function Toon(args?: MeshToonMaterialParameters): Promise<MaterialParms> {
  return {
    material: new MeshToonMaterial(args ? { ...format(DefaultArgs), ...args } : format(DefaultArgs)),
    update: (dt) => {}
  }
}
