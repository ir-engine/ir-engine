import { SceneTagComponent } from '../../common/components/Object3DTagComponents';
import { addComponent, createEntity } from '../../ecs/functions/EntityFunctions';
import { SceneObjectLoadingSchema } from '../constants/SceneObjectLoadingSchema';

export function loadScene (scene) {
  Object.keys(scene.entities).forEach(key => {
    const sceneEntity = scene.entities[key];
    const entity = createEntity();
    addComponent(entity, SceneTagComponent);
    sceneEntity.components.forEach(component => {
      console.log("Component loading is")
      console.log(component);
      console.log(component.name);
      loadComponent(entity, component);
    });
  });
}

export function loadComponent (entity, component) {
  console.log("Loading componenent");
  console.log(component);
  console.log("on entity")
  console.log(entity);

  if (SceneObjectLoadingSchema[component.name] === undefined) return console.warn("Couldn't load ", component.name);
  const componentSchema = SceneObjectLoadingSchema[component.name];
  // for each component in component name, call behavior
  componentSchema.behaviors?.forEach(b => {
    // For each value, from component.data
    const values = b.values ? b.values.map(val => component.data[val]) : {};
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
