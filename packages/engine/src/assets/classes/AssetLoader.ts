import { FileLoader, MeshPhysicalMaterial, Object3D, LOD, TextureLoader } from 'three'
import { getLoader as getGLTFLoader, loadExtentions } from '../functions/LoadGLTF'
import { FBXLoader } from '../loaders/fbx/FBXLoader'
import { AssetType } from '../enum/AssetType'
import { AssetClass } from '../enum/AssetClass'
import { Entity } from '../../ecs/classes/Entity'
import { isAbsolutePath } from '../../common/functions/isAbsolutePath'
import { Engine } from '../../ecs/classes/Engine'
import { LODS_REGEXP, DEFAULT_LOD_DISTANCES } from '../constants/LoaderConstants'
import { instanceGLTF } from '../functions/transformGLTF'

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
 * Handles Level of Detail for asset.
 * @param asset Asset on which LOD will apply.
 * @returns LOD handled asset.
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

const load = async (
  params: AssetLoaderParamType,
  onLoad = (response: any) => {},
  onProgress = (request: ProgressEvent) => {},
  onError = (event: ErrorEvent | Error) => {},
  isInstanced = false
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

  if (isInstanced) {
    let buffer = await instanceGLTF(url)
    // console.log('instanced loading')

    loader.parse(
      buffer,
      null,
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
      onError
    )
  } else {
    // console.log('non instanced loading')
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
}

export class AssetLoader {
  static Cache = new Map<string, any>()
  static loaders = new Map<number, any>()
  static LOD_DISTANCES = DEFAULT_LOD_DISTANCES

  assetType: AssetType
  assetClass: AssetClass
  result: any

  static load(
    params: AssetLoaderParamType,
    onLoad = (response: any) => {},
    onProgress = (request: ProgressEvent) => {},
    onError = (event: ErrorEvent | Error) => {},
    isInstanced = false
  ) {
    load(params, onLoad, onProgress, onError, isInstanced)
  }

  static async loadAsync(params: AssetLoaderParamType) {
    return new Promise<any>((resolve, reject) => {
      load(params, resolve, () => {}, resolve)
    })
  }

  // TODO: we are replciating code here, we should refactor AssetLoader to be entirely functional
  static getFromCache(url: string) {
    return AssetLoader.Cache.get(isAbsolutePath(url) ? url : Engine.publicPath + url)
  }
}
