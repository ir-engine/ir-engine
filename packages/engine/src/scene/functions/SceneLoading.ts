import { SceneTagComponent } from '../../common/components/Object3DTagComponents';
import { addComponent, createEntity } from '../../ecs/functions/EntityFunctions';
import { SceneObjectLoadingSchema } from '../constants/SceneObjectLoadingSchema';

export function loadScene (scene) {
  console.log("Loading scene", scene);
  Object.keys(scene.entities).forEach(key => {
    const sceneEntity = scene.entities[key];
    const entity = createEntity();
    addComponent(entity, SceneTagComponent);
    sceneEntity.components.forEach(component => {
      loadComponent(entity, component);
    });
  });
}

export function loadComponent (entity, component) {
  if (SceneObjectLoadingSchema[component.name] === undefined) return console.warn("Couldn't load ", component.name);
  const componentSchema = SceneObjectLoadingSchema[component.name];
  // for each component in component name, call behavior
  componentSchema.behaviors?.forEach(b => {
    // For each value, from component.data
    const values = {}    
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
    // Invoke behavior with args and spread args
    b.behavior(entity, { ...b.args, objArgs: { ...values } });
  });

  // for each component in component name, add copmponent
  componentSchema.components?.forEach(c => {
    // For each value, from component.data, add to args object
    const values = c.values ? c.values.map(val => component.data[val]) : {};
    // Add component with args
    addComponent(entity, c.type, values);
  });
}
