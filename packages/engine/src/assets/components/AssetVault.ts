import { Object3D } from 'three';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { AssetStorage, AssetUrl } from '../types/AssetTypes';

/**
 * Component class for Asset vault.\
 * This component should only be used once per game.
 */
export default class AssetVault extends Component<AssetVault> {
  /** Static instance of the asset vault to be accessed from anywhere. */
  static instance: AssetVault
  /**
   * Map of assets in this vault.\
   * Map contains URL of the asset as key and asset as value.
   */
  assets: AssetStorage
  /** Indicates whether assets are loaded or not. */
  assetsLoaded!: boolean

  /** Constructs an Asset vault. */
  constructor () {
    super();
    AssetVault.instance = this;
  }

  /** Dispose the asset vault. */
  dispose(): void {
    super.dispose();
    this.assets.clear();
    AssetVault.instance = null;
  }

  static _schema = {
    assetsLoaded: { type: Types.Boolean, default: false },
    assets: { type: Types.Ref, default: new Map<Object3D, AssetUrl>() }
  }
}
