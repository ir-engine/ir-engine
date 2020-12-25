import { Prefab } from '../interfaces/Prefab';
import { Entity } from '../../ecs/classes/Entity';
import { createEntity, addComponent } from '../../ecs/functions/EntityFunctions';
import { Quaternion, Vector3 } from "three";

export function createPrefab (prefab: Prefab): Entity {
  const entity = createEntity();
  // Call each create action
  prefab.onBeforeCreate?.forEach(action => {
    // Call the behavior with the args
    { action.behavior(entity, action.args); }
  });
  // For each component on the prefab...
  {
    prefab.localClientComponents?.forEach(component => {
      if (typeof component.data === 'undefined') {
        // The component to the entity
        addComponent(entity, component.type);
        return;
      }

      const initData = {};
      // Set initialization data for each key
      Object.keys(component.data).forEach(initValueKey => {
        let initValue = component.data[initValueKey];
        // Get the component on the entity, and set it to the initializing value from the prefab
        if (typeof component.type._schema[initValueKey] === 'undefined') {
          console.warn('property', initValueKey, ' not exists in component schema of ', component.type.name);
          // console.log(component);
        } else {
          if (
            typeof component.type._schema[initValueKey].default !== 'undefined' &&
            Array.isArray(initValue)
          ) {
            if (component.type._schema[initValueKey].default instanceof Vector3) {
              initValue = new Vector3().fromArray(initValue);
            } else if (component.type._schema[initValueKey].default instanceof Quaternion) {
              initValue = new Quaternion().fromArray(initValue);
            }
          }
        }
        initData[initValueKey] = initValue;
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
