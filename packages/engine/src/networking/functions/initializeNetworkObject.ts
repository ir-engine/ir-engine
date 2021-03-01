import { Quaternion, Vector3 } from 'three';
import { Component } from '../../ecs/classes/Component';
import { Entity } from '../../ecs/classes/Entity';
import { addComponent, createEntity, getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import { loadActorAvatar } from '../../templates/character/prefabs/NetworkPlayerCharacter';
import { PrefabType } from "../../templates/networking/DefaultNetworkSchema";
import { TransformComponent } from '../../transform/components/TransformComponent';
import { Network } from '../classes/Network';
import { NetworkObject } from '../components/NetworkObject';
import { NetworkPrefab } from '../interfaces/NetworkPrefab';

/**
 * Create network object from prefab.
 * @param prefab Prefab to be used to create object.
 * @param ownerId ID of the owner.
 * @param networkId ID of network in which object will be created.
 * @param override Override prefab properties.
 *
 * @returns Newly created entity.
 */
function createNetworkPrefab(prefab: NetworkPrefab, ownerId, networkId: number, override: NetworkPrefab = null): Entity {
  const entity = createEntity();

  // Add a NetworkObject component to the entity, this will store information about changing state
  addComponent(entity, NetworkObject, { ownerId, networkId });

  // Call each create action
  prefab.onBeforeCreate?.forEach(action => {
    // If it's a networked behavior, or this is the local player, call it
    if (action.networked || ownerId === Network.instance.userId)
    // Call the behavior with the args
    { action.behavior(entity, action.args); }
  });

  // prepare override map
  const overrideMaps: {
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

/**
 * Initialize components.
 * @param entity Entity to be initialized.
 * @param components List of components to be added into entity.
 * @param override Override of the default component values.
 */
function initComponents(entity: Entity, components: Array<{ type: any, data?: any }>, override?: Map<any, any>) {
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

/**
 * Initialize Network object
 * @param ownerId ID of owner of newly created object.
 * @param networkId ID of network in which object will be created.
 * @param prefabType Type of prefab which will be used to create the object.
 * @param position Position of the object.
 * @param rotation Rotation of the object.
 *
 * @returns Newly created object.
 */
export function initializeNetworkObject(ownerId: string, networkId: number, prefabType: string | number, position?: Vector3, rotation?: Quaternion): NetworkObject {
  // Instantiate into the world
  const networkEntity = createNetworkPrefab(
    // Prefab from the Network singleton's schema, using the defaultClientPrefab as a key
    Network.instance.schema.prefabs[prefabType],
    // Connecting client's ID as a string
    ownerId,
    networkId,
    // Initialize with starting position and rotation
    {
      localClientComponents: [],
      networkComponents: [
        {
          type: TransformComponent,
          data: {
            position: position ? position.clone() : new Vector3(),
            rotation: rotation ? rotation.clone() : new Quaternion()
          }
        }
      ],
      serverComponents: []
    }
  );

  // // Initialize with starting position and rotation
  // const transform = getMutableComponent(networkEntity, TransformComponent);
  // transform.position = position ? position.clone() : new Vector3();
  // transform.rotation = rotation ? rotation.clone() : new Quaternion();
  // (Network.instance as any).transform = transform;

  const networkObject = getComponent(networkEntity, NetworkObject);

  // Add network object to list Network.networkObjects with user
  Network.instance.networkObjects[networkId] =
  {
    ownerId,
    prefabType,
    component: networkObject,
    uniqueId: ''
  };

  console.log(ownerId, Network.instance?.userId, Network.instance)

  if (prefabType === PrefabType.Player && ownerId === (Network.instance).userId) {
    Network.instance.localClientEntity = networkEntity;
    document.dispatchEvent(new CustomEvent('client-entity-load', { detail: { id: networkEntity.id } }));
  }

  loadActorAvatar(networkEntity);

  // Tell the client
  // console.log("Object ", networkId, " added to the simulation for owner ", ownerId, " with a prefab type: ", prefabType);

  return networkObject;
}
