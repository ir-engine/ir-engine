import { MeshLambertMaterial, MeshLambertMaterialParameters } from 'three'

// TODO make this a parameter
const cacheByParams = new Map<MeshLambertMaterialParameters, MeshLambertMaterial>()

// TODO re-implement using createUsingGetSet because this actually creates a new material every time it's called because params is an object
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
