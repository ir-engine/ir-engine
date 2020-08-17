import { AssetMap, AssetsLoadedHandler, AssetUrl } from "../types/AssetTypes";
export declare function loadAssets(assets: AssetMap, onAssetLoaded: AssetsLoadedHandler, onAllAssetsLoaded: AssetsLoadedHandler): void;
export declare function loadAsset(url: AssetUrl, onAssetLoaded: AssetsLoadedHandler): void;
export declare function getAssetType(assetFileName: any): number;
export declare function getAssetClass(assetFileName: any): number;
