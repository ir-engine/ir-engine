import { Color, MeshMatcapMaterial, MeshMatcapMaterialParameters, Texture } from 'three'

import { MaterialParms } from '../MaterialParms'
import { formatMaterialArgs as format } from '../Utilities'

export const DefaultArgs: MeshMatcapMaterialParameters = {
  alphaMap: new Texture(),
  alphaTest: 0.0,
  bumpMap: new Texture(),
  bumpScale: 0.025,
  color: new Color(1, 1, 1),
  fog: false,
  map: new Texture(),
  matcap: new Texture(),
  normalMap: new Texture(),
  transparent: false,
  opacity: 1.0
}

export default function Matcap(args?: MeshMatcapMaterialParameters): MaterialParms {
  return {
    material: new MeshMatcapMaterial(args ? { ...format(DefaultArgs), ...args } : format(DefaultArgs)),
    update: (dt) => {}
  }
}
