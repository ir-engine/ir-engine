import { AssetStorage } from '../types/AssetTypes';

/**
 * Component class for Asset vault.\
 * This component should only b e used once per game.
 */
export default class AssetVault {
  /** Static instance of the asset vault to be accessed from anywhere. */
  static instance: AssetVault = new AssetVault();
  /**
   * Map of assets in this vault.\
   * Map contains URL of the asset as key and asset as value.
   */
  assets: AssetStorage = new Map();
  /** Indicates whether assets are loaded or not. */
  assetsLoaded = false;
}
