import { Entity } from '../../ecs/classes/Entity';
import { createEntity, addComponent, getMutableComponent, getComponent } from '../../ecs/functions/EntityFunctions';
import { Network } from '../components/Network';
import { NetworkObject } from '../components/NetworkObject';
import { NetworkPrefab } from '../interfaces/NetworkPrefab';

/**
 * Instantiate a prefab with network-synced values
 * @param prefab NetworkPrefab to instantiate
 * @param networkId ID of the network object instantiated
 */
export function createNetworkPrefab(prefab: NetworkPrefab, ownerId, networkId: number): Entity {
  const entity = createEntity();

  // Add a NetworkObject component to the entity, this will store information about changing state
  addComponent(entity, NetworkObject, { ownerId, networkId });
  console.log("Create prefab: ");
  console.log(prefab);
  // Call each create action
  prefab.onBeforeCreate?.forEach(action => {
    // If it's a networked behavior, or this is the local player, call it
    if (action.networked || ownerId === (Network.instance).userId)
    // Call the behavior with the args
    { action.behavior(entity, action.args); }
    console.log(action);

  });
  // Instantiate network components
  // These will be attached to the entity on all clients
  prefab.networkComponents?.forEach(component => {
    // Add the component to our entity
    addComponent(entity, component.type);
    // Get a mutable reference to the component
    if (component.data !== undefined) {
      const addedComponent = getMutableComponent(entity, component.type);
      // Set initialization data for each key
      Object.keys(component.data).forEach(initValue => {
        // Get the component on the entity, and set it to the initializing value from the prefab
        addedComponent[initValue] = component.data[initValue];
      });
    }
    console.log(component);

  });
  // Instantiate local components
  // If this is the local player, spawn the local components (these will not be spawned for other clients)
  // This is good for input, camera, etc
  if (ownerId === (Network.instance).userId && prefab.components)
  // For each local component on the prefab...
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
        addedComponent[initValue] = component.data[initValue];
      });
    });
  }

  return entity;
}
