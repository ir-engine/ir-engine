import { Object3D } from 'three';
import { Component } from '../../ecs/classes/Component';
import { AssetStorage } from '../types/AssetTypes';
/**
 * Component class for Asset vault.\
 * This component should only be used once per game.
 */
export default class AssetVault extends Component<AssetVault> {
    /** Static instance of the asset vault to be accessed from anywhere. */
    static instance: AssetVault;
    /**
     * Map of assets in this vault.\
     * Map contains URL of the asset as key and asset as value.
     */
    assets: AssetStorage;
    /** Indicates whether assets are loaded or not. */
    assetsLoaded: boolean;
    /** Constructs an Asset vault. */
    constructor();
    /** Dispose the asset vault. */
    dispose(): void;
    static _schema: {
        assetsLoaded: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, boolean>;
            default: boolean;
        };
        assets: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, any>;
            default: Map<Object3D, string>;
        };
    };
}
