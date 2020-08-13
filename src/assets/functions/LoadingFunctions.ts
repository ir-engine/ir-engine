import * as THREE from 'three'
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { TextureLoader, Vector3 } from 'three'

export enum AssetId {
  SHIP_1,
  SHIP_2,
  SHIP_3,
  SHIP_4,
  SHIP_5,
  SHIP_6,

  CROSSHAIR,
}

const gltfAssetsToLoad: AssetPreloadMap = new Map()

const fbxAssetsToLoad: AssetPreloadMap = new Map()
  .set(AssetId.SHIP_1, {
    url: require('url:../assets/space-converted/spaceCraft1.fbx'),
    scale: new Vector3(0.1, 0.1, 0.1),
  })
  .set(AssetId.SHIP_2, {
    url: require('url:../assets/space-converted/spaceCraft2.fbx'),
    scale: new Vector3(0.1, 0.1, 0.1),
  })
  .set(AssetId.SHIP_3, {
    url: require('url:../assets/space-converted/spaceCraft3.fbx'),
    scale: new Vector3(0.1, 0.1, 0.1),
  })
  .set(AssetId.SHIP_4, {
    url: require('url:../assets/space-converted/spaceCraft4.fbx'),
    scale: new Vector3(0.1, 0.1, 0.1),
  })
  .set(AssetId.SHIP_5, {
    url: require('url:../assets/space-converted/spaceCraft5.fbx'),
    scale: new Vector3(0.1, 0.1, 0.1),
  })
  .set(AssetId.SHIP_6, {
    url: require('url:../assets/space-converted/spaceCraft6.fbx'),
    scale: new Vector3(0.1, 0.1, 0.1),
  })

const textureAssetsToLoad: AssetPreloadMap = new Map().set(AssetId.CROSSHAIR, {
  url: require('url:../assets/crosshairs/crosshair115.png'),
})

type AssetUrl = string
type Asset = { url: AssetUrl; scale?: Vector3 }
type AssetPreloadMap = Map<AssetId, Asset>
type AssetsLoadedHandler = () => void
export type GltfAssetMap = Map<AssetId, GLTF>
export type FbxAssetMap = Map<AssetId, THREE.Group>
export type TextureAssetMap = Map<AssetId, THREE.Texture>

export const gltfAssets: GltfAssetMap = new Map()
export const fbxAssets: FbxAssetMap = new Map()
export const textureAssets: TextureAssetMap = new Map()

function loadGltfAsset(
  loader: GLTFLoader,
  iterable: IterableIterator<[AssetId, Asset]>,
  assets: GltfAssetMap,
  onComplete: AssetsLoadedHandler,
) {
  const current = iterable.next()

  if (current.done) {
    return onComplete()
  } else {
    const [id, { url }] = current.value

    loader.load(url, (gltf) => {
      gltf.scene.traverse((child) => {
        // if (child.material) child.material.metalness = 0
      })
      assets.set(id, gltf)
      loadGltfAsset(loader, iterable, assets, onComplete)
    })
  }
}

function loadFbxAsset(
  loader: FBXLoader,
  iterable: IterableIterator<[AssetId, Asset]>,
  assets: FbxAssetMap,
  onComplete: AssetsLoadedHandler,
) {
  const current = iterable.next()

  if (current.done) {
    return onComplete()
  } else {
    const [id, { url, scale = { x: 1, y: 1, z: 1 } }] = current.value

    loader.load(url, (fbx) => {
      // Apply scale
      fbx.scale.set(scale.x, scale.y, scale.z)

      // Center mesh
      const center = new THREE.Vector3()
      const mesh = fbx.children[0] as THREE.Mesh
      mesh.geometry.computeBoundingBox()
      mesh.geometry.boundingBox.getCenter(center)
      mesh.geometry.center()
      mesh.position.copy(center)

      // Save to dictionary
      assets.set(id, fbx)

      // Load next
      loadFbxAsset(loader, iterable, assets, onComplete)
    })
  }
}

function loadTextureAsset(
  loader: TextureLoader,
  iterable: IterableIterator<[AssetId, Asset]>,
  assets: TextureAssetMap,
  onComplete: AssetsLoadedHandler,
) {
  const current = iterable.next()

  if (current.done) {
    return onComplete()
  } else {
    const [id, { url, scale = { x: 1, y: 1, z: 1 } }] = current.value

    loader.load(url, (texture) => {
      // Save to dictionary
      assets.set(id, texture)

      // Load next
      loadTextureAsset(loader, iterable, assets, onComplete)
    })
  }
}

export function loadTextureAssets(onComplete: AssetsLoadedHandler) {
  const entries = textureAssetsToLoad.entries()
  loadTextureAsset(new THREE.TextureLoader(), entries, textureAssets, onComplete)
}

export function loadGltfAssets(onComplete: AssetsLoadedHandler) {
  const entries = gltfAssetsToLoad.entries()
  loadGltfAsset(new GLTFLoader(), entries, gltfAssets, onComplete)
}

export function loadFbxAssets(onComplete: AssetsLoadedHandler) {
  const entries = fbxAssetsToLoad.entries()
  loadFbxAsset(new FBXLoader(), entries, fbxAssets, onComplete)
}
