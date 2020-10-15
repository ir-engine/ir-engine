import { removeObject3DComponent } from '../../common/behaviors/Object3DBehaviors';
import { Object3DComponent } from '../../common/components/Object3DComponent';
import { isBrowser } from '../../common/functions/isBrowser';
import { Entity } from '../../ecs/classes/Entity';
import { System } from '../../ecs/classes/System';
import { Not } from '../../ecs/functions/ComponentFunctions';
import {
  addComponent,
  createEntity,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/EntityFunctions';
import { AssetLoader } from '../components/AssetLoader';
import { AssetLoaderState } from '../components/AssetLoaderState';
import AssetVault from '../components/AssetVault';
import { Model } from '../components/Model';
import { Unload } from '../components/Unload';
import { AssetClass } from '../enums/AssetClass';
import { getAssetClass, getAssetType, loadAsset } from '../functions/LoadingFunctions';
import { ProcessModelAsset } from "../functions/ProcessModelAsset";

export default class AssetLoadingSystem extends System {
  loaded = new Map<Entity, any>()
  loadingCount:number = 0;

  constructor() {
    super();
    addComponent(createEntity(), AssetVault);
  }
  
  execute () {
    if(this.queryResults.toLoad.all.length > 0){
      const event = new CustomEvent('scene-loaded', { detail:{loaded:false} });
      document.dispatchEvent(event);
    }  

    this.queryResults.assetVault.all.forEach(entity => {
      // Do things here
    });
    this.queryResults.toLoad.all.forEach((entity: Entity) => {
      console.log("To load query has members!");
      if(hasComponent(entity, AssetLoaderState)) {
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
      if(isBrowser){ // Only load asset on browser, as it uses browser-specific requests
        this.loadingCount++;

        const eventEntity = new CustomEvent('scene-loaded-entity', { detail:{left:this.loadingCount} });
        document.dispatchEvent(eventEntity);

        loadAsset(assetLoader.url, entity, (entity, { asset }) => {
          // This loads the editor scene
          this.loaded.set(entity, asset); 
          this.loadingCount--;

          if(this.loadingCount === 0){
            //loading finished
            const event = new CustomEvent('scene-loaded', { detail:{loaded:true} });
            document.dispatchEvent(event);
          }else{
            //show progress by entitites
            const event = new CustomEvent('scene-loaded-entity', { detail:{left: this.loadingCount} });
            document.dispatchEvent(event);
          }
        });
      }
     
    });

    if (this.queryResults.toLoad.added?.length > 0) {
      console.log('toLoad added', this.queryResults.toLoad.added.length);
    }
    if (this.queryResults.toLoad.removed?.length > 0) {
      console.log('toLoad removed', this.queryResults.toLoad.removed.length);
    }

    // Do the actual entity creation inside the system tick not in the loader callback
    this.loaded.forEach( (asset, entity) =>{
      const component = getComponent<AssetLoader>(entity, AssetLoader);
      if (component.assetClass === AssetClass.Model) {
        addComponent(entity, Model, { value: asset });
        ProcessModelAsset(entity, component, asset);
      }

      getMutableComponent<AssetLoader>(entity, AssetLoader).loaded = true;
      
      AssetVault.instance.assets.set(hashResourceString(component.url), asset.scene);
      
      if (component.onLoaded) {
        component.onLoaded(entity, { asset });
      }

      console.log('loaded number ', entity)
    });

    this.loaded?.clear();

    this.queryResults.toUnload.all.forEach((entity: Entity) => {
      console.log("Entity should be unloaded", entity);
      removeComponent(entity, AssetLoaderState);
      removeComponent(entity, Unload);

      if(hasComponent(entity, Object3DComponent)){
        removeObject3DComponent(entity);
      }
    });
  }
}

export function hashResourceString (str:string):string {
  let hash = 0;
  let i = 0;
  const len = str.length;
  while (i < len) {
    hash = ((hash << 5) - hash + str.charCodeAt(i++)) << 0;
  }
  // Return the hash plus part of the file name
  return `${hash}${str.substr(Math.max(str.length - 7, 0))}`;
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
