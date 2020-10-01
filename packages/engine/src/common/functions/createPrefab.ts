import { Prefab } from '../interfaces/Prefab';
import { Engine } from '../../ecs/classes/Engine';
import { Entity } from '../../ecs/classes/Entity';
import { createEntity, addComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { Quaternion, Vector3 } from "three";

export function createPrefab (prefab: Prefab): Entity {
  const entity = createEntity();
  // Call each create action
  prefab.onCreate?.forEach(action => {
    // Call the behavior with the args
    { action.behavior(entity, action.args); }
  });
  // For each component on the prefab...
  {
prefab.components?.forEach(component => {
  // The component to the entity
  addComponent(entity, component.type);
  // If the component has no initialization data, return
  if (component.data == undefined) return;
  // Get a mutable reference to the component
  const addedComponent = getMutableComponent(entity, component.type);
  // Set initialization data for each key
  Object.keys(component.data).forEach(initValue => {
    // Get the component on the entity, and set it to the initializing value from the prefab
    if (addedComponent[initValue] instanceof Vector3) {

      addedComponent[initValue].fromArray(component.data[initValue]);

      console.log(addedComponent[initValue]);
    } else if (addedComponent[initValue] instanceof Quaternion) {
      addedComponent[initValue].fromArray(component.data[initValue]);
    } else {
      addedComponent[initValue] = component.data[initValue];
    }
  });
});
  }

  return entity;
}
