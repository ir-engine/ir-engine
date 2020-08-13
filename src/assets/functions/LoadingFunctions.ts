import { TextureLoader } from "three"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import AssetVault from "../components/AssetVault"
import { DefaultAssetCollection } from "../defaults/DefaultAssetCollection"
import { AssetType } from "../enums/AssetType"
import { AssetId, AssetMap, AssetsLoadedHandler, AssetUrl } from "../types/AssetTypes"

export function loadDefaultAssets(onAssetLoaded: AssetsLoadedHandler, onAllAssetsLoaded: AssetsLoadedHandler): void {
  const collection = new Map<AssetId, AssetUrl>()
  Object.keys(DefaultAssetCollection).forEach(key => {
    collection.set(key, DefaultAssetCollection[key])
  })
  loadAsset(collection.entries(), onAssetLoaded, onAllAssetsLoaded)
}

// Kicks off an iterator to load the list of assets and add them to the vault
export function loadAssets(
  assets: AssetMap,
  onAssetLoaded: AssetsLoadedHandler,
  onAllAssetsLoaded: AssetsLoadedHandler
): void {
  loadAsset(assets.entries(), onAssetLoaded, onAllAssetsLoaded)
}

function loadAsset(
  iterable: IterableIterator<[AssetId, AssetUrl]>,
  onAssetLoaded: AssetsLoadedHandler,
  onAllAssetsLoaded: AssetsLoadedHandler
) {
  const current = iterable.next()

  if (current.done) {
    return onAllAssetsLoaded()
  } else {
    const [{ url }] = current.value
    const type = getFileType(url)
    const loader =
      type == AssetType.FBX ? FBXLoader : AssetType.glTF ? GLTFLoader : AssetType.Image ? TextureLoader : null
    new loader().load(url, resource => {
      resource.scene.traverse(child => {
        // Do stuff with metadata here
      })
      AssetVault.instance.assets.set(url, resource)
      loadAsset(iterable, onAssetLoaded, onAllAssetsLoaded)
    })
  }
}

function getFileType(filename) {
  if (/\.(?:gltf|glb|vrm)$/.test(filename)) {
    return AssetType.glTF
  } else if (/\.fbx$/.test(filename)) {
    return AssetType.FBX
  } else if (/\.png$/.test(filename)) {
    return AssetType.Image
  } else if (/\.(?:jpg|jpeg|)$/.test(filename)) {
    return AssetType.Image
  } else {
    return null
  }
}
