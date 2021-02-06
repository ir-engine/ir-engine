import { Entity } from '../../ecs/classes/Entity';
import { AssetClass } from '../enums/AssetClass';
import { AssetType } from '../enums/AssetType';
import { AssetMap, AssetsLoadedHandler, AssetUrl } from '../types/AssetTypes';
/**
 * Kicks off an iterator to load the list of assets and adds them to the vault.
 * @param assets Map holding asset ids and asset URLs.
 * @param onAssetLoaded Callback to be called on single asset load.
 * @param onAllAssetsLoaded Callback to be called after all the asset being loaded.
 */
export declare function loadAssets(assets: AssetMap, onAssetLoaded: AssetsLoadedHandler, onAllAssetsLoaded: AssetsLoadedHandler): void;
/**
 * Load an asset from given URL.
 * @param url URL of the asset.
 * @param entity Entity object which will be passed in **```onAssetLoaded```** callback.
 * @param onAssetLoaded Callback to be called after asset will be loaded.
 */
export declare function loadAsset(url: AssetUrl, entity: Entity, onAssetLoaded: AssetsLoadedHandler): void;
/**
 * Get asset type from the asset file extension.
 * @param assetFileName Name of the Asset file.
 * @returns Asset type of the file.
 */
export declare function getAssetType(assetFileName: string): AssetType;
/**
 * Get asset class from the asset file extension.
 * @param assetFileName Name of the Asset file.
 * @returns Asset class of the file.
 */
export declare function getAssetClass(assetFileName: string): AssetClass;
