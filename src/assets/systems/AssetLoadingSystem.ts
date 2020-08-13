import { System } from "../../ecs/System"
import AssetVault from "../components/AssetVault"

export default class AssetLoadingSystem extends System {
  init() {
    // Init goes here
  }

  execute() {
    this.queries.assetVault.results.forEach(entity => {
      // Do things here
    })

    this.enabled = false
  }
}

AssetLoadingSystem.queries = {
  assetVault: {
    components: [AssetVault]
  }
}
