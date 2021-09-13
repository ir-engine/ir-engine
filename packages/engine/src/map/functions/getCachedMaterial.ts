import { MeshLambertMaterial, MeshLambertMaterialParameters } from 'three'

// TODO make this a parameter
const cacheByParams = new Map<MeshLambertMaterialParameters, MeshLambertMaterial>()

export default function getCachedMaterial(Material: any, params: MeshLambertMaterialParameters): MeshLambertMaterial {
  let material: any

  if (!cacheByParams.get(params)) {
    material = new Material(params)
    cacheByParams.set(params, material)
  } else {
    material = cacheByParams.get(params)
  }

  return material
}
