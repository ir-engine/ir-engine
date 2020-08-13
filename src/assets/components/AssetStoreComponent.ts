import { Component, Types } from "../../ecs"

// This component should only be used once per game
export default class AssetStoreComponent extends Component<AssetStoreComponent> {
  assetsLoaded!: boolean

  static schema = {
    assetsLoaded: { type: Types.Boolean, default: false }
  }
}
