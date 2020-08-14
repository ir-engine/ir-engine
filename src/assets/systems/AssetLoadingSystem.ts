import { System, Not } from "../../ecs/System"
import AssetVault from "../components/AssetVault"
import { AssetLoaderState } from "../components/AssetLoaderState"
import { AssetLoader } from "../components/AssetLoader"
import { loadAsset, getAssetType, getAssetClass } from "../functions/LoadingFunctions"
import { Entity } from "../../ecs"
import { AssetsLoadedHandler } from "../types/AssetTypes"
import { AssetType } from "../enums/AssetType"
import { Object3DComponent } from "../../common/components/Object3DComponent"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { AssetClass } from "../enums/AssetClass"
import { Model } from "../components/Model"

export default class AssetLoadingSystem extends System {
  loaded = new Map<Entity, any>()

  init() {
    this.world.registerComponent(AssetLoaderState).registerComponent(AssetLoader)
  }

  execute() {
    this.queries.assetVault.results.forEach(entity => {
      // Do things here
    })
    while (this.queries.toLoad.results.length) {
      // Create a new entity
      const entity = this.queries.toLoad.results[0]
      // Asset the AssetLoaderState so it falls out of this query
      const assetLoader = entity.addComponent(AssetLoaderState).getMutableComponent<AssetLoader>(AssetLoader)
      // Set the filetype
      assetLoader.assetType = getAssetType(assetLoader.url)
      assetLoader.assetClass = getAssetClass(assetLoader.url)
      // Load the asset with a calback to add it to our processing queue
      loadAsset(assetLoader.url, (asset: AssetsLoadedHandler) => {
        this.loaded.set(entity, asset)
      })
    }

    // Do the actual entity creation inside the system tick not in the loader callback
    for (let i = 0; i < this.loaded.size; i++) {
      const [entity, asset] = this.loaded[i]
      const component = entity.getComponent<AssetLoader>(AssetLoader)
      if (component.assetClass === AssetClass.Model)
        asset.scene.traverse(function(child) {
          if (child.isMesh) {
            child.receiveShadow = component.receiveShadow
            child.castShadow = component.castShadow

            if (component.envMapOverride) {
              child.material.envMap = component.envMapOverride
            }
          }
        })

      if (entity.hasComponent(Object3DComponent)) {
        if (component.append) {
          entity.getComponent(Object3DComponent).value.add(asset.scene)
        }
      } else {
        entity.addComponent(Model, { value: asset }).addObject3DComponent(asset.scene, component.parent)
      }

      if (component.onLoaded) {
        component.onLoaded(asset.scene, asset)
      }
    }
    this.loaded.clear()

    const toUnload = this.queries.toUnload.results
    while (toUnload.length) {
      const entity = toUnload[0]
      entity.removeComponent(AssetLoaderState)
      entity.removeObject3DComponent()
    }
  }
}

AssetLoadingSystem.queries = {
  assetVault: {
    components: [AssetVault]
  },
  toLoad: {
    components: [AssetLoader, Not(AssetLoaderState)]
  },
  toUnload: {
    components: [AssetLoaderState, Not(AssetLoader)]
  }
}
