import {
  AnimationClip,
  FileLoader,
  Group,
  Loader,
  LoaderUtils,
  LOD,
  Material,
  Mesh,
  MeshPhysicalMaterial,
  Object3D,
  SkinnedMesh,
  TextureLoader
} from 'three'

import { isAbsolutePath } from '../../common/functions/isAbsolutePath'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { generateMeshBVH } from '../../scene/functions/bvhWorkerPool'
import { DEFAULT_LOD_DISTANCES, LODS_REGEXP } from '../constants/LoaderConstants'
import { AssetClass } from '../enum/AssetClass'
import { AssetType } from '../enum/AssetType'
import { createGLTFLoader } from '../functions/createGLTFLoader'
import { FBXLoader } from '../loaders/fbx/FBXLoader'
import type { GLTF, GLTFLoader } from '../loaders/gltf/GLTFLoader'

// import { instanceGLTF } from '../functions/transformGLTF'

/**
 * Interface for result of the GLTF Asset load.
 */
export interface LoadGLTFResultInterface {
  animations: AnimationClip[]
  scene: Object3D | Group | Mesh
  json: any
  stats: any
}

// TODO: refactor global scope
const loader = createGLTFLoader()
export function getGLTFLoader() {
  return loader
}

export function disposeDracoLoaderWorkers(): void {
  //loader.dracoLoader?.dispose()
}

export const loadExtensions = async (gltf: GLTF) => {
  if (isClient) {
    const bvhTraverse: Promise<void>[] = []
    gltf.scene.traverse((mesh) => {
      bvhTraverse.push(generateMeshBVH(mesh))
    })
    await Promise.all(bvhTraverse)
  }
}

const processModelAsset = (asset: Mesh): void => {
  const replacedMaterials = new Map()
  const loddables = new Array<Object3D>()

  asset.traverse((child: Mesh<any, Material>) => {
    //test for LODs within this traversal
    if (haveAnyLODs(child)) loddables.push(child)

    if (!child.isMesh) return

    if (replacedMaterials.has(child.material)) {
      child.material = replacedMaterials.get(child.material)
    } else {
      if (child.material?.userData?.gltfExtensions?.KHR_materials_clearcoat) {
        const newMaterial = new MeshPhysicalMaterial({})
        newMaterial.setValues(child.material as any) // to copy properties of original material
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

  loddables.forEach((loddable) => handleLODs(loddable))
}

const haveAnyLODs = (asset) => !!asset.children?.find((c) => String(c.name).match(LODS_REGEXP))

/**
 * Handles Level of Detail for asset.
 * @param asset Asset on which LOD will apply.
 * @returns LOD handled asset.
 */
const handleLODs = (asset: Object3D): Object3D => {
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
const getAssetType = (assetFileName: string): AssetType => {
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
const getAssetClass = (assetFileName: string): AssetClass => {
  if (/\.(?:gltf|glb|vrm|fbx|obj)$/.test(assetFileName)) {
    return AssetClass.Model
  } else if (/\.png|jpg|jpeg$/.test(assetFileName)) {
    return AssetClass.Image
  } else {
    return null!
  }
}

/**
 * Returns true if the given file type is supported
 * Note: images are not supported on node
 * @param assetFileName
 * @returns
 */
const isSupported = (assetFileName: string) => {
  const assetClass = getAssetClass(assetFileName)
  if (isClient) return !!assetClass
  return assetClass === AssetClass.Model
}

//@ts-ignore
const fbxLoader = new FBXLoader()
const textureLoader = new TextureLoader()
const fileLoader = new FileLoader()

export const getLoader = (assetType: AssetType) => {
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

const assetLoadCallback = (url: string, assetType: AssetType, onLoad: (response: any) => void) => async (asset) => {
  const assetClass = AssetLoader.getAssetClass(url)
  if (assetClass === AssetClass.Model) {
    if (assetType === AssetType.glTF || assetType === AssetType.VRM) {
      await loadExtensions(asset)
    }

    if (assetType === AssetType.FBX) {
      asset = { scene: asset }
    } else if (assetType === AssetType.VRM) {
      asset = asset.userData.vrm
    }

    if (asset.scene && !asset.scene.userData) asset.scene.userData = {}
    if (asset.scene.userData) asset.scene.userData.type = assetType
    if (asset.userData) asset.userData.type = assetType

    AssetLoader.processModelAsset(asset.scene)
  }

  AssetLoader.Cache.set(url, asset)
  onLoad(asset)
}

export const getAbsolutePath = (url) => (isAbsolutePath(url) ? url : Engine.publicPath + url)

const load = async (
  _url: string,
  onLoad = (response: any) => {},
  onProgress = (request: ProgressEvent) => {},
  onError = (event: ErrorEvent | Error) => {}
) => {
  if (!_url) {
    onError(new Error('URL is empty'))
    return
  }
  const url = getAbsolutePath(_url)

  if (AssetLoader.Cache.has(url)) {
    onLoad(AssetLoader.Cache.get(url))
  }

  const assetType = AssetLoader.getAssetType(url)
  const loader = getLoader(assetType)
  const callback = assetLoadCallback(url, assetType, onLoad)

  try {
    // TODO: fix instancing for GLTFs - move this to the gltf loader
    // if (instanced) {
    //   ;(loader as GLTFLoader).parse(await instanceGLTF(url), null!, callback, onError)
    // } else {
    loader.load(url, callback, onProgress, onError)
    // }
  } catch (error) {
    onError(error)
  }
}

const loadAsync = async (url: string, onProgress = (request: ProgressEvent) => {}) => {
  return new Promise<any>((resolve, reject) => {
    load(url, resolve, onProgress, reject)
  })
}

// TODO: we are replciating code here, we should refactor AssetLoader to be entirely functional
const getFromCache = (url: string) => {
  return AssetLoader.Cache.get(getAbsolutePath(url))
}

export const AssetLoader = {
  Cache: new Map<string, any>(),
  loaders: new Map<number, any>(),
  LOD_DISTANCES: DEFAULT_LOD_DISTANCES,
  processModelAsset,
  handleLODs,
  getAbsolutePath,
  getAssetType,
  getAssetClass,
  isSupported,
  getLoader,
  assetLoadCallback,
  load,
  loadAsync,
  getFromCache
}
