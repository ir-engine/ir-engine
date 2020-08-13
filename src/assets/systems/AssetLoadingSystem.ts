import { System } from "../../ecs/System"
import { loadGltfAssets, loadFbxAssets, loadTextureAssets } from "../functions/LoadingFunctions"
import AssetStoreComponent from "../components/AssetStoreComponent"

export default class InitSystem extends System {
  assetsLoaded!: boolean

  init() {
    this.assetsLoaded = false
    loadTextureAssets(() => loadFbxAssets(() => loadGltfAssets(() => (this.assetsLoaded = true))))
  }

  execute() {
    if (this.assetsLoaded) {
      this.queries.gameState.results.forEach(entity => {
        const gameState = entity.getMutableComponent(AssetStoreComponent)
        gameState.assetsLoaded = true
      })

      this.enabled = false
    }
  }
}

InitSystem.queries = {
  gameState: {
    components: [AssetStoreComponent]
  }
}
