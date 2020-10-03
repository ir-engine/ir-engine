import { addObject3DComponent, removeObject3DComponent } from '../../common/behaviors/Object3DBehaviors';
import { Object3DComponent } from '../../common/components/Object3DComponent';
import { Engine } from '../../ecs/classes/Engine';
import { Entity } from '../../ecs/classes/Entity';
import { System } from '../../ecs/classes/System';
import { Not } from '../../ecs/functions/ComponentFunctions';
import {
  addComponent,
  createEntity, getComponent, getMutableComponent,

  hasComponent,
  removeComponent
} from '../../ecs/functions/EntityFunctions';
import { TransformChildComponent } from '../../transform/components/TransformChildComponent';
import { TransformParentComponent } from '../../transform/components/TransformParentComponent';
import { AssetLoader } from '../components/AssetLoader';
import { AssetLoaderState } from '../components/AssetLoaderState';
import AssetVault from '../components/AssetVault';
import { Model } from '../components/Model';
import { Unload } from '../components/Unload';
import { AssetClass } from '../enums/AssetClass';
import { getAssetClass, getAssetType, loadAsset } from '../functions/LoadingFunctions';
import { isBrowser } from '../../common/functions/isBrowser';
import { MeshPhysicalMaterial } from "three";

export default class AssetLoadingSystem extends System {
  loaded = new Map<Entity, any>()

  constructor() {
    super();
    addComponent(createEntity(), AssetVault);
  }

  execute () {
    this.queryResults.assetVault.all.forEach(entity => {
      // Do things here
    });
    this.queryResults.toLoad.all.forEach((entity: Entity) => {
      if(hasComponent(entity, AssetLoaderState)) return console.log("Returning because already has assetloader");
      console.log("To load query has members!");
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
      if(isBrowser) // Only load asset on browser, as it uses browser-specific requests
      loadAsset(assetLoader.url, entity, (entity, { asset }) => {
        // This loads the editor scene
        this.loaded.set(entity, asset);
      });
    });

    // Do the actual entity creation inside the system tick not in the loader callback
    this.loaded.forEach( (asset, entity) =>{
      const component = getComponent<AssetLoader>(entity, AssetLoader);
      if (component.assetClass === AssetClass.Model) {
        const replacedMaterials = new Map();
        if(asset.scene !== undefined)
        asset.scene.traverse((child) => {
          if (child.isMesh) {
            child.receiveShadow = component.receiveShadow;
            child.castShadow = component.castShadow;

            if (component.envMapOverride) {
              child.material.envMap = component.envMapOverride;
            }

            if (replacedMaterials.has(child.material)) {
              child.material = replacedMaterials.get(child.material);
            } else {
              if (child?.material?.userData?.gltfExtensions?.KHR_materials_clearcoat) {
                const newMaterial = new MeshPhysicalMaterial({});
                newMaterial.setValues(child.material); // to copy properties of original material
                newMaterial.clearcoat = child.material.userData.gltfExtensions.KHR_materials_clearcoat.clearcoatFactor;
                newMaterial.clearcoatRoughness = child.material.userData.gltfExtensions.KHR_materials_clearcoat.clearcoatRoughnessFactor;
                newMaterial.defines = { STANDARD: '', PHYSICAL: '' }; // override if it's replaced by non PHYSICAL defines of child.material

                replacedMaterials.set(child.material, newMaterial);
                child.material = newMaterial;
              }
            }
          }
        });
        replacedMaterials.clear();
      }

      addComponent(entity, Model, { value: asset });
      if (hasComponent(entity, Object3DComponent)) {
        if (getComponent<Object3DComponent>(entity, Object3DComponent).value !== undefined)
          getMutableComponent<Object3DComponent>(entity, Object3DComponent).value.add(asset.scene);
        else getMutableComponent<Object3DComponent>(entity, Object3DComponent).value = (asset.scene);
      } else {
        addObject3DComponent(entity, {obj3d: asset.scene ?? asset});
      }

      //const transformParent = addComponent<TransformParentComponent>(entity, TransformParentComponent) as TransformParentComponent
      const a = asset.scene ?? asset;
      a.children.forEach(obj => {
        const e = createEntity();
        addObject3DComponent(e, { obj3d: obj, parentEntity: entity });
        // const transformChild = addComponent<TransformChildComponent>(e, TransformChildComponent) as TransformChildComponent
        // transformChild.parent = entity
        //transformParent.children.push(e)
      });
      getMutableComponent<AssetLoader>(entity, AssetLoader).loaded = true;
      
      AssetVault.instance.assets.set(hashResourceString(component.url), asset.scene);
      
      if (component.onLoaded) {
        component.onLoaded(entity, { asset });
      }
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
  models: {
    components: [Model]
  },
  assetVault: {
    components: [AssetVault]
  },
  toLoad: {
    components: [AssetLoader, Not(AssetLoaderState)]
  },
  toUnload: {
    components: [AssetLoaderState, Unload, Not(AssetLoader)]
  }
};
