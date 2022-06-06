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

export default async function Physical(args?: MeshPhysicalMaterialParameters): Promise<MaterialParms> {
  return {
    material: new MeshPhysicalMaterial(args ? { ...format(DefaultArgs), ...args } : format(DefaultArgs)),
    update: (dt) => {}
  }
}
