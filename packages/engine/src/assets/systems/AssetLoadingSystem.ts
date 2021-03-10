import { LOD, MeshPhysicalMaterial, Object3D, SkinnedMesh, TextureLoader } from 'three';
import { hashFromResourceName } from '../../common/functions/hashFromResourceName';
import { isClient } from '../../common/functions/isClient';
import { Engine } from '../../ecs/classes/Engine';
import { EngineEvents } from '../../ecs/classes/EngineEvents';
import { Entity } from '../../ecs/classes/Entity';
import { System } from '../../ecs/classes/System';
import { Not } from '../../ecs/functions/ComponentFunctions';
import {
  addComponent, createEntity, getComponent, getMutableComponent, hasComponent, removeComponent
} from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { addObject3DComponent } from "../../scene/behaviors/addObject3DComponent";
import { Object3DComponent } from '../../scene/components/Object3DComponent';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import AssetVault from '../classes/AssetVault';
import { AssetLoader } from '../components/AssetLoader';
import { AssetLoaderState } from '../components/AssetLoaderState';
import { Model } from '../components/Model';
import { Unload } from '../components/Unload';
import * as LoadGLTF from '../functions/LoadGLTF';
import * as FBXLoader from '../loaders/fbx/FBXLoader';
import { GLTFLoader } from '../loaders/gltf/GLTFLoader';
import { AssetClass } from '../types/AssetClass';
import { AssetType } from '../types/AssetType';
import { AssetsLoadedHandler, AssetTypeAlias, AssetUrl } from '../types/AssetTypes';

const LOD_DISTANCES = {
  "0": 5,
  "1": 15,
  "2": 30
};
const LODS_REGEXP = new RegExp(/^(.*)_LOD(\d+)$/);

/**
 * Process Asset model and map it with given entity.
 * @param entity Entity to which asset will be added.
 * @param component An Asset loader Component holds specifications for the asset.
 * @param asset Loaded asset.
 */
function ProcessModelAsset(entity: Entity, component: AssetLoader, asset: any): void {
  let object = asset.scene ?? asset;

  const replacedMaterials = new Map();
  object.traverse((child) => {
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

  object = HandleLODs(object);

  if (asset.children.length) {
    asset.children.forEach(child => HandleLODs(child));
  }

  if (component.parent) {
    component.parent.add(object);
  } else {
    if (hasComponent(entity, Object3DComponent)) {
      if (getComponent<Object3DComponent>(entity, Object3DComponent).value !== undefined)
        getMutableComponent<Object3DComponent>(entity, Object3DComponent).value.add(object);
      else getMutableComponent<Object3DComponent>(entity, Object3DComponent).value = object;
    } else {
      addObject3DComponent(entity, { obj3d: object });
    }

    object.children.forEach(obj => {
      const e = createEntity();
      addObject3DComponent(e, { obj3d: obj, parentEntity: entity });
    });
  }
}

/**
 * Handles Level of Detail for asset.
 * @param asset Asset on which LOD will apply.
 * @returns LOD handled asset.
 */
function HandleLODs(asset: Object3D): Object3D {
  const haveAnyLODs = !!asset.children?.find(c => String(c.name).match(LODS_REGEXP));
  if (!haveAnyLODs) {
    return asset;
  }

  const LODs = new Map<string, { object: Object3D; level: string }[]>();
  asset.children.forEach(child => {
    const childMatch = child.name.match(LODS_REGEXP);
    if (!childMatch) {
      return;
    }
    const [_, name, level]: string[] = childMatch;
    if (!name || !level) {
      return;
    }

    if (!LODs.has(name)) {
      LODs.set(name, []);
    }

    LODs.get(name).push({ object: child, level });
  });

  LODs.forEach((value, key) => {
    const lod = new LOD();
    lod.name = key;
    value[0].object.parent.add(lod);

    value.forEach(({ level, object }) => {
      lod.addLevel(object, LOD_DISTANCES[level]);
    });
  });

  return asset;
}

/**
 * Replace material on asset based on Asset loader specifications.
 * @param object Object on which replacement will apply.
 * @param component Asset loader component holding material specification.
 */
function ReplaceMaterials(object, component: AssetLoader) {

}

function parallelTraverse(a, b, callback) {
  callback(a, b);
  for (let i = 0; i < a.children.length; i++)
    parallelTraverse(a.children[i], b.children[i], callback);
}

function clone(source: Object3D): Object3D {
  const sourceLookup = new Map();
  const cloneLookup = new Map();
  const clone = source.clone();

  parallelTraverse(source, clone, (sourceNode, clonedNode) => {
    sourceLookup.set(clonedNode, sourceNode);
    cloneLookup.set(sourceNode, clonedNode);
  });

  clone.traverse((node: unknown) => {
    if (!(node instanceof SkinnedMesh)) return;

    const clonedMesh = node;
    const sourceMesh = sourceLookup.get(node);
    const sourceBones = sourceMesh.skeleton.bones;

    clonedMesh.skeleton = sourceMesh.skeleton.clone();
    clonedMesh.bindMatrix.copy(sourceMesh.bindMatrix);

    clonedMesh.skeleton.bones = sourceBones.map((bone) => {
      return cloneLookup.get(bone);
    });
    clonedMesh.bind(clonedMesh.skeleton, clonedMesh.bindMatrix);
  });
  return clone;
}

/**
 * Load an asset from given URL.
 * @param url URL of the asset.
 * @param entity Entity object which will be passed in **```onAssetLoaded```** callback.
 * @param onAssetLoaded Callback to be called after asset will be loaded.
 */
function loadAsset(url: AssetUrl, entity: Entity, onAssetLoaded: AssetsLoadedHandler): void {
  const urlHashed = hashFromResourceName(url);
  if (AssetVault.instance.assets.has(urlHashed)) {
    onAssetLoaded(entity, { asset: clone(AssetVault.instance.assets.get(urlHashed)) });
  } else {
    const loader = getLoaderForAssetType(getAssetType(url));
    if (loader == null) {
      console.error('Asset loader failed ', url, entity);
      return;
    }
    loader.load(url, resource => {
      if (resource !== undefined) {
        LoadGLTF.loadExtentions(resource);
      }
      if (resource.scene) {
        // store just scene, no need in all gltf metadata?
        resource = resource.scene;
      }
      AssetVault.instance.assets.set(urlHashed, resource);
      onAssetLoaded(entity, { asset: resource });
    });
  }
}

/**
 * Get asset loader for given asset type.
 * @param assetType Type of the asset.
 * @returns Asset loader for given asset type.
 */
function getLoaderForAssetType(assetType: AssetTypeAlias): GLTFLoader | any | TextureLoader {
  if (assetType == AssetType.FBX) return new FBXLoader.FBXLoader();
  else if (assetType == AssetType.glTF) return LoadGLTF.getLoader();
  else if (assetType == AssetType.PNG) return new TextureLoader();
  else if (assetType == AssetType.JPEG) return new TextureLoader();
  else if (assetType == AssetType.VRM) return new GLTFLoader();
}

/**
 * Get asset type from the asset file extension.
 * @param assetFileName Name of the Asset file.
 * @returns Asset type of the file.
 */
function getAssetType(assetFileName: string): AssetType {
  if (/\.(?:gltf|glb)$/.test(assetFileName))
    return AssetType.glTF;
  else if (/\.(?:fbx)$/.test(assetFileName))
    return AssetType.FBX;
  else if (/\.(?:vrm)$/.test(assetFileName))
    return AssetType.VRM;
  else if (/\.(?:png)$/.test(assetFileName))
    return AssetType.PNG;
  else if (/\.(?:jpg|jpeg|)$/.test(assetFileName))
    return AssetType.JPEG;
  else
    return null;
}

/**
 * Get asset class from the asset file extension.
 * @param assetFileName Name of the Asset file.
 * @returns Asset class of the file.
 */
function getAssetClass(assetFileName: string): AssetClass {
  if (/\.(?:gltf|glb|vrm|fbx|obj)$/.test(assetFileName)) {
    return AssetClass.Model;
  } else if (/\.png|jpg|jpeg$/.test(assetFileName)) {
    return AssetClass.Image;
  } else {
    return null;
  }
}

/** System class for Asset loading. */
export default class AssetLoadingSystem extends System {
  /** Update type of the system. **Default** value is 
   *    {@link ecs/functions/SystemUpdateType.SystemUpdateType.Fixed | Fixed} type.  */
  updateType = SystemUpdateType.Fixed;
  /** Map holding loaded Assets. */
  loaded = new Map<Entity, Object3D>()
  /** Loading asset count. */
  loadingCount = 0;

  /** Constructs Asset loading system. */
  constructor() {
    super();
  }

  /** Execute the system. */
  execute(): void {
    this.queryResults.toLoad.all.forEach((entity: Entity) => {

      const isCharacter = hasComponent(entity, CharacterComponent);

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
        EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.ENTITY_LOADED, left: this.loadingCount });
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
                EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.SCENE_LOADED, loaded: true });
              } else {
                //show progress by entitites
                EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.ENTITY_LOADED, left: this.loadingCount });
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
      if (component && component.assetClass === AssetClass.Model) {
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

        const object3d = getComponent<Object3DComponent>(entity, Object3DComponent, true).value;
        if (object3d == undefined) return;
        Engine.scene.remove(object3d);

        // Using "true" as the entity could be removed somewhere else
        object3d.parent && object3d.parent.remove(object3d);
        removeComponent(entity, Object3DComponent);

        for (let i = entity.componentTypes.length - 1; i >= 0; i--) {
          const Component = entity.componentTypes[i];

          if (Component.isObject3DTagComponent) {
            removeComponent(entity, Component);
          }
        }

        (object3d as any).entity = null;
      }
    });
  }
}

AssetLoadingSystem.queries = {
  models: {
    components: [Model]
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
