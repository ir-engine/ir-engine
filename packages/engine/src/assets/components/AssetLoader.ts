import { Object3D } from 'three';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { AssetClass } from '../enums/AssetClass';
import { AssetType } from '../enums/AssetType';
import { AssetClassAlias, AssetTypeAlias } from '../types/AssetTypes';

/** Component Class for Asset Loader. */
export class AssetLoader extends Component<AssetLoader> {
  /** Indication of whether the asset is loaded or not. */
  loaded = false
  /** URL of the asset. */
  url = ''
  /** Type of the asset. Supported types can be found in {@link assets/enums/AssetType.AssetType | AssetType}.*/
  assetType: AssetTypeAlias = null
  /** Class of the asset. Supported Asset classes can be found in {@link assets/enums/AssetClass.AssetClass | AssetClass}. */
  assetClass: AssetClassAlias = null
  /** Indicates whether the object will receive a shadow. */
  receiveShadow = false
  /** Indicates whether the object will cast a shadow. */
  castShadow = false
  /** Environment mapping for override. */
  envMapOverride: any = null
  append = true
  /** List of function to be called after loading is completed. */
  onLoaded: any = []
  /** Parent object. */
  parent: Object3D = null
  /** entity Id from scena loader fro editor, needs for physics sync colliders from server with models on client */
  entityIdFromScenaLoader = null
}

AssetLoader._schema = {
  assetType: { default: AssetType.glTF, type: Types.Number },
  assetClass: { default: AssetClass, type: Types.Number },
  url: { default: '', type: Types.Number },
  loaded: { default: false, type: Types.Boolean },
  receiveShadow: { default: false, type: Types.Boolean },
  castShadow: { default: false, type: Types.Boolean },
  envMapOverride: { default: null, type: Types.Ref },
  append: { default: true, type: Types.Boolean },
  onLoaded: { default: [], type: Types.Ref },
  parent: { default: null, type: Types.Ref },
  entityIdFromScenaLoader: { default: null, type: Types.Ref }
};
