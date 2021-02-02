import { Object3D, SkinnedMesh, TextureLoader } from 'three';
import { GLTFLoader } from "../loaders/gltf/GLTFLoader";
import AssetVault from '../components/AssetVault';
import { AssetClass } from '../enums/AssetClass';
import { AssetType } from '../enums/AssetType';
import { AssetId, AssetMap, AssetsLoadedHandler, AssetTypeAlias, AssetUrl } from '../types/AssetTypes';
import * as FBXLoader from '../loaders/fbx/FBXLoader';
import { Entity } from '../../ecs/classes/Entity';
import * as LoadGLTF from './LoadGLTF';

function parallelTraverse(a, b, callback) {
  callback(a, b);
  for (let i = 0; i < a.children.length; i++)
    parallelTraverse(a.children[i], b.children[i], callback);
}

function clone(source: Object3D): Object3D {
  const sourceLookup = new Map();
  const cloneLookup = new Map();
  const clone = source.clone();

  parallelTraverse(source, clone, (sourceNode, clonedNode) => {
    sourceLookup.set(clonedNode, sourceNode);
    cloneLookup.set(sourceNode, clonedNode);
  });

  clone.traverse((node: unknown) => {
    if (!(node instanceof SkinnedMesh)) return;

    const clonedMesh = node;
    const sourceMesh = sourceLookup.get(node);
    const sourceBones = sourceMesh.skeleton.bones;

    clonedMesh.skeleton = sourceMesh.skeleton.clone();
    clonedMesh.bindMatrix.copy(sourceMesh.bindMatrix);

    clonedMesh.skeleton.bones = sourceBones.map((bone) => {
      return cloneLookup.get(bone);
    });
    clonedMesh.bind(clonedMesh.skeleton, clonedMesh.bindMatrix);
  });
  return clone;
}

/**
 * Kicks off an iterator to load the list of assets and adds them to the vault.
 * @param assets Map holding asset ids and asset URLs.
 * @param onAssetLoaded Callback to be called on single asset load.
 * @param onAllAssetsLoaded Callback to be called after all the asset being loaded.
 */
export function loadAssets(
  assets: AssetMap,
  onAssetLoaded: AssetsLoadedHandler,
  onAllAssetsLoaded: AssetsLoadedHandler
): void {
  iterateLoadAsset(assets.entries(), onAssetLoaded, onAllAssetsLoaded);
}

/**
 * Load an asset from given URL.
 * @param url URL of the asset.
 * @param entity Entity object which will be passed in **```onAssetLoaded```** callback.
 * @param onAssetLoaded Callback to be called after asset will be loaded.
 */
export function loadAsset(url: AssetUrl, entity: Entity, onAssetLoaded: AssetsLoadedHandler): void {
  const urlHashed = hashResourceString(url);
  if (AssetVault.instance.assets.has(urlHashed)) {
    onAssetLoaded(entity, { asset: clone(AssetVault.instance.assets.get(urlHashed)) });
  } else {
    const loader = getLoaderForAssetType(getAssetType(url));
    if (loader == null) {
      console.error('Loader failed on ', url);
      return;
    }
    loader.load(url, resource => {
      if(resource !== undefined) {
        LoadGLTF.loadExtentions(resource);
      }
      if (resource.scene) {
        // store just scene, no need in all gltf metadata?
        resource = resource.scene;
      }
      AssetVault.instance.assets.set(urlHashed, resource);
      onAssetLoaded(entity, { asset: resource });
    });
  }
}

/**
 * Loads asset from an iterable list.
 * @param iterable List of Assets.
 * @param onAssetLoaded Callback to be called on single asset load.
 * @param onAllAssetsLoaded Callback to be called after all the asset being loaded.
 */
function iterateLoadAsset(
  iterable: IterableIterator<[AssetId, AssetUrl]>,
  onAssetLoaded: AssetsLoadedHandler,
  onAllAssetsLoaded: AssetsLoadedHandler
) {
  const current = iterable.next();

  if (current.done) {
    return onAllAssetsLoaded(null, {});
  } else {
    const [{ url }] = current.value;
    const urlHashed = hashResourceString(url);
    if (!AssetVault.instance.assets.has(urlHashed)) {
      const loader = getLoaderForAssetType(getAssetType(url));

      if (loader == null) {
        console.error('Loader failed on ', url);
        iterateLoadAsset(iterable, onAssetLoaded, onAllAssetsLoaded);
        return;
      }
      loader.load(url, resource => {
        if(resource !== undefined) {
          LoadGLTF.loadExtentions(resource);
        }
        if (resource.scene !== undefined) {
          resource.scene.traverse(child => {
            // Do stuff with metadata here
          });
          resource = resource.scene;
        }
        AssetVault.instance.assets.set(urlHashed, resource);
        iterateLoadAsset(iterable, onAssetLoaded, onAllAssetsLoaded);
      });
    } else {
      iterateLoadAsset(iterable, onAssetLoaded, onAllAssetsLoaded);
    }
  }
}

/**
 * Get asset loader for given asset type.
 * @param assetType Type of the asset.
 * @returns Asset loader for given asset type.
 */
function getLoaderForAssetType(assetType: AssetTypeAlias): GLTFLoader | any | TextureLoader {
  if (assetType == AssetType.FBX) return new FBXLoader.FBXLoader();
  else if (assetType == AssetType.glTF) return LoadGLTF.getLoader();
  else if (assetType == AssetType.PNG) return new TextureLoader();
  else if (assetType == AssetType.JPEG) return new TextureLoader();
  else if (assetType == AssetType.VRM) return new GLTFLoader();
}

/**
 * Get asset type from the asset file extension.
 * @param assetFileName Name of the Asset file.
 * @returns Asset type of the file.
 */
export function getAssetType(assetFileName: string): AssetType {
  if (/\.(?:gltf|glb)$/.test(assetFileName))
    return AssetType.glTF;
  else if (/\.(?:fbx)$/.test(assetFileName))
    return AssetType.FBX;
  else if (/\.(?:vrm)$/.test(assetFileName))
    return AssetType.VRM;
  else if (/\.(?:png)$/.test(assetFileName))
    return AssetType.PNG;
  else if (/\.(?:jpg|jpeg|)$/.test(assetFileName))
    return AssetType.JPEG;
  else
    return null;
}

/**
 * Get asset class from the asset file extension.
 * @param assetFileName Name of the Asset file.
 * @returns Asset class of the file.
 */
export function getAssetClass(assetFileName: string): AssetClass {
  if (/\.(?:gltf|glb|vrm|fbx|obj)$/.test(assetFileName)) {
    return AssetClass.Model;
  } else if (/\.png|jpg|jpeg$/.test(assetFileName)) {
    return AssetClass.Image;
  } else {
    return null;
  }
}

/**
 * Get hash string from the asset file name.
 * @param str Name of the asset file.
 * @returns The hash plus part of the file name.
 */
function hashResourceString(str: string): string {
  let hash = 0;
  let i = 0;
  const len = str.length;
  while (i < len) {
    hash = ((hash << 5) - hash + str.charCodeAt(i++)) << 0;
  }
  return `${hash}${str.substr(Math.max(str.length - 7, 0))}`;
}