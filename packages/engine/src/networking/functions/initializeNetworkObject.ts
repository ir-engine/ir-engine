import { isClient } from '../../common/functions/isClient'
import { Component } from '../../ecs/classes/Component'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, createEntity, getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions'
import { GameObject } from '../../game/components/GameObject'
import { PrefabType } from '../../networking/templates/PrefabType'
import { Network } from '../classes/Network'
import { NetworkObject } from '../components/NetworkObject'
import { NetworkPrefab } from '../interfaces/NetworkPrefab'
/**
 * Create network object from prefab.
 * @param prefab Prefab to be used to create object.
 * @param ownerId ID of the owner.
 * @param networkId ID of network in which object will be created.
 * @param override Override prefab properties.
 *
 * @returns Newly created entity.
 */
function createNetworkPrefab(
  entity: Entity,
  prefab: NetworkPrefab,
  ownerId: string,
  networkId: number,
  override: NetworkPrefab = null,
  uniqueId: string
): Entity {
  // Add a NetworkObject component to the entity, this will store information about changing state
  addComponent(entity, NetworkObject, { ownerId, networkId, uniqueId })

  // Call each create action
  prefab.onBeforeCreate?.forEach((action) => {
    // If it's a networked behavior, or this is the local player, call it
    if (action.networked || ownerId === Network.instance.userId) {
      // Call the behavior with the args
      action.behavior(entity, action.args)
    }
  })

  // prepare override map
  const overrideMaps: {
    localClientComponents?: Map<Component<any>, Record<string, unknown>>
    clientComponents?: Map<Component<any>, Record<string, unknown>>
    networkComponents: Map<Component<any>, Record<string, unknown>>
    serverComponents: Map<Component<any>, Record<string, unknown>>
  } = {
    localClientComponents: new Map<Component<any>, Record<string, unknown>>(),
    clientComponents: new Map<Component<any>, Record<string, unknown>>(),
    networkComponents: new Map<Component<any>, Record<string, unknown>>(),
    serverComponents: new Map<Component<any>, Record<string, unknown>>()
  }

  if (override) {
    override.localClientComponents?.forEach((component) => {
      overrideMaps.localClientComponents.set(component.type, component.data)
    })
    override.clientComponents?.forEach((component) => {
      overrideMaps.clientComponents.set(component.type, component.data)
    })
    override.networkComponents?.forEach((component) => {
      overrideMaps.networkComponents.set(component.type, component.data)
    })
    override.serverComponents?.forEach((component) => {
      overrideMaps.serverComponents.set(component.type, component.data)
    })
  }

  // Instantiate local components
  // If this is the local player, spawn the local components (these will not be spawned for other clients)
  // This is good for input, camera, etc
  //console.log(ownerId, Network.instance.userId)

  if (ownerId === Network.instance.userId && prefab.localClientComponents) {
    // For each local component on the prefab...
    initComponents(entity, prefab.localClientComponents, overrideMaps.localClientComponents)
  }

  if (isClient && prefab.clientComponents) {
    // For each client component on the prefab...
    initComponents(entity, prefab.clientComponents, overrideMaps.clientComponents)
  }

  if (!isClient) {
    // For each server component on the prefab...
    initComponents(entity, prefab.serverComponents, overrideMaps.serverComponents)
  }
  // Instantiate network components
  // These will be attached to the entity on all clients
  initComponents(entity, prefab.networkComponents, overrideMaps.networkComponents)
  // Call each after create action
  prefab.onAfterCreate?.forEach((action) => {
    // If it's a networked behavior, or this is the local player, call it
    if (action.networked || ownerId === Network.instance.userId) {
      // Call the behavior with the args
      action.behavior(entity, action.args)
    }
  })
  return entity
}

/**
 * Initialize components.
 * @param entity Entity to be initialized.
 * @param components List of components to be added into entity.
 * @param override Override of the default component values.
 */
function initComponents(entity: Entity, components: Array<{ type: any; data?: any }>, override?: Map<any, any>) {
  components?.forEach((component) => {
    const initData = component.data ?? {}
    if (override.has(component.type)) {
      const overrideData = override.get(component.type)
      Object.keys(overrideData).forEach((key) => (initData[key] = overrideData[key]))
    }

    // The component to the entity
    addComponent(entity, component.type, initData)

    // // If the component has no initialization data, return
    // if (typeof initData !== 'object' || Object.keys(initData).length === 0) return;
    // // Get a mutable reference to the component
    // const addedComponent = getMutableComponent(entity, component.type);

    // return;
    // // Set initialization data for each key
    // Object.keys(initData).forEach(key => {
    //   // Get the component on the entity, and set it to the initializing value from the prefab
    //   addedComponent[key] = initData[key];
    // });
  })
}

export function checkIfIdHavePrepair(uniqueId) {
  return (
    Object.keys(Network.instance.networkObjects)
      .map(Number)
      .reduce(
        (result, key) => (Network.instance.networkObjects[key]?.uniqueId === uniqueId ? (result = key) : result),
        null
      ) ?? Network.getNetworkId()
  )
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
export function initializeNetworkObject(args: {
  parameters?: any
  entity?: Entity
  prefabType?: number
  ownerId: string
  networkId?: number
  uniqueId: string
  override?: any
}): NetworkObject {
  // Instantiate into the world
  const entity = args.entity ?? createEntity()
  const prefabType = args.prefabType ?? Network.instance.schema.defaultClientPrefab
  const ownerId = args.ownerId ?? 'server'
  const networkId = args.networkId ?? checkIfIdHavePrepair(args.uniqueId)
  const uniqueId = args.uniqueId
  const parameters = args.parameters

  const networkEntity = createNetworkPrefab(
    entity,
    // Prefab from the Network singleton's schema, using the defaultClientPrefab as a key
    Network.instance.schema.prefabs[prefabType],
    // Connecting client's ID as a string
    ownerId,
    networkId,
    // Initialize with starting position and rotation
    args.override,
    uniqueId
  )

  const networkObject = getMutableComponent(networkEntity, NetworkObject)

  return networkObject
}
