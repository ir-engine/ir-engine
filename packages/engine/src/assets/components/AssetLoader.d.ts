import { Object3D } from 'three';
import { Component } from '../../ecs/classes/Component';
import { AssetClassAlias, AssetTypeAlias } from '../types/AssetTypes';
/** Component Class for Asset Loader. */
export declare class AssetLoader extends Component<AssetLoader> {
    /** Indication of whether the asset is loaded or not. */
    loaded: boolean;
    /** URL of the asset. */
    url: string;
    /** Type of the asset. Supported types can be found in {@link assets/enums/AssetType.AssetType | AssetType}.*/
    assetType: AssetTypeAlias;
    /** Class of the asset. Supported Asset classes can be found in {@link assets/enums/AssetClass.AssetClass | AssetClass}. */
    assetClass: AssetClassAlias;
    /** Indicates whether the object will receive a shadow. */
    receiveShadow: boolean;
    /** Indicates whether the object will cast a shadow. */
    castShadow: boolean;
    /** Environment mapping for override. */
    envMapOverride: any;
    append: boolean;
    /** List of function to be called after loading is completed. */
    onLoaded: any;
    /** Parent object. */
    parent: Object3D;
    /** entity Id from scena loader fro editor, needs for physics sync colliders from server with models on client */
    entityIdFromScenaLoader: any;
}
