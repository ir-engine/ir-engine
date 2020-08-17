import { Component } from "../../ecs/classes/Component";
import { AssetMap } from "../types/AssetTypes";
export default class AssetVault extends Component<AssetVault> {
    static instance: AssetVault;
    assets: AssetMap;
    assetsLoaded: boolean;
    constructor();
    static schema: {
        assetsLoaded: {
            type: import("../../ecs/types/Types").PropType<unknown, boolean>;
            default: boolean;
        };
        assets: {
            type: import("../../ecs/types/Types").PropType<unknown, any>;
            default: Map<string | number, string>;
        };
    };
}
