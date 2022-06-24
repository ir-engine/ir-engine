import { MeshPhysicalMaterial, MeshPhysicalMaterialParameters, Texture } from 'three'

import { MaterialParms } from '../MaterialParms'
import { extractDefaults as format } from '../Utilities'
import { FloatArg, NormalizedFloatArg, TextureArg } from './DefaultArgs'
import { DefaultArgs as StandardDefaults } from './Standard.mat'

export const DefaultArgs = {
  ...StandardDefaults,
  clearcoat: { ...NormalizedFloatArg, default: 0.5 },
  clearcoatMap: TextureArg,
  clearcoatNormalMap: TextureArg,
  transmission: FloatArg,
  transmissionMap: TextureArg
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
