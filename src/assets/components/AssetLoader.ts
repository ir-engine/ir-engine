import { Component, Types } from "../../ecs"
import { AssetTypeAlias, AssetClassAlias, AssetsLoadedHandler } from "../types/AssetTypes"
import { AssetType } from "../enums/AssetType"
import { AssetClass } from "../enums/AssetClass"

export class AssetLoader extends Component<AssetLoader> {
  url: ""
  assetType: AssetTypeAlias
  assetClass: AssetClassAlias
  receiveShadow: false
  castShadow: false
  envMapOverride: null
  append: true
  onLoaded: AssetsLoadedHandler = null
  parent: null
}
AssetLoader.schema = {
  assetType: { default: AssetType.glTF, type: Types.Number },
  assetClass: { default: AssetClass, type: Types.Number },
  url: { default: "", type: Types.Number },
  receiveShadow: { default: false, type: Types.Boolean },
  castShadow: { default: false, type: Types.Boolean },
  envMapOverride: { default: null, type: Types.Ref },
  append: { default: true, type: Types.Boolean },
  onLoaded: { default: null, type: Types.Ref },
  parent: { default: null, type: Types.Ref }
}
