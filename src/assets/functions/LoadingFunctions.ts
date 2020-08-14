import { TextureLoader } from "three"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import AssetVault from "../components/AssetVault"
import { DefaultAssetCollection } from "../defaults/DefaultAssetCollection"
import { AssetType } from "../enums/AssetType"
import { AssetId, AssetMap, AssetsLoadedHandler, AssetUrl } from "../types/AssetTypes"
import { AssetClass } from "../enums/AssetClass"

export function loadDefaultAssets(onAssetLoaded: AssetsLoadedHandler, onAllAssetsLoaded: AssetsLoadedHandler): void {
  const collection = new Map<AssetId, AssetUrl>()
  Object.keys(DefaultAssetCollection).forEach(key => {
    collection.set(key, DefaultAssetCollection[key])
  })
  iterateLoadAsset(collection.entries(), onAssetLoaded, onAllAssetsLoaded)
}

// Kicks off an iterator to load the list of assets and add them to the vault
export function loadAssets(
  assets: AssetMap,
  onAssetLoaded: AssetsLoadedHandler,
  onAllAssetsLoaded: AssetsLoadedHandler
): void {
  iterateLoadAsset(assets.entries(), onAssetLoaded, onAllAssetsLoaded)
}

export function loadAsset(url: AssetUrl, onAssetLoaded: AssetsLoadedHandler): void {
  if (!AssetVault.instance.assets.has(url)) {
    const type = getAssetType(url)
    const loader =
      type == AssetType.FBX
        ? FBXLoader
        : type == AssetType.glTF
          ? GLTFLoader
          : type == (AssetType.PNG | AssetType.JPEG)
            ? TextureLoader
            : null
    new loader().load(url, resource => {
      AssetVault.instance.assets.set(url, resource)
      onAssetLoaded(resource)
    })
  }
}

function iterateLoadAsset(
  iterable: IterableIterator<[AssetId, AssetUrl]>,
  onAssetLoaded: AssetsLoadedHandler,
  onAllAssetsLoaded: AssetsLoadedHandler
) {
  const current = iterable.next()

  if (current.done) {
    return onAllAssetsLoaded()
  } else {
    const [{ url }] = current.value
    if (!AssetVault.instance.assets.has(url)) {
      const type = getAssetType(url)
      const assetClass = getAssetClass(url)
      const loader =
        type == AssetType.FBX
          ? FBXLoader
          : type == AssetType.glTF
            ? GLTFLoader
            : assetClass == AssetClass.Image
              ? TextureLoader
              : null
      if (loader == null) {
        console.error("Loader failed on ", url)
        iterateLoadAsset(iterable, onAssetLoaded, onAllAssetsLoaded)
      }
      new loader().load(url, resource => {
        if (resource.scene !== undefined)
          resource.scene.traverse(child => {
            // Do stuff with metadata here
          })
        AssetVault.instance.assets.set(url, resource)
        iterateLoadAsset(iterable, onAssetLoaded, onAllAssetsLoaded)
      })
    } else {
      iterateLoadAsset(iterable, onAssetLoaded, onAllAssetsLoaded)
    }
  }
}

export function getAssetType(assetFileName) {
  if (/\.(?:gltf|glb)$/.test(assetFileName)) {
    return AssetType.glTF
  } else if (/\.fbx$/.test(assetFileName)) {
    return AssetType.FBX
  } else if (/\.vrm$/.test(assetFileName)) {
    return AssetType.VRM
  } else if (/\.png$/.test(assetFileName)) {
    return AssetType.PNG
  } else if (/\.(?:jpg|jpeg|)$/.test(assetFileName)) {
    return AssetType.JPEG
  } else {
    return null
  }
}

export function getAssetClass(assetFileName) {
  if (/\.(?:gltf|glb|vrm|fbx|obj)$/.test(assetFileName)) {
    return AssetClass.Model
  } else if (/\.png|jpg|jpeg$/.test(assetFileName)) {
    return AssetClass.Image
  } else {
    return null
  }
}
