import { Color, MeshPhongMaterial, MeshPhongMaterialParameters, Texture } from 'three'

import { MaterialParms } from '../MaterialParms'
import { formatMaterialArgs as format } from '../Utilities'
import { BasicArgs } from './Basic.mat'

export const DefaultArgs: MeshPhongMaterialParameters = {
  ...BasicArgs,
  bumpMap: new Texture(),
  bumpScale: 0.025,
  displacementBias: 0.0,
  displacementMap: new Texture(),
  displacementScale: 0.025,
  dithering: true,
  emissive: new Color(0, 0, 0),
  emissiveIntensity: 1.0,
  emissiveMap: new Texture(),
  normalMap: new Texture(),
  fog: false,
  opacity: 1.0,
  transparent: false,
  reflectivity: 0,
  refractionRatio: 0.2,
  shininess: 0.2
}

export default function Phong(args?: MeshPhongMaterialParameters): MaterialParms {
  const _args = args ? { ...format(DefaultArgs), ...args } : format(DefaultArgs)
  return {
    material: new MeshPhongMaterial(_args),
    update: (dt) => {}
  }
}
