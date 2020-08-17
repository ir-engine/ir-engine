import { Object3DComponent } from "../../common/components/Object3DComponent"
import { addObject3DComponent, removeObject3DComponent } from "../../common/defaults/behaviors/Object3DBehaviors"
import { System } from "../../ecs/classes/System"
import { AssetLoader } from "../components/AssetLoader"
import { AssetLoaderState } from "../components/AssetLoaderState"
import AssetVault from "../components/AssetVault"
import { Model } from "../components/Model"
import { AssetClass } from "../enums/AssetClass"
import { getAssetClass, getAssetType, loadAsset } from "../functions/LoadingFunctions"
import { AssetsLoadedHandler } from "../types/AssetTypes"
import {  Not } from "../../ecs/functions/ComponentFunctions"
import { Entity } from "../../ecs/classes/Entity"
import {
  getMutableComponent,
  getComponent,
  hasComponent,
  removeComponent,
  addComponent
} from "../../ecs/functions/EntityFunctions"

export default class AssetLoadingSystem extends System {
  loaded = new Map<Entity, any>()

  init() {
  }

  execute() {
    this.queryResults.assetVault.all.forEach(entity => {
      // Do things here
    })
    while (this.queryResults.toLoad.all.length) {
      // Create a new entity
      const entity = this.queryResults.toLoad.all[0]
      // Asset the AssetLoaderState so it falls out of this query
      addComponent(entity, AssetLoaderState)
      const assetLoader = getMutableComponent<AssetLoader>(entity, AssetLoader)
      // Set the filetype
      assetLoader.assetType = getAssetType(assetLoader.url)
      assetLoader.assetClass = getAssetClass(assetLoader.url)
      // Check if the vault already contains the asset
      // If it does, get it so we don't need to reload it
      // Load the asset with a calback to add it to our processing queue
      loadAsset(assetLoader.url, (asset: AssetsLoadedHandler) => {
        this.loaded.set(entity, asset)
      })
    }

    // Do the actual entity creation inside the system tick not in the loader callback
    for (let i = 0; i < this.loaded.size; i++) {
      const [entity, asset] = this.loaded[i]
      const component = getComponent<AssetLoader>(entity, AssetLoader) as AssetLoader
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

      if (hasComponent(entity, Object3DComponent)) {
        if (component.append) {
          getComponent<Object3DComponent>(entity, Object3DComponent).value.add(asset.scene)
        }
      } else {
        addComponent(entity, Model, { value: asset })
        addObject3DComponent(entity, { obj: asset, parent: component.parent })
      }

      if (component.onLoaded) {
        component.onLoaded(asset)
      }
      AssetVault.instance.assets.set(hashResourceString(component.url), asset.scene)
    }
    this.loaded.clear()

    const toUnload = this.queryResults.toUnload.all
    while (toUnload.length) {
      const entity = toUnload[0]
      removeComponent(entity, AssetLoaderState)
      removeObject3DComponent(entity)
    }
  }
}

export function hashResourceString(str) {
  let hash = 0,
    i = 0
  const len = str.length
  while (i < len) {
    hash = ((hash << 5) - hash + str.charCodeAt(i++)) << 0
  }
  // Return the hash plus part of the file name
  return `${hash}${str.substr(Math.max(str.length - 7, 0))}`
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
