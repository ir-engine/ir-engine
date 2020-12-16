import { Entity } from '../../ecs/classes/Entity';
import { createEntity, addComponent, getMutableComponent, getComponent } from '../../ecs/functions/EntityFunctions';
import { Network } from '../components/Network';
import { NetworkObject } from '../components/NetworkObject';
import { Server } from '../components/Server';
import { Client } from '../components/Client';
import { NetworkPrefab } from '../interfaces/NetworkPrefab';
import {Component} from "../../ecs/classes/Component";

/**
 * Instantiate a prefab with network-synced values
 * @param prefab NetworkPrefab to instantiate
 * @param networkId ID of the network object instantiated
 * @param ownerId
 * @param override?
 */
export function createNetworkPrefab(prefab: NetworkPrefab, ownerId, networkId: number, override: NetworkPrefab = null): Entity {
  console.log("createNetworkPrefab");
  const entity = createEntity();

  // Add a NetworkObject component to the entity, this will store information about changing state
  addComponent(entity, NetworkObject, { ownerId, networkId });
  addComponent(entity, Network.instance.transport.isServer ? Server : Client);

  console.log("Create prefab ", networkId, " for ", ownerId);
  // Call each create action
  prefab.onBeforeCreate?.forEach(action => {
    // If it's a networked behavior, or this is the local player, call it
    if (action.networked || ownerId === Network.instance.userId)
    // Call the behavior with the args
    { action.behavior(entity, action.args); }
  });

  // prepare override map
  const overrideMaps:{
    localClientComponents?: Map<Component<any>, Record<string, unknown>>;
    networkComponents: Map<Component<any>, Record<string, unknown>>;
    serverComponents: Map<Component<any>, Record<string, unknown>>;
  } = {
    localClientComponents: new Map<Component<any>, Record<string, unknown>>(),
    networkComponents: new Map<Component<any>, Record<string, unknown>>(),
    serverComponents: new Map<Component<any>, Record<string, unknown>>()
  };

  if (override) {
    override.localClientComponents.forEach(component => {
      overrideMaps.localClientComponents.set(component.type, component.data)
    })
    override.networkComponents.forEach(component => {
      overrideMaps.networkComponents.set(component.type, component.data)
    })
    override.serverComponents.forEach(component => {
      overrideMaps.serverComponents.set(component.type, component.data)
    })
  }

    // Instantiate local components
  // If this is the local player, spawn the local components (these will not be spawned for other clients)
  // This is good for input, camera, etc
  if (ownerId === Network.instance.userId && prefab.localClientComponents)
  // For each local component on the prefab...
  {
    initComponents(entity, prefab.localClientComponents, overrideMaps.localClientComponents);
  }
  if (Network.instance.transport.isServer)
  // For each server component on the prefab...
  {
    initComponents(entity, prefab.serverComponents, overrideMaps.serverComponents);
  }
  // Instantiate network components
  // These will be attached to the entity on all clients
  initComponents(entity, prefab.networkComponents, overrideMaps.networkComponents);
    // Call each after create action
    prefab.onAfterCreate?.forEach(action => {
      // If it's a networked behavior, or this is the local player, call it
      if (action.networked || ownerId === Network.instance.userId)
      // Call the behavior with the args
      { action.behavior(entity, action.args); }
    });
  return entity;
}

function initComponents(entity: Entity, components:Array<{ type: any, data?:any }>, override?: Map<any, any>) {
  components?.forEach(component => {
    // The component to the entity
    addComponent(entity, component.type);

    const initData = component.data ?? {};
    if (override.has(component.type)) {
      const overrideData = override.get(component.type);
      Object.keys(overrideData).forEach(key => initData[key] = overrideData[key]);
    }

    // If the component has no initialization data, return
    if (typeof initData !== 'object' || Object.keys(initData).length === 0) return;
    // Get a mutable reference to the component
    const addedComponent = getMutableComponent(entity, component.type);
    // Set initialization data for each key
    Object.keys(initData).forEach(key => {
      // Get the component on the entity, and set it to the initializing value from the prefab
      addedComponent[key] = initData[key];
    });
  });
}
