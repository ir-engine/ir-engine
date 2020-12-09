import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { AssetId, AssetMap, AssetStorage, AssetUrl } from '../types/AssetTypes';
import { Object3D } from 'three';

// This component should only be used once per game
export default class AssetVault extends Component<AssetVault> {
  static instance: AssetVault
  assets: AssetStorage
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

  static _schema = {
    assetsLoaded: { type: Types.Boolean, default: false },
    assets: { type: Types.Ref, default: new Map<Object3D, AssetUrl>() }
  }
}
