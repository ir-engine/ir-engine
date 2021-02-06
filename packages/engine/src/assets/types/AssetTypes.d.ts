import { Object3D } from 'three';
export declare type AssetId = string | number;
export declare type AssetsLoadedHandler = (entity: any, args: {
    asset?: any;
}) => void;
export declare type AssetMap = Map<AssetId, AssetUrl>;
export declare type AssetStorage = Map<AssetUrl, Object3D>;
export declare type AssetUrl = string;
export declare type AssetTypeAlias = string | number;
export declare type AssetClassAlias = string | number;
