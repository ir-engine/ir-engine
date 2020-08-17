import { Component } from "../../ecs/classes/Component";
import { AssetClassAlias, AssetsLoadedHandler, AssetTypeAlias } from "../types/AssetTypes";
export declare class AssetLoader extends Component<AssetLoader> {
    url: "";
    assetType: AssetTypeAlias;
    assetClass: AssetClassAlias;
    receiveShadow: false;
    castShadow: false;
    envMapOverride: null;
    append: true;
    onLoaded: AssetsLoadedHandler;
    parent: null;
}
