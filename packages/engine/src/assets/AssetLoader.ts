import { FileLoader, LOD, MeshPhysicalMaterial, Object3D, TextureLoader } from 'three'
import { isAbsolutePath } from '../common/functions/isAbsolutePath'
import { Engine } from '../ecs/Engine'
import { AssetClass } from './AssetClass'
import { AssetType } from './AssetType'
import { FBXLoader } from './FBXLoader'
import { DEFAULT_LOD_DISTANCES, LODS_REGEXP } from './LoaderConstants'
import { getLoader as getGLTFLoader, loadExtentions } from './LoadGLTF'

/**
* Process a model asset.
* Traverse the asset and its children
* If the child is a Mesh, check if it has a material. If it does, check if it has a userData.gltfExtensions.KHR_materials_clearcoat.
* If it does, create a new MeshPhysicalMaterial and set its values to the original material.
* Set the clearcoat and clearcoatRoughness properties of the new material.
* Set the defines property of the new material to { STANDARD: '', PHYSICAL: '' }.
* Add the new material to the Map of replaced materials.
* Replace the original material with the new material.
* Repeat steps 1-7 for all children.
 * @param asset - Model asset.
 * @param params - Asset loader parameters.
 * @throws {@link MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
* @internal
*/
export const processModelAsset = (asset: any, params: AssetLoaderParamType): void => {
  const replacedMaterials = new Map()
  asset.traverse((child) => {
    if (!child.isMesh) return

    if (typeof params.receiveShadow !== 'undefined') child.receiveShadow = params.receiveShadow
    if (typeof params.castShadow !== 'undefined') child.castShadow = params.castShadow

    if (replacedMaterials.has(child.material)) {
      child.material = replacedMaterials.get(child.material)
    } else {
      if (child.material?.userData?.gltfExtensions?.KHR_materials_clearcoat) {
        const newMaterial = new MeshPhysicalMaterial({})
        newMaterial.setValues(child.material) // to copy properties of original material
        newMaterial.clearcoat = child.material.userData.gltfExtensions.KHR_materials_clearcoat.clearcoatFactor
        newMaterial.clearcoatRoughness =
          child.material.userData.gltfExtensions.KHR_materials_clearcoat.clearcoatRoughnessFactor
        newMaterial.defines = { STANDARD: '', PHYSICAL: '' } // override if it's replaced by non PHYSICAL defines of child.material

        replacedMaterials.set(child.material, newMaterial)
        child.material = newMaterial
      }
    }
  })
  replacedMaterials.clear()

  handleLODs(asset)

  if (asset.children.length) {
    asset.children.forEach((child) => handleLODs(child))
  }
}

/**
* Process a model asset.
* Traverse the asset and its children
* If the child is a Mesh, check if it has a material. If it does, check if it has a userData.gltfExtensions.KHR_materials_clearcoat.
* If it does, create a new MeshPhysicalMaterial and set its values to the original material.
* Set the clearcoat and clearcoatRoughness properties of the new material.
* Set the defines property of the new material to { STANDARD: '', PHYSICAL: '' }.
* Add the new material to the Map of replaced materials.
* Replace the original material with the new material.
* Repeat steps 1-7 for all children.
 * @param asset - Model asset.
 * @param params - Asset loader parameters.
 * @throws {@link MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
* @internal
*/

export const handleLODs = (asset: Object3D): Object3D => {
  const haveAnyLODs = !!asset.children?.find((c) => String(c.name).match(LODS_REGEXP))
  if (!haveAnyLODs) {
    return asset
  }

  const LODs = new Map<string, { object: Object3D; level: string }[]>()
  asset.children.forEach((child) => {
    const childMatch = child.name.match(LODS_REGEXP)
    if (!childMatch) {
      return
    }
    const [_, name, level]: string[] = childMatch
    if (!name || !level) {
      return
    }

    if (!LODs.has(name)) {
      LODs.set(name, [])
    }

    LODs.get(name)?.push({ object: child, level })
  })

  LODs.forEach((value, key) => {
    const lod = new LOD()
    lod.name = key
    value[0].object.parent?.add(lod)

    value.forEach(({ level, object }) => {
      lod.addLevel(object, AssetLoader.LOD_DISTANCES[level])
    })
  })

  return asset
}

/**
 * Get asset type from the asset file extension.
 * @param assetFileName Name of the Asset file.
 * @returns Asset type of the file.
 */
export const getAssetType = (assetFileName: string): AssetType => {
  if (/\.(?:gltf|glb)$/.test(assetFileName)) return AssetType.glTF
  else if (/\.(?:fbx)$/.test(assetFileName)) return AssetType.FBX
  else if (/\.(?:vrm)$/.test(assetFileName)) return AssetType.VRM
  else if (/\.(?:png)$/.test(assetFileName)) return AssetType.PNG
  else if (/\.(?:jpg|jpeg|)$/.test(assetFileName)) return AssetType.JPEG
  return null!
}

/**
 * Get asset class from the asset file extension.
 * @param assetFileName Name of the Asset file.
 * @returns Asset class of the file.
 */
export const getAssetClass = (assetFileName: string): AssetClass => {
  if (/\.(?:gltf|glb|vrm|fbx|obj)$/.test(assetFileName)) {
    return AssetClass.Model
  } else if (/\.png|jpg|jpeg$/.test(assetFileName)) {
    return AssetClass.Image
  } else {
    return null!
  }
}

const fbxLoader = new FBXLoader()
const textureLoader = new TextureLoader()
const fileLoader = new FileLoader()

const getLoader = (assetType: AssetType) => {
  switch (assetType) {
    case AssetType.glTF:
    case AssetType.VRM:
      return getGLTFLoader()
    case AssetType.FBX:
      return fbxLoader
    case AssetType.PNG:
    case AssetType.JPEG:
      return textureLoader
    default:
      return fileLoader
  }
}

type AssetLoaderParamType = {
  url: string
  castShadow?: boolean
  receiveShadow?: boolean
  [key: string]: any
}

const load = (
  params: AssetLoaderParamType,
  onLoad = (response: any) => {},
  onProgress = (request: ProgressEvent) => {},
  onError = (event: ErrorEvent | Error) => {}
) => {
  if (!params.url) {
    onError(new Error('URL is empty'))
    return
  }
  const url = isAbsolutePath(params.url) ? params.url : Engine.publicPath + params.url

  if (AssetLoader.Cache.has(url)) {
    onLoad(AssetLoader.Cache.get(url))
  }

  const assetType = getAssetType(url)
  const assetClass = getAssetClass(url)

  const loader = getLoader(assetType)

  loader.load(
    url,
    (asset) => {
      if (assetType === AssetType.glTF || assetType === AssetType.VRM) {
        loadExtentions(asset)
      }

      if (assetClass === AssetClass.Model) {
        processModelAsset(asset.scene, params)
      }

      AssetLoader.Cache.set(url, asset)

      onLoad(asset)
    },
    onProgress,
    onError
  )
}

/**
* Load a model asset.
* @param params - Asset loader parameters.
* @throws {@link MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
* @internal
*/
export class AssetLoader {
  static Cache = new Map<string, any>()
  static loaders = new Map<number, any>()
  static LOD_DISTANCES = DEFAULT_LOD_DISTANCES

  assetType: AssetType
  assetClass: AssetClass
  result: any

/**
* Load a model asset.
* @param params - Asset loader parameters.
* @param onLoad - Handler function for the load event.
* @param onProgress - Handler function for the progress event.
* @param onError - Handler function for the error event.
* @throws {@link MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
* @internal
*/
  static load(
    params: AssetLoaderParamType,
    onLoad = (response: any) => {},
    onProgress = (request: ProgressEvent) => {},
    onError = (event: ErrorEvent | Error) => {}
  ) {
    load(params, onLoad, onProgress, onError)
  }

/**
* Loads a model asset.
* @param params - Asset loader parameters.
* @return {Promise}
* @throws {MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
* @internal
*/
  static async loadAsync(params: AssetLoaderParamType) {
    return new Promise<any>((resolve, reject) => {
      load(params, resolve, () => {}, resolve)
    })
  }

/**
* Loads an asset from the cache.
* @param url - The url of the asset to load.
* @return {@link Asset} The loaded asset.
* @internal
*/

  static getFromCache(url: string) {
    return AssetLoader.Cache.get(isAbsolutePath(url) ? url : Engine.publicPath + url)
  }
}
