import { Object3D } from 'three';

export type AssetId = string | number
export type AssetsLoadedHandler = (entity, args: { asset? }) => void
export type AssetMap = Map<AssetId, AssetUrl>
export type AssetStorage = Map<AssetUrl, Object3D>
export type AssetUrl = string
export type AssetTypeAlias = string | number
export type AssetClassAlias = string | number
