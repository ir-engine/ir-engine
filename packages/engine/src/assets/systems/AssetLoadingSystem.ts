import { removeObject3DComponent } from '../../common/behaviors/Object3DBehaviors';
import { Object3DComponent } from '../../common/components/Object3DComponent';
import { isClient } from '../../common/functions/isClient';
import { Entity } from '../../ecs/classes/Entity';
import { System } from '../../ecs/classes/System';
import { Not } from '../../ecs/functions/ComponentFunctions';
import {
  addComponent, createEntity, getComponent, getMutableComponent, hasComponent, removeComponent
} from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { AssetLoader } from '../components/AssetLoader';
import { AssetLoaderState } from '../components/AssetLoaderState';
import AssetVault from '../components/AssetVault';
import { Model } from '../components/Model';
import { Unload } from '../components/Unload';
import { AssetClass } from '../enums/AssetClass';
import { getAssetClass, getAssetType, loadAsset } from '../functions/LoadingFunctions';
import { ProcessModelAsset } from "../functions/ProcessModelAsset";
import { Object3D } from 'three';
import { CharacterAvatarComponent } from '../../templates/character/components/CharacterAvatarComponent';

export default class AssetLoadingSystem extends System {
  updateType = SystemUpdateType.Fixed;
  loaded = new Map<Entity, Object3D>()
  loadingCount = 0;

  constructor() {
    super();
    addComponent(createEntity(), AssetVault);
  }

  execute(): void {
    this.queryResults.assetVault.all.forEach(entity => {
      // Do things here
    });
    this.queryResults.toLoad.all.forEach((entity: Entity) => {
      // console.log("**************** TO LOAD");
      // console.log(entity)
      const isCharacter = hasComponent(entity, CharacterAvatarComponent);

      if (hasComponent(entity, AssetLoaderState)) {
        //return console.log("Returning because already has AssetLoaderState");
        console.log("??? already has AssetLoaderState");
      } else {
        // Create a new AssetLoaderState
        addComponent(entity, AssetLoaderState);
      }
      const assetLoader = getMutableComponent<AssetLoader>(entity, AssetLoader);
      // Set the filetype
      assetLoader.assetType = getAssetType(assetLoader.url);
      // Set the class (model, image, etc)
      assetLoader.assetClass = getAssetClass(assetLoader.url);
      // Check if the vault already contains the asset
      // If it does, get it so we don't need to reload it
      // Load the asset with a calback to add it to our processing queue
      if (isClient) { // Only load asset on browser, as it uses browser-specific requests
        this.loadingCount++;

        const eventEntity = new CustomEvent('scene-loaded-entity', { detail: { left: this.loadingCount } });
        document.dispatchEvent(eventEntity);
      }


      if (!isCharacter || isClient) {
        try {
          loadAsset(assetLoader.url, entity, (entity, { asset }) => {
            // This loads the editor scene
            this.loaded.set(entity, asset);
            if (isClient) {
              this.loadingCount--;

              if (this.loadingCount === 0) {
                //loading finished
                const event = new CustomEvent('scene-loaded', { detail: { loaded: true } });
                document.dispatchEvent(event);
              } else {
                //show progress by entitites
                const event = new CustomEvent('scene-loaded-entity', { detail: { left: this.loadingCount } });
                document.dispatchEvent(event);
              }
            }
          });
        } catch (error) {
          console.log("**** Loading error; failed to load because ", error);
        }
      }

    });

    // Do the actual entity creation inside the system tick not in the loader callback
    this.loaded.forEach((asset, entity) => {
      const component = getComponent<AssetLoader>(entity, AssetLoader);
      if (component.assetClass === AssetClass.Model) {
        addComponent(entity, Model, { value: asset });
        ProcessModelAsset(entity, component, asset);
      }

      getMutableComponent<AssetLoader>(entity, AssetLoader).loaded = true;

      // asset is already set into Vault in it's raw unprocessed state
      // const urlHashed = hashResourceString(component.url);
      // if (!AssetVault.instance.assets.has(urlHashed)) {
      //   AssetVault.instance.assets.set(urlHashed, asset);
      // }

      if (component.onLoaded.length > 0) {
        component.onLoaded.forEach(onLoaded => onLoaded(entity, { asset }));
      }
    });

    this.loaded?.clear();

    this.queryResults.toUnload.all.forEach((entity: Entity) => {
      console.log("Entity should be unloaded", entity);
      removeComponent(entity, AssetLoaderState);
      removeComponent(entity, Unload);

      if (hasComponent(entity, Object3DComponent)) {
        removeObject3DComponent(entity);
      }
    });
  }
}

AssetLoadingSystem.queries = {
  models: {
    components: [Model]
  },
  assetVault: {
    components: [AssetVault]
  },
  toLoad: {
    components: [AssetLoader, Not(AssetLoaderState)],
    listen: {
      added: true,
      removed: true
    }
  },
  toUnload: {
    components: [AssetLoaderState, Unload, Not(AssetLoader)]
  }
};
