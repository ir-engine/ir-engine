import { Color, MeshLambertMaterial, MeshLambertMaterialParameters, Texture } from 'three'

import { MaterialParms } from '../MaterialParms'
import { formatMaterialArgs as format } from '../Utilities'
import { BasicArgs } from './Basic.mat'

export const DefaultArgs: MeshLambertMaterialParameters = {
  ...BasicArgs,
  emissive: new Color(0, 0, 0),
  emissiveIntensity: 1.0,
  emissiveMap: new Texture(),
  fog: false,
  opacity: 1.0,
  transparent: false,
  reflectivity: 0,
  refractionRatio: 0.2
}

export default async function Lambert(args?: MeshLambertMaterialParameters): Promise<MaterialParms> {
  return {
    material: new MeshLambertMaterial(args ? { ...format(DefaultArgs), ...args } : format(DefaultArgs)),
    update: (dt) => {}
  }
}
