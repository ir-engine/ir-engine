import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { AssetId, AssetMap, AssetUrl } from '../types/AssetTypes';

// This component should only be used once per game
export default class AssetVault extends Component<AssetVault> {
  static instance: AssetVault
  assets: AssetMap
  assetsLoaded!: boolean

  constructor () {
    super();
    AssetVault.instance = this;
  }

  dispose(): void {
    super.dispose();
    this.assets.clear();
    AssetVault.instance = null;
  }

  static schema = {
    assetsLoaded: { type: Types.Boolean, default: false },
    assets: { type: Types.Ref, default: new Map<AssetId, AssetUrl>() }
  }
}
