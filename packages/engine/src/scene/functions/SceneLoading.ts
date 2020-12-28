import { Engine } from '../../ecs/classes/Engine';
import { SceneTagComponent } from '../../common/components/Object3DTagComponents';
import { addComponent, createEntity, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { SceneObjectLoadingSchema } from '../constants/SceneObjectLoadingSchema';
import { PhysicsManager } from '../../physics/components/PhysicsManager';
import { AssetLoader } from '../../assets/components/AssetLoader';
import { isClient } from "../../common/functions/isClient";
import { Entity } from "../../ecs/classes/Entity";
import { SceneData } from "../interfaces/SceneData";
import { SceneDataComponent } from "../interfaces/SceneDataComponent";

export function loadScene (scene: SceneData): void {
  if (isClient) {
    console.warn(Engine.scene);
    console.warn("Loading scene", scene);
  }
  const loadPromises = [];
  let loaded = 0;
  if (isClient) {
    const event = new CustomEvent('scene-loaded-entity', {detail: {left: loadPromises.length}});
    document.dispatchEvent(event);
  }
  Object.keys(scene.entities).forEach(key => {
    const sceneEntity = scene.entities[key];
    const entity = createEntity();
    addComponent(entity, SceneTagComponent);
    sceneEntity.components.forEach(component => {
      loadComponent(entity, component);
      if(isClient && component.name === 'gltf-model'){
        const loaderComponent = getMutableComponent(entity, AssetLoader);
        loadPromises.push(new Promise((resolve, reject)=>{
          if(loaderComponent.onLoaded === null || loaderComponent.onLoaded === undefined){
          }
          loaderComponent.onLoaded.push(()=> {
            loaded++;
            const event = new CustomEvent('scene-loaded-entity', { detail: { left: (loadPromises.length-loaded) } });
            document.dispatchEvent(event);
          });
        }));
      }
    });
  });
  //PhysicsManager.instance.simulate = true;

  isClient && Promise.all(loadPromises).then(()=>{
    const event = new CustomEvent('scene-loaded', { detail: { loaded: true } });
    document.dispatchEvent(event);
  });
}

export function loadComponent (entity: Entity, component: SceneDataComponent): void {
  let name = component.name.replace(/-\d+/, "").replace(" ", "")
  // Override for loading mesh colliders

  if (SceneObjectLoadingSchema[name] === undefined)return console.warn("Couldn't load ", name);

  const componentSchema = SceneObjectLoadingSchema[name];
  // for each component in component name, call behavior
  componentSchema.behaviors?.forEach(b => {
    // For each value, from component.data
    const values = {};
    b.values?.forEach(val => {
      // Does it have a from and to field? Let's map to that
      if(val['from'] !== undefined) {
        values[val['to']] = component.data[val['from']];
      }
      else {
      // Otherwise raw data
      values[val] = component.data[val];
      }
    });
    // run behavior after load model
    if((b as any).onLoaded) values['onLoaded'] = (b as any).onLoaded;
    // Invoke behavior with args and spread args
    b.behavior(entity, { ...b.args, objArgs: { ...values } });
  });

  // for each component in component name, add component
  componentSchema.components?.forEach(c => {
    // For each value, from component.data, add to args object
    const values = c.values ? c.values.map(val => component.data[val]) : {};
    // Add component with args
    addComponent(entity, c.type, values);
  });
}
