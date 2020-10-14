import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { AssetClass } from '../enums/AssetClass';
import { AssetType } from '../enums/AssetType';
import { AssetClassAlias, AssetsLoadedHandler, AssetTypeAlias } from '../types/AssetTypes';
import { Object3D } from 'three';

export class AssetLoader extends Component<AssetLoader> {
  loaded = false
  url = ''
  assetType: AssetTypeAlias = null
  assetClass: AssetClassAlias = null
  receiveShadow = false
  castShadow = false
  envMapOverride: any = null
  append = true
  onLoaded: AssetsLoadedHandler = null
  parent: Object3D = null
}
AssetLoader.schema = {
  assetType: { default: AssetType.glTF, type: Types.Number },
  assetClass: { default: AssetClass, type: Types.Number },
  url: { default: '', type: Types.Number },
  loaded: { default: false, type: Types.Boolean },
  receiveShadow: { default: false, type: Types.Boolean },
  castShadow: { default: false, type: Types.Boolean },
  envMapOverride: { default: null, type: Types.Ref },
  append: { default: true, type: Types.Boolean },
  onLoaded: { default: null, type: Types.Ref },
  parent: { default: null, type: Types.Ref }
};
