import { TextureLoader } from 'three';
import GLTFLoader from 'three-gltf-loader';
import AssetVault from '../components/AssetVault';
import { AssetClass } from '../enums/AssetClass';
import { AssetType } from '../enums/AssetType';
import { AssetId, AssetMap, AssetsLoadedHandler, AssetTypeAlias, AssetUrl } from '../types/AssetTypes';
import * as FBXLoader from '../loaders/fbx/FBXLoader';
import { Entity } from '../../ecs/classes/Entity';
import { clone as SkeletonUtilsClone } from '../../common/functions/SkeletonUtils';
import { hashResourceString } from './hashResourceString';

// Kicks off an iterator to load the list of assets and add them to the vault
export function loadAssets (
  assets: AssetMap,
  onAssetLoaded: AssetsLoadedHandler,
  onAllAssetsLoaded: AssetsLoadedHandler
): void {
  iterateLoadAsset(assets.entries(), onAssetLoaded, onAllAssetsLoaded);
}

export function loadAsset (url: AssetUrl, entity: Entity, onAssetLoaded: AssetsLoadedHandler): void {
  const urlHashed = hashResourceString(url);
  if (AssetVault.instance.assets.has(urlHashed)) {
    onAssetLoaded(entity, { asset: SkeletonUtilsClone(AssetVault.instance.assets.get(urlHashed)) });
  } else {
    const loader = getLoaderForAssetType(getAssetType(url));
    if (loader == null) {
      console.error('Loader failed on ', url);
      return;
    }
    loader.load(url, resource => {
      if (resource.scene) {
        // store just scene, no need in all gltf metadata?
        resource = resource.scene;
      }
      AssetVault.instance.assets.set(urlHashed, resource);
      onAssetLoaded(entity, { asset: resource });
    });
  }
}

function iterateLoadAsset (
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

function getLoaderForAssetType (assetType: AssetTypeAlias): GLTFLoader | any | TextureLoader {
  if (assetType == AssetType.FBX) return new FBXLoader.FBXLoader();
  else if (assetType == AssetType.glTF) return new GLTFLoader();
  else if (assetType == AssetType.PNG) return new TextureLoader();
  else if (assetType == AssetType.JPEG) return new TextureLoader();
  else if (assetType == AssetType.VRM) return new GLTFLoader();
}

export function getAssetType (assetFileName:string):AssetType {
  if (/\.(?:gltf|glb)$/.test(assetFileName))
    return AssetType.glTF;
  else if (/\.(?:fbx)$/.test(assetFileName))
    return AssetType.FBX;
  else if (/\.(?:vrm)$/.test(assetFileName))
    return AssetType.VRM;
  else  if (/\.(?:png)$/.test(assetFileName))
    return AssetType.PNG;
  else if (/\.(?:jpg|jpeg|)$/.test(assetFileName)) 
    return AssetType.JPEG;
  else 
    return null;
}

export function getAssetClass (assetFileName:string):AssetClass {
  if (/\.(?:gltf|glb|vrm|fbx|obj)$/.test(assetFileName)) {
    return AssetClass.Model;
  } else if (/\.png|jpg|jpeg$/.test(assetFileName)) {
    return AssetClass.Image;
  } else {
    return null;
  }
}
