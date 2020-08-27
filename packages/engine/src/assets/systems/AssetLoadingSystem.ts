import { Object3DComponent } from '../../common/components/Object3DComponent';
import { addObject3DComponent, removeObject3DComponent } from '../../common/behaviors/Object3DBehaviors';
import { System } from '../../ecs/classes/System';
import { AssetLoader } from '../components/AssetLoader';
import { AssetLoaderState } from '../components/AssetLoaderState';
import AssetVault from '../components/AssetVault';
import { Model } from '../components/Model';
import { AssetClass } from '../enums/AssetClass';
import { getAssetClass, getAssetType, loadAsset } from '../functions/LoadingFunctions';
import { Not } from '../../ecs/functions/ComponentFunctions';
import { Entity } from '../../ecs/classes/Entity';
import {
  getMutableComponent,
  getComponent,
  hasComponent,
  removeComponent,
  addComponent,
  createEntity
} from '../../ecs/functions/EntityFunctions';
import { Engine } from '../../ecs/classes/Engine';
import { TransformParentComponent } from '../../transform/components/TransformParentComponent';
import { TransformChildComponent } from '../../transform/components/TransformChildComponent';
import { Group } from 'three';
import { GroupTagComponent } from '../../common/components/Object3DTagComponents';

export default class AssetLoadingSystem extends System {
  loaded = new Map<Entity, any>()

  init () {
    addComponent(createEntity(), AssetVault)
  }

  execute () {
    this.queryResults.assetVault.all.forEach(entity => {
      // Do things here
    });
    this.queryResults.toLoad.all.forEach((entity: Entity) => {
      // Create a new entity
      addComponent(entity, AssetLoaderState);
      const assetLoader = getMutableComponent<AssetLoader>(entity, AssetLoader);
      // Set the filetype
      assetLoader.assetType = getAssetType(assetLoader.url);
      // Set the class (model, image, etc)
      assetLoader.assetClass = getAssetClass(assetLoader.url);
      // Check if the vault already contains the asset
      // If it does, get it so we don't need to reload it
      // Load the asset with a calback to add it to our processing queue
      loadAsset(assetLoader.url, (asset: any) => {
        // This loads the editor scene

        this.loaded.set(entity, asset);
      });
    })

    // Do the actual entity creation inside the system tick not in the loader callback
    this.loaded.forEach( (asset, entity) =>{
      if(!hasComponent(entity, AssetLoader)) {
        return console.log("Error, entity doesn't have asset loader")
      }

      const component = getComponent<AssetLoader>(entity, AssetLoader);
      if (component.assetClass === AssetClass.Model) {
        if(asset.scene !== undefined)
        asset.scene.traverse((child) => {
          if (child.isMesh) {
            child.receiveShadow = component.receiveShadow;
            child.castShadow = component.castShadow;

            if (component.envMapOverride) {
              child.material.envMap = component.envMapOverride;
            }
          }
        });
      }

      if (hasComponent(entity, Object3DComponent)) {
        if (component.append) {
          if(getComponent<Object3DComponent>(entity, Object3DComponent).value !== undefined)
          getMutableComponent<Object3DComponent>(entity, Object3DComponent).value.add(asset.scene)
          else getMutableComponent<Object3DComponent>(entity, Object3DComponent).value = (asset.scene)
        }
      } else {
        addComponent(entity, Model, { value: asset });
        const transformParent = addComponent<TransformParentComponent>(entity, TransformParentComponent) as TransformParentComponent
        addObject3DComponent(entity, { obj3d: asset.scene ?? asset, parent: Engine.scene });
        const object3DComponent = getComponent<Object3DComponent>(entity, Object3DComponent) as Object3DComponent

        const a = asset.scene ?? asset
        a.children.forEach(obj => {
          const e = createEntity()
          addObject3DComponent(e, { obj3d: obj, parent: object3DComponent });
          const transformChild = addComponent<TransformChildComponent>(e, TransformChildComponent) as TransformChildComponent
          transformChild.parent = entity
          transformParent.children.push(e)
        })
      }
      getMutableComponent<AssetLoader>(entity, AssetLoader).loaded = true;
      
      AssetVault.instance.assets.set(hashResourceString(component.url), asset.scene);
      
      if (component.onLoaded) {
        component.onLoaded(asset);
      }
    });

    this.loaded.clear();

    this.queryResults.toUnload.all.forEach((entity: Entity) => {
      removeComponent(entity, AssetLoaderState);
      if(hasComponent(entity, Object3DComponent))
      removeObject3DComponent(entity);
    })
  }
}

export function hashResourceString (str) {
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
  mopdels: {
    components: [Model]
  },
  assetVault: {
    components: [AssetVault]
  },
  toLoad: {
    components: [AssetLoader, Not(AssetLoaderState)]
  },
  toUnload: {
    components: [AssetLoaderState, Not(AssetLoader)]
  }
};
