import { AssetLoader } from '../../assets/components/AssetLoader';
import { isClient } from "../../common/functions/isClient";
import { Engine } from '../../ecs/classes/Engine';
import { Entity } from "../../ecs/classes/Entity";
import { addComponent, createEntity, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { EngineEvents } from '../../worker/EngineEvents';
import { SceneTagComponent } from '../components/Object3DTagComponents';
import { SceneObjectLoadingSchema } from '../constants/SceneObjectLoadingSchema';
import { SceneData } from "../interfaces/SceneData";
import { SceneDataComponent } from "../interfaces/SceneDataComponent";

export const SCENE_EVENTS = {
  LOAD_SCENE: 'SCENE_EVENTS_LOAD_SCENE',
  SCENE_LOADED: 'SCENE_EVENTS_SCENE_LOADED',
  ENTITY_LOADED: 'SCENE_EVENTS_ENTITY_LOADED',  
};

export function loadScene(scene: SceneData): void {
  const loadPromises = [];
  let loaded = 0;
  if (isClient) {
    console.warn(Engine.scene);
    console.warn(scene);
    EngineEvents.instance.dispatchEvent({ type: SCENE_EVENTS.ENTITY_LOADED, left: loadPromises.length });
  }
  Object.keys(scene.entities).forEach(key => {
    const sceneEntity = scene.entities[key];
    const entity = createEntity();
    addComponent(entity, SceneTagComponent);
    sceneEntity.components.forEach(component => {
      loadComponent(entity, component);
      if (isClient && component.name === 'gltf-model') {
        const loaderComponent = getMutableComponent(entity, AssetLoader);
        loaderComponent.entityIdFromScenaLoader = sceneEntity;
        loadPromises.push(new Promise<void>((resolve, reject) => {
          if (loaderComponent.onLoaded === null || loaderComponent.onLoaded === undefined) {
          }
          loaderComponent.onLoaded.push(() => {
            loaded++;
            resolve()
            EngineEvents.instance.dispatchEvent({ type: SCENE_EVENTS.ENTITY_LOADED, left: (loadPromises.length - loaded) });
          });
        }));
      } else if (!isClient && component.name === 'gltf-model') {
        const loaderComponent = getMutableComponent(entity, AssetLoader);
        loaderComponent.entityIdFromScenaLoader = sceneEntity;
      }
    });
  });
  //PhysicsSystem.simulate = true;

  isClient && Promise.all(loadPromises).then(() => {
    EngineEvents.instance.dispatchEvent({ type: SCENE_EVENTS.SCENE_LOADED, loaded: true });
  });
}

export function loadComponent(entity: Entity, component: SceneDataComponent): void {
  const name = component.name.replace(/-\d+/, "").replace(" ", "")
  // Override for loading mesh colliders

  if (SceneObjectLoadingSchema[name] === undefined)
    return console.warn("Couldn't load ", name);

  const componentSchema = SceneObjectLoadingSchema[name];
  // for each component in component name, call behavior
  componentSchema.behaviors?.forEach(b => {
    // For each value, from component.data
    const values = {};
    b.values?.forEach(val => {
      // Does it have a from and to field? Let's map to that
      if (val['from'] !== undefined) {
        values[val['to']] = component.data[val['from']];
      }
      else {
        // Otherwise raw data
        values[val] = component.data[val];
      }
    });
    // run behavior after load model
    if ((b as any).onLoaded) values['onLoaded'] = (b as any).onLoaded;
    // Invoke behavior with args and spread args
    b.behavior(entity, { ...b.args, objArgs: { ...b.args?.objArgs, ...values } });
  });

  // for each component in component name, add component
  componentSchema.components?.forEach(c => {
    // For each value, from component.data, add to args object
    const values = c.values ? c.values.map(val => component.data[val]) : {};
    // Add component with args
    addComponent(entity, c.type, values);
  });
}
