import { MeshLambertMaterial, MeshLambertMaterialParameters } from 'three'

// TODO make this a parameter
const cache = new Map<string, MeshLambertMaterial>()

// TODO re-implement using createUsingGetSet
// TODO generalize this so it'll work even if params contain Textures
export default function getCachedMaterial(Material: any, params: MeshLambertMaterialParameters): MeshLambertMaterial {
  const key = JSON.stringify(params)
  let material = cache.get(key)

  if (!material) {
    material = new Material(params)
    cache.set(key, material!)
  }

  return material!
}
