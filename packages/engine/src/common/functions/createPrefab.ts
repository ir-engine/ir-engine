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
      if (typeof component.data === 'undefined') {
        // The component to the entity
        addComponent(entity, component.type);
        return;
      }

      const initData = {};
      // Set initialization data for each key
      Object.keys(component.data).forEach(initValue => {
        // Get the component on the entity, and set it to the initializing value from the prefab
        if (initData[initValue] instanceof Vector3) {

          initData[initValue].fromArray(component.data[initValue]);

          //console.log(initData[initValue]);
        } else if (initData[initValue] instanceof Quaternion) {
          initData[initValue].fromArray(component.data[initValue]);
        } else {
          initData[initValue] = component.data[initValue];
        }
      });
      // The component to the entity
      addComponent(entity, component.type, initData);
    });
  }
  prefab.onAfterCreate?.forEach(action => {
    // Call the behavior with the args
    { action.behavior(entity, action.args); }
  });

  return entity;
}
