import { Engine } from '../../ecs/classes/Engine';
import { SceneTagComponent } from '../../common/components/Object3DTagComponents';
import { addComponent, createEntity } from '../../ecs/functions/EntityFunctions';
import { SceneObjectLoadingSchema } from '../constants/SceneObjectLoadingSchema';
import { PhysicsManager } from '../../physics/components/PhysicsManager';
import { isClient } from "../../common/functions/isClient";
import { Entity } from "../../ecs/classes/Entity";
import { SceneData } from "../interfaces/SceneData";
import { SceneDataComponent } from "../interfaces/SceneDataComponent";

export function loadScene (scene: SceneData): void {
  console.warn(Engine.scene);
  console.warn("Loading scene", scene);
  Object.keys(scene.entities).forEach(key => {
    const sceneEntity = scene.entities[key];
    const entity = createEntity();
    addComponent(entity, SceneTagComponent);
    sceneEntity.components.forEach(component => {
      loadComponent(entity, component);
    });
  });
  //PhysicsManager.instance.simulate = true;

  // TODO: temporary! we need to catch assets to load, and if there is no assets - then nothing to wait
  if (isClient) {
    const event = new CustomEvent('scene-loaded', {detail: {loaded: true}});
    document.dispatchEvent(event);
  }
}

export function loadComponent (entity: Entity, component: SceneDataComponent): void {
  if (SceneObjectLoadingSchema[component.name] === undefined) return console.warn("Couldn't load ", component.name);
  const componentSchema = SceneObjectLoadingSchema[component.name];
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
