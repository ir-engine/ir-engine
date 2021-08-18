import { FileLoader, MeshPhysicalMaterial, Object3D, LOD, TextureLoader } from 'three'
import { getLoader as getGLTFLoader, loadExtentions } from '../functions/LoadGLTF'
import { FBXLoader } from '../loaders/fbx/FBXLoader'
import { AssetType } from '../enum/AssetType'
import { AssetClass } from '../enum/AssetClass'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { Entity } from '../../ecs/classes/Entity'
import { isAbsolutePath } from '../../common/functions/isAbsolutePath'
import { Engine } from '../../ecs/classes/Engine'
import { LOADER_STATUS, LODS_REGEXP, DEFAULT_LOD_DISTANCES } from '../constants/LoaderConstants'

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

  if (params.parent) {
    params.parent.add(asset)
  } else if (params.entity) {
    if (hasComponent(params.entity, Object3DComponent)) {
      if (getComponent(params.entity, Object3DComponent).value !== undefined)
        getComponent(params.entity, Object3DComponent).value.add(asset)
      else getComponent(params.entity, Object3DComponent).value = asset
    } else {
      addComponent(params.entity, Object3DComponent, { value: asset })
    }
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

    LODs.get(name).push({ object: child, level })
  })

  LODs.forEach((value, key) => {
    const lod = new LOD()
    lod.name = key
    value[0].object.parent.add(lod)

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
  else return null
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
    return null
  }
}

type AssetLoaderParamType = {
  entity?: Entity
  parent?: Object3D
  url: string
  castShadow?: boolean
  receiveShadow?: boolean
  [key: string]: any
}

export class AssetLoader {
  static Cache = new Map<string, any>()
  static loaders = new Map<number, any>()
  static LOD_DISTANCES = DEFAULT_LOD_DISTANCES

  assetType: AssetType
  assetClass: AssetClass
  fileLoader: any
  result: any
  status: number = LOADER_STATUS.LOADING

  constructor(
    private params: AssetLoaderParamType,
    private onLoad?: (response: any) => void,
    private onProgress?: (request: ProgressEvent) => void,
    private onError?: (event: ErrorEvent | Error) => void
  ) {
    if (!this.params.url) {
      this._onError(new Error('URL is empty'))
      return
    }

    this.assetType = getAssetType(this.params.url)
    this.assetClass = getAssetClass(this.params.url)

    if (AssetLoader.Cache.has(this.params.url)) {
      this._onLoad(AssetLoader.Cache.get(this.params.url))
      return
    }

    switch (this.assetType) {
      case AssetType.glTF:
      case AssetType.VRM:
        this.fileLoader = getGLTFLoader()
        break
      case AssetType.FBX:
        this.fileLoader = new FBXLoader()
        break
      case AssetType.PNG:
      case AssetType.JPEG:
        this.fileLoader = new TextureLoader()
        break
      default:
        this.fileLoader = new FileLoader()
        break
    }

    const url = isAbsolutePath(this.params.url) ? this.params.url : Engine.publicPath + this.params.url
    this.fileLoader.load(url, this._onLoad, this._onProgress, this._onError)

    // Add or overwrites the loader for an entity.
    if (this.params.entity) {
      AssetLoader.loaders.set(this.params.entity, this)
    }
  }

  _onLoad = (response: any): void => {
    this.result = response
    // TODO: we shouldn't be changing the gltf/vrm default object hierarchy
    if (response && (this.assetType === AssetType.glTF || this.assetType === AssetType.VRM)) {
      loadExtentions(this.result)
      this.result = response.scene
      this.result.animations = response.animations
    }

    if (this.assetClass === AssetClass.Model) {
      processModelAsset(this.result, this.params)
    }

    if (!AssetLoader.Cache.has(this.params.url)) AssetLoader.Cache.set(this.params.url, response)

    this.status = LOADER_STATUS.LOADED

    if (typeof this.onLoad === 'function') this.onLoad(this.result)
    else return this.result
  }

  _onProgress = (request: ProgressEvent): void => {
    this.status = LOADER_STATUS.LOADING
    if (typeof this.onProgress === 'function') this.onProgress(request)
  }

  _onError = (event: ErrorEvent | Error): void => {
    this.status = LOADER_STATUS.ERROR
    if (typeof this.onError === 'function') this.onError(event)
  }

  static load(
    params: AssetLoaderParamType,
    onLoad?: (response: any) => void,
    onProgress?: (request: ProgressEvent) => void,
    onError?: (event: ErrorEvent | Error) => void
  ) {
    const loader = new AssetLoader(params, onLoad, onProgress, onError)
    return loader
  }

  static async loadAsync(params: AssetLoaderParamType) {
    return new Promise<any>((resolve, reject) => {
      new AssetLoader(params, resolve, () => {}, resolve)
    })
  }

  // TODO: we are replciating code here, we should refactor AssetLoader to be entirely functional
  static getFromCache(url: string) {
    const response = AssetLoader.Cache.get(url)
    const assetType = getAssetType(url)
    const assetClass = getAssetClass(url)

    let result = response

    // TODO: we shouldn't be changing the gltf/vrm default object hierarchy
    if (response && (assetType === AssetType.glTF || assetType === AssetType.VRM)) {
      loadExtentions(result)
      result = response.scene
      result.animations = response.animations
    }

    // should already be processed, this should happen on load only the first time :/
    // if (assetClass === AssetClass.Model) {
    //   processModelAsset(result, params)
    // }
    return result
  }
}
