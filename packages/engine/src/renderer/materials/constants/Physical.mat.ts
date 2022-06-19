import { MeshPhysicalMaterial, MeshPhysicalMaterialParameters, Texture } from 'three'

import { MaterialParms } from '../MaterialParms'
import { formatMaterialArgs as format } from '../Utilities'
import { DefaultArgs as StandardDefaults } from './Standard.mat'

export const DefaultArgs: MeshPhysicalMaterialParameters = {
  ...StandardDefaults,
  clearcoat: 0.5,
  clearcoatMap: new Texture(),
  clearcoatNormalMap: new Texture(),
  transmission: 0.0,
  transmissionMap: new Texture()
}

export default function Physical(args?: MeshPhysicalMaterialParameters): MaterialParms {
  const mergedArgs = args ? { ...format(DefaultArgs), ...args } : format(DefaultArgs)
  const material = new MeshPhysicalMaterial()
  for (const [k, v] of Object.entries(mergedArgs)) {
    material[k] = v
  }
  return {
    material: material,
    update: (dt) => {}
  }
}
